# Pytest for Refactoring 🐍🧪

## Source Reference
* **Tooling:** Python `pytest` framework (modern standard for test-driven refactoring)
* **Goal:** Maximum behavioral coverage with minimum boilerplate code.

---

## 1. Why `pytest` is the Premier Refactoring Harness

Python's built-in `unittest.TestCase` inherits heavily from JUnit 3 (Java), requiring verbose class structures, `self.assertEqual()` methods, and rigid setup patterns.

In contrast, **`pytest`** offers three critical advantages for refactoring:
1. **Plain Python Assertions:** `assert a == b` provides deep introspection diffs on lists, dicts, and dataclasses automatically.
2. **Compact Parametrization:** Test dozens of boundary inputs in a single 5-line test function.
3. **Powerful Built-in Fixtures:** `monkeypatch` and `tmp_path` isolate external dependencies (databases, clocks, filesystems) without complex mock libraries.

---

## 2. Essential Refactoring Patterns in `pytest`

### Pattern A: Exhaustive Parametrization for Boundary Cases
When refactoring complex conditional trees, use `@pytest.mark.parametrize` to verify edge cases:

```python
import pytest


# Code under refactoring
def calculate_shipping_tier(weight_kg: float, is_vip: bool) -> str:
  if weight_kg <= 0:
    raise ValueError("Weight must be positive")
  if is_vip:
    return "PRIORITY_FREE"
  if weight_kg < 5.0:
    return "STANDARD_ECONOMY"
  elif weight_kg <= 20.0:
    return "STANDARD_HEAVY"
  return "FREIGHT_CARRIER"


# Parametrized verification suite
@pytest.mark.parametrize(
    "weight, is_vip, expected_tier",
    [
        (0.5, False, "STANDARD_ECONOMY"),
        (4.99, False, "STANDARD_ECONOMY"),
        (5.0, False, "STANDARD_HEAVY"),  # Exact boundary
        (20.0, False, "STANDARD_HEAVY"),  # Exact boundary
        (20.01, False, "FREIGHT_CARRIER"),
        (50.0, True, "PRIORITY_FREE"),  # VIP override
    ],
)
def test_shipping_tier_boundaries(weight, is_vip, expected_tier):
  assert calculate_shipping_tier(weight, is_vip) == expected_tier


def test_invalid_weight_raises():
  with pytest.raises(ValueError, match="Weight must be positive"):
    calculate_shipping_tier(-1.0, False)
```

---

### Pattern B: Isolating System Time and APIs with `monkeypatch`

Legacy code often calls non-deterministic functions directly (`datetime.now()`, `requests.get()`, or `os.environ`). During refactoring, tests must remain 100% deterministic and isolated from external networks.

```python
from datetime import datetime
import requests


# Legacy smelly function with hardcoded side effects
def get_daily_backup_filename() -> str:
  now = datetime.now()
  date_str = now.strftime("%Y-%m-%d")
  return f"backup_{date_str}.tar.gz"


# Refactoring test using monkeypatch to freeze time
def test_backup_filename_deterministic(monkeypatch):
  class MockDateTime:

    @classmethod
    def now(cls):
      return datetime(2026, 11, 8, 14, 30, 0)

  # Inject mock into the module under test
  monkeypatch.setattr("datetime.datetime", MockDateTime)

  assert get_daily_backup_filename() == "backup_2026-11-08.tar.gz"
```

---

### Pattern C: Testing Filesystem Side-Effects with `tmp_path`

Never write refactoring tests that read or write to actual user directories. Use `pytest`'s built-in `tmp_path` fixture to create sandboxed temporary directories that are wiped after the test run:

```python
from pathlib import Path


# Function under refactoring
def archive_summary_report(output_dir: Path, content: str) -> Path:
  output_dir.mkdir(parents=True, exist_ok=True)
  report_file = output_dir / "summary.txt"
  report_file.write_text(content, encoding="utf-8")
  return report_file


# Test passes a temporary, sandboxed Path
def test_archive_summary_report(tmp_path: Path):
  sandbox_dir = tmp_path / "reports"
  created_file = archive_summary_report(sandbox_dir, "Sales: $50,000")

  assert created_file.exists()
  assert created_file.read_text(encoding="utf-8") == "Sales: $50,000"
```

---

## 3. Best Practices for Refactoring Suites

1. **Keep Test Execution Under 10 Seconds:** If your unit tests take 2 minutes to run, you will stop running them on every micro-refactoring, defeating the safety net.
2. **Never Mock What You Own In Unit Tests:** Mock network borders and external databases, but test your internal domain logic directly without mocks.
3. **Assert Invariance, Not Implementation:** Test what the code outputs, not which private methods it called internally. Testing private methods makes code brittle and resistant to refactoring.
