# pytest-mock vs. unittest.mock

> *"Decorators invert arguments; manual patchers leak state on exceptions; the mocker fixture gives you guaranteed cleanup and clean function signatures. In modern Pytest suites, standardizing on pytest-mock is an essential quality hygiene practice."*

---

## 1. Conceptual Mental Model & Theoretical Foundations

In Python standard library testing, mocking relies on `unittest.mock.patch`. Developers typically apply patches via two patterns:
1. **The `@patch` Decorator Pattern**: Decorates the test function, injecting mock objects into the test's parameter list in **reverse (bottom-to-top) order**.
2. **The Context Manager Pattern**: Uses `with patch(...) as mock_obj:`, which introduces nesting indentation for every patched target.

The `pytest-mock` plugin introduces a third, superior paradigm:
3. **The `mocker` Fixture Pattern**: A lightweight wrapper around `unittest.mock` that exposes `mocker.patch()`, `mocker.spy()`, and `mocker.stub()` as a dependency-injected fixture with **guaranteed teardown unpatching**.

```
unittest.mock (@patch Decorator Inversion):
@patch("app.mailer.send")       ──┐
@patch("app.db.query")          ──┼──> def test_foo(mock_db, mock_mailer):  <── Arguments Reversed!
                                  │    (Prone to positional bugs when reordered)

pytest-mock (mocker Fixture):
def test_foo(mocker):
    mock_mailer = mocker.patch("app.mailer.send")  <── Linear, readable, zero argument pollution!
    mock_db = mocker.patch("app.db.query")
    # Guaranteed automatic unpatching on test exit!
```

---

## 2. Comprehensive Architectural Comparison Matrix

| Dimension | `unittest.mock` (`@patch`) | `pytest-mock` (`mocker` fixture) |
| :--- | :--- | :--- |
| **Invocation Mechanism** | Decorator (`@patch`) or Context Manager | Injected Pytest fixture (`mocker`) |
| **Argument Ordering** | **Inverted (Bottom-to-Top)**; fragile to order changes | **None**; mocks assigned directly to variables |
| **Teardown Guarantee** | Guaranteed via decorator, but leaks if `patcher.start()` fails | **100% Guaranteed** via Pytest fixture lifecycle |
| **Signature Pollution** | Test function parameters cluttered with mock handles | Clean test signature containing only dependencies |
| **Spies & Stubs** | Requires manual subclassing or mock plumbing | First-class `mocker.spy()` and `mocker.stub()` built-in |
| **Async Mocking Support** | Native `AsyncMock` supported | Seamless `AsyncMock` via `mocker.patch(..., new_callable=AsyncMock)` |
| **External Dependency** | Built into standard library | Third-party plugin (`pytest-mock`) |
| **Readability & Maintenance**| Degrades quickly with $>2$ patches | High; linear top-to-bottom procedural flow |

---

## 3. Side-by-Side Implementation Comparison

### Scenario: Testing User Registration with Payment & Email

Let us observe the difference when patching three collaborators: an email sender, a payment processor, and an analytics logger.

#### The `unittest.mock` Decorator Nightmare (Argument Inversion Trap)

```python
from unittest.mock import patch
from app.services import register_user


# Notice: Decorators are evaluated from bottom to top!
@patch("app.services.send_email")
@patch("app.services.charge_credit_card")
@patch("app.services.track_analytics")
def test_registration_with_patch_decorators(
    mock_analytics,      # Matches track_analytics (Bottom-most decorator)
    mock_charge,         # Matches charge_credit_card
    mock_email,          # Matches send_email (Top-most decorator)
):
    mock_charge.return_value = True
    mock_email.return_value = True

    register_user("alex@domain.com")

    # If someone reorders decorators above, these assertions break with opaque errors!
    mock_charge.assert_called_once()
    mock_email.assert_called_once()
    mock_analytics.assert_called_once_with("user_registered")
```

---

#### The `pytest-mock` Approach (Clean, Linear & Safe)

```python
import pytest
from app.services import register_user


def test_registration_with_mocker(mocker):
    # Linear, readable, and completely immune to argument order confusion
    mock_email = mocker.patch("app.services.send_email", return_value=True)
    mock_charge = mocker.patch("app.services.charge_credit_card", return_value=True)
    mock_analytics = mocker.patch("app.services.track_analytics")

    register_user("alex@domain.com")

    mock_charge.assert_called_once()
    mock_email.assert_called_once()
    mock_analytics.assert_called_once_with("user_registered")
```

---

## 4. First-Class Spies with `mocker.spy`

In `unittest.mock`, creating a **Spy** (an object that executes real code while recording call history) requires manually wrapping methods with `wraps=real_obj`.

`pytest-mock` provides a clean, one-line `mocker.spy()`:

```python
from app.calculator import TaxCalculator


def test_calculate_tax_spy(mocker):
    calc = TaxCalculator()
    # Spies on real method: executes actual math while tracking call history
    spy = mocker.spy(calc, "compute_vat")

    total = calc.calculate_total(price=100.0)

    assert total == 120.0  # Real logic executed!
    assert spy.call_count == 1
    spy.assert_called_once_with(100.0)
```

---

## 5. Preventing State Leakage: The `patcher.start()` Vulnerability

Developers using `unittest.mock` often attempt to avoid decorators by calling `patcher.start()` in fixtures:

```python
# DANGEROUS PATTERN: Leaks state if an error occurs!
@pytest.fixture
def broken_fixture():
    patcher = patch("app.external_api.fetch")
    mock = patcher.start()
    # If anything raises here before yield, patcher.stop() is NEVER CALLED!
    yield mock
    patcher.stop()
```
If a crash occurs before `yield` or inside an unhandled setup step, the mock remains active across the entire test session, silently corrupting subsequent tests.

`pytest-mock` guarantees that `mocker.stopall()` is called inside the fixture's finalizer regardless of how the test completes, crashes, or times out.

---

## 6. Senior/Staff Engineer Interview Q&A

### Q1: Why is `@patch` decorator argument inversion considered a high-risk anti-pattern in large engineering teams?
> **Answer**: When using multiple `@patch` decorators, Python applies decorators from the inside out (bottom to top). As a result, the injected mock arguments in the function definition must appear in the exact reverse order of the decorators. 
> In enterprise codebases with complex tests requiring 3 to 5 patches, engineers routinely add, delete, or reorder decorators during feature updates. If an engineer adds a `@patch` at the top of the stack but adds the argument at the end of the parameter list, every mock argument shifts position by one. 
> Because Python mocks accept any method call without type errors, assertions on `mock_email` might execute against `mock_db`, silently passing or failing with baffling tracebacks. Standardizing on `pytest-mock` (`mocker.patch`) eliminates positional parameters entirely, making tests order-independent, refactoring-safe, and self-documenting.

---

## Summary & Cross-References

- Learn mocking mechanics in [Pytest-Mock Mastery](../advanced-pytest/pytest-mock.md).
- Explore test double taxonomies in [Test Doubles: Mocks vs. Fakes vs. Stubs](mock-vs-fake-vs-stub.md).
- Master async patching in [Advanced Async Testing](../advanced-pytest/async-testing.md).
