# SQLite vs. PostgreSQL in Database Integration Testing

> *"Testing PostgreSQL code against in-memory SQLite is like practicing flying a Boeing 747 in a Cessna flight simulator. It feels fast and easy until you encounter real-world aerodynamics."*

---

## 1. Conceptual Mental Model & Theoretical Foundations

In Python backend systems utilizing SQLAlchemy or SQLModel, engineering teams face a fundamental database testing architectural decision:
1. **The In-Memory SQLite Illusion**: Swap the database connection string in tests to `sqlite:///:memory:`. Tests run in under 2 milliseconds without Docker containers or network sockets.
2. **The Production-Parity PostgreSQL Approach**: Spin up a containerized PostgreSQL instance (via Docker, Testcontainers, or CI service containers) and run tests against the real engine using **Transaction Savepoint Rollbacks**.

```
In-Memory SQLite:
[ Pytest Runner ] ──> SQLite C-Library in RAM (Dialect Emulation, Single Writer Lock)
(Sub-millisecond speed, but masks dialect, locking, and constraint bugs)

Containerized PostgreSQL with Savepoints:
[ Pytest Runner ] ──> Unix Socket / Loopback TCP ──> Real PostgreSQL 16 (MVCC, JSONB, Row Locks)
(High fidelity, real dialect; 3-5ms execution when using SAVEPOINT rollback)
```

---

## 2. The Dangerous Discrepancies: What SQLite Silently Masks

| Feature / Behavior | PostgreSQL 16 | SQLite 3 | Impact on Testing |
| :--- | :--- | :--- | :--- |
| **`JSONB` Operators** | Native `@>`, `?`, `jsonb_extract_path` | Limited text-based JSON functions | Queries fail with `OperationalError` in prod |
| **Row-Level Locking** | `SELECT ... FOR UPDATE` locks specific rows | Locks the entire database file | Fails to detect concurrency race conditions |
| **Concurrency Model** | Full MVCC (Multi-Version Concurrency Control) | Single-writer serialized lock | Deadlock detection is impossible in SQLite |
| **Case-Insensitive Match** | `ILIKE` operator natively supported | `LIKE` is case-insensitive for ASCII only; `ILIKE` syntax error | Query works in SQLite but crashes in Postgres |
| **Array Types** | First-class `ARRAY(Integer)`, `ARRAY(String)` | Unsupported natively (Stored as BLOB/text) | Complex array indexing cannot be tested |
| **Foreign Key Enforcement** | Always enforced strictly | **Disabled by default** unless explicit `PRAGMA` enabled | Cascading delete bugs slip into production |
| **Enums** | Native `CREATE TYPE mood AS ENUM (...)` | Simulated via text check constraints | Enum migration failures go undetected |
| **Schema Isolation** | Multi-schema support (`search_path`) | Single schema (or attached database files) | Multi-tenant schema isolation cannot be verified |

---

## 3. Concrete Code Demonstration: The Bug That SQLite Missed

Consider this e-commerce inventory query utilizing PostgreSQL's `JSONB` containment operator and pessimistic row locking:

### The Production Query (`app/inventory.py`)

```python
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import ProductModel


def find_in_stock_products_by_tag(session: Session, tag: str):
    """Find products matching JSON metadata tag with pessimistic lock."""
    stmt = (
        select(ProductModel)
        .where(ProductModel.metadata_tags.contains([tag]))  # PostgreSQL JSONB @>
        .with_for_update()                                   # Row-level lock
    )
    return session.execute(stmt).scalars().all()
```

### What Happens When Tested Against SQLite:
```
sqlalchemy.exc.CompileError: SQLite does not support 'FOR UPDATE' clause.
# OR:
sqlite3.OperationalError: no such function: json_contains
```
To "make it pass" on SQLite, developers often strip the `with_for_update()` lock or rewrite queries into non-idiomatic workarounds, directly compromising production concurrency and performance.

---

## 4. The Solution: PostgreSQL at Sub-Millisecond Speed

The historic argument for SQLite was execution speed: restarting a database between tests took seconds. With modern **Transaction Savepoint Rollbacks**, PostgreSQL integration tests run in **3 to 5 milliseconds per test**:

```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Run once per test session: connect to containerized PostgreSQL
engine = create_engine("postgresql://postgres:postgres@localhost:5432/test_db")


@pytest.fixture(scope="function")
def db_session():
    """Wrap each test in an outer transaction with savepoint rollback."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, expire_on_commit=False)

    yield session

    session.close()
    transaction.rollback()  # 100% cleanup in 2 milliseconds!
    connection.close()
```

---

## 5. Architectural Decision Matrix

| Dimension | In-Memory SQLite | Containerized PostgreSQL |
| :--- | :--- | :--- |
| **Setup Complexity** | Zero (Standard library) | Low (Docker Compose or CI service) |
| **Test Execution Speed** | $\approx 0.5\text{ms}$ per test | $\approx 3\text{--}8\text{ms}$ per test with Savepoints |
| **Dialect Accuracy** | Low (SQLite dialect) | **100% Production Parity** |
| **Constraint Enforcement** | Requires custom PRAGMA setup | Native ACID constraints |
| **Concurrency Testing** | Impossible (Single writer) | Fully supported (Thread & process safe) |
| **Recommended Use Case** | Pure unit testing of domain calculations | **All database integration and API tests** |

---

## 6. Senior/Staff Engineer Interview Q&A

### Q1: Why should an engineering team never use SQLite in CI if the production target is PostgreSQL?
> **Answer**: Testing against SQLite violates the principle of **Production Environment Parity**. While SQLAlchemy provides an abstract ORM layer, production databases rely heavily on database-specific optimizations: PostgreSQL `JSONB` indexing, `ILIKE` text matching, `DISTINCT ON`, sequence generators, and row-level concurrency locking (`SELECT ... FOR UPDATE`). 
> SQLite either does not support these features or implements them with fundamentally different semantics (such as locking the entire database on write). This creates a dangerous false sense of security: unit tests pass in CI on SQLite, but code crashes with syntax errors, deadlocks, or unique constraint violations upon production deployment. By using containerized PostgreSQL with transaction savepoint rollbacks, teams achieve 100% parity with zero speed compromise.

---

## Summary & Cross-References

- Learn PostgreSQL transaction rollback fixtures in [Transaction & Rollback Testing](../integration-testing/transaction-and-rollback.md).
- Master Testcontainers automation in [Testcontainers Integration Testing](../integration-testing/testcontainers-testing.md).
- Explore SQLAlchemy 2.0 testing patterns in [SQLAlchemy Testing](../integration-testing/sqlalchemy-testing.md).
