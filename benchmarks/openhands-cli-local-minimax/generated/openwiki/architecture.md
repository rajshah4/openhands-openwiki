# Architecture

The TUI uses a reactive state management pattern with clear separation of concerns. All TUI code lives in `openhands_cli/tui/`.

## Widget Hierarchy

```
OpenHandsApp
└── ConversationManager(Container)  ← message router
    └── Horizontal(#content_area)
        └── ConversationContainer(#conversation_state)  ← reactive state
            ├── ScrollableContent(#scroll_view)
            │   ├── SplashContent(#splash_content)
            │   └── ... dynamically added conversation widgets
            └── InputAreaContainer(#input_area)
                ├── WorkingStatusLine
                ├── InputField
                └── InfoStatusLine
    └── Footer
    └── ... modals and side panels (SettingsScreen, HistorySidePanel, MCPSidePanel, etc.)
```

## Core Components

**ConversationContainer** (`tui/core/state.py`) — Reactive state holder
- A Textual `Container` widget owning all conversation-related reactive properties
- Properties: `running`, `conversation_id`, `conversation_title`, `confirmation_policy`, `pending_action_count`, `elapsed_seconds`, `metrics`
- UI widgets bind via `data_bind()` and auto-update when state changes
- Thread-safe state update methods (`set_running()`, `set_conversation_id()`, `_schedule_update()`)

**ConversationManager** (`tui/core/conversation_manager.py`) — Message router
- Textual `Container` that listens to messages and delegates to controllers
- Owns: `RunnerRegistry`, `ConfirmationPolicyService`, and all controllers
- Message handlers (`@on(MessageType)`) route to appropriate controllers

**Controllers** (single-responsibility business logic):
| Controller | File | Responsibility |
|------------|------|----------------|
| `UserMessageController` | `user_message_controller.py` | User input, message rendering, runner queueing |
| `ConversationCrudController` | `conversation_crud_controller.py` | New conversations, state reset |
| `ConversationSwitchController` | `conversation_switch_controller.py` | Pause current, prepare new |
| `ConfirmationFlowController` | `confirmation_flow_controller.py` | Confirmation panel, user decisions |
| `RefinementController` | `refinement_controller.py` | Agent self-refinement cycles |

**RunnerFactory + RunnerRegistry** (`runner_factory.py`, `runner_registry.py`) — Runner lifecycle
- `RunnerFactory`: creates `ConversationRunner` instances with dependencies
- `RunnerRegistry`: caches runners by `conversation_id`, tracks current runner

## Data Flow

1. **User input** → `InputField` posts `UserInputSubmitted` → bubbles to `ConversationManager` → `UserMessageController.handle_user_message()`
2. **Slash commands** → `InputField` posts `SlashCommandSubmitted` → `InputAreaContainer` routes to command handlers → posts operation messages (e.g., `CreateConversation`)
3. **State changes** → Controllers call `ConversationContainer.set_*()` methods → reactive properties update → bound widgets auto-refresh
4. **Cross-thread updates** → `ConversationContainer._schedule_update()` uses `call_from_thread()` for thread safety

## Message Flow

`InputField` → `SendMessage` → bubbles → `ConversationManager`
`InputAreaContainer` → `CreateConversation`/etc → bubbles → `ConversationManager`
`HistorySidePanel` → `SwitchConversation` → bubbles → `ConversationManager`

`ConversationManager` → posts `UIEvent` → bubbles up → `App` handles with `@on`

## Key Design Principles

- **Reactive state**: UI components bind to `ConversationContainer` properties via `data_bind()`, auto-update on changes
- **Single source of truth**: `ConversationContainer` owns all conversation state
- **Thread safety**: State updates use `call_from_thread()` when called from background threads
- **Message-based communication**: Components communicate via Textual messages that bubble up the widget tree
- **Controller pattern**: Business logic split into focused controllers; `ConversationManager` is just a router

## CLI Entrypoint Architecture

`openhands_cli/entrypoint.py:main()` is the single entrypoint registered as the `openhands` console script in `pyproject.toml`:

```toml
[project.scripts]
openhands = "openhands_cli.entrypoint:main"
"openhands-acp" = "openhands_cli.acp:main"
```

The `main()` function dispatches to:
- **TUI mode** (default): calls `tui.textual_app.main()` → `OpenHandsApp.run()`
- **`serve`**: calls `gui_launcher.launch_gui_server()` → Docker container
- **`web`**: calls `tui.serve.launch_web_server()` → `textual-serve`
- **`acp`**: calls `acp_impl.agent.run_acp_server()`
- **`login`/`logout`/`mcp`/`cloud`/`view`**: command-specific handlers

## Persistence Stores

| Store | File | Purpose |
|-------|------|---------|
| `AgentStore` | `stores/agent_store.py` | LLM settings, env var handling |
| `CliSettings` | `stores/cli_settings.py` | TUI preferences, critic config |
| `PromptHistoryStore` | `stores/prompt_history.py` | Workspace-specific prompt history with fuzzy search |
| `LocalFileStore` | `conversations/store/local.py` | Conversation list and history |

## Relevant Files

- Entrypoint: `openhands_cli/entrypoint.py`
- TUI app: `openhands_cli/tui/textual_app.py`
- State container: `openhands_cli/tui/core/state.py`
- Message router: `openhands_cli/tui/core/conversation_manager.py`
- Runner lifecycle: `openhands_cli/tui/core/runner_factory.py`, `runner_registry.py`
- Config locations: `openhands_cli/locations.py`
