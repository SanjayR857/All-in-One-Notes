# Refactoring Quick Reference & Cheat Sheet ⚡

## Source Reference
* **Core Disciplines:** [Dive Into Refactoring](../index.md), [Dive Into Design Patterns](../../design-patterns/index.md)
* **Target Audience:** Developers preparing for code review, sprints, or system refactorings.

---

## 1. The Core Refactoring Rules

1. **The Two Hats Principle:** Never add new features and refactor at the same time. Wear one hat at a time.
2. **Make the Change Easy First:** *"For each desired change, make the change easy (warning: this may be hard), then make the easy change."* — Kent Beck
3. **The Rule of Three:** The first time you do something, just do it. The second time, wince at duplication. The third time, refactor!
4. **The Boy Scout Rule:** Always leave the code a little cleaner than you found it.
5. **Micro-Commit Rhythm:** Take 2-to-5 minute incremental steps. If tests break, run `git restore .` immediately rather than debugging for 20 minutes.

---

## 2. Code Smells Quick Diagnostic

| Smell Category | Core Symptoms | Top Remedy |
| :--- | :--- | :--- |
| **Bloaters** | Huge classes, 80-line methods, 6-argument lists | [Extract Method](../techniques/composing-methods/extract-method.md), [Extract Class](../techniques/moving-features/extract-class.md), [Parameter Object](../techniques/simplifying-method-calls/introduce-parameter-object.md) |
| **OO Abusers** | Large `match/case` on type codes, rejected methods | [Replace Conditional with Polymorphism](../techniques/simplifying-conditionals/replace-conditional-with-polymorphism.md), [Delegation](../techniques/generalization/replace-inheritance-with-delegation.md) |
| **Change Preventers** | 1 change touches 10 files (Shotgun) or 1 class has 10 reasons to change (Divergent) | [Move Method](../techniques/moving-features/move-method.md), [Move Field](../techniques/moving-features/move-field.md), [Extract Class](../techniques/moving-features/extract-class.md) |
| **Dispensables** | Dead code, explanatory comments, lazy classes | Delete dead code, [Inline Class](../techniques/moving-features/inline-class.md), [Collapse Hierarchy](../techniques/generalization/collapse-hierarchy.md) |
| **Couplers** | `a.b.c.d()`, classes reading each other's private state | [Hide Delegate](../techniques/moving-features/hide-delegate.md), [Extract Class](../techniques/moving-features/extract-class.md), [Encapsulate Field](../techniques/organizing-data/encapsulate-field.md) |

---

## 3. High-Value Python Refactoring Snippets

### A. Grouping Arguments into a Frozen Dataclass
```python
# Before:
def register(
    street: str, city: str, state: str, zip_code: str, country: str
):
  ...


# After:
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Address:
  street: str
  city: str
  state: str
  zip_code: str
  country: str = "US"


def register(address: Address):
  ...
```

### B. Flattening Conditionals with Guard Clauses
```python
# Before:
def process(user):
  if user is not None:
    if user.is_active:
      if user.has_funds:
        return user.charge()
  return False


# After:
def process(user):
  if user is None or not user.is_active or not user.has_funds:
    return False
  return user.charge()
```

### C. Command-Query Separation (CQS)
```python
# Query: Pure, idempotent, zero side-effects
def calculate_subtotal(items: list[Item]) -> float:
  return sum(item.price for item in items)


# Command: Mutates state, returns None
def update_account_balance(account: Account, amount: float) -> None:
  account.balance += amount
```
