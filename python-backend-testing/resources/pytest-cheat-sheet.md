# Pytest Complete Command-Line & Configuration Cheat Sheet

> *"A desk reference for Python backend engineers. Keep this cheat sheet open during active development for instant syntax, CLI flags, filter queries, and configuration recipes."*

---

## 1. CLI Execution & Filtering Flags

### Discovery & Running Tests

```bash
# Run all tests in the current directory and subdirectories
pytest

# Run tests in a specific directory or file
pytest tests/unit/
pytest tests/unit/test_billing.py

# Run a specific test function inside a module
pytest tests/unit/test_billing.py::test_invoice_creation

# Run a specific test method inside a test class
pytest tests/unit/test_billing.py::TestInvoices::test_tax_calculation
```

### Keyword & Expression Filtering (`-k`)

```bash
# Run tests whose name matches substring (case-insensitive)
pytest -k "billing"

# Complex boolean logic on test names
pytest -k "invoice and not subscription"
pytest -k "test_create or test_update"
```

### Marker Filtering (`-m`)

```bash
# Run tests with a specific marker
pytest -m "integration"

# Boolean combination of markers
pytest -m "unit and not slow"
pytest -m "smoke or api"

# Run all tests EXCEPT quarantined flaky tests
pytest -m "not quarantined"
```

### Stopping Early & Failure Control

```bash
# Stop immediately on first failure
pytest -x

# Stop after N failures
pytest --maxfail=3

# Run only tests that failed in the previous run
pytest --lf
pytest --last-failed

# Run all tests, but run previously failed tests first
pytest --ff
pytest --failed-first
```

---

## 2. Output & Diagnostic Reporting

```bash
# Verbose output (lists each test file and name)
pytest -v

# Quiet mode (minimal dot output)
pytest -q

# Disable stdout/stderr capturing (print statements show live in console)
pytest -s
pytest --capture=no

# Traceback formatting styles
pytest --tb=short      # Compact one-line tracebacks
pytest --tb=line       # Single line per failure
pytest --tb=auto       # Default adaptive formatting
pytest --tb=no         # Suppress tracebacks entirely

# Show slowest N tests (diagnose build bottlenecks)
pytest --durations=10

# Show summary of all test outcomes (e.g. skipped, xfailed)
pytest -rA            # Summary of all outcomes
pytest -rs            # Summary of skipped tests
pytest -rx            # Summary of xfailed tests
```

---

## 3. Built-In Markers Reference

| Marker Syntax | Description | Example |
| :--- | :--- | :--- |
| `@pytest.mark.skip(reason="...")` | Unconditionally skip test | `@pytest.mark.skip(reason="Feature deprecated")` |
| `@pytest.mark.skipif(condition, reason="...")` | Skip test if condition evaluates to `True` | `@pytest.mark.skipif(sys.platform == "win32", reason="POSIX only")` |
| `@pytest.mark.xfail(condition, reason="...")` | Expect test to fail; passes if it fails | `@pytest.mark.xfail(reason="Known upstream bug #402")` |
| `@pytest.mark.parametrize("arg", [1, 2])` | Parameterize test with multiple input sets | `@pytest.mark.parametrize("x,y", [(1, 2), (3, 4)])` |
| `@pytest.mark.asyncio` | Mark test as an asynchronous coroutine | `@pytest.mark.asyncio async def test_api():` |
| `@pytest.mark.filterwarnings("ignore:...")` | Ignore specific Python warnings | `@pytest.mark.filterwarnings("ignore::DeprecationWarning")` |

---

## 4. Fixture Scopes & Lifecycles

```python
import pytest

# Available Scopes:
# 1. "function" (Default): Runs once per test function (isolated state)
# 2. "class": Runs once per test class
# 3. "module": Runs once per Python module file
# 4. "package": Runs once per test package directory
# 5. "session": Runs once across the entire test session (shared engine/cache)

@pytest.fixture(scope="session")
def database_engine():
    """Created once for the entire test run."""
    engine = create_engine("postgresql://...")
    yield engine
    engine.dispose()  # Executed after all tests conclude


@pytest.fixture(scope="function", autouse=True)
def auto_cleanup_redis():
    """Runs automatically before every test function without being passed as arg."""
    yield
    redis.flushdb()
```

---

## 5. Built-In Standard Fixtures

```python
def test_temp_files(tmp_path: Path):
    """tmp_path provides a unique pathlib.Path temporary directory."""
    data_file = tmp_path / "test.json"
    data_file.write_text('{"status": "ok"}')
    assert data_file.exists()


def test_capsys(capsys: pytest.CaptureFixture):
    """capsys captures stdout and stderr."""
    print("Hello World")
    captured = capsys.readouterr()
    assert captured.out == "Hello World\n"


def test_monkeypatch(monkeypatch: pytest.MonkeyPatch):
    """monkeypatch safely overrides environment variables and object attributes."""
    monkeypatch.setenv("APP_ENV", "testing")
    monkeypatch.setattr("app.config.DEBUG", True)
```

---

## 6. Popular Ecosystem Plugins CLI Reference

### `pytest-xdist` (Multi-Core Parallelization)

```bash
# Auto-detect physical CPU cores and distribute tests
pytest -n auto

# Run tests across 4 worker processes
pytest -n 4

# Group tests by module so module fixtures share the same worker
pytest -n auto --dist=loadscope

# Group tests by file
pytest -n auto --dist=loadfile
```

### `pytest-cov` (Code & Branch Coverage)

```bash
# Measure line coverage of the app package
pytest --cov=app

# Measure branch coverage with missing lines report
pytest --cov=app --cov-branch --cov-report=term-missing

# Fail CI build if branch coverage is under 85%
pytest --cov=app --cov-branch --cov-fail-under=85

# Export XML and HTML reports for CI artifacts
pytest --cov=app --cov-report=xml:reports/cov.xml --cov-report=html:reports/html
```

### `pytest-rerunfailures` (Flaky Test Reruns)

```bash
# Rerun failed tests up to 2 times with a 1-second delay
pytest --reruns 2 --reruns-delay 1

# Mark individual test for retries
@pytest.mark.flaky(reruns=3, reruns_delay=0.5)
def test_external_api():
    pass
```

---

## 7. Canonical `pyproject.toml` Reference

```toml
[tool.pytest.ini_options]
minversion = "8.0"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
python_classes = ["Test*"]
addopts = [
    "-v",
    "--strict-markers",
    "--strict-config",
    "--tb=short",
    "--cov=app",
    "--cov-branch",
    "--cov-report=term-missing:skip-covered",
    "--cov-fail-under=85",
    "-m", "not quarantined"
]
asyncio_mode = "auto"
markers = [
    "unit: Fast pure-memory unit tests",
    "integration: Database and container tests",
    "e2e: End-to-end HTTP API tests",
    "slow: Tests exceeding 500ms duration",
    "quarantined: Tests excluded from CI merge gates"
]
```

---

## Summary & Cross-References

- Learn complete CI/CD configuration in [GitHub Actions CI/CD Pipeline](../ci-cd-and-devops/github-actions.md).
- Master parallel execution in [Parallel Test Execution with pytest-xdist](../ci-cd-and-devops/parallel-testing.md).
- Explore coverage enforcement in [Coverage Reporting & Merge Gates](../ci-cd-and-devops/coverage-reporting.md).
