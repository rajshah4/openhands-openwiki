# Setup & Install

## Requirements

- **Python**: 3.12 (also supports 3.13)
- **uv**: 0.11.6 or newer (older versions may serialize `uv.lock` differently)

This repository uses **uv** for all dependency management. Do not use `pip install` directly.

## Package Manager

```bash
# Install uv if not present
curl -LsSf https://astral.sh/uv/install.sh | sh
# or
uv self update
```

Verify: `uv --version`

## Dependency Installation

```bash
# Install dependencies (runtime only)
make install
# or: uv sync

# Install with dev dependencies (tests, linting, PyInstaller)
make install-dev
# or: uv sync --group dev

# Full build (sync + pre-commit hooks)
make build
```

## Running the CLI

```bash
# Standard TUI
make run
# or: uv run openhands

# Automation-friendly (quit with Ctrl+Q, not Ctrl+C)
uv run openhands --exit-without-confirmation

# Fast TUI development (auto-restart on file changes)
make run-watch
# or: uv run python scripts/run_watch.py

# Other modes
uv run openhands --headless -t "task"
uv run openhands web
uv run openhands serve
uv run openhands-acp
```

## Project Scripts

### `scripts/run_watch.py`

Uses `watchfiles` to monitor `openhands_cli/` for `.py` and `.tcss` changes, then auto-restarts the TUI. The fastest way to iterate on TUI changes during development.

### `build.py` / `build.sh`

PyInstaller-based binary build (see [Build & Release](build-release.md)).

## Makefile Targets

| Target | Command | Purpose |
|--------|---------|---------|
| `install` | `uv sync` | Install runtime dependencies |
| `install-dev` | `uv sync --group dev` | Install dev dependencies |
| `build` | check uv, sync --dev, install hooks | Full setup |
| `lint` | `ruff check --fix` | Lint with auto-fix |
| `format` | `ruff format` | Format code |
| `pre-commit` | `pre-commit run --all-files` | Run all pre-commit hooks |
| `test` | `pytest --ignore=tests/snapshots` | Unit/integration tests |
| `test-snapshots` | `pytest tests/snapshots` | Textual UI snapshot tests |
| `test-binary` | `pytest tui_e2e` | Binary e2e tests |
| `test-all` | `test` + `test-snapshots` | All non-binary tests |
| `run` | `uv run openhands` | Run TUI |
| `run-watch` | `python scripts/run_watch.py` | Auto-restart TUI dev |
| `clean` | rm -rf .venv, __pycache__ | Clean artifacts |

## Pre-commit Hooks

Installed via `make build` / `make install-dev`:

```bash
uv run pre-commit install
```

Hooks run on `git commit` and include ruff linting, formatting, and pyright type checking.

## Configuration Files

### `pyproject.toml`

- Hatchling build config (`openhands_cli/` as package)
- uv dependency pinning with 7-day freshness cutoff for third-party
- ruff formatting/linting rules (88-char lines, double quotes)
- pytest configuration
- pyright type checking config

### `uv.lock`

Locked dependency versions. Commit changes when dependency versions move.

## Persistence Directory

Config and data are stored in `~/.openhands/` (or `OPENHANDS_PERSISTENCE_DIR`):

```
~/.openhands/
├── agent_settings.json   # LLM settings
├── cli_config.json       # CLI/TUI preferences
├── mcp.json              # MCP server config
├── conversations/         # Conversation history
└── projects/             # Per-project data (prompt history)
```

Override via env vars:
- `OPENHANDS_PERSISTENCE_DIR`
- `OPENHANDS_CONVERSATIONS_DIR`
- `OPENHANDS_WORK_DIR`

## Code Style

- **Python**: 3.12
- **Formatter**: ruff (88-char line limit, double quotes)
- **Linter**: ruff (pycodestyle, pyflakes, isort, pyupgrade, unused-arg checks, mutable defaults guards)
- **Type checker**: pyright
- **Modern typing**: `X | None` preferred over `Optional[X]`

## Relevant Files

- `pyproject.toml` — dependency and tool configuration
- `uv.lock` — locked versions
- `Makefile` — development commands
- `scripts/run_watch.py` — auto-restart development
- `openhands_cli/locations.py` — persistence dir paths
- `.pre-commit-config.yaml` — pre-commit hooks
