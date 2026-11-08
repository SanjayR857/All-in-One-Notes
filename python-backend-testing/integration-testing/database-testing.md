# Database Integration Testing & Migration Strategies 💾

> **Authoritative Sources & Literature:**
> - Mike Bayer: *Alembic Database Migration Architecture & Operations* (alembic.sqlalchemy.org)
> - Martin Fowler & Pramod Sadalage: *Refactoring Databases: Evolutionary Database Design* (Addison-Wesley)
> - Brian Okken: *Python Testing with pytest* (Chapter 3: Fixtures & Scopes)
> - PostgreSQL Global Development Group: *Transaction Isolation & Constraints*

---

## 1. Conceptual Definition & Core Mental Model

**Database Integration Testing** verifies that application code, database schemas, foreign key constraints, and relational queries function harmoniously against a genuine database engine.

A comprehensive database testing strategy must validate two orthogonal domains:
1. **Schema Evolution (Migrations)**: Testing that database migration scripts (`Alembic`) apply cleanly from `base` to `head`, and that rollback scripts (`downgrade`) cleanly revert without data loss or locking deadlocks.
2. **Data Manipulation & Query Contracts**: Testing that CRUD operations, joins, cascading deletes, transactions, and concurrency locks execute correctly under relational database engines.

```
       [ Test Session Starts ]
                  │
       Run Alembic Migrations: alembic.command.upgrade(cfg, "head")
                  │
       Seed Immutable Reference Data (Currencies, Countries, Roles)
                  │
       ┌────────────────────────────────────────────────────────┐
       │ Per-Test Loop: Open SAVEPOINT -> Run Test -> ROLLBACK │
       └────────────────────────────────────────────────────────┘
                  │
       [ Optional CI Gate: Verify alembic.command.downgrade(cfg, "base") ]
```

---

## 2. Why This Is Critical in Modern Python Backend Engineering

1. **Catching Migration Disasters in CI**: Developers frequently write migrations that work locally on empty tables, but fail in production (e.g. adding a `NOT NULL` column without a `server_default`, causing PostgreSQL to lock tables and reject existing rows).
2. **The "Bypassing Migrations" Trap**: Teams often use `Base.metadata.create_all(engine)` in their tests because it is faster than running Alembic. **This is a dangerous anti-pattern**: your test suite passes, but production explodes because the actual Alembic migration script has a missing import or broken foreign key!
3. **Verifying Relational Integrity**: Python unit tests cannot verify that deleting a `Customer` automatically cascades to delete their `Orders` and `Invoices` (`ON DELETE CASCADE`). Only real database testing verifies constraints.

---

## 3. The Database Testing Lifecycle Architecture

```mermaid
sequenceDiagram
    autonumber
    participant Session as Pytest Session (Once per Run)
    participant Container as PostgreSQL Engine
    participant Alembic as Alembic Migration Engine
    participant Test as Individual Test Function
    
    Session->>Container: Initialize Database Connection
    Session->>Alembic: 1. Run Migrations: upgrade head
    Alembic->>Container: Execute DDL (CREATE TABLE, ALTER, INDEX)
    Session->>Container: 2. Insert Immutable Seed Data (e.g. USD, EUR, GBP)
    
    loop For Every Test Function
        Test->>Container: 3. Begin Nested SAVEPOINT
        Test->>Container: Run application queries / mutations
        Test-->>Container: Assert DB state
        Test->>Container: 4. ROLLBACK to SAVEPOINT
    end
    
    Session->>Alembic: 5. Optional CI Check: downgrade base
    Session->>Container: Dispose Connection Pool
```

---

## 4. Standard Syntax, Signatures & Key Options

### Programmatic Alembic Execution Inside Pytest
Alembic provides a Python API (`alembic.command`) that allows running migrations directly from pytest fixtures:

```python
from alembic.config import Config
from alembic import command
from pathlib import Path

def run_migrations_up(database_url: str):
    """Programmatically runs all pending Alembic migrations to head."""
    ini_path = Path(__file__).parents[2] / "alembic.ini"
    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(alembic_cfg, "head")

def run_migrations_down(database_url: str):
    """Programmatically rolls back all migrations to base."""
    ini_path = Path(__file__).parents[2] / "alembic.ini"
    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    command.downgrade(alembic_cfg, "base")
```

---

## 5. Lifecycle, Execution Flow & Teardown Mechanics

- **Session Setup**: Migrations run **once** at the start of the entire pytest session.
- **Per-Test Execution**: Each test runs inside a nested transaction (`SAVEPOINT`).
- **Session Teardown**: The connection is closed and the container is stopped.

### Why You Should NEVER Re-Run Migrations Per Test
Running migrations takes $1 - 3$ seconds. Running migrations for 500 tests takes **25 minutes**. Running migrations once at `session` scope and using `SAVEPOINT` rollbacks per test takes **0.8 seconds** total!

---

## 6. Scopes, Hierarchy, or Test Boundaries

```
[ Session Scope ]
  ├── Ephemeral PostgreSQL Container (Testcontainers)
  ├── Alembic DDL Migrations (alembic upgrade head)
  └── Static Reference Data (Countries, Roles, Currencies)
        │
[ Function Scope ]
  └── SAVEPOINT Rollback Sandbox (Prisinte per test)
```

---

## 7. Pytest Fixture & `conftest.py` Integration Patterns

```python
# tests/integration/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from src.database.migrations import run_migrations_up, run_migrations_down

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/test_db"

@pytest.fixture(scope="session")
def migrated_database():
    """
    Session-scoped fixture:
    1. Runs Alembic migrations to head.
    2. Yields database URL.
    3. (Optional) Rolls back migrations to base on session exit.
    """
    run_migrations_up(DATABASE_URL)
    yield DATABASE_URL
    # Optional teardown check:
    # run_migrations_down(DATABASE_URL)

@pytest.fixture(scope="session")
def db_engine(migrated_database):
    engine = create_engine(migrated_database, pool_pre_ping=True)
    yield engine
    engine.dispose()
```

---

## 8. Practical Python Implementation: Step-by-Step Walkthrough

We will implement a **Reversible Migration Test Suite** that tests both `alembic upgrade head` and `alembic downgrade -1`, proving that database migrations can be rolled back safely.

### Step 1: Writing a Dedicated Migration Rollback Test

```python
# tests/integration/test_migrations.py
import pytest
from alembic.config import Config
from alembic import command
from pathlib import Path
from sqlalchemy import inspect, create_engine

@pytest.mark.integration
def test_alembic_migrations_upgrade_and_downgrade():
    """
    Verifies that all migrations can cleanly:
    1. Upgrade from base to head.
    2. Downgrade from head back to base.
    3. Re-upgrade back to head.
    Guarantees zero syntax errors or irreversibility in Alembic scripts!
    """
    db_url = "postgresql+psycopg://postgres:postgres@localhost:5432/test_db"
    ini_path = Path(__file__).parents[2] / "alembic.ini"
    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)

    engine = create_engine(db_url)

    # 1. Downgrade completely to base (Clean slate)
    command.downgrade(alembic_cfg, "base")
    inspector = inspect(engine)
    # Only alembic_version table should remain
    tables = [t for t in inspector.get_table_names() if t != "alembic_version"]
    assert len(tables) == 0

    # 2. Upgrade to head
    command.upgrade(alembic_cfg, "head")
    inspector = inspect(engine)
    assert "users" in inspector.get_table_names()
    assert "orders" in inspector.get_table_names()

    # 3. Test rolling back exactly one revision (downgrade -1)
    command.downgrade(alembic_cfg, "-1")

    # 4. Re-apply to head so remaining tests have a migrated DB
    command.upgrade(alembic_cfg, "head")
    engine.dispose()
```

### Step 2: Testing Foreign Key Cascade Deletion

```python
# tests/integration/test_foreign_key_cascades.py
import pytest
from sqlalchemy.orm import Session
from src.models import CustomerORM, OrderORM

@pytest.mark.integration
def test_customer_deletion_cascades_to_orders(db_session: Session):
    # 1. Arrange: Create Customer and associated Order
    customer = CustomerORM(id="cust_1", name="Alice")
    order = OrderORM(id="ord_1", customer_id="cust_1", total_amount=150.0)
    db_session.add(customer)
    db_session.add(order)
    db_session.commit()

    # Verify both rows exist in PostgreSQL
    assert db_session.query(CustomerORM).filter_by(id="cust_1").count() == 1
    assert db_session.query(OrderORM).filter_by(id="ord_1").count() == 1

    # 2. Act: Delete Customer
    db_session.delete(customer)
    db_session.commit()

    # 3. Assert: PostgreSQL Foreign Key CASCADE automatically deleted the order!
    assert db_session.query(CustomerORM).filter_by(id="cust_1").count() == 0
    assert db_session.query(OrderORM).filter_by(id="ord_1").count() == 0
```

---

## 9. Framework-Specific Integration: Handling Reference Data Seeding

In many enterprise applications, certain tables must contain static reference data (e.g. country codes, tax brackets, system roles) for any test to execute.

Seed this data **once at session scope** after migrations complete:

```python
# tests/integration/conftest.py
@pytest.fixture(scope="session", autouse=True)
def seed_reference_data(db_engine):
    """Seeds immutable static reference tables once for the entire session."""
    with Session(db_engine) as session:
        # Check if already seeded
        if session.query(CurrencyORM).count() == 0:
            session.add_all([
                CurrencyORM(code="USD", name="US Dollar", symbol="$"),
                CurrencyORM(code="EUR", name="Euro", symbol="€"),
                CurrencyORM(code="GBP", name="British Pound", symbol="£"),
            ])
            session.commit()
```

---

## 10. Real-World Enterprise Backend Scenario: Zero-Downtime Multi-Step Migrations

In high-traffic enterprise architectures:
- Migrations must be zero-downtime (e.g. the **Expand and Contract Pattern** for renaming columns).
- When renaming `phone` to `phone_number`:
  1. Migration 1 (Expand): Adds `phone_number` as nullable, writes a DB trigger to sync values.
  2. Application code starts reading from `phone_number`.
  3. Migration 2 (Contract): Drops the old `phone` column.
- Database tests run automated migration suites against loaded dummy datasets to prove that Migration 1 does not lock the table or disrupt running queries.

---

## 11. Anti-Patterns & Common Pitfalls

### Anti-Pattern 1: Bypassing Alembic with `create_all()`
```python
# ❌ DANGEROUS: Bypasses migration scripts!
Base.metadata.create_all(engine)
```
- **Consequence**: The test suite passes against your in-memory metadata, but production crashes because an Alembic script had a syntax error, bad import, or incompatible index.
- **Fix**: Always run `command.upgrade(alembic_cfg, "head")`.

### Anti-Pattern 2: Running Truncations inside Session Fixtures
Truncating tables inside a `session`-scoped fixture deletes the static reference data seeded at startup, breaking subsequent tests.

---

## 12. Best Practices & Production Guidelines

1. **Test Both Upgrade and Downgrade**: Include an automated test in CI that verifies migrations can downgrade cleanly without errors.
2. **Run Migrations Once per Session**: Use `scope="session"` for Alembic execution.
3. **Use Real PostgreSQL via Docker**: Never test PostgreSQL migrations against SQLite; syntax, data types, and constraint rules diverge completely.
4. **Isolate Tests with Nested SAVEPOINTs**: Never commit data directly in tests unless testing isolation levels; use savepoints to roll back.

---

## 13. Trade-Off Analysis: Schema Setup Approaches

| Approach | Migration Parity | Setup Speed | Catches DDL Bugs? |
| :--- | :--- | :--- | :--- |
| **Alembic `upgrade head` (Session)** | **100% Real Parity** | Fast ($\approx 2\text{s}$ once) | **Yes** |
| **`Base.metadata.create_all()`** | Zero (Bypasses scripts) | Fast ($\approx 0.5\text{s}$) | **No (Disaster risk)** |
| **Alembic per Test** | 100% Real Parity | **Extremely Slow (Minutes)** | Yes |
| **Pre-Migrated Docker Image** | 100% Real Parity | Fastest startup | Yes (Requires Docker build) |

---

## 14. Diagnostic & Debugging Playbook

```bash
# 1. Print current Alembic database revision in test database:
alembic current

# 2. Check for migration branch heads (detects merge conflicts):
alembic heads

# 3. Inspect PostgreSQL constraints and indexes using psql:
psql -h localhost -U postgres -d test_db -c "\d+ orders"
```

---

## 15. Senior Staff Interview Questions & Deep Dives

### Question 1: Why is testing the `downgrade` path in Alembic migrations critical, and what common SQL operations make a migration irreversible?
**Answer**:
In production continuous delivery pipelines, automated rollback scripts rely on `alembic downgrade -1` when a deployment fails health checks. If the downgrade script fails, the production database is left in a corrupted intermediate state requiring manual emergency hotfixes.
**Common Irreversible Operations**:
1. Dropping a column (`op.drop_column`) without a backup table: when downgraded, the column is recreated, but **all original data is permanently lost**.
2. Narrowing data types (e.g. changing `VARCHAR(255)` to `VARCHAR(50)`): if strings longer than 50 characters were inserted, downgrading back requires truncation.
3. Data migrations: updating rows without recording the inverse transformation.
Testing downgrade in CI ensures that every schema modification has a verified, executable exit strategy.

### Question 2: Why should `Base.metadata.create_all()` never be used in integration test suites of mature projects?
**Answer**:
`Base.metadata.create_all()` generates DDL directly from the current state of SQLAlchemy ORM Python models. However, in production, databases are updated via **Alembic migration revision files**.
Over time, discrepancies (schema drift) inevitably occur:
- An Alembic script might include custom PostgreSQL indexes (`CREATE INDEX CONCURRENTLY`), partial indexes, triggers, or custom constraints that are not declared in the Python model.
- An Alembic script might have syntax errors, circular dependencies, or invalid foreign key references.
If tests use `create_all()`, they test against a synthetic schema that **does not exist in production**, giving false confidence while allowing broken migration scripts to deploy to production.

---

## 16. Hands-on Engineering Exercises & Challenges

### Exercise 1: Writing an Automated Migration Parity Check
Using `alembic.command.check`, write a pytest test that verifies there are no ungenerated migrations (i.e. ensures that no developer modified an SQLAlchemy model without running `alembic revision --autogenerate`).

### Exercise 2: Testing Unique Constraint Violations
Given an `AccountORM` with a `unique=True` constraint on `email`:
1. Insert a user with `email="test@corp.com"`.
2. Attempt to insert a second user with the same email in the same session.
3. Assert that SQLAlchemy raises `sqlalchemy.exc.IntegrityError`.
4. Verify that rolling back the session restores transaction health.

---

## 17. Summary, Cross-References & Further Reading

Database testing guarantees that persistent data structures, constraints, and migrations function flawlessly under real relational engines. By running Alembic migrations once at session scope and verifying foreign key cascades, backend teams ensure evolutionary database health.

### Cross-References:
- Previous: [API Integration Testing](api-integration-testing.md)
- Next: [SQLAlchemy 2.0 Testing Harnesses](sqlalchemy-testing.md)
- [Production-Parity PostgreSQL Testing](postgresql-testing.md)
- [Transaction Rollback Sandboxing](transaction-and-rollback.md)
