# SQLAlchemy 2.0 Testing Harnesses & Async ORM Verification 🛠️

> **Authoritative Sources & Literature:**
> - Mike Bayer: *SQLAlchemy 2.0 Architecture & Unified Tutorial* (docs.sqlalchemy.org)
> - Harry Percival & Bob Gregory: *Architecture Patterns with Python* (Chapter 2: The Repository Pattern, O'Reilly)
> - SQLAlchemy Community: *AsyncIO Support and Greenlet Mechanics in SQLAlchemy 2.0*

---

## 1. Conceptual Definition & Core Mental Model

**SQLAlchemy 2.0** represents a major architectural transformation in Python's database ecosystem. It transitions from legacy 1.x implicit query syntax (`session.query(User).filter(...)`) to a modern, typed, functional SQL expression language (`session.scalars(select(User).where(...))`), backed by first-class native asynchronous execution (`AsyncEngine` and `AsyncSession`).

### The Testing Challenge: The Async Boundary
In asynchronous backend architectures (FastAPI with `asyncpg` or `psycopg`), testing SQLAlchemy 2.0 introduces unique challenges:
1. **The `MissingGreenlet` Hazard**: In asynchronous mode, **lazy loading is physically prohibited**. Attempting to access an un-loaded relationship attribute outside an explicit eager load crashes with `MissingGreenlet: greenlet_spawn has not been called`.
2. **Session Identity Mapping & State Expiration**: By default, committing a session expires all object attributes, forcing a database re-query on the next attribute access. In tests, setting `expire_on_commit=False` is non-negotiable.

```
       [ Modern SQLAlchemy 2.0 Test Harness ]
                         │
        AsyncEngine (Session Scoped / Pooled)
                         │
        AsyncConnection (Function Scoped / SAVEPOINT)
                         │
        AsyncSession (expire_on_commit=False)
                         │
        select(Order).options(selectinload(Order.items)) <─── EAGER LOADING REQUIRED!
```

---

## 2. Why This Is Critical in Modern Python Backend Engineering

1. **Detecting the N+1 Query Disaster in CI**: If an endpoint loads 50 orders and accesses `order.customer.name` without eager loading, SQLAlchemy fires 50 individual database queries. Integration tests must assert on executed query counts to prevent production latency degradation.
2. **Verifying Relationship Cascade Invariants**: Testing that `delete-orphan` cascades properly clean up child records when removed from an ORM collection.
3. **Optimistic Concurrency Control Testing**: Verifying that concurrent writes to the same aggregate root raise `StaleDataError` using SQLAlchemy's `version_id_col`.

---

## 3. Internal Mechanics: The AsyncIO Greenlet Bridge

SQLAlchemy 2.0 achieves asynchronous compatibility with existing relational drivers using **greenlets** (`greenlet` C-extension):

```mermaid
sequenceDiagram
    autonumber
    participant Coroutine as Python Async Test Coroutine
    participant AsyncSession as SQLAlchemy AsyncSession
    participant SyncCore as Core Synchronous Engine (Inside Greenlet)
    participant Driver as asyncpg / psycopg Driver
    participant Postgres as PostgreSQL Database
    
    Coroutine->>AsyncSession: await session.scalars(select(User))
    AsyncSession->>SyncCore: Switch to Greenlet context
    SyncCore->>Driver: Dispatch non-blocking async query
    Driver->>Postgres: Socket I/O
    Postgres-->>Driver: Return tuples
    Driver-->>SyncCore: Return rows
    SyncCore-->>AsyncSession: Map tuples to UserORM instances
    AsyncSession-->>Coroutine: Return ScalarResult
```

Because relationship lazy-loading happens synchronously via Python property getters (`order.items`), SQLAlchemy cannot await I/O on property access without an active greenlet bridge. Therefore, **all relationships accessed in tests must be eagerly loaded** via `selectinload` or `joinedload`.

---

## 4. Standard Syntax, Signatures & Key Options

### Modern SQLAlchemy 2.0 Models (`Mapped` & `mapped_column`)
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Numeric
from decimal import Decimal
from typing import List

class Base(DeclarativeBase):
    pass

class CustomerORM(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    orders: Mapped[List["OrderORM"]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
    )

class OrderORM(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    customer: Mapped[CustomerORM] = relationship(back_populates="orders")
```

### Modern 2.0 Query Construction (`select`)
```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload

# 1. Basic query execution
stmt = select(CustomerORM).where(CustomerORM.name == "Alice")
result = await session.scalars(stmt)
customer = result.first()

# 2. Eager loading relationships (Prevents MissingGreenlet!)
stmt = (
    select(CustomerORM)
    .where(CustomerORM.id == "cust_1")
    .options(selectinload(CustomerORM.orders)) # Pre-fetches orders in one query!
)
customer = await session.scalar(stmt)
```

---

## 5. Lifecycle, Execution Flow & Teardown Mechanics

```mermaid
flowchart TD
    InitEngine["1. Session Fixture: Initialize create_async_engine()"] --> Conn["2. Function Fixture: connection = await engine.connect()"]
    Conn --> Tx["3. trans = await connection.begin() (SAVEPOINT)"]
    Tx --> Session["4. async_sessionmaker(bind=connection, expire_on_commit=False)"]
    Session --> Test["5. Execute Test (await session.execute, add, commit)"]
    Test --> Teardown["6. await session.close()"]
    Teardown --> Rollback["7. await trans.rollback() (Clean slate!)"]
    Rollback --> CloseConn["8. await connection.close()"]
```

---

## 6. Scopes, Hierarchy, or Test Boundaries

```
[ AsyncEngine: session scope (Connection Pool) ]
       │
[ AsyncConnection: function scope (Transaction Owner) ]
       │
[ AsyncSession: function scope (Unit of Work) ]
```

---

## 7. Pytest Fixture & `conftest.py` Integration Patterns

```python
# tests/integration/conftest.py
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db"

@pytest.fixture(scope="session")
def async_engine():
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )
    yield engine

@pytest.fixture
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    High-performance async transactional sandbox:
    Uses nested transaction (SAVEPOINT) to guarantee 100% isolation.
    """
    connection = await async_engine.connect()
    trans = await connection.begin()

    # CRITICAL: expire_on_commit=False prevents MissingGreenlet on attribute access!
    session_factory = async_sessionmaker(
        bind=connection,
        expire_on_commit=False,
        class_=AsyncSession,
    )
    session = session_factory()

    yield session

    await session.close()
    await trans.rollback()
    await connection.close()
```

---

## 8. Practical Python Implementation: Step-by-Step Walkthrough

We will test an **E-Commerce Order Management System**, demonstrating relationship cascades, eager loading, and query counting to prevent N+1 queries.

### Step 1: Query Count Assertion Helper

```python
# tests/helpers/query_counter.py
from sqlalchemy import event

class QueryCounter:
    """Context manager counting SQL queries executed on a connection."""
    def __init__(self, engine):
        self.engine = engine.sync_engine
        self.count = 0

    def __enter__(self):
        event.listen(self.engine, "before_cursor_execute", self._callback)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        event.remove(self.engine, "before_cursor_execute", self._callback)

    def _callback(self, conn, cursor, statement, parameters, context, executemany):
        self.count += 1
```

### Step 2: The Integration Test Suite

```python
# tests/integration/test_sqlalchemy_orders.py
import pytest
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models import CustomerORM, OrderORM
from tests.helpers.query_counter import QueryCounter

@pytest.mark.integration
@pytest.mark.asyncio
async def test_order_cascade_delete(async_session: AsyncSession):
    # 1. Arrange: Insert customer with 2 orders
    customer = CustomerORM(
        id="cust_101",
        name="Bob",
        orders=[
            OrderORM(id="ord_1", total=Decimal("50.00")),
            OrderORM(id="ord_2", total=Decimal("75.00")),
        ]
    )
    async_session.add(customer)
    await async_session.commit()

    # 2. Act: Delete customer
    await async_session.delete(customer)
    await async_session.commit()

    # 3. Assert: Orders deleted via cascade!
    orders_result = await async_session.scalars(select(OrderORM).where(OrderORM.customer_id == "cust_101"))
    assert len(orders_result.all()) == 0


@pytest.mark.integration
@pytest.mark.asyncio
async def test_eager_loading_prevents_n_plus_one_queries(async_session: AsyncSession, async_engine):
    # Arrange: Seed 1 customer with 5 orders
    customer = CustomerORM(
        id="cust_vip",
        name="VIP Customer",
        orders=[OrderORM(id=f"ord_{i}", total=Decimal("100.00")) for i in range(5)]
    )
    async_session.add(customer)
    await async_session.commit()

    # Act & Assert: Load customer with selectinload and verify query count
    with QueryCounter(async_engine) as counter:
        stmt = (
            select(CustomerORM)
            .where(CustomerORM.id == "cust_vip")
            .options(selectinload(CustomerORM.orders))
        )
        loaded_customer = await async_session.scalar(stmt)
        
        # Accessing loaded_customer.orders does NOT trigger extra queries!
        order_count = len(loaded_customer.orders)
        assert order_count == 5

    # Exactly 2 queries: 1 for customer, 1 for orders in batch! (Zero N+1!)
    assert counter.count == 2
```

---

## 9. Framework-Specific Integration: FastAPI Dependency Overrides with AsyncSession

```python
# src/api/dependencies.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    # Production session generator
    ...

# tests/integration/conftest.py
@pytest.fixture
def override_db(app, async_session):
    app.dependency_overrides[get_db] = lambda: async_session
    yield
    app.dependency_overrides.clear()
```

---

## 10. Real-World Enterprise Backend Scenario: Optimistic Concurrency Control

In high-concurrency payment gateways:
- Two workers attempt to modify the same wallet balance concurrently.
- SQLAlchemy 2.0 models use `version_id_col`:
  ```python
  class WalletORM(Base):
      __tablename__ = "wallets"
      id: Mapped[str] = mapped_column(primary_key=True)
      balance: Mapped[Decimal] = mapped_column()
      version_id: Mapped[int] = mapped_column(default=1)
      __mapper_args__ = {"version_id_col": version_id}
  ```
- An integration test loads the wallet in two separate sessions, commits an update in Session A (incrementing version to 2), and attempts to commit in Session B.
- The test asserts that Session B raises `sqlalchemy.orm.exc.StaleDataError`, guaranteeing that double-spending is physically impossible.

---

## 11. Anti-Patterns & Common Pitfalls

### Anti-Pattern 1: The `MissingGreenlet` Lazy Loading Crash
Accessing an un-loaded relationship attribute in async code:
```python
# ❌ CRASH: Customer orders were not eagerly loaded!
customer = await session.scalar(select(CustomerORM).where(CustomerORM.id == "1"))
print(customer.orders) # MissingGreenlet: greenlet_spawn has not been called!

# ✅ FIX: Use selectinload
stmt = select(CustomerORM).options(selectinload(CustomerORM.orders))
```

### Anti-Pattern 2: `expire_on_commit=True` in Tests
By default, `commit()` expires all model attributes. Accessing `order.id` after commit triggers an automatic reload query, causing async failures. Always set `expire_on_commit=False`.

### Anti-Pattern 3: Using Legacy 1.x Query Syntax
Using `session.query(User)` instead of `session.scalars(select(User))`. Legacy syntax is deprecated in SQLAlchemy 2.0 and lacks full type checking.

---

## 12. Best Practices & Production Guidelines

1. **Always Set `expire_on_commit=False`**: Prevents unexpected re-querying when reading model attributes after `commit()`.
2. **Use `selectinload` for Collections**: For 1-to-N relationships, `selectinload` issues a clean, optimized `IN (...)` secondary query, eliminating Cartesian explosion.
3. **Use `joinedload` for Many-to-One**: For child-to-parent relationships (`order.customer`), `joinedload` executes a single SQL `LEFT OUTER JOIN`.
4. **Assert on Query Counts**: Use event listeners (`before_cursor_execute`) to catch N+1 query regressions in CI.

---

## 13. Trade-Off Analysis: Relationship Loading Strategies

| Strategy | SQL Pattern | Best Used For | Risk / Caveat |
| :--- | :--- | :--- | :--- |
| **`selectinload`** | `SELECT ... WHERE id IN (...)` | Collections (One-to-Many) | Second SQL query required |
| **`joinedload`** | `LEFT OUTER JOIN ...` | Many-to-One / One-to-One | Cartesian product on large collections |
| **`subqueryload`** | `SELECT ... WHERE id IN (SELECT ...)` | Large legacy datasets | Subquery performance overhead |
| **Lazy Loading** | Triggered on attribute access | **NEVER in Async!** | **Crashes with MissingGreenlet** |

---

## 14. Diagnostic & Debugging Playbook

```bash
# Temporarily enable full SQL statement logging during a test run:
pytest tests/integration/test_sqlalchemy_orders.py -o log_cli=true --log-cli-level=DEBUG

# Enable SQLAlchemy engine-level echoing:
engine = create_async_engine(URL, echo="debug")
```

---

## 15. Senior Staff Interview Questions & Deep Dives

### Question 1: What causes the `sqlalchemy.exc.MissingGreenlet` exception in modern asynchronous SQLAlchemy applications, and how is it architecturally resolved?
**Answer**:
SQLAlchemy's ORM was originally built around synchronous attribute access: accessing `user.orders` transparently executes a database query via Python property getters. However, Python property accessors cannot be declared as `async def` and cannot be `await`ed.
In async SQLAlchemy, all non-blocking I/O must be scheduled on the async event loop using greenlets. When code accesses an un-loaded relationship attribute (`user.orders`), SQLAlchemy attempts to initiate an I/O query synchronously from within a context where no greenlet dispatcher is active, raising `MissingGreenlet: greenlet_spawn has not been called`.
**Resolution**:
1. Eagerly load all required relationships at query time using `.options(selectinload(...))` or `.options(joinedload(...))`.
2. If explicit lazy loading is required in async code, use `await session.run_sync(lambda sync_session: user.orders)`.

### Question 2: Why is `expire_on_commit=False` essential when testing SQLAlchemy sessions, and what are its trade-offs?
**Answer**:
By default in SQLAlchemy, calling `session.commit()` marks all persistent instances in the identity map as "expired". The next time any attribute on an instance is accessed (e.g. `assert user.email == "test@test.com"`), SQLAlchemy triggers an implicit `SELECT` statement to refresh the object from the database.
In test code:
1. In async mode, this implicit refresh triggers `MissingGreenlet` errors because attribute access is synchronous.
2. In transactional rollback sandboxes (`SAVEPOINT`), refreshing an expired instance can read stale or empty state.
Setting `expire_on_commit=False` ensures that objects remain fully populated in memory after commits, allowing immediate assertions on model state without extra I/O.
**Trade-off**: The in-memory model does not reflect database-side changes (such as database triggers, generated default columns, or concurrent modifications by other transactions) unless explicitly reloaded via `await session.refresh(obj)`.

---

## 16. Hands-on Engineering Exercises & Challenges

### Exercise 1: Catching and Fixing a `MissingGreenlet` Bug
1. Define a `DepartmentORM` that has a relationship to `EmployeeORM`.
2. Write an async test that loads a department and accesses `dept.employees` without eager loading. Observe the `MissingGreenlet` crash.
3. Fix the test using `.options(selectinload(DepartmentORM.employees))`.
4. Verify the test passes cleanly.

### Exercise 2: Implementing a Query Count Sentinel
Write a custom pytest assertion helper `assert_max_queries(session, max_count=3)` as an async context manager. Verify that loading an order with its customer and items fails if more than 3 SQL queries are dispatched.

---

## 17. Summary, Cross-References & Further Reading

Mastering SQLAlchemy 2.0 testing guarantees that modern asynchronous backends execute queries efficiently, load relationships without crashes, and handle transactions deterministically. By pairing `AsyncSession` sandboxes with explicit eager loading strategies, backend teams eliminate production database errors.

### Cross-References:
- Previous: [Database Integration Testing Strategies](database-testing.md)
- Next: [Production-Parity PostgreSQL Testing](postgresql-testing.md)
- [Transaction Rollback Sandboxing](transaction-and-rollback.md)
- [Testcontainers for Python](testcontainers-testing.md)
