# CQRS (Command Query Responsibility Segregation) Testing in Python ⚡

> **Authoritative Sources & Literature:**
> - Harry Percival & Bob Gregory: *Architecture Patterns with Python* (Chapter 12: Command-Query Responsibility Segregation, O'Reilly)
> - Martin Fowler: *CQRS Pattern* (martinfowler.com/bliki/CQRS.html)
> - Greg Young: *CQRS and Event Sourcing Documentation* (cqrs.files.wordpress.com)
> - Gerard Meszaros: *xUnit Test Patterns: Refactoring Test Code*

---

## 1. Conceptual Definition & Core Mental Model

**Command Query Responsibility Segregation (CQRS)** states that every method in an application should be either a **Command** (mutates state, returns no data) or a **Query** (returns data, mutates no state).

### The Problem: The Read-Model Impedance Mismatch
In traditional architectures, developers use the same Domain Models and Repositories for both writing and reading:
```python
# ❌ Reading through domain repositories to populate a simple dashboard table
batches = repo.list_all()  # Loads 5,000 aggregates and thousands of child OrderLines into RAM!
```
1. **Performance Disasters**: Reading through ORM aggregate roots causes massive $N+1$ query cascades, excessive memory consumption, and slow serializations.
2. **Domain Pollution**: Developers add read-only helper attributes to domain entities just to satisfy UI formatting requirements.

### The Mental Model: Asymmetric Pipelines
CQRS splits the architecture into two distinct, optimized paths:
1. **The Write Path (Commands)**: Traverses the Unit of Work, Repositories, and rich Domain Aggregates to enforce consistency rules and invariants.
2. **The Read Path (Queries)**: **Bypasses the Domain Model entirely!** Queries execute raw, optimized SQL directly against the database, returning plain Python dictionaries, tuples, or read-only DTOs.

```
                      ┌──────────────────────────────────────────────┐
                      │              Incoming Request                │
                      └──────────────────────┬───────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                         │
                 Is it a Command?                           Is it a Query?
                 (POST / Allocate)                          (GET / Allocations)
                        │                                         │
                        ▼                                         ▼
         ┌─────────────────────────────┐           ┌─────────────────────────────┐
         │ WRITE PATH (Commands)       │           │ READ PATH (Queries)         │
         │ - Command Handler           │           │ - Raw SQL / Asyncpg / Views │
         │ - Unit of Work & Repos      │           │ - Bypasses Domain Entities  │
         │ - Enforces Invariants       │           │ - Returns plain dictionaries│
         └──────────────┬──────────────┘           └──────────────┬──────────────┘
                        │                                         │
                        ▼                                         ▼
         ┌───────────────────────────────────────────────────────────────┐
         │                  Shared Relational Database                   │
         │            (Or Synchronized Read-Replica View)                │
         └───────────────────────────────────────────────────────────────┘
```

---

## 2. Why This Is Critical in Modern Python Backend Engineering

1. **Unconstrained Read Performance**: Read queries can use specialized SQL joins, database views, or Redis projections returning JSON in sub-milliseconds without ORM overhead.
2. **Simplified Write Models**: Domain models no longer need to support search, sorting, or complex projection queries; they focus 100% on protecting business rules.
3. **Targeted Testing Architecture**: Commands are tested in high gear using in-memory `FakeUnitOfWork` ($< 0.05\text{ms}$), while Queries are tested against real SQL database engines to verify view correctness.

---

## 3. Internal Mechanics & Architectural Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Test as Pytest Test Function
    participant CmdHandler as allocate(Command, UoW)
    participant UoW as UnitOfWork
    participant DB as Relational Database
    participant QueryView as get_allocations(QueryView)

    Note over Test,DB: Write Path Execution
    Test->>CmdHandler: allocate(order_id="o1", sku="DESK", qty=2)
    CmdHandler->>UoW: with uow: product.allocate(); uow.commit()
    UoW->>DB: INSERT INTO allocations ... (COMMIT)

    Note over Test,QueryView: Read Path Execution (Bypasses Domain Model!)
    Test->>QueryView: get_allocations_for_order("o1")
    QueryView->>DB: SELECT b.ref, a.sku FROM allocations ...
    DB-->>QueryView: Raw SQL rows
    QueryView-->>Test: [{"batch_ref": "b1", "sku": "DESK"}]
    Test->>Test: Assert read view reflects write command!
```

---

## 4. Standard Syntax, Signatures & Configuration

### The Write Model (Command Handler)

```python
from dataclasses import dataclass
from src.service_layer.unit_of_work import AbstractUnitOfWork

@dataclass(frozen=True)
class AllocateCommand:
    order_id: str
    sku: str
    qty: int

def handle_allocate(cmd: AllocateCommand, uow: AbstractUnitOfWork) -> None:
    with uow:
        product = uow.products.get(cmd.sku)
        product.allocate(cmd.order_id, cmd.qty)
        uow.commit()
```

### The Read Model (Raw SQL Query Function)

```python
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session

def get_allocations_for_order(order_id: str, session: Session) -> List[Dict[str, Any]]:
    query = text("""
        SELECT b.ref AS batch_ref, ol.sku, ol.qty
        FROM order_lines ol
        JOIN allocations a ON a.order_line_id = ol.id
        JOIN batches b ON b.id = a.batch_id
        WHERE ol.order_id = :order_id
    """)
    rows = session.execute(query, {"order_id": order_id}).mappings().all()
    return [dict(row) for row in rows]
```

---

## 5. Execution Lifecycle & Teardown Protocol

Testing CQRS systems requires testing both sides of the segregation:
1. **Commands**: Tested with `FakeUnitOfWork` to verify business invariants and commits.
2. **Queries**: Tested against real SQL databases (PostgreSQL or SQLite) to verify SQL syntax, column mappings, and JOIN logic.
3. **Integration Roundtrip**: Execute a Command, then invoke a Query to assert that the read model accurately reflects the write mutation.

---

## 6. Scopes, Isolation & System Boundaries

| Pipeline | Model Used | Execution Mechanism | Testing Strategy |
| :--- | :--- | :--- | :--- |
| **Write (Command)** | Pure Domain Aggregate (`Product`) | Unit of Work (`uow.commit()`) | High Gear with `FakeUnitOfWork` |
| **Read (Query)** | Read DTO / Plain `dict` | Raw SQL / Database View | Integration with real database session |
| **Read Projection** | Materialized View / Cache | Event Bus listener | Event synchronization tests |

---

## 7. Pytest Fixture & conftest Integration

```python
# tests/conftest.py
import pytest
from sqlalchemy.orm import Session
from src.service_layer.unit_of_work import FakeUnitOfWork

@pytest.fixture
def fake_uow() -> FakeUnitOfWork:
    return FakeUnitOfWork()

@pytest.fixture
def read_db(db_session: Session) -> Session:
    """Read-only test session bound to transactional SAVEPOINT."""
    return db_session
```

---

## 8. Step-by-Step Practical Python 3.10+ Walkthrough

Let's test both the write command handler and the read query view.

### Step 1: Write the Command Handler Test (High Gear)
```python
# tests/test_commands.py
import pytest
from src.domain.model import Product
from src.service_layer.unit_of_work import FakeUnitOfWork
from src.service_layer.commands import AllocateCommand, handle_allocate

def test_allocate_command_mutates_domain_state():
    uow = FakeUnitOfWork()
    uow.products.add(Product(sku="DESK-001", available_qty=20))

    cmd = AllocateCommand(order_id="order-99", sku="DESK-001", qty=5)
    handle_allocate(cmd, uow)

    assert uow.committed is True
    assert uow.products.get("DESK-001").available_qty == 15
```

### Step 2: Write the Read Query Test (Real SQL)
```python
# tests/test_queries.py
import pytest
from sqlalchemy import text
from src.views.queries import get_allocations_for_order

def test_query_returns_allocated_batches(read_db):
    # 1. Seed raw database tables (Simulating existing DB state)
    read_db.execute(text("""
        INSERT INTO batches (id, ref, sku, qty) VALUES (1, 'b-alpha', 'MONITOR-27', 10);
        INSERT INTO order_lines (id, order_id, sku, qty) VALUES (101, 'ord-777', 'MONITOR-27', 2);
        INSERT INTO allocations (order_line_id, batch_id) VALUES (101, 1);
    """))

    # 2. Execute Read Query function directly
    results = get_allocations_for_order(order_id="ord-777", session=read_db)

    # 3. Assert raw dictionary output
    assert len(results) == 1
    assert results[0]["batch_ref"] == "b-alpha"
    assert results[0]["sku"] == "MONITOR-27"
    assert results[0]["qty"] == 2

def test_query_returns_empty_list_for_unknown_order(read_db):
    results = get_allocations_for_order(order_id="unknown_order", session=read_db)
    assert results == []
```

---

## 9. Framework & Ecosystem Integration: Testing CQRS Roundtrip

A complete integration test verifying that a command executed on the write model immediately updates the read query view:

```python
# tests/test_cqrs_roundtrip.py
import pytest
from src.adapters.unit_of_work import SqlAlchemyUnitOfWork
from src.service_layer.commands import AllocateCommand, handle_allocate
from src.views.queries import get_allocations_for_order
from src.domain.model import Product

def test_cqrs_end_to_end_roundtrip(db_session_factory):
    uow = SqlAlchemyUnitOfWork(db_session_factory)

    # 1. Seed product via UoW
    with uow:
        uow.products.add(Product(sku="KEYBOARD-RGB", available_qty=50))
        uow.commit()

    # 2. Execute Write Command
    cmd = AllocateCommand(order_id="ord-e2e-1", sku="KEYBOARD-RGB", qty=3)
    handle_allocate(cmd, uow)

    # 3. Execute Read Query directly against the database
    session = db_session_factory()
    allocations = get_allocations_for_order(order_id="ord-e2e-1", session=session)
    session.close()

    assert len(allocations) >= 1
    assert allocations[0]["sku"] == "KEYBOARD-RGB"
    assert allocations[0]["qty"] == 3
```

---

## 10. Real-World Enterprise Scenario: Materialized Read Views (Eventual Consistency)

In high-scale architectures, write commands emit domain events that asynchronously update a read-optimized view table or Redis cache:

```python
# tests/test_eventual_consistency_projection.py
def test_projection_updates_read_view_on_event(read_db):
    from src.domain.events import OrderAllocated
    from src.views.projections import update_order_summary_projection

    event = OrderAllocated(order_id="ord_async_01", sku="LAMP", batch_ref="b_99")
    
    # Event handler updates read table
    update_order_summary_projection(event, session=read_db)

    # Query the projected read view
    row = read_db.execute(text("SELECT status FROM order_summaries WHERE order_id='ord_async_01'")).scalar()
    assert row == "ALLOCATED"
```

---

## 11. Anti-Patterns & Code Smells (Before vs After)

### Anti-Pattern 1: Querying Repositories for UI Views
```python
# ❌ BEFORE: Querying domain model repository for list/filter views (Horribly slow!)
products = repo.list()
return [{"sku": p.sku, "qty": p.available_qty} for p in products]

# ✅ AFTER: Direct SQL Query View bypassing domain entities
return get_product_summary_view(session)
```

### Anti-Pattern 2: Mutating State Inside Query Functions
```python
# ❌ BEFORE: Side-effects in a GET query function
def get_user(user_id):
    user = query_user(user_id)
    user.last_login = now()  # Violates CQRS! Read must NEVER write!
```

---

## 12. Best Practices & Production Guidelines

1. **Commands Return Nothing (or Identifiers Only)**: Write operations should not return rich domain entities.
2. **Queries Bypass Domain Entities Completely**: Read functions execute optimized SQL and return plain dictionaries or tuples.
3. **Test Commands with `FakeUnitOfWork`**: Keep write logic tests running in $< 0.05\text{ms}$.
4. **Test Queries with Real PostgreSQL Sessions**: Verify SQL column mappings, joins, and indexing against real database engines.

---

## 13. Comprehensive Trade-Off Matrix

| Dimension | Standard Single Model | CQRS (Commands & Queries Split) |
| :--- | :--- | :--- |
| **Read Speed** | Slow (ORM overhead & N+1) | **Maximum (Raw SQL / Views)** |
| **Write Model Simplicity** | Complex (Supports both read & write) | **Simple (Focuses purely on invariants)** |
| **Testing Isolation** | Fragile (Tangled dependencies) | **Clean (Commands faked, Queries SQL-checked)** |
| **Code Overhead** | Low (Single repository) | Moderate (Two separate pipelines) |

---

## 14. Diagnostic & Troubleshooting Playbook

### Issue 1: Read Query reflects stale data
- **Root Cause**: In asynchronous CQRS, the read projection event has not yet been processed by the background worker.
- **Remediation**: In synchronous integration tests, invoke the projection handler inline before executing the read query.

### Issue 2: `KeyError` on SQL row mapping
- **Root Cause**: SQL query column alias did not match the expected dictionary key.
- **Remediation**: Use explicit `AS column_name` in raw SQL statements.

---

## 15. Senior Staff Interview Questions & Answers

### Question 1: Why does CQRS advocate bypassing Domain Models and Repositories entirely for Read operations?
**Answer**:
Domain Models exist to **protect business invariants and enforce consistency** during state changes (validating stock, checking credit limits, calculating complex discounts).
When reading data to populate a dashboard, mobile screen, or CSV report, **zero invariants are being enforced**. You are simply fetching data to display.
If reads traverse the domain model:
1. The ORM must instantiate dozens of domain entity objects, load unneeded child collections, and execute multiple database queries ($N+1$ problem).
2. The domain model becomes cluttered with query-specific methods (`get_orders_sorted_by_date_with_customer_names()`).
By bypassing the Domain Model and using raw SQL or database views for reads, queries execute directly in the database engine, return plain dictionaries, and achieve 10x higher throughput while keeping the Domain Model clean and focused.

### Question 2: How does testing differ between the Write side and the Read side of a CQRS architecture?
**Answer**:
Testing is segregated to match the architectural intent:
1. **The Write Side (Commands)**:
   - Evaluates business rules and invariants.
   - Tested in **High Gear** using `FakeUnitOfWork` in pure Python memory ($< 0.05\text{ms}$ per test).
   - Zero database required; asserts that valid commands commit and invalid commands raise domain exceptions.
2. **The Read Side (Queries)**:
   - Evaluates SQL queries, joins, filtering, and pagination.
   - Tested against **real relational databases** (PostgreSQL via Testcontainers).
   - Zero domain models required; asserts that seeded raw database rows are correctly selected, transformed, and returned as DTOs.

---

## 16. Practical Hands-On Exercises & Challenges

### Exercise 1: Build a Raw SQL Read View for Product Catalogs
1. Write a raw SQL query `get_catalog_view(session, min_stock=5)`.
2. Write a test asserting that products with available stock $\ge 5$ are returned with proper column names, and out-of-stock products are omitted.

### Exercise 2: Testing CQRS Command Validation
1. Create a command `CancelOrderCommand(order_id="o1")`.
2. Write a unit test verifying that cancelling an already-shipped order raises a domain `OrderAlreadyShippedError` and does not commit the UoW.

---

## 17. Key Takeaways & Summary

- **CQRS separates mutative Commands from data-fetching Queries**.
- **Commands traverse the Unit of Work and Domain Entities** to protect invariants.
- **Queries bypass Domain Models entirely**, executing raw SQL for maximum performance.
- **Enables targeted testing**: ultra-fast in-memory command tests and SQL-accurate read tests.

---

## 18. Next Steps & Cross-References

- Next: [Dependency Injection & Bootstrapping](dependency-injection.md)
- [The Service Layer Pattern](service-layer.md)
- [The Unit of Work (UoW) Pattern](unit-of-work.md)
- [The Repository Pattern](repository-pattern.md)
- [Domain Events & Message Bus Testing](domain-events-and-message-bus-testing.md)
