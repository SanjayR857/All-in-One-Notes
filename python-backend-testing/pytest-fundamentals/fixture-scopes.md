# Fixture Scopes, Lifecycle & Mutation Safety ⏱️

> **Authoritative Sources & Literature:**
> - Brian Okken: *Python Testing with pytest* (Chapter 3: pytest Fixtures - Fixture Scope, Pragmatic Bookshelf)
> - Gerard Meszaros: *xUnit Test Patterns: Refactoring Test Code* (Fresh Fixture vs. Shared Fixture Pattern)
> - Holger Krekel: *Pytest Fixture Lifecycle & Scope Internals* (docs.pytest.org)

---

## 1. Conceptual Definition & Core Mental Model

A fixture's **scope** defines its lifecycle boundary: **when it is created, how many times it is reused, and when its teardown executes**.

In modern Python backend testing, choosing the correct fixture scope is the critical engineering lever balancing **test execution velocity** against **deterministic test isolation**:
- **Too Narrow (`function` for everything)**: The test suite is hermetically isolated, but painfully slow (e.g., spinning up a Docker database or recompiling ORM schemas for every single test).
- **Too Broad (`session` for everything)**: The test suite executes in seconds, but tests suffer from **shared mutable state pollution**, causing flaky tests and order-dependent bugs.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SESSION SCOPE                             │
│                  (Created once per test run; e.g. Docker Engine)       │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                            MODULE SCOPE                            │ │
│ │             (Created once per test file; e.g. Static Mock)         │ │
│ │                                                                    │ │
│ │ ┌──────────────────────────────┐  ┌──────────────────────────────┐ │ │
│ │ │        FUNCTION SCOPE        │  │        FUNCTION SCOPE        │ │ │
│ │ │  (Fresh per test; e.g. Tx)   │  │  (Fresh per test; e.g. Tx)   │ │ │
│ │ │        [ Test 1 ]            │  │        [ Test 2 ]            │ │ │
│ │ └──────────────────────────────┘  └──────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why This Is Critical in Modern Python Backend Engineering

1. **The Performance Cliff**: In a project with 800 integration tests, starting a PostgreSQL container takes $\approx 3$ seconds. If the container fixture is `function`-scoped, the suite takes **40 minutes** to run! By changing the container to `session` scope and using a `function`-scoped transaction rollback fixture, the suite runs in **12 seconds**.
2. **Eliminating the Shared Mutable State Trap**: When developers define a `session`-scoped database session or cache, Test 1 modifies a row, and Test 2 crashes because it expects pristine data.
3. **Preventing Scope Inversion Crashes**: Pytest strictly validates scope boundaries. A wide-scoped fixture cannot depend on a narrow-scoped fixture.

---

## 3. The Five Pytest Scopes

```mermaid
graph LR
    subgraph Broadest ["Broadest Lifecycle (Shared)"]
        S["session<br/>Once per pytest run"]
        P["package<br/>Once per directory package"]
        M["module<br/>Once per test_*.py file"]
        C["class<br/>Once per TestClass"]
        F["function (Default)<br/>Once per test function"]
    end
    S --> P --> M --> C --> F
```

### Detailed Breakdown of Scopes

| Scope | Frequency of Execution | When Teardown Runs | Mutation Safety Rule | Typical Backend Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`function`** (Default) | Once per test function | Immediately after the test completes | **100% Safe** for mutation | DB transactions, HTTP clients, auth tokens |
| **`class`** | Once per test class | After the last method in the class completes | Must reset class state | Expensive class-level mocks |
| **`module`** | Once per test file | After the last test in the module completes | **Read-Only**: Do not mutate! | Static JSON schemas, compiled regexes |
| **`package`** | Once per package directory | After all tests in the package complete | **Read-Only**: Do not mutate! | Subsystem configuration |
| **`session`** | Once per entire pytest run | At the very end of the entire test run | **Strictly Read-Only** | Docker containers, DB engines, base app |

---

## 4. The Cardinal Rules of Scoping

### Rule 1: The Dependency Scope Hierarchy
A fixture can **only depend on fixtures of equal or broader scope**:
- A `function` fixture CAN depend on `function`, `module`, or `session` fixtures.
- A `session` fixture CANNOT depend on a `function` fixture!

```python
# ❌ SCOPE MISMATCH ERROR: Session fixture depending on function fixture!
@pytest.fixture(scope="function")
def function_user():
    return User("Alice")

@pytest.fixture(scope="session")
def session_report(function_user): # CRASHES AT STARTUP!
    ...
```
Pytest halts with: `ScopeMismatch: You tried to access the function scoped fixture function_user from a session scoped fixture session_report`.

### Rule 2: The Immutability Mandate for Shared Scopes
> [!WARNING]
> Any fixture with a scope broader than `function` (`module`, `package`, `session`) **must be treated as strictly immutable**. If a test mutates a shared fixture, it pollutes the environment for all subsequent tests.

---

## 5. Standard Syntax, Signatures & Key Options

### Specifying Scope
```python
import pytest

@pytest.fixture(scope="session")
def shared_resource():
    ...

@pytest.fixture(scope="module")
def module_resource():
    ...

@pytest.fixture(scope="function") # Default (can be omitted)
def fresh_resource():
    ...
```

### Dynamic Fixture Scoping
You can determine fixture scope dynamically at runtime using a callable that inspects command-line configuration:

```python
def determine_db_scope(fixture_name, config):
    if config.getoption("--reuse-db"):
        return "session"
    return "function"

@pytest.fixture(scope=determine_db_scope)
def database():
    ...
```

---

## 6. Lifecycle, Execution Flow & Teardown Mechanics

Notice how pytest interleaves setups and teardowns across multiple scopes:

```mermaid
sequenceDiagram
    autonumber
    participant Runner as Pytest Runner
    participant SessionFix as session fixture (Engine)
    participant ModuleFix as module fixture (Schema)
    participant FunctionFix as function fixture (Transaction)
    participant Test1 as test_create_order()
    participant Test2 as test_cancel_order()
    
    Runner->>SessionFix: Setup Engine (ONCE)
    Runner->>ModuleFix: Setup Schema (ONCE per file)
    
    Note over Runner,Test1: Running Test 1
    Runner->>FunctionFix: Setup Transaction 1 (SAVEPOINT)
    FunctionFix->>Test1: Execute test
    Test1-->>FunctionFix: Pass
    FunctionFix->>FunctionFix: Teardown Transaction 1 (ROLLBACK)
    
    Note over Runner,Test2: Running Test 2
    Runner->>FunctionFix: Setup Transaction 2 (SAVEPOINT)
    FunctionFix->>Test2: Execute test
    Test2-->>FunctionFix: Pass
    FunctionFix->>FunctionFix: Teardown Transaction 2 (ROLLBACK)
    
    Runner->>ModuleFix: Teardown Schema
    Runner->>SessionFix: Teardown Engine (At end of run)
```

---

## 7. Scopes, Hierarchy, or Test Boundaries

```
[ Session Scope: Testcontainers PostgreSQL Container ]
         │ (Instantiated 1x for all 1,000 tests)
         ▼
[ Session Scope: SQLAlchemy Database Engine & Connection Pool ]
         │ (Instantiated 1x)
         ▼
[ Session Scope: Run Alembic Database Migrations ]
         │ (Executed 1x to establish base tables)
         ▼
[ Function Scope: Nested Transaction (SAVEPOINT) Sandbox ]
           (Created & Rolled back for every individual test)
```

---

## 8. Practical Python Implementation: Step-by-Step Walkthrough

We will build the industry-standard **Two-Tier High-Performance Database Harness** that bridges a `session`-scoped engine to a `function`-scoped transaction sandbox.

### Step 1: Define Application Models

```python
# src/models.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from decimal import Decimal

class Base(DeclarativeBase):
    pass

class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[str] = mapped_column(primary_key=True)
    balance: Mapped[Decimal] = mapped_column()
```

### Step 2: Implement Multi-Tier Scoped Fixtures

```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from src.models import Base, Wallet
from decimal import Decimal

# Tier 1: Shared Database Engine (Session Scope - 1x setup)
@pytest.fixture(scope="session")
def engine():
    """Created ONCE for the entire test session."""
    engine = create_engine("postgresql+psycopg://postgres:postgres@localhost:5432/test_db")
    # Run schema migrations once
    Base.metadata.create_all(engine)
    yield engine
    # Teardown once at the end of all tests
    Base.metadata.drop_all(engine)
    engine.dispose()

# Tier 2: Transactional Sandbox (Function Scope - Fresh for every test!)
@pytest.fixture(scope="function")
def db_session(engine) -> Session:
    """
    Connects to shared engine, opens a transaction with SAVEPOINT,
    and rolls back on teardown. Takes only 1ms!
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### Step 3: Tests Verifying Speed and Hermetic Isolation

```python
# tests/integration/test_wallets.py
from src.models import Wallet
from decimal import Decimal

def test_deposit(db_session):
    wallet = Wallet(id="w1", balance=Decimal("100.00"))
    db_session.add(wallet)
    db_session.flush()

    assert db_session.query(Wallet).count() == 1

def test_initial_clean_state(db_session):
    # Because test_deposit rolled back, count is guaranteed to be 0!
    assert db_session.query(Wallet).count() == 0
```
*Performance Benchmark*: Running 100 tests with this pattern takes **~0.15s**, whereas recreating the database on `function` scope takes **~45s**.

---

## 9. Framework-Specific Integration: FastAPI Async Lifespan Scoping

For FastAPI applications, initialize the app once at `session` scope, but initialize the `AsyncClient` at `function` scope:

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI
from src.main import app

@pytest.fixture(scope="session")
def fastapi_app() -> FastAPI:
    """Session-scoped FastAPI application instance."""
    return app

@pytest.fixture(scope="function")
async def client(fastapi_app: FastAPI) -> AsyncClient:
    """Function-scoped HTTP client ensuring clean connection state per test."""
    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app),
        base_url="http://testserver"
    ) as ac:
        yield ac
```

---

## 10. Real-World Enterprise Backend Scenario: Microservices Auth Token Caching

In an enterprise microservices backend, generating an RSA-signed JWT token requires loading a 4096-bit private key and computing cryptographic signatures (taking $\approx 50\text{ms}$ per token).
- **Optimization**: A `session`-scoped fixture generates and signs static service tokens (`admin_jwt_token`, `readonly_jwt_token`) once at startup.
- **Isolation Protection**: The tokens are immutable string constants, so sharing them across 2,000 unit and integration tests is **100% safe** and eliminates 100 seconds of cryptographic overhead from CI runs.

---

## 11. Anti-Patterns & Common Pitfalls

### Anti-Pattern 1: The Mutated Session Cache
```python
# ❌ DISASTER: Mutating a session fixture leaks state across tests!
@pytest.fixture(scope="session")
def global_cache():
    return {}

def test_add_to_cache(global_cache):
    global_cache["user_1"] = "Alice" # POLLUTION!

def test_cache_is_empty(global_cache):
    # FAILS if test_add_to_cache ran beforehand!
    assert len(global_cache) == 0
```

### Anti-Pattern 2: The Over-Scoped Client Session
Making an `httpx.AsyncClient` or `requests.Session` fixture `session`-scoped without clearing cookies or auth headers. Test 1 logs in as Admin, and Test 2 (testing anonymous access) accidentally sends Admin cookies.

---

## 12. Best Practices & Production Guidelines

1. **Default to `function` Scope**: Always start with `function` scope. Only widen to `module` or `session` when profiling shows significant setup overhead.
2. **Never Mutate Broader-Scoped Fixtures**: If a fixture has `scope="module"` or `scope="session"`, treat its return value as frozen/immutable.
3. **Bridge Scopes with Adapters**: Combine `session`-scoped infrastructure (Docker, connection pools) with `function`-scoped handles (transactions, temporary files).
4. **Audit Lifecycles with `--setup-show`**: Regularly run `pytest --setup-show` to verify that expensive resources are not being accidentally re-created on every test.

---

## 13. Trade-Off Analysis: Scoping Strategies

| Strategy | Speed | Isolation Guarantee | Flakiness Risk | Implementation Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Pure Function Scoping** | Extremely Slow | Absolute (100%) | Near Zero | Trivial |
| **Bridged (Session Engine + Function Transaction)** | Ultra-Fast | High (Transactional) | Low | Moderate |
| **Pure Session Scoping** | Maximum | Poor (Zero Isolation) | Critical | High (Requires manual resets) |

---

## 14. Diagnostic & Debugging Playbook

```bash
# 1. Print the visual hierarchy of setup and teardowns for every scope
pytest --setup-show

# 2. Inspect fixture plan without running tests
pytest --setup-plan

# 3. Check execution time spent in fixture setup vs test execution
pytest --durations=10
```

---

## 15. Senior Staff Interview Questions & Deep Dives

### Question 1: How do you design a database testing fixture architecture that achieves sub-second test execution across hundreds of tests without risking state pollution?
**Answer**:
We use the **Bridged Two-Tier Architecture**:
1. At **`session` scope**, we instantiate the database engine, connect to PostgreSQL (or spin up a Testcontainer), and run Alembic migrations once to establish the schema. This takes 2–3 seconds total.
2. At **`function` scope**, for each individual test, we check out a raw connection from the pool, issue `BEGIN`, and open a `SAVEPOINT`. We bind our SQLAlchemy `Session` to this nested savepoint.
3. During test execution, application code can query, insert, and even call `session.commit()` (which SQLAlchemy intercepts and turns into a savepoint release).
4. On fixture teardown (post-`yield`), we issue an immediate `ROLLBACK` on the outer connection. This takes $\approx 1\text{ms}$ per test, leaves the database completely clean, and eliminates all state pollution.

### Question 2: Why does pytest raise a `ScopeMismatch` error when a `session` fixture requests a `function` fixture, but allows a `function` fixture to request a `session` fixture?
**Answer**:
A `session` fixture is instantiated once and lives for the entire pytest process. A `function` fixture is instantiated and destroyed for each test function. If a `session` fixture were permitted to depend on a `function` fixture, the `session` fixture would be holding a reference to a resource that has already been torn down and garbage-collected after the first test, resulting in undefined behavior or dead references on subsequent tests. Conversely, a `function` fixture can safely depend on a `session` fixture because the `session` fixture is guaranteed to outlive the test function.

---

## 16. Hands-on Engineering Exercises & Challenges

### Exercise 1: Profiling and Optimizing Fixture Scopes
Given a test suite where 50 integration tests each spin up a mock Redis server via a `function`-scoped fixture, taking 25 seconds total:
1. Run `pytest --setup-show` and calculate the redundant setup overhead.
2. Refactor the Redis server fixture to `session` scope.
3. Create a `function`-scoped `clean_redis` fixture that calls `redis.flushdb()` on teardown.
4. Measure the speedup.

### Exercise 2: Catching a Scope Inversion Bug
Create a minimal pytest project where a `module`-scoped fixture depends on a `function`-scoped fixture. Run pytest, capture the `ScopeMismatch` error, and resolve it properly using the dependency hierarchy rules.

---

## 17. Summary, Cross-References & Further Reading

Mastering fixture scopes is essential for building scalable, fast, and deterministic backend test suites. By pairing immutable session-scoped infrastructure with isolated function-scoped transactional handles, engineering teams achieve both blazing execution speed and absolute test reliability.

### Cross-References:
- Previous: [Centralized Configuration with conftest.py](conftest.md)
- Next: [Data-Driven Parametrization](parametrization.md)
- [Transaction Rollback Sandboxing](../integration-testing/transaction-and-rollback.md)
- [PostgreSQL Testing with Testcontainers](../integration-testing/testcontainers-testing.md)
