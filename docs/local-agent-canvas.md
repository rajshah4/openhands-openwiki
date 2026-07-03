# Local Agent Canvas Usage

Use this path when you want to run OpenWiki from a local Agent Canvas / OpenHands Agent Server, for example at `http://localhost:8000`.

The verified local benchmark used:

- Agent Canvas: `http://127.0.0.1:8000`
- Server version: `1.29.3`
- Profile: `Minimax`
- Model: `openhands/minimax-m2.7`
- Workspace location: `/private/tmp/.../repo`

## 1. Preflight The Local Server

```bash
./scripts/check-agent-canvas-local.sh http://127.0.0.1:8000
```

Expected output includes:

```text
server_info: ok
openapi: ok
authenticated settings/profile probes: ok
local automation API probe: ok
local Agent Canvas preflight passed
```

If a scripted run cannot read a repository under `~/Documents` on macOS, clone or copy the target repo under `/private/tmp` and run against that path.

## 2. Clone A Target Repo

```bash
git clone https://github.com/OpenHands/OpenHands-CLI.git /private/tmp/openwiki-openhands-cli
```

Use forks or local clones for experiments where you may commit or open a PR.

## 3. Run OpenWiki With Minimax

```bash
OPENWIKI_WORKSPACE=/private/tmp/openwiki-openhands-cli \
OPENWIKI_PROFILE=Minimax \
OPENWIKI_MODE=init \
OPENWIKI_FOCUS="architecture, commands, setup, tests, build and release" \
OPENWIKI_MAX_ITERATIONS=140 \
node scripts/run-agent-canvas-openwiki.mjs
```

The script:

- reads the active Agent Canvas API key without printing it
- loads the local `Minimax` profile
- injects the `openwiki-docs` skill
- creates a local conversation with standard Agent Canvas tools
- writes generated docs into the target repo

## 4. Monitor The Run

The launch command prints a conversation URL:

```text
http://127.0.0.1:8000/conversations/<conversation-id>
```

You can inspect the target repo while the run is active:

```bash
find /private/tmp/openwiki-openhands-cli/openwiki -maxdepth 2 -type f | sort
git -C /private/tmp/openwiki-openhands-cli status --short
```

## 5. Sample Prompts

Init a new wiki:

```text
Use the openwiki-docs skill in this repository and run in init mode.
Focus: architecture, commands, setup, tests, build and release.

Constraints:
- Read repository files and git history before writing docs.
- Write documentation under openwiki/.
- Update only top-level AGENTS.md or CLAUDE.md outside openwiki/ if the skill calls for it.
- Do not edit application source files.
- Use the runtime clock for openwiki/.last-update.json updatedAt.
- Verify generated file listing, relative links, and git status before finishing.
```

Update an existing wiki:

```text
Use the openwiki-docs skill in this repository and run in update mode.
Focus on changes since openwiki/.last-update.json.

If docs are still current, do not edit files. If docs changed, keep the diff scoped to openwiki/** plus top-level AGENTS.md or CLAUDE.md.
```

Run a no-op check:

```text
Use the openwiki-docs skill in update mode. Check whether the existing OpenWiki docs are current. Do not make formatting-only edits.
```

## 6. Review The Result

Expected init output:

- `openwiki/quickstart.md`
- `openwiki/.last-update.json`
- zero or more supporting pages under `openwiki/`
- an OpenWiki reference section in top-level `AGENTS.md` or `CLAUDE.md`

Review before committing:

```bash
find openwiki -type f | sort
git status --short
git diff --stat
```

Allowed changed files:

```text
openwiki/**
AGENTS.md
CLAUDE.md
```

Anything else should be treated as a bug in the prompt, skill instructions, or run configuration.
