# Production-Parity PostgreSQL Testing & SQLite Traps 🐘

> **Authoritative Sources & Literature:**
> - PostgreSQL Global Development Group: *PostgreSQL Documentation - Concurrency Control, MVCC, and JSON Types* (postgresql.org)
> - Martin Fowler: *Evolutionary Database Design & Environment Parity*
> - The Twelve-Factor App: *Factor X: Dev/Prod Parity (Keep development, staging, and production as similar as possible)*
> - Mike Bayer: *SQLAlchemy Dialect Differences: PostgreSQL vs. SQLite*

---

## 1. Conceptual Definition & Core Mental Model

In Python backend engineering, a ubiquitous historical temptation is testing against an **in-memory SQLite database (`sqlite:///:memory:`)** while running **PostgreSQL** in production.

This practice violates **Factor X (Dev/Prod Parity)** of the Twelve-Factor App. While SQLite is fast to spin up, it has an entirely different SQL engine, storage format, and concurrency model. 

Testing against SQLite gives developers **false confidence**: tests pass with flying colors locally, only to suffer catastrophic outages in production due to dialect discrepancies, missing data types, and ignored constraints.

```
       [ Developer Local Test Run ] ──> SQLite In-Memory (Passes Cleanly! ✅)
                                                 │
                                                 ▼ (Deploy to Production)
       [ Production Traffic ]       ──> PostgreSQL 16 (Crashes with Syntax/Lock Errors! 💥)
```

---

## 2. The Core Divergences: Why SQLite Hides Production Bugs

```mermaid
flowchart TD
    Divergence["PostgreSQL vs SQLite Core Divergences"]
    
    Divergence --> D1["1. Advanced Data Types<br/>JSONB, native ENUM, UUID, ARRAY, INET"]
    Divergence --> D2["2. Concurrency & Locking<br/>MVCC & row-level locks (SELECT FOR UPDATE) vs Database-level locks"]
    Divergence --> D3["3. Text Matching & Case Sensitivity<br/>LIKE is case-sensitive in PG; case-insensitive in SQLite"]
    Divergence --> D4["4. Constraint Enforcement<br/>Foreign keys OFF by default in SQLite; strictly enforced in PG"]
    Divergence --> D5["5. Transaction Failure Semantics<br/>PG aborts entire transaction on error; SQLite allows continuing"]
```

### Detailed Breakdown of Differences

| Feature | PostgreSQL | SQLite In-Memory | Production Risk If Tested with SQLite |
| :--- | :--- | :--- | :--- |
| **`JSONB` & Indexing** | Native binary JSON, operators (`@>`, `?`, `->>`), GIN indexes | Stores as plain `TEXT`; no indexing | Complex JSON queries fail to compile |
| **Row Locking (`FOR UPDATE`)** | Native row-level locks prevent race conditions | Silently ignored (No-op) | High-concurrency race conditions slip past tests |
| **Case Sensitivity (`LIKE`)** | `LIKE` is case-sensitive; `ILIKE` for insensitive | `LIKE` is case-insensitive for ASCII | Search queries behave differently in production |
| **Native `ENUM` Types** | Enforces valid database-level enum values | Stored as raw text without validation | Invalid enum values pass in tests |
| **Foreign Keys** | Always enforced | **Disabled by default!** | Orphaned rows slip into production |
| **Failed Transaction State** | Error puts transaction into `ABORTED` state | Allows subsequent queries to execute | Error recovery logic fails in production |

---

## 3. Internal Mechanics: The PostgreSQL Transaction Abortion Rule

One of the most critical operational differences is how PostgreSQL handles SQL errors within a transaction:

```mermaid
sequenceDiagram
    autonumber
    participant App as Backend Service
    participant PG as PostgreSQL
    participant SQLite as SQLite
    
    App->>PG: 1. INSERT with invalid Foreign Key
    PG-->>App: Error: ForeignKeyViolation
    Note over PG: Entire Transaction is now in ABORTED state!
    App->>PG: 2. SELECT * FROM users
    PG-->>App: Error: InFailedSqlTransaction (Current transaction is aborted!)
    
    Note over App,SQLite: Contrast with SQLite:
    App->>SQLite: 1. INSERT with invalid Foreign Key
    SQLite-->>App: Error (if PRAGMA enabled)
    App->>SQLite: 2. SELECT * FROM users
    SQLite-->>App: Returns Users successfully! (Masks bug!)
```

In PostgreSQL, once any statement fails inside a transaction, **no further statements are permitted until an explicit `ROLLBACK` is issued**. If your exception handling does not issue a rollback, subsequent queries crash with `InFailedSqlTransaction`. SQLite completely hides this bug!

---

## 4. Standard Syntax, Signatures & Key Options

### Using Native PostgreSQL Types in SQLAlchemy 2.0
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB, UUID, ARRAY, ENUM as PG_ENUM
from decimal import Decimal
import uuid
import enum

class Base(DeclarativeBase):
    pass

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    MEMBER = "MEMBER"

class UserAccountORM(Base):
    __tablename__ = "user_accounts"

    # Native PostgreSQL UUID (Stores as 16-byte binary, not 36-char string)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    # Native PostgreSQL ENUM
    role: Mapped[UserRole] = mapped_column(
        PG_ENUM(UserRole, name="user_role_enum", create_type=False),
        nullable=False,
    )

    # Native Binary JSONB (Supports indexable queries and containment)
    profile_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Native PostgreSQL Array
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
```

---

## 5. Lifecycle, Execution Flow & Teardown Mechanics

To achieve 100% production parity without sacrificing speed:
1. Run a real PostgreSQL container (via **Testcontainers** or local Docker Compose).
2. Run Alembic migrations once at `session` scope.
3. Isolate each test with a `SAVEPOINT` rollback.

---

## 6. Scopes, Hierarchy, or Test Boundaries

```
[ Local Development / CI Runner ]
                 │
[ Docker Daemon: Ephemeral PostgreSQL 16 Container ] <─── 100% PRODUCTION PARITY
                 │ (Listens on dynamic port, e.g. localhost:5432)
[ Alembic Migrations: Native PG Types & Triggers ]
                 │
[ Pytest Integration Suite: Tests Real JSONB, Enums, & MVCC Locks ]
```

---

## 7. Pytest Fixture & `conftest.py` Integration Patterns

```python
# tests/integration/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Real PostgreSQL connection string
DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/test_db"

@pytest.fixture(scope="session")
def pg_engine():
    """Shared PostgreSQL engine for integration tests."""
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    yield engine
    engine.dispose()

@pytest.fixture
def pg_session(pg_engine) -> Session:
    """Transactional SAVEPOINT sandbox against real PostgreSQL."""
    connection = pg_engine.connect()
    trans = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    yield session

    session.close()
    trans.rollback()
    connection.close()
```

---

## 8. Practical Python Implementation: Step-by-Step Walkthrough

We will demonstrate testing native **PostgreSQL `JSONB` queries** and **Row-Level Locking (`SELECT FOR UPDATE`)**, proving that these features work as expected in PostgreSQL while failing under SQLite.

### Step 1: Testing PostgreSQL `JSONB` Containment and Extraction

```python
# tests/integration/test_postgresql_jsonb.py
import pytest
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.models import UserAccountORM, UserRole

@pytest.mark.integration
def test_postgresql_jsonb_operators(pg_session: Session):
    # 1. Arrange: Insert user with rich JSONB document
    user_id = uuid.uuid4()
    user = UserAccountORM(
        id=user_id,
        role=UserRole.ADMIN,
        profile_data={
            "tier": "enterprise",
            "settings": {"notifications": True, "theme": "dark"},
            "login_count": 42,
        },
        tags=["vip", "beta_tester"],
    )
    pg_session.add(user)
    pg_session.commit()

    # 2. Act & Assert: JSONB key extraction operator (->>)
    stmt_extract = select(UserAccountORM).where(
        UserAccountORM.profile_data["tier"].as_string() == "enterprise"
    )
    loaded = pg_session.scalar(stmt_extract)
    assert loaded is not None
    assert loaded.id == user_id

    # 3. Act & Assert: JSONB containment operator (@>)
    # Tests that profile_data contains {"settings": {"theme": "dark"}}
    stmt_containment = select(UserAccountORM).where(
        UserAccountORM.profile_data.contains({"settings": {"theme": "dark"}})
    )
    contained_user = pg_session.scalar(stmt_containment)
    assert contained_user is not None
```
*(Note: Running this containment test against SQLite raises `CompileError: JSONB type is not supported on dialect sqlite`)*.

### Step 2: Testing Row-Level Locking (`SELECT ... FOR UPDATE`)

```python
# tests/integration/test_postgresql_locking.py
import pytest
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.models import UserAccountORM, UserRole

@pytest.mark.integration
def test_select_for_update_locks_row(pg_engine):
    """
    Verifies that SELECT ... FOR UPDATE acquires a real row-level lock
    in PostgreSQL, preventing concurrent modifications until commit.
    """
    user_id = uuid.uuid4()
    
    # Seed user in separate initial transaction
    with Session(pg_engine) as init_session:
        init_session.add(UserAccountORM(id=user_id, role=UserRole.MEMBER))
        init_session.commit()

    # Open Transaction A and lock the row
    conn_a = pg_engine.connect()
    trans_a = conn_a.begin()
    session_a = Session(bind=conn_a)

    # Acquire row lock: SELECT ... FOR UPDATE NOWAIT
    stmt_lock = (
        select(UserAccountORM)
        .where(UserAccountORM.id == user_id)
        .with_for_update(nowait=True) # Fails immediately if lock cannot be acquired!
    )
    locked_user = session_a.scalar(stmt_lock)
    assert locked_user is not None

    # Open Transaction B: Attempt to acquire the SAME lock concurrently
    conn_b = pg_engine.connect()
    trans_b = conn_b.begin()
    session_b = Session(bind=conn_b)

    # Assert: PostgreSQL raises OperationalError (could not obtain lock)
    from sqlalchemy.exc import OperationalError
    with pytest.raises(OperationalError, match="could not obtain lock on row"):
        session_b.scalar(stmt_lock)

    # Cleanup
    session_a.close()
    trans_a.rollback()
    conn_a.close()

    session_b.close()
    trans_b.rollback()
    conn_b.close()
```

---

## 9. Framework-Specific Integration: Handling PostgreSQL `ILIKE` in FastAPI

In PostgreSQL, text search is strictly case-sensitive when using `LIKE`. Modern APIs use `ILIKE` for case-insensitive matching:

```python
# src/api/search.py
from sqlalchemy import select
from src.models import UserAccountORM

def search_users_by_tag(session, tag_query: str):
    # In PostgreSQL, ILIKE matches case-insensitively ('VIP' matches 'vip')
    stmt = select(UserAccountORM).where(UserAccountORM.name.ilike(f"%{tag_query}%"))
    return session.scalars(stmt).all()
```
Testing this against SQLite is misleading because SQLite makes `LIKE` case-insensitive by default, concealing code where a developer accidentally used `LIKE` instead of `ILIKE`.

---

## 10. Real-World Enterprise Backend Scenario: Financial Double-Spending Prevention

In a high-throughput crypto/fiat exchange:
- A user submits two concurrent withdrawal requests for \$500 against an account with a \$600 balance.
- The withdrawal handler executes:
  ```python
  account = session.scalar(select(Account).where(Account.id == acc_id).with_for_update())
  if account.balance >= amount:
      account.balance -= amount
  ```
- Because the integration test runs against real PostgreSQL, the second transaction is forced to wait for Transaction A to complete, after which it evaluates `balance = $100 < $500` and cleanly rejects the overdraft.
- Under SQLite, this concurrency test passes even with broken locking logic due to SQLite's single-writer database lock.

---

## 11. Anti-Patterns & Common Pitfalls

### Anti-Pattern 1: The "Dual Dialect" Abstraction Trap
Writing application code that avoids PostgreSQL features (like `JSONB`, native enums, and window functions) just so tests can run on SQLite.
- **Consequence**: Cripples your production database capabilities to appease a convenience hack in testing.

### Anti-Pattern 2: Forgetting `PRAGMA foreign_keys = ON` When SQLite Is Used
If SQLite must be used for simple utility scripts, forgetting to emit `PRAGMA foreign_keys=ON` means foreign key constraints are completely ignored.

---

## 12. Best Practices & Production Guidelines

1. **Test Against Real PostgreSQL**: Standardize on Dockerized PostgreSQL (via Testcontainers or GitHub Actions Service Containers).
2. **Leverage Native PostgreSQL Features**: Confidently use `JSONB`, native enums, UUIDs, and arrays knowing your integration suite verifies them.
3. **Always Test Row-Level Locking**: If your application uses `with_for_update()`, verify it against PostgreSQL with concurrent transactions.
4. **Use `nowait=True` or `skip_locked=True` in Lock Tests**: Prevents tests from hanging indefinitely if a deadlock occurs.

---

## 13. Trade-Off Analysis: PostgreSQL vs. SQLite Testing

| Dimension | PostgreSQL (Docker / Testcontainers) | SQLite (`:memory:`) |
| :--- | :--- | :--- |
| **Production Parity** | **100% Identical** | Low (Dialect mismatch) |
| **Supports `JSONB` & Operators** | ✅ Yes (`@>`, `?`, `->>`) | ❌ No (Text only) |
| **Row-Level Locking (`FOR UPDATE`)** | ✅ Real MVCC locks | ❌ Ignored |
| **Native Enums & UUIDs** | ✅ Enforced by database | ❌ Stored as raw strings |
| **Startup Overhead** | $\approx 2 - 4\text{s}$ (Session scoped) | Instant |
| **Per-Test Execution Speed** | $\approx 1 - 2\text{ms}$ (with SAVEPOINT) | $\approx 1\text{ms}$ |

---

## 14. Diagnostic & Debugging Playbook

```bash
# 1. Connect directly to test database to inspect active locks:
psql -h localhost -U postgres -d test_db -c "SELECT pid, locktype, mode, granted FROM pg_locks;"

# 2. Inspect query execution plan for a JSONB index scan:
EXPLAIN ANALYZE SELECT * FROM user_accounts WHERE profile_data @> '{"tier": "enterprise"}';
```

---

## 15. Senior Staff Interview Questions & Deep Dives

### Question 1: What is the PostgreSQL `InFailedSqlTransaction` error, why does it occur in test code, and why does SQLite conceal it?
**Answer**:
In PostgreSQL, transactions are strictly atomic state machines. If any statement within a transaction causes an error (such as an `IntegrityError` from a duplicate key or foreign key violation), PostgreSQL puts the entire transaction into an **ABORTED** state. Any subsequent statement sent on that connection—even a simple `SELECT 1`—will immediately fail with:
`sqlalchemy.exc.InternalError: (psycopg.errors.InFailedSqlTransaction) current transaction is aborted, commands ignored until end of transaction block`.
The only valid operation on an aborted transaction is an explicit `ROLLBACK`.
SQLite, by contrast, does not enter an aborted state on individual statement errors; it allows subsequent statements to execute on the same connection. If backend error-handling code fails to issue a rollback after catching an error, the code passes in SQLite tests but crashes on the very next query in PostgreSQL production.

### Question 2: Why are `JSONB` containment queries (`@>`) preferred over standard text serialization in PostgreSQL, and how do integration tests verify their GIN index usage?
**Answer**:
- PostgreSQL `JSON` stores data as exact text, requiring re-parsing on every query. `JSONB` decomposes the JSON into parsed binary format, eliminating re-parsing overhead and supporting GIN (Generalized Inverted Index) indexing.
- The containment operator (`@>`) checks whether a JSONB document contains another JSONB structure (e.g. `metadata @> '{"status": "active"}'`). With a GIN index (`CREATE INDEX ON table USING gin (metadata)`), containment searches execute in logarithmic time ($O(\log N)$) rather than full table scans.
- Integration tests verify index usage by executing `EXPLAIN (FORMAT JSON) SELECT ...` and asserting that the query plan specifies an `Index Scan using idx_metadata_gin` rather than a `Seq Scan`.

---

## 16. Hands-on Engineering Exercises & Challenges

### Exercise 1: Demonstrating SQLite Dialect Incompatibility
1. Create a model using `sqlalchemy.dialects.postgresql.JSONB`.
2. Write a test that attempts to execute `.contains({"tier": "gold"})` against SQLite.
3. Observe the compilation failure.
4. Re-run the test against PostgreSQL and observe it pass cleanly.

### Exercise 2: Testing a Deadlock / Lock Timeout
Using two separate database connections:
1. Connection 1 locks Row A, then attempts to lock Row B.
2. Connection 2 locks Row B, then attempts to lock Row A.
3. Set `SET lock_timeout = '1s'`.
4. Assert that PostgreSQL detects the deadlock or timeout and raises `OperationalError`.

---

## 17. Summary, Cross-References & Further Reading

Testing against real PostgreSQL eliminates the dangerous illusions created by in-memory SQLite. By leveraging real PostgreSQL containers, verifying native `JSONB` operators, and enforcing row-level locking semantics, backend teams deliver resilient, high-concurrency systems.

### Cross-References:
- Previous: [SQLAlchemy 2.0 Testing Harnesses](sqlalchemy-testing.md)
- Next: [Transaction Rollback Sandboxing](transaction-and-rollback.md)
- [Containerized Dependencies with Testcontainers](testcontainers-testing.md)
- [FastAPI Database Integration Testing](api-integration-testing.md)
