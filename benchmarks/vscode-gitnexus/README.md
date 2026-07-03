# Benchmark: VS Code With GitNexus Context

This benchmark records a GitNexus-enriched Autodocs context run against
[`microsoft/vscode`](https://github.com/microsoft/vscode).

VS Code / Code OSS is a large TypeScript and Electron codebase with command
routing, extension activation, localization, workbench services, tests, and
shared platform utilities. It is a useful target for testing whether structured
repo intelligence helps an agent find the right subsystem before writing or
updating docs.

This is not a full Autodocs generation benchmark. It records the kind of
GitNexus evidence Autodocs can use when GitNexus is available and indexed.

## Target

| Field | Value |
| --- | --- |
| Repository | `microsoft/vscode` |
| Local GitNexus alias | `vscode-benchmark-repo` |
| Indexed commit | `9d16a19` |
| Indexed files | `11,454` |
| Indexed symbols | `249,982` |
| Indexed edges | `966,616` |
| Clusters | `11,767` |
| Processes | `300` |

The scale matters: this is large enough that broad text search can produce a
lot of plausible-looking noise. A graph-backed context source can help
Autodocs choose better starting points for architecture, workflow, and risk
notes.

## Setup

Use an existing VS Code checkout or clone one:

```bash
export VSCODE_REPO_DIR=../example-projects/vscode-benchmark-repo
export GITNEXUS_REPO_ALIAS=vscode-benchmark-repo

mkdir -p ../example-projects
git clone --depth 1 https://github.com/microsoft/vscode.git \
  "$VSCODE_REPO_DIR"
```

Index it with GitNexus:

```bash
npx -y gitnexus@latest analyze "$VSCODE_REPO_DIR" \
  --name "$GITNEXUS_REPO_ALIAS"
```

For OpenHands MCP usage, add GitNexus as a custom stdio server:

```text
Name: gitnexus
Type: stdio
Command: npx
Arguments:
-y
gitnexus@latest
mcp
```

OpenHands `1.31.0` or newer is recommended for GitNexus MCP tools whose schemas
include an argument named `kind`.

## Finding 1: Starting Point

Question:

```text
extension activation command registration execute command
```

Plain exact phrase search:

```bash
rg -n -i --fixed-strings \
  "extension activation command registration execute command" \
  "$VSCODE_REPO_DIR"
```

Result from the local run:

```text
0 exact phrase matches
real 0.52s
```

A broader token fallback across command and activation terms hit `1,009` files.
That is useful raw retrieval, but it leaves ranking and structure to the agent.

GitNexus query:

```bash
npx -y gitnexus@latest query -r "$GITNEXUS_REPO_ALIAS" \
  -c "VS Code command execution and extension activation architecture" \
  -g "Find the best starting point for a coding agent investigating where commands are executed after registration or activation" \
  "extension activation command registration execute command"
```

Useful result:

```text
CommandService.executeCommand
src/vs/workbench/services/commands/common/commandService.ts
lines 51-89
```

Why it matters for Autodocs:

Autodocs can use the graph-ranked target as a better starting point for a
workflow or architecture page. The output is not just "files containing these
words"; it is a symbol-level lead in the command execution subsystem.

## Finding 2: Symbol Context

GitNexus context query:

```bash
npx -y gitnexus@latest context -r "$GITNEXUS_REPO_ALIAS" \
  -f src/vs/workbench/services/commands/common/commandService.ts \
  executeCommand
```

Useful result:

```text
Symbol:
CommandService.executeCommand
src/vs/workbench/services/commands/common/commandService.ts
lines 51-89

Calls:
_activateStar
_tryExecuteCommand
ICommandRegistry.getCommand
raceCancellablePromises

Implements:
ICommandService.executeCommand

Accesses:
_extensionHostIsReady
_extensionService
_logService

Boundary:
executeCommand is an interface with 4 implementations, so callers that bind
through the interface may not all trace to this concrete symbol.
```

Why it matters for Autodocs:

This is the kind of evidence that turns a source-file summary into a useful
agent map. Autodocs can document the nearby calls, implemented interface,
important fields, and static-analysis boundary before a future coding agent
starts editing.

## Finding 3: Blast Radius

GitNexus impact query:

```bash
npx -y gitnexus@latest impact -r "$GITNEXUS_REPO_ALIAS" \
  -f src/vs/nls.ts \
  --kind Function \
  --depth 2 \
  --summary-only \
  localize
```

Useful result:

```text
Target: localize
File: src/vs/nls.ts
Risk: CRITICAL
Impacted count: 7,963
Direct impacts: 4,328
Depth 2 impacts: 3,635
Processes affected: 7
Modules affected: 20
```

Why it matters for Autodocs:

The symbol looks like a small helper, but it is structurally central. Autodocs
can use this kind of result to add practical change guidance: avoid broad API
changes, preserve compatibility, inspect call sites, and run wider validation.

## Finding 4: Update Context

GitNexus can also map the current git diff to indexed symbols:

```bash
npx -y gitnexus@latest detect-changes -r "$GITNEXUS_REPO_ALIAS" --scope all
```

In the local VS Code working tree, this returned a low-risk documentation-only
change surface:

```text
Changes: 1 files, 28 symbols
Affected processes: 0
Risk level: low
```

Why it matters for Autodocs:

Update mode should be surgical. If GitNexus is available, `detect-changes` can
help Autodocs decide which docs are likely stale, which workflows are affected,
and whether a documentation update should be small or broad.

## Takeaways

GitNexus is most valuable to Autodocs on large or unfamiliar repositories where
plain search finds too many plausible files.

Use GitNexus to enrich:

- architecture and workflow pages
- "where to start" sections
- risky change-surface notes
- update-mode docs impact plans
- future-agent guidance in `AGENTS.md` or `CLAUDE.md`

Keep GitNexus optional. Autodocs should always fall back to normal source,
docs, test, config, and git inspection when the graph is unavailable.
