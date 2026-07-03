# Testing

## Test Suites

The repository has three distinct test suites:

| Suite | Location | Command | Purpose |
|-------|----------|---------|---------|
| Unit/Integration | `tests/` (excl. snapshots) | `make test` | Fast pytest tests, mirrors source layout |
| Snapshot | `tests/snapshots/` | `make test-snapshots` | Textual UI visual regression (SVG) |
| Binary | `tui_e2e/` | `make test-binary` | PyInstaller executable e2e |

## Unit & Integration Tests

```bash
# Run all except snapshots
make test

# Faster (skip integration tests)
uv run pytest -m "not integration" --ignore=tests/snapshots

# Run specific test file
uv run pytest tests/test_main.py

# With coverage
uv run pytest --cov=openhands_cli --cov-report=term-missing
```

Test discovery: `test_*.py` files, `Test*` classes, `test_*` functions.

Use `@pytest.mark.integration` for costly flows.

## Snapshot Tests

The CLI uses [pytest-textual-snapshot](https://github.com/Textualize/pytest-textual-snapshot) for visual regression testing. Snapshots are SVG screenshots capturing exact UI state.

### Running Snapshot Tests

```bash
# Run all
make test-snapshots

# Update snapshots (for intentional UI changes)
uv run pytest tests/snapshots/ --snapshot-update
```

### Test Files

- `tests/snapshots/test_app_snapshots.py`
- `tests/snapshots/test_visualizer_snapshots.py`
- `tests/tui/widgets/test_richlog_visualizer.py` — unit tests for `RichLogVisualizer`

### Writing Snapshot Tests

Snapshot tests are **synchronous** (not async). The `snap_compare` fixture handles async internally:

```python
from textual.app import App, ComposeResult
from textual.widgets import Static, Footer

def test_my_widget(snap_compare):
    class MyTestApp(App):
        def compose(self) -> ComposeResult:
            yield Static("Content")
            yield Footer()

    assert snap_compare(MyTestApp(), terminal_size=(80, 24))
```

Using `run_before` for setup:
```python
async def setup(pilot):
    input_field = pilot.app.query_one(InputField)
    input_field.input_widget.value = "Hello!"
    await pilot.pause()

assert snap_compare(MyApp(), terminal_size=(80, 24), run_before=setup)
```

Using `press` for key simulation:
```python
assert snap_compare(
    MyApp(),
    terminal_size=(80, 24),
    press=["tab", "tab"],
)
```

### Viewing Snapshots

Start a local HTTP server in the snapshots directory and access via browser:

```bash
cd tests/snapshots/__snapshots__/test_app_snapshots
python -m http.server 12000
```

Then open via the work host URL (check browser tool for the URL).

### Best Practices

- Mock external dependencies so snapshots are deterministic
- Always pass a fixed `terminal_size=(width, height)`
- Commit SVG snapshots
- Review snapshot diffs carefully

## Binary Tests (tui_e2e)

Tests for the PyInstaller-built executable. Uses `mock_llm_server.py` for deterministic testing without real LLM calls.

```bash
make test-binary
# or: uv run pytest tui_e2e
```

### Mock LLM Server

`tui_e2e/mock_llm_server.py` provides OpenAI-compatible endpoints with proper tool call format.

Use `openai/gpt-4o-mock` as the model name (litellm requires a provider prefix).

Key files:
- `tui_e2e/runner.py` — test runner
- `tui_e2e/test_acp.py` — ACP binary tests
- `tui_e2e/test_experimental_ui.py` — experimental UI tests
- `tui_e2e/test_version.py` — version display test

## Test Location Convention

Test files mirror source layout:
- `tests/test_main.py` ↔ `openhands_cli/entrypoint.py`
- `tests/test_gui_launcher.py` ↔ `openhands_cli/gui_launcher.py`
- `tests/tui/widgets/test_richlog_visualizer.py` ↔ `openhands_cli/tui/widgets/richlog_visualizer.py`

Add fixtures in `tests/conftest.py` when shared.

## CI Workflow

See `.github/workflows/tests.yml`:
- Runs `make test` on Ubuntu, macOS, Windows
- Runs `make test-snapshots` on Ubuntu
- Binary tests run in `cli-build-binary-and-optionally-release.yml`

## Before Opening a PR

1. `make lint`
2. `make test`
3. `make test-snapshots` if TUI touched (update snapshots with `--snapshot-update` for intentional changes)
4. `make test-binary` if ACP/binary code touched

## Relevant Files

- `tests/conftest.py` — shared fixtures
- `tests/snapshots/` — snapshot tests and generated SVGs
- `tui_e2e/` — binary e2e tests and mock LLM server
- `.github/workflows/tests.yml` — CI test configuration
- `pyproject.toml` — pytest configuration (`[tool.pytest.ini_options]`)
