# Transaction Rollback Sandboxing (`SAVEPOINT`) Mechanics 🔄

> **Authoritative Sources & Literature:**
> - Mike Bayer: *Joining a Session into an External Transaction (with SAVEPOINT)* (docs.sqlalchemy.org)
> - Martin Fowler: *Transactional Client & Unit of Work Patterns* (martinfowler.com)
> - Gerard Meszaros: *xUnit Test Patterns: Refactoring Test Code* (Database Sandbox Pattern)
> - Brian Okken: *Python Testing with pytest* (Chapter 3: Fixtures)

---

## 1. Conceptual Definition & Core Mental Model

In database integration testing, the **Nested Transaction (`SAVEPOINT`) Pattern** is the premier architectural mechanism for achieving both **blazing execution speed** and **absolute test isolation**.

### The Classic Database Dilemma
1. **The State Leak Dilemma**: If tests write data to PostgreSQL and commit, rows persist into subsequent tests, causing test pollution.
2. **The Truncation Performance Penalty**: If you truncate all tables (`TRUNCATE TABLE ... CASCADE`) after every test, the database engine must flush buffers, re-acquire locks, and reset sequences, taking **50ms to 200ms per test**.
3. **The Application `commit()` Problem**: Application services explicitly call `session.commit()`. If a test tries to prevent commits, the application code breaks.

### The Solution: The Nested SAVEPOINT Sandbox
SQLAlchemy 2.0 provides `join_transaction_mode="create_savepoint"`. Pytest opens an outer transaction and wraps the test inside a nested `SAVEPOINT`. When the application code executes `session.commit()`, SQLAlchemy **intercepts the commit and releases/re-creates the savepoint** rather than issuing an actual database `COMMIT`. On test teardown, Pytest issues a single `ROLLBACK` on the outer transaction, erasing all changes in **1 to 2 milliseconds**!

```
       [ Test Setup ] ──> BEGIN (Outer Transaction)
                               │
                          SAVEPOINT test_savepoint
                               │
       [ App Code ]   ──> INSERT INTO orders ...
                      ──> session.commit()
                          (Intercepted! Executes: RELEASE SAVEPOINT; SAVEPOINT)
                               │
       [ Test Assert] ──> SELECT count(*) FROM orders == 1
                               │
       [ Teardown ]   ──> ROLLBACK (Outer Transaction)
                          (All changes erased instantly from PostgreSQL!)
```

---

## 2. Why This Is Critical in Modern Python Backend Engineering

1. **Sub-Second Suite Velocity**: Running 500 integration tests with table truncation takes **60 seconds**. Running the same 500 tests with `SAVEPOINT` rollbacks takes **1.2 seconds**.
2. **100% Production Parity**: Tests run against the exact same PostgreSQL database used in production, validating native types, constraints, and triggers.
3. **Zero Test Pollution**: Even if a test crashes midway through execution or raises an unhandled exception, the post-yield fixture teardown guarantees an immediate rollback, leaving the database pristine for the next test.

---

## 3. Internal Mechanics: The `create_savepoint` Interception

```mermaid
sequenceDiagram
    autonumber
    participant Test as Pytest Test Function
    participant Fixture as db_session Fixture
    participant App as Application Service
    participant PG as PostgreSQL Database
    
    Fixture->>PG: 1. connection = engine.connect()
    Fixture->>PG: 2. trans = connection.begin() (BEGIN)
    Fixture->>PG: 3. Session(bind=connection, join_transaction_mode="create_savepoint")
    PG-->>Fixture: SAVEPOINT sa_savepoint_1 created
    Fixture-->>Test: Yield session
    
    Test->>App: Call service: create_order()
    App->>PG: INSERT INTO orders VALUES (...)
    App->>Fixture: App calls: session.commit()
    Note over Fixture,PG: Intercepted! Releases savepoint and creates new savepoint!
    Fixture->>PG: RELEASE SAVEPOINT sa_savepoint_1; SAVEPOINT sa_savepoint_2
    
    Test->>PG: Assert row exists in PostgreSQL
    Test-->>Fixture: Test completes
    
    Fixture->>Fixture: session.close()
    Fixture->>PG: 4. trans.rollback() (ROLLBACK)
    Note over PG: PostgreSQL discards all changes back to initial connection!
    Fixture->>PG: connection.close()
```

---

## 4. Standard Syntax, Signatures & Key Options

### Modern SQLAlchemy 2.0 Synchronous Sandbox Fixture
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/test_db"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()

@pytest.fixture(scope="function")
def db_session(engine) -> Session:
    """
    Synchronous SAVEPOINT transactional sandbox.
    Takes ~1ms per test.
    """
    connection = engine.connect()
    transaction = connection.begin()
    
    # CRITICAL: join_transaction_mode="create_savepoint" intercepts session.commit()!
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### Modern SQLAlchemy 2.0 Asynchronous Sandbox Fixture (`asyncpg`)
```python
import pytest
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

ASYNC_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db"

@pytest.fixture(scope="session")
def async_engine():
    engine = create_async_engine(ASYNC_DATABASE_URL, pool_pre_ping=True)
    yield engine

@pytest.fixture(scope="function")
async def async_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Asynchronous SAVEPOINT transactional sandbox.
    """
    connection = await async_engine.connect()
    transaction = await connection.begin()

    session_factory = async_sessionmaker(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
        class_=AsyncSession,
    )
    session = session_factory()

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()
```

---

## 5. Lifecycle, Execution Flow & Teardown Mechanics

| Phase | Action | SQL Statement Sent to PostgreSQL |
| :--- | :--- | :--- |
| **Fixture Setup** | `connection.begin()` | `BEGIN` |
| **Session Binding** | `join_transaction_mode="create_savepoint"` | `SAVEPOINT sa_savepoint_1` |
| **Application Logic** | `session.add(order)` | `INSERT INTO orders ...` |
| **Application Commit** | `session.commit()` | `RELEASE SAVEPOINT sa_savepoint_1; SAVEPOINT sa_savepoint_2` |
| **Test Assertion** | `session.query(Order).count()` | `SELECT count(*) FROM orders` |
| **Fixture Teardown** | `transaction.rollback()` | `ROLLBACK` (Entire outer transaction erased) |
| **Connection Cleanup** | `connection.close()` | Returned to connection pool |

---

## 6. Scopes, Hierarchy, or Test Boundaries

```
[ Engine Fixture: scope="session" ] ──> Maintains persistent connection pool
            │
[ Connection & Transaction: scope="function" ] ──> Unique SAVEPOINT per test
```

---

## 7. Pytest Fixture & `conftest.py` Integration Patterns

Wiring the savepoint session into FastAPI routes:

```python
# tests/integration/conftest.py
import pytest
from src.main import app
from src.database import get_db

@pytest.fixture
def test_app(db_session):
    """Overrides FastAPI's get_db dependency with our SAVEPOINT session."""
    app.dependency_overrides[get_db] = lambda: db_session
    yield app
    app.dependency_overrides.clear()
```

---

## 8. Practical Python Implementation: Step-by-Step Proof of Isolation

We will write two consecutive tests demonstrating that **Test A can write and commit data**, and **Test B runs in a completely empty database**.

### Step 1: Define Application Model

```python
# src/models.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from decimal import Decimal

class Base(DeclarativeBase):
    pass

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column()
    amount: Mapped[Decimal] = mapped_column()
```

### Step 2: Consecutive Isolation Tests

```python
# tests/integration/test_savepoint_isolation.py
import pytest
from decimal import Decimal
from src.models import LedgerEntry

@pytest.mark.integration
def test_step_a_inserts_and_commits_record(db_session):
    # Arrange & Act: App code writes and COMMITS!
    entry = LedgerEntry(id="TX_101", description="Customer Deposit", amount=Decimal("500.00"))
    db_session.add(entry)
    
    # Notice the commit! In normal DB code, this persists to disk.
    # In our sandbox, it is intercepted and safely trapped inside the savepoint!
    db_session.commit()

    # Assert: Queryable within Test A
    assert db_session.query(LedgerEntry).count() == 1
    loaded = db_session.query(LedgerEntry).filter_by(id="TX_101").one()
    assert loaded.amount == Decimal("500.00")


@pytest.mark.integration
def test_step_b_proves_database_is_completely_clean(db_session):
    # Act & Assert:
    # Because test_step_a's outer transaction was rolled back during teardown,
    # the ledger_entries table is guaranteed to have ZERO rows!
    total_count = db_session.query(LedgerEntry).count()
    assert total_count == 0
```
*Run tests*: `2 passed in 0.04s`. Zero data leakage!

---

## 9. Framework-Specific Integration: FastAPI Dependency Overrides

```python
# src/api/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import LedgerEntry

router = APIRouter()

@router.post("/ledger")
def create_ledger(description: str, amount: float, db: Session = Depends(get_db)):
    entry = LedgerEntry(id="auto", description=description, amount=amount)
    db.add(entry)
    db.commit() # Intercepted by SAVEPOINT!
    return {"status": "ok"}
```

---

## 10. Real-World Enterprise Backend Scenario: E-Commerce Multi-Table Checkout

In a high-volume checkout flow:
- A user checkout transaction inserts:
  1. 1 `orders` row.
  2. 5 `order_items` rows.
  3. 1 `payments` row.
  4. 2 `inventory_allocations` rows.
- The service executes `session.commit()`.
- Under the SAVEPOINT pattern, all 9 database rows are written and verified, but rolled back in **1.8 milliseconds** upon test exit.

---

## 11. Anti-Patterns & Common Pitfalls

### Anti-Pattern 1: Omitting `join_transaction_mode="create_savepoint"`
If you bind a session to an external connection without `join_transaction_mode="create_savepoint"`, calling `session.commit()` will **commit the outer transaction to PostgreSQL**, permanently writing the test rows to disk and polluting all subsequent tests!

### Anti-Pattern 2: The Multi-Connection Asynchronous Worker Limitation
> [!CAUTION]
> **The Multi-Connection Limitation**: `SAVEPOINT`s are bound to a **single physical database connection**.
> If your application architecture spawns an external background worker (like a separate Celery process or asynchronous task that opens its **own independent database connection**), Worker 2 will **not see uncommitted savepoint data** from Connection 1 due to PostgreSQL MVCC transaction isolation!
> **Remediation**: For multi-connection integration tests, use real database commits followed by post-test table truncation (`TRUNCATE TABLE ... CASCADE`).

---

## 12. Best Practices & Production Guidelines

1. **Always Set `join_transaction_mode="create_savepoint"`**: Essential for intercepting application-level `commit()` calls.
2. **Combine with `expire_on_commit=False`**: Prevents `MissingGreenlet` errors and unnecessary re-querying after commits.
3. **Use Truncation Only When Concurrency Demands It**: Default to the `SAVEPOINT` pattern for 98% of your integration tests. Reserve table truncation strictly for multi-connection tests.
4. **Pool Connections at Session Scope**: Never dispose and recreate the database engine on every test.

---

## 13. Trade-Off Analysis: Database Isolation Approaches

| Technique | Speed per Test | Isolation Fidelity | Works with `commit()`? | Supports Multi-Connection? |
| :--- | :--- | :--- | :--- | :--- |
| **Nested SAVEPOINT Rollback** | **$\approx 1 - 2\text{ms}$ (Fastest)** | **Absolute (In-Connection)** | **Yes (Intercepted)** | ❌ No (Single Connection) |
| **Table Truncate (`TRUNCATE CASCADE`)** | $\approx 30 - 80\text{ms}$ | High | Yes (Real Commit) | ✅ Yes |
| **Drop & Recreate Schema** | $\approx 200 - 500\text{ms}$ | Absolute | Yes | ✅ Yes |
| **SQLite In-Memory** | $\approx 1\text{ms}$ | Poor (Dialect bugs) | Yes | ❌ No |

---

## 14. Diagnostic & Debugging Playbook

```bash
# Enable SQLAlchemy statement echoing to verify SAVEPOINT operations in terminal:
pytest tests/integration/test_savepoint_isolation.py -o log_cli=true --log-cli-level=DEBUG

# Output will clearly show:
# SAVEPOINT sa_savepoint_1
# RELEASE SAVEPOINT sa_savepoint_1
# ROLLBACK
```

---

## 15. Senior Staff Interview Questions & Deep Dives

### Question 1: How does SQLAlchemy's `join_transaction_mode="create_savepoint"` solve the "Application Commit" dilemma in automated testing?
**Answer**:
In production service layers, business use cases explicitly execute `session.commit()` to finalize transactions and flush changes. In automated tests, if code commits, changes persist to disk, corrupting database state for subsequent tests. If the test prevents commits by monkey-patching `commit()`, intermediate flushes do not happen, database-generated default IDs are not populated, and code behavior deviates from production.
`join_transaction_mode="create_savepoint"` resolves this:
1. Pytest checks out a raw connection and begins an outer transaction (`BEGIN`).
2. When the test initializes the `Session`, SQLAlchemy issues a nested `SAVEPOINT`.
3. When the application code calls `session.commit()`, SQLAlchemy intercepts the call: instead of emitting an actual database `COMMIT`, it emits `RELEASE SAVEPOINT <name>; SAVEPOINT <name>`.
4. This flushes changes to the database and satisfies constraints, but confines all mutations to the outer transaction.
5. On test teardown, Pytest issues `ROLLBACK` on the outer transaction, erasing all mutations in milliseconds without touching disk persistence.

### Question 2: In what architectural scenario does the `SAVEPOINT` rollback pattern fail, and how must the test harness adapt?
**Answer**:
The `SAVEPOINT` pattern fails in **Multi-Connection Architectures**. Under relational MVCC (Multi-Version Concurrency Control), data inside an uncommitted transaction (or savepoint) on Connection 1 is completely invisible to Connection 2.
If a test triggers an asynchronous background worker (such as a Celery worker, an external microservice, or a separate connection pool) that attempts to read the row created by the test, the worker will find nothing and fail.
**Adaptation**: In tests requiring multiple independent database connections, the test must use **real database commits** on Connection 1. Teardown cannot use `ROLLBACK`; instead, the test harness must execute post-test table truncation (`TRUNCATE TABLE <name> RESTART IDENTITY CASCADE`) across modified tables.

---

## 16. Hands-on Engineering Exercises & Challenges

### Exercise 1: Implementing an Async SAVEPOINT Fixture
Using SQLAlchemy 2.0 and `asyncpg`:
1. Write an `async_session` fixture implementing `join_transaction_mode="create_savepoint"`.
2. Write a test that inserts an entity and calls `await session.commit()`.
3. Write a second test asserting that the table is completely empty.

### Exercise 2: Tracing Savepoint SQL Statements
Run pytest with `--capture=no` and `echo="debug"` on the database engine. Verify in the logs that `SAVEPOINT`, `RELEASE SAVEPOINT`, and `ROLLBACK` are emitted in the exact sequence expected.

---

## 17. Summary, Cross-References & Further Reading

The Nested Transaction (`SAVEPOINT`) pattern is the cornerstone of high-performance database testing. By intercepting application commits and rolling back outer transactions in 1 millisecond, backend teams run hundreds of integration tests against genuine PostgreSQL databases in seconds.

### Cross-References:
- Previous: [Production-Parity PostgreSQL Testing](postgresql-testing.md)
- Next: [Containerized Dependencies with Testcontainers](testcontainers-testing.md)
- [SQLAlchemy 2.0 Testing Harnesses](sqlalchemy-testing.md)
- [Unit of Work Testing](../architecture-and-testing/unit-of-work.md)
