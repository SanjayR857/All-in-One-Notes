# Refactoring & Clean Architecture Interview Questions 🎓

## Source Reference
* **Core Philosophy:** Senior / Staff Software Engineer Architectural Interview Standards
* **Topics Covered:** Code Smells, Refactoring Mechanics, Testing Legacy Code, Fowler's Principles, Design Patterns

---

## 1. Foundational Refactoring Concepts

### Q1: What is the formal definition of "Refactoring", and what is the "Two Hats" rule?
**Answer:**
* **Refactoring:** A disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external observable behavior. Its purpose is to make the software easier to understand, test, and maintain.
* **The Two Hats Rule (Martin Fowler):** When programming, you should divide your time between two distinct activities: adding new functionality (the "Feature Hat") and improving design without changing behavior (the "Refactoring Hat"). You must never wear both hats simultaneously. If you wear both hats, you cannot determine whether a regression was caused by the new feature or by the refactoring.

### Q2: How does refactoring differ from rewriting? When should an engineering team choose one over the other?
**Answer:**
* **Refactoring:** Preserves the existing codebase and continuous business value while incrementally improving design in 5-minute micro-commits. Regressions are immediately localized and low risk.
* **Rewriting (Greenfield):** Discarding the existing system and building from scratch. Often suffers from the *Second-System Effect*, feature scope creep, and business paralysis during the rewrite.
* **When to Rewrite:** When the underlying platform/language is obsolete, when requirements are completely different, or when the system is so defective that nobody understands its domain rules. In almost all other cases, incremental refactoring (e.g., using the *Strangler Fig Pattern*) is vastly safer and more cost-effective.

### Q3: What is "Technical Debt", and what are Martin Fowler's four quadrants of debt?
**Answer:**
Technical Debt (coined by Ward Cunningham) is a metaphor for the implied cost of future rework caused by choosing an easy or suboptimal solution today over a better, long-term approach. Just like financial debt, technical debt incurs "interest" in the form of slower feature delivery and increased defect rates.
Fowler's 4 Quadrants:
1. **Deliberate & Prudent:** *"We must ship now to survive; we will pay the debt down next month."*
2. **Deliberate & Reckless:** *"We don't have time for design or tests; just ship it."*
3. **Inadvertent & Prudent:** *"We did our best, but now that we understand the domain, we see a much better architecture."*
4. **Inadvertent & Reckless:** Novice engineers building without design principles or tests.

---

## 2. Code Smells & Diagnosis

### Q4: Explain the difference between "Divergent Change" and "Shotgun Surgery".
**Answer:**
* **Divergent Change:** Occurs when **one class** suffers many different kinds of changes for completely different reasons. (1 class $\rightarrow$ many reasons to change). It violates the Single Responsibility Principle (SRP). Remedy: [Extract Class](../techniques/moving-features/extract-class.md).
* **Shotgun Surgery:** Occurs when **one conceptual change** requires making tiny edits scattered across a dozen different classes. (1 reason to change $\rightarrow$ many classes). The responsibility is fragmented. Remedy: [Move Method](../techniques/moving-features/move-method.md) and [Move Field](../techniques/moving-features/move-field.md) to consolidate the feature in a single owner.

### Q5: What is "Primitive Obsession", and how does it manifest in modern Python codebases?
**Answer:**
Primitive Obsession is the reluctance to create small domain classes, leading to the excessive use of primitive types (`str`, `int`, `float`, `dict`, `list`) for domain concepts that have identity, validation, or behavior.
In Python, it manifests as:
* Passing raw tuples or dictionaries where keys are accessed with magic strings (`user["billing_state"]`).
* Using floats for financial currency instead of a `Money` Value Object.
* Passing loose string coordinates (`lat, lon`) instead of a `GeoPoint` `@dataclass`.
Remedy: [Replace Data Value with Object](../techniques/organizing-data/replace-data-value-with-object.md) using `@dataclass(frozen=True)`.

### Q6: What is "Feature Envy", and how do you differentiate it from the Visitor or Strategy Pattern?
**Answer:**
* **Feature Envy:** Occurs when a method in Class A accesses the attributes and helpers of Class B more than its own. It violates the *Information Expert* principle. Remedy: [Move Method](../techniques/moving-features/move-method.md) to relocate the method into Class B.
* **Distinction:** In the Strategy or Visitor pattern, behavior is intentionally extracted outside the data entity to enable runtime polymorphism or decoupled algorithms. If the separation is a deliberate architectural pattern, it is not a smell. If it is an accidental misplacement of logic, it is Feature Envy.

### Q7: What is "Refused Bequest", and why does it violate the Liskov Substitution Principle (LSP)?
**Answer:**
Refused Bequest occurs when a subclass inherits methods from a parent class, but either ignores them, overrides them with `pass`, or raises `NotImplementedError`. It violates LSP because any client function written to accept the parent class cannot safely invoke inherited methods when given the subclass without crashing.
Remedy: [Replace Inheritance with Delegation](../techniques/generalization/replace-inheritance-with-delegation.md).

---

## 3. Refactoring Mechanics & Testing

### Q8: How do you safely refactor code that has zero existing unit tests?
**Answer:**
Follow Michael Feathers' protocol (*Working Effectively with Legacy Code*):
1. **Never change logic first.**
2. **Find a Seam:** Identify a place where behavior can be observed without editing code (e.g., parameter injection seams or subclass-and-override seams).
3. **Write Characterization Tests:** Feed known inputs into the legacy module and assert against its actual observed outputs (Golden Master testing) to capture baseline behavior.
4. **Make Micro-Refactorings:** Refactor in small, verified steps, re-running characterization tests after each micro-step.
5. **Add New Features:** Once the code is modular and covered by tests, wear the "Feature Hat".

### Q9: What is Command-Query Separation (CQS), and why is it essential for clean architecture?
**Answer:**
CQS states that every method should either be:
* A **Query:** Returns a value and produces zero side effects (pure and idempotent).
* A **Command (Modifier):** Mutates state or produces side effects, but returns `None`.
*"Asking a question should not change the answer."* If a query mutates state, calling it multiple times (e.g., in logging, assert statements, or debugging) corrupts program state.

### Q10: How does Python's `typing.Protocol` enable safer refactoring than traditional abstract base classes?
**Answer:**
`typing.Protocol` implements **structural subtyping** (static duck typing). An external class satisfies a `Protocol` simply by implementing the required method signatures, without needing an explicit `class MyClass(BaseABC):` inheritance declaration. This allows decoupling client code from third-party vendor SDKs or legacy classes without modifying their class headers.
