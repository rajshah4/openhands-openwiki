# Commands & Entrypoints

## Package Entrypoints

Defined in `pyproject.toml`:

```toml
[project.scripts]
openhands = "openhands_cli.entrypoint:main"
"openhands-acp" = "openhands_cli.acp:main"
```

The ACP entrypoint (`openhands-acp`) is a separate console script pointing to `openhands_cli.acp:main`.

## Entrypoint Dispatch

`openhands_cli/entrypoint.py:main()` parses arguments and dispatches to mode-specific handlers:

```
main() 
├── serve  → gui_launcher.launch_gui_server()
├── web    → tui.serve.launch_web_server()  (textual-serve)
├── acp    → acp_impl.agent.run_acp_server()
├── login  → auth/login_command.run_login_command()
├── logout → auth/logout_command.run_logout_command()
├── mcp    → mcp/mcp_commands.handle_mcp_command()
├── cloud  → cloud/command.handle_cloud_command()
├── view   → conversations/viewer.view_conversation()
└── (default TUI) → tui/textual_app.main() → OpenHandsApp.run()
```

## CLI Modes

### Default TUI Mode (`openhands`)

Interactive Textual-based terminal UI. Default confirmation mode is `always-ask`.

```bash
# Basic
openhands

# With initial task
openhands -t "Fix the login bug"
openhands -f instructions.md

# Auto-approve (yolo mode)
openhands --always-approve  # or --yolo

# LLM-based security analyzer
openhands --llm-approve

# Resume conversation
openhands --resume <conversation-id>
openhands --resume --last  # most recent
openhands --resume         # show conversation list
```

### Headless Mode

CI/CD and automation. No UI, auto-approves all actions.

```bash
# Basic headless
openhands --headless -t "Write unit tests"

# JSON output (JSONL stream)
openhands --headless --json -t "Write unit tests"

# With file input
openhands --headless -f instructions.md
```

Headless mode automatically sets `--exit-without-confirmation` and disables the critic.

### Web Mode (`openhands web`)

Browser-served Textual TUI via `textual-serve`.

```bash
openhands web                    # default port
openhands web --port 8080       # custom port
openhands web --host 0.0.0.0    # bind address
```

Uses `openhands_cli/tui/serve.py` → `launch_web_server()`.

### GUI Server (`openhands serve`)

Docker-based full OpenHands GUI on port 3000. Requires Docker running.

```bash
# Basic
openhands serve

# Mount current directory into container
openhands serve --mount-cwd

# GPU support (nvidia-docker)
openhands serve --gpu
```

Uses `openhands_cli/gui_launcher.py:launch_gui_server()`. Pulls `docker.openhands.dev/openhands/openhands:latest` by default (configurable via `OPENHANDS_VERSION` env var).

### ACP Mode (`openhands acp`)

Agent Client Protocol server for IDE integrations (Toad, Zed, VSCode, JetBrains).

```bash
openhands acp
openhands acp --always-approve
openhands acp --llm-approve
openhands acp --resume <id>
openhands acp --cloud              # connect to OpenHands Cloud
openhands acp --cloud-url <url>   # custom cloud API URL
```

Uses `openhands_cli/acp_impl/agent.py:run_acp_server()`.

### Cloud Mode (`openhands cloud`)

Run conversations on OpenHands Cloud.

```bash
openhands cloud -t "Fix the login bug"
openhands cloud -f instructions.md
```

Requires prior `openhands login`.

### Auth Commands

```bash
openhands login <server-url>
openhands logout <server-url>
```

### MCP Commands

```bash
openhands mcp list
openhands mcp add <name> --transport stdio -- npx -- -y mcp-remote "<url>"
openhands mcp enable <name>
openhands mcp disable <name>
```

MCP config is persisted to `~/.openhands/mcp.json`.

### View Command

```bash
openhands view <conversation-id> [--limit N]
```

Display a past conversation.

## Argument Parsing

The parser is built by `openhands_cli/argparsers/main_parser.py:create_main_parser()`, which composes subparsers from:
- `argparsers/acp_parser.py`
- `argparsers/auth_parser.py`
- `argparsers/cloud_parser.py`
- `argparsers/mcp_parser.py`
- `argparsers/serve_parser.py`
- `argparsers/view_parser.py`
- `argparsers/web_parser.py`

Shared argument utilities in `argparsers/util.py`:
- `add_resume_args()` — `--resume`, `--last`
- `add_confirmation_mode_args()` — `--always-approve`, `--llm-approve`, `--yolo`
- `add_env_override_args()` — `--override-with-envs`

## Confirmation Modes

Three mutually-exclusive modes controlled by CLI flags:

| Mode | Flag | Behavior |
|------|------|----------|
| `AlwaysAsk` | (default) | User confirms every action |
| `NeverConfirm` | `--always-approve` / `--yolo` | Auto-approve all |
| `ConfirmRisky` | `--llm-approve` | LLM-based security analyzer, confirm high-risk only |

Headless mode always uses `NeverConfirm`.

## Relevant Files

- Entrypoint: `openhands_cli/entrypoint.py`
- Main parser: `openhands_cli/argparsers/main_parser.py`
- TUI main: `openhands_cli/tui/textual_app.py`
- Web launcher: `openhands_cli/tui/serve.py`
- GUI launcher: `openhands_cli/gui_launcher.py`
- ACP server: `openhands_cli/acp_impl/agent.py`
- Argument utilities: `openhands_cli/argparsers/util.py`
