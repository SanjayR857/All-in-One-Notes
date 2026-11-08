# All-in-One Software Engineering Knowledge System 📐🛠️🧪

> A curated digital garden, architectural encyclopedia, and production-grade engineering handbook based on foundational software engineering literature:
> 1. ***[Dive Into Design Patterns](design-patterns/)*** — Object-oriented architecture, SOLID principles, and the 23 Gang of Four design patterns (Alexander Shvets).
> 2. ***[Dive Into Refactoring](refactoring/)*** — The 24 classic code smells, 66 safe refactoring techniques, and comprehensive testing strategies (Alexander Shvets & Martin Fowler).
> 3. ***[Python Backend Testing & Quality Architecture](python-backend-testing/)*** — Test-driven development, modern pytest mastery, architecture & domain testing, and framework test harnesses (Brian Okken, Harry Percival & Bob Gregory).
>
> All implementations are written in modern, type-hinted **Python 3 (Python 3.10+)** with companion **`pytest`** behavioral contracts and interactive text-based **Mermaid.js** diagrams.

---

## 🏛️ The Three Pillars of Engineering Excellence

This repository integrates architectural design, safe refactoring transformations, and deterministic quality assurance into a unified engineering workflow:

```mermaid
graph TD
    subgraph Pillar1 ["Pillar 1: Architecture & Design Patterns"]
        SOLID["SOLID & OOP Principles"]
        Patterns["23 GoF Design Patterns<br/>(Creational, Structural, Behavioral)"]
        ArchModels["Enterprise Architectures<br/>(Hexagonal, Ports & Adapters, CQRS)"]
    end

    subgraph Pillar2 ["Pillar 2: Diagnostics & Safe Refactoring"]
        Smells["24 Code Smells<br/>(Bloaters, OO Abusers, Couplers)"]
        Techniques["66 Refactoring Techniques<br/>(Composing, Moving, Conditionals)"]
        Pythonic["Pythonic Refactoring<br/>(Dataclasses, Protocols, Generators)"]
    end

    subgraph Pillar3 ["Pillar 3: Automated Testing & Verification"]
        Fnd["Testing Foundations & Topologies<br/>(Pyramid, TDD High/Low Gear, Isolation)"]
        PytestCore["Pytest Mastery<br/>(Fixtures, Scopes, Parametrize, Mocking)"]
        Harnesses["Framework & DB Harnesses<br/>(FastAPI, SQLAlchemy 2.0, Testcontainers)"]
    end

    Patterns -->|Structures Clean Code| Techniques
    Smells -->|Diagnoses Need for| Techniques
    Techniques -->|Paves the Way For| Patterns
    Fnd -->|Guarantees Behavior Invariance| Techniques
    Harnesses -->|Verifies Real Architecture| ArchModels
    PytestCore -->|Enables Fast Feedback| Pillar1
```

---

## 🧭 Master Navigation & Knowledge Hubs

### 1. 📐 [Design Patterns Knowledge System](design-patterns/) (46 Guides)
A comprehensive architecture reference for building flexible, loosely coupled software:
* 🏛️ **[Foundations](design-patterns/foundations/)**: [SOLID Principles](design-patterns/foundations/solid-principles.md), [OOP Pillars](design-patterns/foundations/oop-pillars.md), and [Object Relationships](design-patterns/foundations/object-relationships.md).
* 🏭 **[Creational Patterns (5)](design-patterns/creational/)**: Factory Method, Abstract Factory, Builder, Prototype, and Singleton.
* 🔌 **[Structural Patterns (7)](design-patterns/structural/)**: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, and Proxy.
* 🚦 **[Behavioral Patterns (10)](design-patterns/behavioral/)**: Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, and Visitor.
* ⚖️ **[Direct Pattern Comparisons (6)](design-patterns/comparisons/)**: Strategy vs. State, Decorator vs. Proxy, Adapter vs. Facade vs. Proxy, etc.
* 💳 **[Enterprise System Case Studies (5)](design-patterns/practical-examples/)**: Payment Systems, Notifications, Document Editors, Logging Frameworks, and E-Commerce.
* ⚡ **[Revision Tools](design-patterns/resources/)**: [22-Pattern Cheat Sheet](design-patterns/resources/pattern-cheat-sheet.md), [Selection Decision Guide](design-patterns/resources/pattern-selection-guide.md), and [Interview Q&A](design-patterns/resources/interview-questions.md).

---

### 2. 🛠️ [Refactoring Knowledge System](refactoring/) (135 Guides)
A safe, disciplined playbook for recognizing code rot and systematically cleaning legacy software:
* 📖 **[Foundations (8)](refactoring/foundations/)**: [What is Refactoring?](refactoring/foundations/what-is-refactoring.md), [Technical Debt](refactoring/foundations/technical-debt.md), [Refactoring vs. Rewriting](refactoring/foundations/refactoring-vs-rewriting.md), and [Testing Preconditions](refactoring/foundations/safe-refactoring-and-testing.md).
* 🧪 **[Testing Strategy (5)](refactoring/testing/)**: Characterization Tests, Golden Master Testing, and Pytest Fixtures for legacy code.
* 👃 **[The 24 Code Smells (29)](refactoring/code-smells/)**: Diagnostic checklists across Bloaters, Object-Orientation Abusers, Change Preventers, Dispensables, and Couplers.
* ✂️ **[The 66 Refactoring Techniques (73)](refactoring/techniques/)**: Step-by-step transformations across Composing Methods, Moving Features, Organizing Data, Simplifying Conditionals, Simplifying Method Calls, and Generalization.
* 🐍 **[Pythonic Refactoring (7)](refactoring/python-refactoring/)**: Idiomatic refactorings using dataclasses, protocols, comprehensions, and generators.
* 🏰 **[Real-World Case Studies (5)](refactoring/case-studies/)**: Taming God classes, eliminating duplicate logic, and modernizing legacy services.
* 🗺️ **[Diagnostic & Connection Matrices (4)](refactoring/matrices/)**: Smell-to-Technique Matrix, Technique-to-Pattern Architectural Bridge, and Diagnostic Flowcharts.
* ⚡ **[Resources & Interview Prep (3)](refactoring/resources/)**: One-page Refactoring Cheat Sheet, 25 Senior Interview Q&As, and Complete Glossary.

---

### 3. 🧪 [Python Backend Testing Knowledge System](python-backend-testing/) (14 Modules)
An enterprise-grade testing manual and quality architecture encyclopedia based on Brian Okken (*Python Testing with pytest*) and Harry Percival & Bob Gregory (*Architecture Patterns with Python*):
* 🏛️ **[Foundations (8)](python-backend-testing/foundations/)**: [Testing Fundamentals](python-backend-testing/foundations/software-testing-fundamentals.md), [Testing Pyramid & Topologies](python-backend-testing/foundations/testing-pyramid.md), [Unit vs. Int vs. E2E](python-backend-testing/foundations/unit-vs-integration-vs-e2e.md), [TDD High & Low Gear](python-backend-testing/foundations/test-driven-development.md), [Coverage & Mutation Testing](python-backend-testing/foundations/test-coverage.md), and [Test Isolation & Sandboxing](python-backend-testing/foundations/test-isolation.md).
* ⚙️ **[Pytest Fundamentals](python-backend-testing/pytest-fundamentals/)**: Fixture dependency injection, scopes, parametrized data tests, `conftest.py` cascades, custom markers, and plugin hooks.
* 🎛️ **[Advanced Pytest](python-backend-testing/advanced-pytest/)**: `Mock` vs. `MagicMock`, `monkeypatch`, `pytest-mock`, async testing with `pytest-asyncio`, exception assertions, and debugging workflows.
* 🔬 **[Unit Testing](python-backend-testing/unit-testing/)**: Domain logic, service layer orchestration, boundary value analysis, and dependency isolation.
* 🗄️ **[Integration Testing](python-backend-testing/integration-testing/)**: PostgreSQL with SQLAlchemy 2.0, nested transaction (`SAVEPOINT`) sandboxing, and containerized dependencies via Testcontainers.
* ⚡ **[Modern Framework Testing](python-backend-testing/fastapi-testing/)**: FastAPI with `httpx.AsyncClient`, lifespan management, dependency overrides, schema validation, and JWT security.
* 🏛️ **[Architecture & Testing (Cosmic Python)](python-backend-testing/architecture-and-testing/)**: Repository Pattern, Unit of Work, Service Layer, Domain Model invariants, Domain Events, and CQRS.
* 🤖 **[AI-Assisted & DevOps QA](python-backend-testing/ai-assisted-testing/)**: Mutation testing (`mutmut`), property-based testing (`hypothesis`), Docker pipelines, and GitHub Actions CI matrices.

---

## 📋 The Golden Anatomy Standard

Every guide across this repository strictly adheres to an uncompromising quality standard:
1. **Source Traceability:** Direct attribution to Brian Okken, Harry Percival, Bob Gregory, Martin Fowler, Alexander Shvets, and Gang of Four literature.
2. **Interactive Visuals:** Standardized Mermaid.js diagrams (Architecture, Sequence, State, Flowchart).
3. **Runnable Modern Python 3:** Complete, runnable, type-hinted code implementations (`typing.Protocol`, `@dataclass`, `enum`).
4. **Behavioral Test Verification:** Companion `pytest` suites proving that observable functionality remains 100% invariant.
