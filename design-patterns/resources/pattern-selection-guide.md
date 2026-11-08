---
title: "Design Pattern Selection Guide"
category: "Design Patterns"
type: "Resources"
permalink: /design-patterns/resources/pattern-selection-guide/
tags: [resources, guide, decision-matrix, architecture, gof]
summary: "A practical decision guide and diagnostic flowchart to help you choose the right design pattern for any engineering problem."
---

# Design Pattern Selection Guide 🧭

> *"Don't start with a pattern and try to force a problem into it. Start with the problem and let the symptoms guide you to the pattern."*

---

## 1. Master Decision Flowchart

```mermaid
flowchart TD
    Start["What is your primary architectural challenge?"]

    Start --> Creation["Object Creation & Instantiation"]
    Start --> Structure["Structural Composition & Wiring"]
    Start --> Behavior["Algorithmic Flow & Communication"]

    %% Creational Branch
    Creation --> C1{"Do you need exactly ONE shared instance?"}
    C1 -- Yes --> S["Singleton"]
    C1 -- No --> C2{"Are you constructing a complex multi-step object?"}
    C2 -- Yes --> B["Builder"]
    C2 -- No --> C3{"Is cloning existing objects cheaper/easier?"}
    C3 -- Yes --> P["Prototype"]
    C3 -- No --> C4{"Do you need a single object or a FAMILY of objects?"}
    C4 -- Single Product --> FM["Factory Method"]
    C4 -- Family of Products --> AF["Abstract Factory"]

    %% Structural Branch
    Structure --> S1{"Are you integrating two incompatible interfaces?"}
    S1 -- Yes --> Ad["Adapter"]
    S1 -- No --> S2{"Are you splitting a class along 2 orthogonal axes?"}
    S2 -- Yes --> Br["Bridge"]
    S2 -- No --> S3{"Is your data a recursive tree (part-whole hierarchy)?"}
    S3 -- Yes --> Co["Composite"]
    S3 -- No --> S4{"Do you want to add behaviors dynamically at runtime?"}
    S4 -- Yes --> Dec["Decorator"]
    S4 -- No --> S5{"Do you need a simplified front door to a complex subsystem?"}
    S5 -- Yes --> Fac["Facade"]
    S5 -- No --> S6{"Are millions of objects exhausting RAM?"}
    S6 -- Yes --> Fly["Flyweight"]
    S6 -- No --> Pr["Proxy (Lazy loading / Caching / Access Control)"]

    %% Behavioral Branch
    Behavior --> B1{"Do you need to pass a request through a pipeline of handlers?"}
    B1 -- Yes --> CoR["Chain of Responsibility"]
    B1 -- No --> B2{"Do you need Undo/Redo, task queuing, or command logging?"}
    B2 -- Yes --> Cmd["Command"]
    B2 -- No --> B3{"Do you need to broadcast events to multiple subscribers?"}
    B3 -- Yes --> Obs["Observer"]
    B3 -- No --> B4{"Does behavior alter dynamically as state changes (FSM)?"}
    B4 -- Yes --> St["State"]
    B4 -- No --> B5{"Do you have interchangeable algorithms swapped at runtime?"}
    B5 -- Yes --> Str["Strategy"]
    B5 -- No --> B6{"Do you have an invariant algorithm with subclass steps?"}
    B6 -- Yes --> TM["Template Method"]
    B6 -- No --> B7{"Do you want to add operations to a class graph without changing classes?"}
    B7 -- Yes --> Vis["Visitor"]
    B7 -- No --> B8{"Do you want to decouple chaotic N-to-N communication?"}
    B8 -- Yes --> Med["Mediator"]
    B8 -- No --> Mem["Memento (State snapshot & rollback)"]
```

---

## 2. Problem-to-Pattern Diagnostic Table

| If you see this code smell or symptom... | The root problem is... | Apply this pattern |
| :--- | :--- | :--- |
| Giant `switch` statement over string types during `new` calls | Tight coupling to concrete classes | [Factory Method](../creational/factory-method.md) |
| A constructor taking 10+ arguments with many `null` or boolean defaults | Telescoping constructor anti-pattern | [Builder](../creational/builder.md) |
| Multiple instances conflicting over a shared physical resource or socket | Uncoordinated state mutation | [Singleton](../creational/singleton.md) |
| Two classes do identical jobs but have incompatible method signatures | Third-party interface mismatch | [Adapter](../structural/adapter.md) |
| A class hierarchy multiplying into $N \times M$ subclasses | Orthogonal dimensions coupled together | [Bridge](../structural/bridge.md) |
| Complex recursive `instanceof` checks to unwrap nested objects and boxes | Missing common abstraction over part-whole trees | [Composite](../structural/composite.md) |
| Subclasses multiplying just to combine optional features (e.g. `LoggingAuthEncryptionService`) | Combinatorial inheritance explosion | [Decorator](../structural/decorator.md) |
| Client code importing 15 classes just to perform one basic business operation | Leaky subsystem abstractions | [Facade](../structural/facade.md) |
| Massive `OutOfMemoryError` caused by millions of similar small objects | Redundant duplicate intrinsic state in heap | [Flyweight](../structural/flyweight.md) |
| Heavyweight service slowing down application boot times | Missing lazy loading or security check | [Proxy](../structural/proxy.md) |
| Sequential validation checks hardcoded into one 500-line service method | Monolithic execution pipeline | [Chain of Responsibility](../behavioral/chain-of-responsibility.md) |
| Actions cannot be queued, scheduled, or undone | Actions are bound directly to UI triggers | [Command](../behavioral/command.md) |
| One object changes and multiple unrelated modules need to be updated | Polling or tight coupling | [Observer](../behavioral/observer.md) |
| Massive `switch (currentState)` statements duplicated across every method | Unencapsulated finite state machine | [State](../behavioral/state.md) |
| Multiple variations of an algorithm tangled inside conditional branches | Inability to swap algorithms dynamically | [Strategy](../behavioral/strategy.md) |
| Duplicate multi-step workflow across sibling classes | Code duplication in parallel algorithms | [Template Method](../behavioral/template-method.md) |
| Core domain classes bloated with dozens of unrelated export and audit methods | Operations coupled to data nodes | [Visitor](../behavioral/visitor.md) |

---

## 3. Four Questions to Ask Before Choosing a Pattern

1. **Am I over-engineering?** If standard OOP with clean methods and a constructor solves the problem, **do not introduce a pattern**. Patterns add architectural indirection.
2. **Can I use composition instead of inheritance?** Always lean toward patterns that compose behavior at runtime ([Strategy](../behavioral/strategy.md), [Decorator](../structural/decorator.md)) rather than static subclassing.
3. **Is the interface stable?** Patterns like [Visitor](../behavioral/visitor.md) and [Abstract Factory](../creational/abstract-factory.md) become painful if the underlying interfaces change frequently.
4. **Is there a modern language feature that replaces the pattern?** (e.g., Python first-class functions replace single-method Strategies; `@dataclass` replaces Builders for simple DTOs).
