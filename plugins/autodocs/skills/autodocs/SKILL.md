---
name: autodocs
description: Generate and maintain durable repository documentation for humans and future coding agents. Use when asked to plan, initialize, update, repair, or automate repo docs, including OpenWiki-style docs and optional GitNexus-enriched docs.
triggers:
  - autodocs
  - openwiki
  - repo docs
  - documentation automation
  - generate wiki
  - update wiki
  - gitnexus docs
  - agent docs
---

# Autodocs

You are maintaining durable repository documentation that is useful to both humans and future coding agents.

The default output format is OpenWiki-style, OKF-compatible documentation under `openwiki/`. The required default entrypoint is `openwiki/quickstart.md`.

Autodocs is flexible: when a user asks for another documentation format or an existing tool produces useful docs, use that format if it fits the request. GitNexus is an optional structured context provider, not a requirement.

## Core Contract

- Ground important claims in files, existing docs, tests, configuration, scripts, git evidence, or structured tool output you inspected.
- Treat GitNexus output as evidence. Do not treat it as a replacement for source files, existing docs, tests, config, or git history.
- Do not invent APIs, architecture, business logic, deployment behavior, ownership, or runtime guarantees.
- Do not read secret values, credentials, private keys, tokens, `.env` files, or other sensitive material.
- Keep default generated documentation under `openwiki/`.
- The only allowed default edits outside `openwiki/` are top-level `AGENTS.md` and `CLAUDE.md`, and only for the Autodocs reference section.
- Prefer concise, navigable docs over exhaustive file inventories.
- Write for future change work: where to start, what to watch, and how to verify changes.

## OpenWiki And OKF Compatibility

For default OpenWiki-style output, follow the Open Knowledge Format (OKF) v0.1 conventions used by OpenWiki 0.2.

Treat every non-reserved Markdown file under `openwiki/` as a concept document. Each concept document created or updated by Autodocs must begin with valid YAML front matter. Use this shape, replacing the example values with real values and omitting optional fields that do not apply:

```yaml
---
type: Reference
title: Optional display title
description: One to two sentence summary optimized for search and retrieval.
resource: Optional canonical URI or repository path
tags: [optional, short, strings]
timestamp: "<ISO 8601 datetime for last meaningful content change>"
---
```

Only `type` is required. Recommended fields, in priority order, are `title`, `description`, `resource`, `tags`, and `timestamp`. Use short, descriptive `type` values such as `Architecture`, `Workflow`, `API Endpoint`, `Runbook`, `Testing Guide`, or `Reference`; do not force every page into a fixed taxonomy. Set `timestamp` from the runtime clock only when it represents the page's last meaningful content change. Preserve producer-defined front matter fields when updating existing concept documents. Omit optional fields when they are not supported by evidence.

Reserved OKF files are not concept documents:

- `index.md`
- `log.md`
- `INSTRUCTIONS.md`

Do not add concept front matter to reserved files. The root `openwiki/index.md` may include only:

```yaml
---
okf_version: "0.1"
---
```

Maintain directory indexes for navigation. Each `index.md` should summarize sibling concept pages and subdirectories, using each page's `title` and `description` when present. Nested directory indexes should not include front matter.

Maintain `openwiki/log.md` as the human- and agent-readable update log. Add an entry only when docs changed. Include the date, changed docs, and why they changed. Keep `openwiki/.last-update.json` as the machine-readable update marker.

Use standard Markdown links between concept documents to express relationships. Put the link in the sentence that explains the relationship, such as "the API layer dispatches to [workflow execution](workflows/execution.md)." Quickstart links and index links help navigation but do not replace relationship links inside concept prose.

When updating a legacy `openwiki/` tree that lacks OKF front matter, add or correct front matter only for pages edited in the run unless the user explicitly asks for a full OKF migration.

## Modes

Use plan mode when the user asks what docs should be created, wants a dry run, or wants to compare documentation approaches.

Use init mode when the repository does not have useful default docs yet.

Use update mode when `openwiki/` exists and the task is to refresh docs from recent repository changes.

If the user or automation command does not specify a mode:

- choose init mode when `openwiki/quickstart.md` is missing
- choose update mode when `openwiki/quickstart.md` exists

If the user or automation command does not specify a documentation focus, use a default brief that covers architecture, setup, primary workflows, integrations, operations, tests, verification, and change-risk areas. Do not pause for clarification unless the repository purpose cannot be inferred from inspectable evidence.

## Context Sources

Autodocs can use multiple context sources:

- repository files and directory structure
- existing README files and docs
- tests, evals, scripts, configs, schemas, and deployment files
- recent git history and current diffs
- existing agent instructions such as `AGENTS.md`, `CLAUDE.md`, and nested skills
- optional GitNexus graph context when available
- optional generated GitNexus wiki output when the user explicitly asks to use or compare it
- optional MCP servers, OpenHands tools, plugins, or custom integrations that provide relevant project evidence
- optional structured project artifacts such as OpenAPI specs, database schemas, ADRs, runbooks, issue specs, CI reports, coverage reports, eval outputs, and service maps

When GitNexus is not available, continue with standard repository inspection.

When another integration is available, use it only when it directly improves the documentation task. Summarize the useful evidence and keep claims grounded in inspectable output.

## Optional GitNexus Rules

Use GitNexus only when it is available through MCP or CLI and the target repository has an index. GitNexus MCP enrichment requires OpenHands Agent Server `1.31.0` or newer; older `1.29.x` Agent Server / SDK builds can fail on MCP tool schemas with a valid argument named `kind`. Do not fail the Autodocs run just because GitNexus is missing, unreachable, or degraded. If MCP tools are unavailable but the GitNexus CLI works, note the MCP limitation or required Agent Server upgrade and use the CLI as optional evidence.

High-value GitNexus uses:

- Use `list` or MCP repo listing to verify the target repository is indexed.
- Use `query` to find graph-ranked starting points for workflows, concepts, services, or features.
- Use `context` for important symbols before writing architecture or workflow details.
- Use `impact` to identify risky change surfaces and blast radius.
- Use `trace` to document execution paths when a workflow crosses multiple files or layers.
- Use `detect-changes` during update mode to map current diffs to changed symbols and affected execution flows.
- Use generated GitNexus wiki pages as comparison material only when the user asks for a GitNexus docs format or comparison.

Good places to mention GitNexus-backed evidence:

- architecture pages
- workflow pages
- "where to start" sections
- change-risk or watch-out sections
- update-mode docs impact plans

Do not copy raw GitNexus JSON into docs unless the user asks. Summarize the useful structure and cite the command or tool used.

## Discovery Rules

- Start with targeted repository inventory:
  - README and root docs
  - package, build, and config files
  - application or service entrypoints
  - routing and API surfaces
  - schema, data, and model files
  - tests and evals
  - operational scripts and deployment config
  - existing agent instructions such as `AGENTS.md`, `CLAUDE.md`, and nested skills
- Use fast targeted search. Prefer `rg --files` with excludes for `.git`, `node_modules`, `dist`, `build`, cache directories, generated `openwiki/`, and generated `.gitnexus/wiki/`.
- Do not exhaustively read every file.
- Prefer representative source files for each major domain.
- Use git history where it helps explain why code exists, not only what code exists.
- During init, inspect recent commit history and selectively inspect high-signal commits.
- During update, inspect commits since `openwiki/.last-update.json` `gitHead` when available. Fall back to `updatedAt`, then recent history.
- Use `git status` and `git diff` to account for uncommitted local changes.

## Plan Mode

Plan mode should not edit files.

Return:

- recommended documentation format
- proposed docs pages
- evidence to inspect
- whether GitNexus appears available and useful
- OKF readiness, including whether existing docs need front matter, index, or log updates
- risks, unknowns, and suggested next command

Prefer a short plan over a full design document. The plan should make it easy for a human to approve init or update mode.

## Init Mode

Build a strong first-pass documentation set, then stop.

Required behavior:

- Create `openwiki/quickstart.md` first unless the user explicitly requested a different output format.
- Create the smallest useful set of supporting pages needed to explain the repo.
- Use at most 8 documentation pages unless the repo clearly needs more.
- Add OKF front matter to every concept page created under `openwiki/`.
- Create `openwiki/index.md` and any needed nested `index.md` files after creating concept pages.
- Create `openwiki/log.md` with an initialization entry when docs are created.
- Include a high-level repository overview in `quickstart.md`.
- Link from `quickstart.md` to every major supporting page.
- Do not link from `quickstart.md` to a supporting page unless that page exists by the end of the same run.
- Include source references inline where they help a reader verify or continue exploring.
- When a Markdown file under `openwiki/` links to repository-root files or directories, use paths relative to the page location, such as `../src/server.js` or `../README.md`.
- Add change-oriented guidance for future agents.
- If GitNexus was used, include concise graph-backed notes only where they improve the docs.
- Avoid thin pages and one-file section directories unless the boundary is clearly useful and likely to grow.
- Before finishing, review the `openwiki/` tree and merge or remove stubs.

For small repositories with about 10 or fewer primary source files, prefer `openwiki/quickstart.md` plus at most 1-2 supporting pages.

## Update Mode

Update runs must be surgical.

Required behavior:

- Read existing `openwiki/` docs before editing.
- Read `openwiki/.last-update.json` if present.
- Read `openwiki/log.md` and relevant `index.md` files when present.
- Build a docs impact plan in your own working notes:
  - source change
  - docs affected
  - edit needed
  - why
- If GitNexus is available, consider `detect-changes` to map diffs to indexed symbols and affected flows.
- Only edit pages whose current content is inaccurate, incomplete, or misleading because of recent source, workflow, product, or existing-doc changes.
- Add or correct OKF front matter for any concept page you edit.
- Refresh affected `index.md` files and append `openwiki/log.md` only when docs content changed.
- Prefer replacing one stale sentence over rewriting an accurate page.
- Do not make formatting-only edits.
- Do not refresh source maps, git evidence lists, or generic watch-outs unless materially wrong.
- Avoid editing `quickstart.md` unless top-level behavior, setup, or navigation changed.
- If fewer than about 5 source files changed, update at most 1-2 wiki pages unless there is a clear reason to do more.
- If the docs are already current, do not edit files.

## Required Autodocs Reference Section

Unless the user explicitly asks otherwise, ensure top-level `AGENTS.md` and/or `CLAUDE.md` reference the default docs entrypoint.

Only inspect and edit top-level files for this step. Do not edit nested `AGENTS.md` or `CLAUDE.md`.

If both top-level files exist, ensure both contain the same section. If neither exists, create top-level `AGENTS.md` containing only this section.

Use this section structure. Keep the "includes" sentence accurate for the pages that actually exist; do not claim architecture, workflow, domain, integration, test, source-map, or GitNexus-enriched pages exist unless you created or verified them.

```markdown
## Autodocs

This repository has durable documentation located in the /openwiki directory. Start here:

- [Autodocs quickstart](openwiki/quickstart.md)

Autodocs includes <accurate, comma-separated list of existing documentation areas>.

When working in this repository, read the Autodocs quickstart first, then follow its links to the relevant supporting notes.
```

Preserve surrounding instructions. Replace an existing stale Autodocs or OpenWiki section instead of adding duplicates.

## Metadata

Track successful default docs updates in `openwiki/.last-update.json`.

Use this shape:

```json
{
  "updatedAt": "2026-07-02T00:00:00.000Z",
  "command": "init",
  "gitHead": "abc123",
  "model": "openhands",
  "contextSources": ["repo", "git", "gitnexus"]
}
```

Set `command` to `init` or `update`.

Set `gitHead` from `git rev-parse HEAD` when available.

Set `updatedAt` from the runtime clock, not from your prompt context. Prefer a command such as `date -u +"%Y-%m-%dT%H:%M:%S.000Z"` before writing metadata.

Set `contextSources` to the sources that materially shaped the docs. Omit `gitnexus` if GitNexus was unavailable or unused.

In update mode, update metadata only when docs content changed. In init mode, write metadata after creating useful docs.

## Automation Behavior

When running inside an automation, keep the final response short and PR-friendly:

- changed docs
- evidence inspected
- context sources used
- caveats
- whether a PR should be opened

If the automation asks you to open a PR, commit only:

- `openwiki/**`
- top-level `AGENTS.md`
- top-level `CLAUDE.md`

Use a branch name like `autodocs/update` or `autodocs/init`.

Suggested commit messages:

- `docs: initialize Autodocs`
- `docs: update Autodocs`

Suggested PR title:

- `docs: initialize Autodocs`
- `docs: update Autodocs`

Suggested PR body:

```markdown
Automated Autodocs documentation update.

Summary:
- ...

Context sources:
- ...

Review notes:
- ...
```

## Quality Bar

The docs are successful when a new engineer or coding agent can start at `openwiki/quickstart.md` and understand:

- what the project does
- how it is organized
- where important workflows live
- how to verify common changes
- where to continue reading for architecture, data, operations, integrations, and tests
- what change surfaces deserve extra care

Do not optimize for volume. Optimize for reliable orientation.
