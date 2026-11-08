# Refactoring & Clean Architecture Glossary 📖

## Source Reference
* **Core Disciplines:** [Dive Into Refactoring](../index.md), [Dive Into Design Patterns](../../design-patterns/index.md)
* **Authoritative Definitions:** Martin Fowler, Michael Feathers, Alexander Shvets, Robert C. Martin, Bertrand Meyer

---

### A
* **Arrow Anti-pattern (Pyramid of Doom):** Deeply nested conditional structures (`if-else` within `if-else`) that push code far to the right of the screen. Cured via [Replace Nested Conditional with Guard Clauses](../techniques/simplifying-conditionals/replace-nested-conditional-with-guard-clauses.md).

### B
* **Bloater:** A category of code smells (Long Method, Large Class, Long Parameter List, Primitive Obsession, Data Clumps) that represent code, methods, or classes that have grown so large that they are hard to comprehend and maintain.
* **Boy Scout Rule:** The engineering practice of always leaving the code slightly cleaner than you found it.

### C
* **Characterization Test:** A test written to preserve the existing behavior of legacy software rather than to specify desired new behavior. It pins down the current outputs for given inputs to ensure that refactoring causes zero behavioral regressions.
* **Code Smell:** A surface indication that usually corresponds to a deeper problem in the system. Coined by Kent Beck: *"If it stinks, change it."*
* **Command-Query Separation (CQS):** An architectural principle stating that every method must either be a command that performs actions (mutates state) or a query that returns data without side effects.
* **Coupler:** A category of code smells (Feature Envy, Inappropriate Intimacy, Message Chains, Middle Man, Incomplete Library Class) that exhibit excessive or awkward coupling between classes.

### D
* **Data Clump:** Different parts of the code containing the exact same group of variables (e.g., `start_date, end_date` or `street, city, zip`). Cured via [Introduce Parameter Object](../techniques/simplifying-method-calls/introduce-parameter-object.md) or [Extract Class](../techniques/moving-features/extract-class.md).
* **Dead Code:** Variables, parameters, fields, or functions that are never executed or referenced anywhere in the application. Should be deleted immediately.
* **Divergent Change:** A code smell where one class is frequently modified in different ways for completely different reasons. Violates the Single Responsibility Principle.

### E
* **EAFP (Easier to Ask for Forgiveness than Permission):** A Pythonic programming style that assumes valid keys or attributes and catches exceptions if the assumption proves false. Contrast with LBYL (*Look Before You Leap*).
* **Encapsulation:** Bundling data with the methods that operate on that data, and restricting direct external access to an object's internal components.

### F
* **Feature Envy:** A code smell where a method in Class A accesses the fields and methods of Class B more than its own. Cured via [Move Method](../techniques/moving-features/move-method.md).

### G
* **God Class:** An anti-pattern class that knows too much or does too much, centralizing most of the system's business rules and delegating to anemic data containers.
* **Golden Master Testing:** A testing approach where the complete output of a legacy system is recorded across a wide input dataset to serve as a regression benchmark during refactoring.
* **Guard Clause:** A conditional statement at the top of a method that checks for invalid or terminal conditions and returns or raises immediately, flattening nested indentation.

### I
* **Information Expert:** A General Responsibility Assignment Software Principle (GRASP) stating that responsibility should be assigned to the class that possesses the information needed to fulfill it.
* **Inappropriate Intimacy:** A smell where two classes spend too much time rummaging in each other's private fields and internal implementation details.

### L
* **Law of Demeter (Principle of Least Knowledge):** A design guideline stating that a method should only invoke methods on: (1) itself, (2) objects passed in as arguments, (3) objects it created, or (4) its direct component fields. *"Only talk to your immediate friends."*
* **Liskov Substitution Principle (LSP):** A SOLID principle stating that subtypes must be substitutable for their base types without altering program correctness.

### M
* **Message Chain:** A navigation code smell where a client calls `a.get_b().get_c().get_d().do_something()`. Cured via [Hide Delegate](../techniques/moving-features/hide-delegate.md).
* **Middle Man:** A smell where a class does almost nothing except forward calls to another class. Cured via [Remove Middle Man](../techniques/moving-features/remove-middle-man.md).

### P
* **Primitive Obsession:** A smell characterized by the reluctance to create small domain classes, instead using raw primitives (`str`, `int`, `dict`) for domain concepts (like currency, coordinates, or phone numbers).

### R
* **Refactoring:** The disciplined process of modifying the internal structure of code without altering its external observable behavior.
* **Refused Bequest:** A smell where a subclass inherits methods from a parent class but rejects or cannot fulfill them. Cured via [Replace Inheritance with Delegation](../techniques/generalization/replace-inheritance-with-delegation.md).
* **Rule of Three:** A rule of thumb stating that you only refactor duplicate code once it appears three times.

### S
* **Seam (Michael Feathers):** A place where you can alter program behavior without editing code in that place. Essential for introducing tests to legacy code.
* **Shotgun Surgery:** A smell where making a single conceptual change requires making dozens of small edits scattered across many different files.
* **Sprout Method:** A technique for adding new functionality to an existing legacy method by writing the new code in a fresh, well-tested standalone method and calling it from the legacy flow.

### T
* **Technical Debt:** The implied cost of future rework caused by choosing an expedient solution over a better long-term approach.
* **Two Hats:** Martin Fowler's rule that you must never add new features and refactor code simultaneously.

### V
* **Value Object:** A small, immutable object whose equality is based on its values/attributes rather than a unique identity ID.
