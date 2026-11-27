---
title: "Python Design Patterns (Interview Handbook)"
category: "Python Design Patterns"
type: "Overview"
permalink: /python-design-patterns/
tags: [python, design-patterns, gof, interview]
summary: "Complete 16-chapter Python design patterns interview handbook based on Mastering Python Design Patterns by Sakis Kasampalis."
---

# Python Design Patterns 🐍🏛️

> Based on *Mastering Python Design Patterns* by **Sakis Kasampalis**, distilled into concise 6-section interview cards with **Python 3.10+** code.

---

## 🧭 Complete 16-Chapter Map

### 1. Creational Patterns (Chapters 1–3)
* **Ch. 1 — Factory Pattern**
  * 🏭 **[Factory Method](creational/factory-method.md)** — Centralize creation (`connection_factory` for JSON/XML).
  * 🏢 **[Abstract Factory](creational/abstract-factory.md)** — Create families of related objects (`FrogWorld` / `WizardWorld`).
* **Ch. 2 — Builder**
  * 🔨 **[Builder](creational/builder.md)** — Step-by-step construction separated from representation (Pizza ordering).
* **Ch. 3 — Prototype**
  * 🧬 **[Prototype](creational/prototype.md)** — Clone objects at a point in time via `copy.deepcopy()` + registry.

### 2. Structural Patterns (Chapters 4–9)
* **Ch. 4 — Adapter**
  * 🔌 **[Adapter](structural/adapter.md)** — Make incompatible interfaces work together (`Adapter` with `__getattr__`).
* **Ch. 5 — Decorator**
  * 🎁 **[Decorator](structural/decorator.md)** — Extend behavior dynamically with `@decorator` & `@functools.wraps` (Fibonacci memoization).
* **Ch. 6 — Facade**
  * 🏛️ **[Facade](structural/facade.md)** — Simplified interface over complex subsystems (`OperatingSystem` microkernel).
* **Ch. 7 — Flyweight**
  * 🪶 **[Flyweight](structural/flyweight.md)** — Share intrinsic state to cut memory (`WeakValueDictionary` `Tree` pool).
* **Ch. 8 — Model-View-Controller**
  * 🧩 **[MVC](structural/mvc.md)** — Smart Models, Thin Controllers, Dumb Views (Quote printer & Django MTV).
* **Ch. 9 — Proxy**
  * 🛡️ **[Proxy](structural/proxy.md)** — Virtual (`LazyProperty` descriptor) & Protection (`InfoProxy`) surrogates.

### 3. Behavioral Patterns (Chapters 10–16)
* **Ch. 10 — Chain of Responsibility**
  * ⛓️ **[Chain of Responsibility](behavioral/chain-of-responsibility.md)** — Dynamic event bubbling (`Widget` chain with `getattr`).
* **Ch. 11 — Command**
  * 📜 **[Command](behavioral/command.md)** — Encapsulate operations with `execute()` & `undo()` (`CreateFile` / `RenameFile`).
* **Ch. 12 — Interpreter**
  * 🧠 **[Interpreter](behavioral/interpreter.md)** — Domain-Specific Language (DSL) evaluation (Smart-house `Boiler` DSL).
* **Ch. 13 — Observer**
  * 📡 **[Observer](behavioral/observer.md)** — Publish-subscribe notifications (`DefaultFormatter` → `Hex`/`BinaryFormatter`).
* **Ch. 14 — State**
  * 🚦 **[State](behavioral/state.md)** — Finite-State Machine (OS `Process` lifecycle).
* **Ch. 15 — Strategy**
  * 🎯 **[Strategy](behavioral/strategy.md)** — Swap algorithms at runtime with first-class functions (`all_unique`).
* **Ch. 16 — Template**
  * 📋 **[Template](behavioral/template.md)** — Unify shared algorithm skeletons with hooks (`BFS` & `DFS` traversal).
