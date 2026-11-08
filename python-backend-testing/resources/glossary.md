# Quality Architecture & Testing Glossary

> *"Clear terminology is the prerequisite for clear thinking. This glossary establishes standardized definitions across testing levels, architectural patterns, test double taxonomies, and testing economics."*

---

## Alphabetical Index

### A
- **Acceptance Criteria**: The formal, measurable conditions that a software system must satisfy to be accepted by end-users or stakeholders.
- **Aggregate Root (DDD)**: An entity within Domain-Driven Design that binds a cluster of domain objects together and enforces all internal business invariants across the boundary.
- **AnyIO**: An asynchronous networking and concurrency library that runs on top of both AsyncIO and Trio, providing unified structured concurrency primitives.
- **Argon2id**: The modern password-hashing algorithm recommended by OWASP, combining resistance against side-channel and GPU cracking attacks.
- **ASGI (Asynchronous Server Gateway Interface)**: The standard interface between async Python web frameworks (FastAPI, Starlette) and web servers (Uvicorn).
- **ASGITransport**: An in-memory HTTP transport provided by `httpx` that routes HTTP requests directly into an ASGI application coroutine without opening OS network sockets.
- **Assertion Roulette**: A test smell where a test function contains multiple unlabelled assert statements; when one fails, it is unclear which assertion triggered the failure without inspecting line numbers.
- **AST Rewriting (Abstract Syntax Tree)**: The technique employed by `pytest` during module import to transform standard Python `assert` statements into rich diagnostic objects that report sub-expression differences upon failure.

---

### B
- **Behavior-Driven Development (BDD)**: An agile development methodology focusing on user behavior and system specifications written in human-readable language (Given-When-Then).
- **Boundary Value Analysis (BVA)**: A test case design technique that focuses on testing values at the boundaries of input domains (e.g., $0$, $1$, $N-1$, $N$, $N+1$).
- **Branch Coverage ($C_1$)**: A metric measuring whether each conditional decision point (`if/else`, boolean expressions, match cases) in the codebase has been evaluated to both `True` and `False`.
- **Build Cop**: An assigned rotating role within an engineering squad responsible for monitoring CI/CD health, quarantining flaky tests, and unblocking the main build pipeline.

---

### C
- **Characterization Test (Golden Master)**: A test written against an existing legacy system to document and preserve its current actual behavior before refactoring, regardless of whether that behavior is bug-free.
- **Classicist (Detroit) School**: The school of TDD that favors state verification, in-memory fakes, and real code collaborators over interaction mocks.
- **Code Smell**: A structural surface indication in source or test code that usually corresponds to a deeper architectural weakness or maintainability liability.
- **`conftest.py`**: A specialized local configuration file in `pytest` used to share fixtures, plugins, and custom hooks across all tests within its directory tree without explicit imports.
- **Consumer-Driven Contract**: A testing pattern where service consumers define the expected request/response contracts that an upstream service provider must satisfy.
- **Cosmic Python**: The industry nickname for the architectural patterns described in *Architecture Patterns with Python* (Percival & Gregory), centered on Clean Architecture, Domain-Driven Design, and Event-Driven systems.
- **CQRS (Command Query Responsibility Segregation)**: An architectural pattern that separates read models (queries) from write models (commands).

---

### D
- **Deadlock**: A concurrency failure where two or more threads or transactions are unable to proceed because each is waiting for the other to release a lock.
- **Dependency Injection (DI)**: A design pattern where an object receives its dependencies from an external assembler rather than creating them internally.
- **Dependency Overrides**: The mechanism in FastAPI (`app.dependency_overrides`) that allows test harnesses to swap production dependencies (e.g., database sessions, auth guards) with test doubles.
- **Dummy**: A test double passed solely to satisfy method parameters or type signatures, never actually invoked or asserted upon during the test.
- **Dual-Write Anti-Pattern**: Attempting to update a database and publish to a message broker in separate operations without transactional guarantees; causes data loss if a crash occurs between the operations.

---

### E
- **End-to-End (E2E) Test**: A test verifying that an entire integrated system delivers expected customer outcomes across all boundaries (UI, network, APIs, database, external webhooks).
- **Equivalence Partitioning**: Dividing input data into valid and invalid partitions where all members of a partition are expected to be processed similarly by the system.
- **Event Loop**: The central execution coordinator in asynchronous programming that schedules and multiplexes non-blocking I/O tasks and coroutines.
- **Execnet**: The low-level inter-process communication protocol utilized by `pytest-xdist` to manage worker subprocesses over pipes or sockets.

---

### F
- **Fake**: A test double that has a working, fully functional implementation but takes shortcuts (such as using an in-memory dictionary instead of a database) that make it unsuitable for production.
- **FileLock**: A cross-platform file-locking mechanism used to synchronize operations across multiple `pytest-xdist` worker processes on a single filesystem.
- **Flake Rate**: The percentage of test suite runs that fail initially but succeed upon rerun: $\text{Flake Rate} = (\text{Runs with Reruns} / \text{Total Runs}) \times 100\%$.
- **Flaky Test**: A test that produces both passing and failing outcomes across different runs on the exact same code commit without changes.

---

### G
- **Given-When-Then**: The standard structural pattern for test design: **Given** the initial context/state, **When** an action is executed, **Then** assert the expected observable outcome.
- **Goodhart's Law in Testing**: *"When a measure becomes a target, it ceases to be a good measure."* Often observed when management enforces a strict 100% coverage target, prompting developers to write assert-free vanity tests.

---

### H
- **Hexagonal Architecture (Ports and Adapters)**: An architectural pattern that decouples core business domain logic from external technologies (databases, HTTP frameworks, message brokers) via ports (interfaces) and adapters (implementations).
- **Hypothesis**: The premier Python library for property-based testing, featuring automatic adversarial input generation and test case shrinking.

---

### I
- **Idempotency**: The property of an operation where executing it multiple times produces the exact same outcome as executing it once (e.g., HTTP `PUT`, `DELETE`, or payments with `Idempotency-Key`).
- **Integration Test**: A test verifying that two or more distinct architectural subsystems (e.g., Service Layer and PostgreSQL database) communicate and operate together correctly.
- **Invariant**: A business condition or rule that must always hold true across all valid states within a domain model or system aggregate.

---

### K
- **Killed Mutant**: In mutation testing, a synthetic code mutation that causes at least one test in the test suite to fail, successfully proving that the test suite caught the defect.

---

### L
- **Lifespan Manager**: The ASGI context manager protocol in FastAPI/Starlette managing application startup initialization and shutdown resource cleanup.
- **London (Mockist) School**: The school of TDD that emphasizes unit isolation through interaction testing, using mocks for all collaborators and verifying messages sent between objects.

---

### M
- **Meszaros Taxonomy**: The formal classification of test doubles into Dummies, Stubs, Spies, Mocks, and Fakes (*xUnit Test Patterns*, 2007).
- **Mock**: A test double pre-programmed with explicit expectations of method calls and parameter signatures that fails if unexpected interactions occur.
- **Mock Drift**: The dangerous divergence over time between a mock object's behavior and the actual behavior of the production dependency it simulates.
- **Monkeypatch**: Dynamically modifying attributes, functions, or environment variables at runtime during a test, with automatic reversion at teardown via the `monkeypatch` fixture.
- **Mutation Testing**: A quality assessment technique that injects deliberate syntactic defects into source code to verify whether test assertions are capable of detecting them.
- **Mutmut**: A leading Python mutation testing framework that injects AST mutations and computes mutation scores.
- **MVCC (Multi-Version Concurrency Control)**: The database concurrency mechanism used by PostgreSQL that provides transaction isolation without locking readers out of updated rows.

---

### O
- **Optimistic Locking**: A concurrency control pattern where records carry a version number; writes verify that the version hasn't changed since reading, raising a conflict error on collisions.
- **Outbox Pattern (Transactional Outbox)**: Persisting outbound domain events in an `outbox` table inside the exact same local database transaction as business state changes, guaranteeing at-least-once message delivery.

---

### P
- **Parallel Testing**: Distributing test execution across multiple CPU cores or machine nodes concurrently (e.g., via `pytest-xdist`).
- **Parametrization**: Running the exact same test function multiple times with varying sets of input arguments using `@pytest.mark.parametrize`.
- **Pessimistic Locking**: Acquiring explicit database row locks (`SELECT ... FOR UPDATE`) to prevent concurrent transactions from modifying data until the current transaction commits.
- **Property-Based Testing**: A testing approach where developers assert universal domain invariants across hundreds of auto-generated pseudo-random test inputs rather than testing hand-crafted examples.
- **Pytest**: The dominant functional testing framework in Python, featuring expressive assertions, dependency-injected fixtures, and a rich plugin ecosystem.

---

### Q
- **Quarantine**: The practice of temporarily marking flaky tests (`@pytest.mark.quarantined`) to exclude them from blocking pull request CI gates while they are being diagnosed and repaired.

---

### R
- **Red-Green-Refactor**: The foundational TDD rhythm: write a failing test (**Red**), write minimal code to pass the test (**Green**), and clean up code architecture while keeping tests passing (**Refactor**).
- **Regression Testing**: Re-running existing tests to confirm that new code changes or bug fixes have not inadvertently broken previously working functionality.
- **Repository Pattern**: An abstraction that mediates between the domain layer and data mapping layers, acting like an in-memory collection of domain entities.

---

### S
- **Savepoint Isolation**: Executing a test within a nested transaction savepoint (`SAVEPOINT`) and rolling back to that savepoint during teardown, enabling sub-millisecond database cleanup.
- **Scatter-Gather Architecture**: The distributed worker architecture used by `pytest-xdist` where a master controller discovers tests, distributes chunks to workers, and gathers reports.
- **Service Layer**: An architectural layer that defines application use cases and orchestrates domain aggregates, repositories, and external adapters.
- **Shrinking Engine**: The algorithm in Hypothesis that systematically reduces a complex failing test input down to the smallest possible minimal reproducing example.
- **Spy**: A test double that wraps a real dependency and records execution history (arguments, call counts, return values) for subsequent assertion.
- **Statement Coverage ($C_0$)**: The percentage of executable lines of code reached during a test run.
- **Stub**: A test double that returns hardcoded, canned responses to queries made during a test without performing any logic or interaction tracking.
- **Surviving Mutant**: A synthetic bug injected during mutation testing that went completely undetected by the test suite, revealing a gap in assertions or dead code.

---

### T
- **Ten-Minute Build Rule**: Martin Fowler's maxim that automated continuous integration builds must provide feedback to developers in under 10 minutes to maintain developer flow and prevent context switching.
- **Test Double**: The generic umbrella term for any object that stands in for a real production dependency during a test (Dummy, Stub, Spy, Mock, Fake).
- **Testing Honeycomb**: An architectural testing distribution model that emphasizes Service-Layer Integration tests as the widest layer, optimal for microservices.
- **Testing Pyramid**: Mike Cohn's classic model emphasizing a broad base of unit tests, a moderate tier of integration tests, and a small layer of E2E tests.
- **Time-Machine**: A high-performance Python library for mocking the system clock deterministically by intercepting C-level time queries.
- **Transactional Outbox**: See *Outbox Pattern*.

---

### U
- **Unit of Work (UoW)**: A design pattern that maintains a list of objects affected by a business transaction and coordinates the writing out of changes and resolution of concurrency conflicts.
- **Unit Test**: An automated test that verifies a small, isolated unit of code (a function, class, or domain aggregate) completely in memory without external I/O.

---

### V
- **Vanity Metric**: A metric (such as 100% statement coverage achieved without assertions) that looks impressive on executive dashboards but fails to reflect genuine software quality or defect prevention.

---

### W
- **Webhook HMAC Verification**: Cryptographically validating incoming webhook request bodies using HMAC-SHA256 signatures and timestamps to prevent forged requests and replay attacks.
- **Worker Node (`gwX`)**: An autonomous Python subprocess spawned by `pytest-xdist` to execute assigned test items concurrently in isolation.

---

## Summary & Cross-References

- Review senior interview concepts in [Senior/Staff Interview Q&A](interview-questions.md).
- Quick reference for pytest commands in [Pytest Complete Cheat Sheet](pytest-cheat-sheet.md).
- Master enterprise strategy in [Testing Strategy RFC Template](testing-strategy-template.md).
