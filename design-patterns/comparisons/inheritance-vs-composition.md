---
title: "Inheritance vs. Composition"
category: "Design Patterns"
type: "Comparisons"
permalink: /design-patterns/comparisons/inheritance-vs-composition/
tags: [comparisons, foundations, inheritance, composition, oop, python]
summary: "The definitive guide to the oldest debate in object-oriented architecture: why composition is favored and when inheritance is still justified."
---

# Inheritance vs. Composition

> *"Inheritance is white-box reuse: the internals of parent classes are often visible to subclasses. Composition is black-box reuse: no internal details of objects are visible. Favoring object composition over class inheritance is the foundational design heuristic of the Gang of Four."*  
> — Gang of Four, *Design Patterns*

---

## 1. Executive Summary

```mermaid
graph TD
    subgraph "Class Inheritance (White-Box, Static)"
        Base["Superclass (Exposes internal mechanics)"] -->|is-a (Compile-time)| Sub["Subclass (Tight Coupling)"]
    end
    subgraph "Object Composition (Black-Box, Dynamic)"
        Container["Container Object"] o-->|has-a (Runtime swappable)| Component["Component Interface (Encapsulated)"]
    end
```

---

## 2. Side-by-Side Comparison Matrix

| Dimension | Inheritance ("Is-a") | Composition ("Has-a") |
| :--- | :--- | :--- |
| **Coupling Level** | **High (Tight)**: Subclass depends on superclass internals | **Low (Loose)**: Interacts solely through public interfaces |
| **Binding Time** | **Static (Compile-time)**: Cannot change type at runtime | **Dynamic (Runtime)**: Can swap components on the fly |
| **Encapsulation** | **Weakened**: Subclasses often violate superclass invariants | **Strong**: Objects are black boxes to one another |
| **Class Proliferation** | Leads to **combinatorial subclass explosion** ($N \times M$) | Linear scaling of independent components ($N + M$) |
| **Reusability** | Rigid; ties features to a specific class hierarchy | Flexible; components can be reused across unrelated classes |
| **Primary Patterns** | [Template Method](../behavioral/template-method.md), [Factory Method](../creational/factory-method.md) | [Strategy](../behavioral/strategy.md), [Decorator](../structural/decorator.md), [Bridge](../structural/bridge.md) |

---

## 3. The Fragile Base Class Problem Illustrated

Consider extending a class where the superclass implementation details leak into the subclass:

```python
# FRAGILE INHERITANCE:
class BadCountingList(list):
    def __init__(self) -> None:
        super().__init__()
        self.add_count = 0

    def append(self, item) -> None:
        self.add_count += 1
        super().append(item)

    def extend(self, items) -> None:
        # If Python's built-in extend() calls append() internally, count will be doubled!
        self.add_count += len(items)
        super().extend(items)
```
If you add 3 elements with `addAll()`, `addCount` becomes **6** because `HashSet.addAll()` calls `add()` internally! Inheritance broke because the subclass did not understand the private internal calling conventions of the superclass.

### The Composition Solution (Forwarding Wrapper)
```python
# ROBUST COMPOSITION:
class ForwardingCountingList:
    def __init__(self) -> None:
        self._list: list = []  # Composed dependency
        self.add_count = 0

    def append(self, item) -> None:
        self._list.append(item)
        self.add_count += 1

    def extend(self, items) -> None:
        self._list.extend(items)
        self.add_count += len(items)  # 100% predictable
```

---

## 4. When IS Inheritance Justified?

Inheritance should not be completely eliminated. It is appropriate when:
1. An authentic, permanent **"is-a"** relationship exists in the problem domain.
2. The subclass fulfills the **Liskov Substitution Principle (LSP)** without overriding methods to throw `UnsupportedOperationException`.
3. You are designing an invariant framework lifecycle with [Template Method](../behavioral/template-method.md).
4. Both superclass and subclass are maintained by the same team within the same module/package.

---

## 5. Summary Heuristic

> **"If Class B needs only Class A's interface, use Inheritance. If Class B needs Class A's behavior or implementation, use Composition."**
