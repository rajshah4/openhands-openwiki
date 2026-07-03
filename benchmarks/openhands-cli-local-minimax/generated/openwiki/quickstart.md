# OpenHands CLI

A standalone terminal interface (Textual TUI) for interacting with the OpenHands AI agent. The CLI also provides a browser-served view and IDE integration via the Agent Client Protocol (ACP).

## What This Repo Is

The **V1 CLI** is feature-complete and primarily maintained for stability. New features are unlikely; expect only major bug fixes and compatibility updates. For active development, see [OpenHands](https://github.com/OpenHands/OpenHands) or join the Slack.

Key capabilities:
- **Terminal UI (TUI)**: Interactive Textual-based interface (`openhands`)
- **Browser UI**: Textual `textual-serve` web app (`openhands web`)
- **GUI Server**: Docker-based full web GUI (`openhands serve`)
- **Headless Mode**: CI/CD pipelines and automation (`openhands --headless`)
- **IDE Integration**: ACP server for Toad, Zed, VSCode, JetBrains (`openhands acp`)
- **Cloud Conversations**: Run on OpenHands Cloud (`openhands cloud`)

## Repository Structure

```
openhands_cli/          # Core source (entrypoint, TUI, auth, cloud, MCP, etc.)
├── entrypoint.py       # CLI main() — dispatches commands
├── argparsers/         # argparse subcommand definitions
├── tui/                # Textual TUI application
│   ├── textual_app.py  # OpenHandsApp + main() for TUI
│   ├── core/           # State, controllers, runner lifecycle
│   ├── widgets/        # InputField, ScrollableContent, RichLogVisualizer, etc.
│   ├── modals/         # Exit, confirmation, history, settings screens
│   └── panels/         # History, MCP, plan side panels
├── stores/            # AgentStore, CliSettings, PromptHistoryStore
├── conversations/      # Local file store, display, viewer
├── auth/              # Login/logout for OpenHands Cloud
├── cloud/             # Cloud conversation command
├── mcp/               # MCP server management
├── acp_impl/          # ACP server implementation
├── gui_launcher.py    # Docker-based GUI server launcher
└── locations.py       # Persistence dir paths (~/.openhands/)

tests/                  # Pytest suite mirroring source layout
tui_e2e/               # Binary end-to-end tests (PyInstaller executable)
scripts/               # ACP helpers, run_watch for fast TUI dev
hooks/                 # PyInstaller runtime hooks
.github/workflows/      # CI: tests, lint, type-check, build, release
```

## Configuration

OpenHands stores config under `~/.openhands/` (created on first run):

| File | Purpose |
|------|---------|
| `agent_settings.json` | LLM settings, condenser config |
| `cli_config.json` | CLI/TUI preferences |
| `mcp.json` | MCP server configuration |
| `conversations/` | Conversation history |

Environment variable overrides (pass `--override-with-envs`):
- `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`

Override persistence dir: `OPENHANDS_PERSISTENCE_DIR`, `OPENHANDS_CONVERSATIONS_DIR`

## Quick Start for Development

```bash
# 1. Install dependencies (requires uv 0.11.6+)
make build

# 2. Run the TUI
make run
# or automation-friendly (Ctrl+Q to quit):
uv run openhands --exit-without-confirmation

# 3. Fast iteration on TUI changes (auto-restart on .py/.tcss save):
make run-watch

# 4. Run tests
make test          # unit/integration
make test-snapshots  # Textual UI snapshots
make test-binary   # PyInstaller binary tests
make test-all     # unit + snapshots

# 5. Lint and format
make lint
make format
```

## Key Commands

| Command | Mode |
|---------|------|
| `openhands` | Default TUI |
| `openhands --headless -t "task"` | Headless automation |
| `openhands --headless --json -t "task"` | Headless with JSONL output |
| `openhands --resume <id>` | Resume conversation |
| `openhands web` | Browser-served TUI |
| `openhands serve` | Docker GUI server (port 3000) |
| `openhands acp` | IDE ACP server |
| `openhands cloud -t "task"` | Cloud conversation |
| `openhands login/logout` | OpenHands Cloud auth |
| `openhands mcp list/add/enable/disable` | MCP servers |

Confirmation modes: `--always-approve` (yolo), `--llm-approve` (LLM-based security).

## Documentation Areas

- [Architecture](architecture.md) — TUI state management, widget hierarchy, message flow
- [Commands](commands.md) — CLI entrypoints, subcommands, launch behavior
- [Setup & Install](setup.md) — uv workflow, dependencies, dev environment
- [Testing](testing.md) — Unit, snapshot, binary test strategies
- [Build & Release](build-release.md) — PyInstaller binary, GitHub Actions, release procedure

## Change Guidance for Future Agents

**Before any commit**: run `make lint` and fix all issues.

**For TUI changes**: run `make test-snapshots` and use `--snapshot-update` only for intentional UI changes. Commit the SVG snapshots.

**For ACP/binary changes**: run `make test-binary`.

**Dependency updates**: Update `pyproject.toml` version fields, then `uv lock --refresh`. Check in `uv.lock` when versions move.

**Version bumps**: Use GitHub Actions "Bump Version" workflow. See [Build & Release](build-release.md).

**Minimal PRs**: Keep scope focused; include tests and formatting in the same change. See commit pattern: `<scope>: <message> (#NNN)`.
