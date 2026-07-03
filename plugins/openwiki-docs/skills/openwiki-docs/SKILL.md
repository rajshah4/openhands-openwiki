---
name: openwiki-docs
description: Generate and maintain OpenWiki-style documentation for a repository. Use when asked to initialize, update, repair, or automate durable repo documentation for humans and future coding agents.
triggers:
  - openwiki
  - repo docs
  - documentation automation
  - generate wiki
  - update wiki
  - agent docs
---

# OpenWiki Docs

You are maintaining durable repository documentation that is useful to both humans and future coding agents.

The documentation lives in `openwiki/`. The required entrypoint is `openwiki/quickstart.md`.

## Core Contract

- Ground important claims in files, existing docs, tests, configuration, scripts, or git evidence you inspected.
- Do not invent APIs, architecture, business logic, deployment behavior, or ownership.
- Do not read secret values, credentials, private keys, tokens, `.env` files, or other sensitive material.
- Keep generated documentation under `openwiki/`.
- The only allowed edits outside `openwiki/` are top-level `AGENTS.md` and `CLAUDE.md`, and only for the OpenWiki reference section.
- Prefer concise, navigable docs over exhaustive file inventories.
- Write for future change work: where to start, what to watch, and how to verify changes.

## Modes

Use init mode when the repository does not have useful OpenWiki documentation yet.

Use update mode when `openwiki/` exists and the task is to refresh docs from recent repository changes.

If the user or automation command does not specify a mode:

- choose init mode when `openwiki/quickstart.md` is missing
- choose update mode when `openwiki/quickstart.md` exists

## Discovery Rules

- Start with targeted repository inventory:
  - README and root docs
  - package/build/config files
  - application or service entrypoints
  - routing/API surfaces
  - schema/data/model files
  - tests/evals
  - operational scripts and deployment config
  - existing agent instructions such as `AGENTS.md`, `CLAUDE.md`, and nested skills
- Use fast targeted search. Prefer `rg --files` with excludes for `.git`, `node_modules`, `dist`, `build`, cache directories, and generated `openwiki/`.
- Do not exhaustively read every file.
- Prefer representative source files for each major domain.
- Use git history where it helps explain why code exists, not only what code exists.
- During init, inspect recent commit history and selectively inspect high-signal commits.
- During update, inspect commits since `openwiki/.last-update.json` `gitHead` when available. Fall back to `updatedAt`, then recent history.
- Use `git status` and `git diff` to account for uncommitted local changes.

## Init Mode

Build a strong first-pass wiki, then stop.

Required behavior:

- Create `openwiki/quickstart.md` first.
- Create the smallest useful set of supporting pages needed to explain the repo.
- Use at most 8 documentation pages unless the repo clearly needs more.
- Include a high-level repository overview in `quickstart.md`.
- Link from `quickstart.md` to every major supporting page.
- Do not link from `quickstart.md` to a supporting page unless that page exists by the end of the same run.
- Include source references inline where they help a reader verify or continue exploring.
- When a Markdown file under `openwiki/` links to repository-root files or directories, use paths relative to the page location, such as `../src/server.js` or `../README.md`.
- Add change-oriented guidance for future agents.
- Avoid thin pages and one-file section directories unless the boundary is clearly useful and likely to grow.
- Before finishing, review the `openwiki/` tree and merge/remove stubs.

For small repositories with about 10 or fewer primary source files, prefer `openwiki/quickstart.md` plus at most 1-2 supporting pages.

## Update Mode

Update runs must be surgical.

Required behavior:

- Read existing `openwiki/` docs before editing.
- Read `openwiki/.last-update.json` if present.
- Build a docs impact plan in your own working notes:
  - source change
  - docs affected
  - edit needed
  - why
- Only edit pages whose current content is inaccurate, incomplete, or misleading because of recent source, workflow, product, or existing-doc changes.
- Prefer replacing one stale sentence over rewriting an accurate page.
- Do not make formatting-only edits.
- Do not refresh source maps, git evidence lists, or generic watch-outs unless materially wrong.
- Avoid editing `quickstart.md` unless top-level behavior, setup, or navigation changed.
- If fewer than about 5 source files changed, update at most 1-2 wiki pages unless there is a clear reason to do more.
- If the wiki is already current, do not edit files.

## Required OpenWiki Reference Section

Unless the user explicitly asks otherwise, ensure top-level `AGENTS.md` and/or `CLAUDE.md` reference the OpenWiki quickstart.

Only inspect and edit top-level files for this step. Do not edit nested `AGENTS.md` or `CLAUDE.md`.

If both top-level files exist, ensure both contain the same section. If neither exists, create top-level `AGENTS.md` containing only this section.

Use this section structure. Keep the "includes" sentence accurate for the pages that actually exist; do not claim architecture, workflow, domain, integration, test, or source-map pages exist unless you created or verified them.

```markdown
## OpenWiki

This repository has documentation located in the /openwiki directory. Start here:

- [OpenWiki quickstart](openwiki/quickstart.md)

OpenWiki includes <accurate, comma-separated list of existing documentation areas>.

When working in this repository, read the OpenWiki quickstart first, then follow its links to the relevant supporting notes.
```

Preserve surrounding instructions. Replace an existing stale OpenWiki section instead of adding duplicates.

## Metadata

Track successful docs updates in `openwiki/.last-update.json`.

Use this shape:

```json
{
  "updatedAt": "2026-07-02T00:00:00.000Z",
  "command": "init",
  "gitHead": "abc123",
  "model": "openhands"
}
```

Set `command` to `init` or `update`.

Set `gitHead` from `git rev-parse HEAD` when available.

Set `updatedAt` from the runtime clock, not from your prompt context. Prefer a command such as `date -u +"%Y-%m-%dT%H:%M:%S.000Z"` before writing metadata.

In update mode, update metadata only when OpenWiki content changed. In init mode, write metadata after creating useful docs.

## Automation Behavior

When running inside an automation, keep the final response short and PR-friendly:

- changed docs
- evidence inspected
- caveats
- whether a PR should be opened

If the automation asks you to open a PR, commit only:

- `openwiki/**`
- top-level `AGENTS.md`
- top-level `CLAUDE.md`

Use a branch name like `openwiki/update` or `openwiki/init`.

Suggested commit messages:

- `docs: initialize OpenWiki`
- `docs: update OpenWiki`

Suggested PR title:

- `docs: initialize OpenWiki`
- `docs: update OpenWiki`

Suggested PR body:

```markdown
Automated OpenWiki documentation update.

Summary:
- ...

Review notes:
- ...
```

## Quality Bar

The wiki is successful when a new engineer or coding agent can start at `openwiki/quickstart.md` and understand:

- what the project does
- how it is organized
- where important workflows live
- how to verify common changes
- where to continue reading for architecture, data, operations, integrations, and tests

Do not optimize for volume. Optimize for reliable orientation.
