---
title: "Design Patterns Master Interview Guide"
category: "Design Patterns"
type: "Resources"
permalink: /design-patterns/resources/interview-questions/
tags: [resources, interview, questions, system-design, senior-engineer, gof]
summary: "Top 20 software architecture and Gang of Four design pattern interview questions with deep, senior-level model answers."
---

# Design Patterns Master Interview Guide 🎯

> *"Interviewers at top tech firms don't just ask for pattern definitions—they test your ability to recognize trade-offs, identify anti-patterns, and combine patterns to solve distributed system problems."*

---

## 🏛️ Part 1: Foundations & Core Principles

### Q1: What does "Favor object composition over class inheritance" mean, and what is the "Fragile Base Class" problem?
> **Model Answer:**  
> Inheritance represents white-box reuse where subclasses depend on the internal implementation mechanics of the parent class. The **Fragile Base Class** problem occurs when a change to a superclass inadvertently breaks subclasses (e.g., if a superclass method `addAll()` internally calls `add()`, and a subclass overrides both, elements get counted twice).  
> **Composition** represents black-box reuse where an object interacts with dependencies solely through public interfaces. It avoids combinatorial subclass explosion ($N \times M$ becomes $N + M$), preserves encapsulation, and allows behaviors to be swapped dynamically at runtime.

### Q2: How does the Open/Closed Principle (OCP) directly relate to design patterns?
> **Model Answer:**  
> OCP states that software entities should be open for extension, but closed for modification. Design patterns achieve this by encapsulating variability behind interfaces:
> * [Strategy](../behavioral/strategy.md) allows adding new algorithms without modifying the context class.
> * [Factory Method](../creational/factory-method.md) allows adding new product types without altering creation logic.
> * [Decorator](../structural/decorator.md) allows adding behaviors without altering existing classes.

---

## 🏭 Part 2: Creational Patterns

### Q3: How do you implement a thread-safe Singleton in Python?
> **Model Answer:**  
> The Bill Pugh Singleton uses a `private static` inner holder class:
```python
import threading


class SingletonMeta(type):
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
```
> It is superior because it achieves **thread-safe, lock-free lazy loading** without needing synchronization locks or the `volatile` keyword. The JVM class loader guarantees that the inner `Holder` class is only loaded into memory when `getInstance()` is called, triggering a thread-safe, one-time static initialization.

### Q4: Why is Joshua Bloch an advocate for Enum Singletons?
> **Model Answer:**  
> In Python, Singletons implemented via metaclasses or module-level singletons guarantee a single instance. However, if callers manually invoke `type(instance)()` or use deep copy without a custom `__deepcopy__`, new instances could be spawned unless guarded against.

### Q5: What is the fundamental difference between Factory Method and Abstract Factory?
> **Model Answer:**  
> * **Factory Method** relies on **class inheritance**: a Creator class delegates the creation of **one** product to its subclasses via a virtual method (`createProduct()`).
> * **Abstract Factory** relies on **object composition**: an object delegates the creation of a **family of related products** to an injected factory object containing multiple creation methods (`createChair()`, `createSofa()`).

---

## 🏛️ Part 3: Structural Patterns

### Q6: How do Decorator and Proxy differ if they share the exact same interface as the wrapped object?
> **Model Answer:**  
> The difference lies in **intent** and **lifecycle control**:
> * In **[Decorator](../structural/decorator.md)**, the wrapper's purpose is to add **new dynamic behaviors** (e.g., encryption, compression). The **client** explicitly chooses and stacks multiple decorator layers like Russian dolls.
> * In **[Proxy](../structural/proxy.md)**, the wrapper's purpose is to **control access, manage lifecycle, lazy-load, or cache**. The proxy often instantiates and manages the real service internally, and the client is typically unaware that a proxy is present.

### Q7: Explain how Spring AOP uses the Proxy pattern to implement `@Transactional`.
> **Model Answer:**  
> Spring wraps target bean classes in a dynamic JDK or CGLIB proxy. When client code invokes a `@Transactional` method, the proxy intercepts the call:
> 1. The proxy asks the `PlatformTransactionManager` to start a database transaction.
> 2. The proxy calls the real method on the target bean.
> 3. If the method succeeds, the proxy commits the transaction; if an unchecked exception is thrown, it rolls back.
> 4. The caller receives the result without any database transaction code polluting business logic.

### Q8: What is the Flyweight pattern, and how does the JVM use it for `Integer`?
> **Model Answer:**  
> Flyweight saves memory by sharing immutable **intrinsic state** across many objects while passing **extrinsic state** in as parameters. The JVM implements this in `Integer.valueOf(int)`: it maintains a static cache of `Integer` objects for numbers between `-128` and `127`. Calling `Integer.valueOf(10)` returns the same pre-allocated instance, reducing heap pressure.

---

## 🚦 Part 4: Behavioral Patterns

### Q9: What is the difference between Strategy and State patterns?
> **Model Answer:**  
> While structurally identical (Context delegates to an interface), their intents are opposites:
> * In **[Strategy](../behavioral/strategy.md)**, algorithms are **independent and oblivious to each other**. The client explicitly selects the strategy, which typically remains fixed throughout execution.
> * In **[State](../behavioral/state.md)**, states model a **finite state machine**. Concrete states know about each other and actively trigger transitions to sibling states dynamically based on context events.

### Q10: What is the "Lapsed Listener" problem in the Observer pattern, and how do you prevent it?
> **Model Answer:**  
> It is a memory leak that occurs when a short-lived subscriber registers with a long-lived publisher and fails to unsubscribe when destroyed. The publisher maintains a strong reference to the subscriber, preventing garbage collection.  
> **Prevention:**
> 1. Implement strict lifecycle hooks (`close()`, `dispose()`).
> 2. Use `WeakReference` in the publisher’s collection (`WeakHashMap`), allowing the GC to reclaim listeners automatically.

### Q11: Explain "Double Dispatch" in the Visitor pattern.
> **Model Answer:**  
> In Python, dynamic dispatch executes methods based on the runtime instance based on the declared variable type, not the runtime type. Double dispatch solves this:
> 1. First Dispatch: The client calls `node.accept(visitor)` (polymorphic virtual dispatch resolves the concrete Node type).
> 2. Second Dispatch: Inside `node.accept()`, it calls `visitor.visit(this)` (because `this` is explicitly known inside that class, it dispatches to the exact overloaded visitor method).

---

## 🏗️ Part 5: System Design Scenarios

### Q12: How would you design an Undo/Redo engine for a collaborative document editor?
> **Model Answer:**  
> Combine **[Command](../behavioral/command.md)**, **[Memento](../behavioral/memento.md)**, and **[Composite](../structural/composite.md)**:
> 1. Structure the document as a **Composite** tree (Document -> Sections -> Paragraphs -> Spans).
> 2. Encapsulate editing actions (Insert, Delete, Format) as **Command** objects.
> 3. Before mutating the document, the command captures a lightweight **Memento** snapshot of the affected nodes.
> 4. An `EditorHistory` stack tracks executed commands. When Undo is called, the stack pops the last command and calls its `undo()`, which restores state from the Memento.

### Q13: How would you architect a payment engine that supports multiple gateways with retries and audit logging?
> **Model Answer:**  
> 1. Use **[Strategy](../behavioral/strategy.md)** for gateway providers (Stripe, PayPal, Crypto).
> 2. Use **[Decorator](../structural/decorator.md)** to wrap the charging pipeline with cross-cutting concerns: `LoggingDecorator` and `RetryPolicyDecorator`.
> 3. Use **[Factory Method](../creational/factory-method.md)** to assemble the correct strategy and decorator stack based on customer currency and region.
> 4. Use **[Observer](../behavioral/observer.md)** to broadcast payment success events to receipt and ledger services asynchronously.
