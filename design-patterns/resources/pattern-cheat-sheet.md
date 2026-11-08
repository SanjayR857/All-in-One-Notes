---
title: "Design Patterns 22-Pattern Cheat Sheet"
category: "Design Patterns"
type: "Resources"
permalink: /design-patterns/resources/pattern-cheat-sheet/
tags: [resources, cheat-sheet, quick-reference, gof]
summary: "A rapid-revision cheat sheet covering all 22 Gang of Four design patterns: intents, JDK examples, and key trade-offs."
---

# Design Patterns 22-Pattern Cheat Sheet 📑

> *"A rapid-reference guide summarizing every Gang of Four design pattern for quick review, architectural design sessions, and interview preparation."*

---

## 🏭 Creational Patterns (5 Patterns)

| Pattern | Also Known As | Core Mechanism | 1-Sentence Intent | JDK / Spring Example | Key Trade-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Factory Method](../creational/factory-method.md)** | Virtual Constructor | Inheritance | Subclasses decide which concrete class to instantiate. | `Calendar.getInstance()` | May create too many small subclasses. |
| **[Abstract Factory](../creational/abstract-factory.md)** | Kit | Composition | Produces families of related products without specifying concrete classes. | `DocumentBuilderFactory` | Hard to add new product *types*. |
| **[Builder](../creational/builder.md)** | — | Composition | Constructs complex objects step-by-step; separates construction from representation. | `StringBuilder`, `@Builder` | Duplicates fields in builder class. |
| **[Prototype](../creational/prototype.md)** | Clone | Composition | Clones existing objects without coupling to concrete classes. | `Object.clone()` | Deep-copying nested objects is difficult. |
| **[Singleton](../creational/singleton.md)** | — | Static Gateway | Guarantees exactly one instance of a class with global access. | `Runtime.getRuntime()` | Violates SRP; hard to unit test/mock. |

---

## 🏛️ Structural Patterns (7 Patterns)

| Pattern | Also Known As | Core Mechanism | 1-Sentence Intent | JDK / Spring Example | Key Trade-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Adapter](../structural/adapter.md)** | Wrapper | Composition / Inheritance | Converts one interface into another interface expected by clients. | `Arrays.asList()`, `InputStreamReader` | Adds an extra layer of indirection. |
| **[Bridge](../structural/bridge.md)** | Handle/Body | Composition | Decouples an abstraction from its implementation so both vary independently ($N+M$). | JDBC Drivers (`DriverManager`) | Requires up-front architectural design. |
| **[Composite](../structural/composite.md)** | — | Recursive Composition | Composes objects into tree structures; treats leaves and branches uniformly. | `xml.etree.ElementTree`, PyQt `QWidget`/`QLayout` | Difficult to restrict leaf-specific types. |
| **[Decorator](../structural/decorator.md)** | Wrapper | Recursive Composition | Attaches dynamic behaviors to objects at runtime without subclass explosion. | `BufferedInputStream(FileInputStream)` | Hard to remove a specific inner wrapper. |
| **[Facade](../structural/facade.md)** | — | Delegation | Provides a simplified, high-level front door to a complex subsystem. | `JdbcTemplate`, SLF4J | Risk of becoming a monolithic God Object. |
| **[Flyweight](../structural/flyweight.md)** | Cache | State Sharing | Shares immutable intrinsic state among millions of fine-grained objects. | `Integer.valueOf()` (-128..127) | Trades minor CPU overhead for memory savings. |
| **[Proxy](../structural/proxy.md)** | Surrogate | Composition | Provides a placeholder to control access, lazy-load, log, or cache requests. | `unittest.mock.Mock`, SQLAlchemy Lazy Loading | Response latency slightly delayed by checks. |

---

## 🚦 Behavioral Patterns (10 Patterns)

| Pattern | Also Known As | Core Mechanism | 1-Sentence Intent | JDK / Spring Example | Key Trade-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Chain of Responsibility](../behavioral/chain-of-responsibility.md)** | Pipeline | Linked List Delegation | Passes a request sequentially along a chain of candidate handlers. | `javax.servlet.Filter` | Requests may drop off chain unhandled. |
| **[Command](../behavioral/command.md)** | Action, Transaction | Encapsulation | Encapsulates a request as an object, enabling queuing, undo/redo, and logging. | Celery / RQ Tasks, `concurrent.futures.Future` | Increases number of command classes. |
| **[Iterator](../behavioral/iterator.md)** | Cursor | Composition | Traverses complex collections sequentially without exposing internal structures. | Python `__iter__()`/`__next__()`, `itertools` | Overkill for simple contiguous arrays. |
| **[Mediator](../behavioral/mediator.md)** | Hub, Controller | Star Topology | Centralizes communication among peer components, eliminating spaghetti dependencies. | Air Traffic Control, Swing Dialogs | Risk of the mediator becoming a God Object. |
| **[Memento](../behavioral/memento.md)** | Snapshot | Encapsulated State | Captures and restores an object's internal state without violating encapsulation. | `Serializable`, DB Savepoints | Storing full snapshots can consume high RAM. |
| **[Observer](../behavioral/observer.md)** | Pub/Sub, Listener | Broadcast | Notifies multiple subscriber objects automatically when a subject's state changes. | `ActionListener`, `@EventListener` | Can cause memory leaks (lapsed listeners). |
| **[State](../behavioral/state.md)** | — | Composition | Alters object behavior when internal state changes (clean state machines). | TCP Connection Sockets | Can be overkill for simple boolean flags. |
| **[Strategy](../behavioral/strategy.md)** | Policy | Composition | Defines a family of interchangeable algorithms swappable at runtime. | `Comparator.compare()` | Clients must know algorithm differences. |
| **[Template Method](../behavioral/template-method.md)** | Template | Inheritance | Defines the invariant skeleton of an algorithm, deferring steps to subclasses. | `InputStream.read()`, `AbstractList` | Bound by compile-time inheritance rigidity. |
| **[Visitor](../behavioral/visitor.md)** | Double Dispatch | Polymorphic Callback | Adds new operations across an object hierarchy without modifying their classes. | `ast.NodeVisitor`, `os.walk()` | Fragile: adding new element classes breaks all visitors. |
