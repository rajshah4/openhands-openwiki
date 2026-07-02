# Testing Plan

This plan validates `openwiki-docs` from both places users are likely to run it:

- local Agent Canvas / Agent Server at `http://localhost:8000`
- a replicated OpenHands automation service

The goal is not just "the prompt works." The goal is to prove the whole OpenWiki loop works across both execution surfaces: plugin loading, repo access, docs edits, metadata, no-op updates, PR scope, and automation lifecycle.

## Current Local Baseline

Local Agent Canvas was reachable on July 2, 2026:

```text
GET http://127.0.0.1:8000/server_info -> 200
title: OpenHands Agent Server
version: 1.29.3
sdk_version: 1.29.3
```

Use `127.0.0.1` for scripted checks. On this machine, `localhost` may resolve through an interface that does not answer even when the service is listening.

The advertised API includes:

- `/api/conversations`
- `/api/plugins`
- `/api/plugins/install`
- `/api/plugins/installed`
- `/api/skills`
- `/api/skills/install`
- `/api/workspaces`
- `/api/settings`

This means the local track should test plugin/skill installation and direct conversation execution. It should not depend on public webhook delivery.

## Backend Matrix

| Track | Backend | What It Proves | Trigger Style |
| --- | --- | --- | --- |
| Local Canvas | `http://localhost:8000` | Plugin loads, skill instructions work, repo files are edited correctly, conversation output is usable | Direct conversation or UI run |
| Replicated Manual | `OPENHANDS_HOST/api/automation/v1` | Plugin preset can create an automation, clone repos, dispatch runs, and report status | Cron automation plus manual dispatch |
| Replicated Event | `OPENHANDS_HOST/api/automation/v1` | GitHub webhook routing, event filter, PR branch/comment behavior | GitHub label/comment trigger |

## Repository Ladder

Start tiny, then move through forked real repos.

1. `demo-target/`
   - Local-only fixture.
   - Use for very fast init/update/no-op checks.

2. Fork of `OpenHands/extensions`
   - Good first fork candidate.
   - Small, plugin/skill-shaped, directly relevant to this project.

3. Fork of `OpenHands/software-agent-sdk`
   - Medium complexity.
   - Python SDK plus examples and existing agent instructions.
   - Good test for source-map quality and update discipline.

4. Fork of `OpenHands/agent-canvas`
   - Tests frontend/backend product docs.
   - Good fit because users will run this from local Agent Canvas.

5. Fork of `OpenHands/OpenHands`
   - Large monorepo.
   - Use last, mostly to test scale limits, page budgeting, and whether updates stay surgical.

Use forks for all GitHub write/PR tests. Do not run branch-writing tests against upstream repos.

## Acceptance Criteria

A run passes only if all of these are true:

- Creates or updates `openwiki/quickstart.md`.
- Writes `openwiki/.last-update.json` after a real init/update docs change.
- Adds or refreshes only the top-level `AGENTS.md` and/or `CLAUDE.md` OpenWiki section.
- Does not read `.env` or secret-bearing files.
- Does not edit source code.
- Does not commit files outside:
  - `openwiki/**`
  - top-level `AGENTS.md`
  - top-level `CLAUDE.md`
- Update mode is surgical: no broad rewrites when recent changes affect only a narrow area.
- No-op update leaves the worktree clean.
- Final response is PR-friendly: changed docs, evidence inspected, caveats.

## Local Agent Canvas Tests

Run preflight:

```bash
./scripts/check-agent-canvas-local.sh http://127.0.0.1:8000
```

This script treats `server_info` and `openapi` as required. Authenticated plugin/skill probes are best effort because a local session key can be missing or stale.

Then install or load the local plugin through Agent Canvas. Use this repository path as the plugin source:

```text
plugins/openwiki-docs
```

### LC-1: Demo Init

Workspace:

```text
demo-target
```

Prompt:

```text
/openwiki-docs:init
```

Expected:

- `demo-target/openwiki/quickstart.md`
- `demo-target/openwiki/.last-update.json`
- `demo-target/AGENTS.md`

Review:

```bash
git -C demo-target status --short
find demo-target/openwiki -maxdepth 3 -type f
```

### LC-2: Demo No-op Update

Prompt:

```text
/openwiki-docs:update
```

Expected:

- No docs changes if the init docs are still accurate.
- Final response says the wiki is current.

### LC-3: Demo Targeted Update

Make a tiny route change in `demo-target/src/server.js`, such as adding `GET /version`.

Prompt:

```text
/openwiki-docs:update routing behavior
```

Expected:

- Only route-related docs change.
- Metadata updates.
- No unrelated docs rewrite.

### LC-4: Fork Init Conversation

Use a local clone of one fork, starting with `OpenHands/extensions`.

Prompt:

```text
/openwiki-docs:init extension marketplace structure
```

Expected:

- A small, navigable wiki.
- No more than 8 docs pages unless clearly justified.
- Top-level agent instructions point at `openwiki/quickstart.md`.

## Replicated Automation Tests

Run preflight after setting credentials:

```bash
export OPENHANDS_HOST="https://..."
export OPENHANDS_API_KEY="sk-oh-..."
./scripts/check-replicated-automation-api.sh
```

### RA-1: Manual Cron Smoke On A Fork

Use `automations/cron-update.json` with:

- plugin source set to the pushed prototype or marketplace repo
- repo set to a fork, not upstream
- schedule set to daily

Create the automation through:

```bash
curl -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/plugin" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @automations/cron-update.json
```

Then manually dispatch it from the automation API or UI.

Expected:

- Automation run reaches `COMPLETED`.
- Conversation remains viewable in the UI.
- Branch/PR is created only when docs changed.
- PR diff scope is limited to allowed docs files.

### RA-2: No-op Update On Same Fork

Dispatch the same automation again with no source changes.

Expected:

- No new commit.
- No duplicate PR.
- Final output says docs are current.

### RA-3: Event Label Trigger

Use `automations/github-label-update.json`.

On a fork PR, apply:

```text
openwiki-update
```

Expected:

- Automation matches exactly one event.
- It updates docs on the PR branch when safe.
- It leaves a concise PR comment.

### RA-4: Mention Trigger

Use `automations/github-comment.json`.

On a fork issue or PR, comment:

```text
@openhands openwiki update the docs for this routing change
```

Expected:

- Automation matches the comment.
- It chooses init or update correctly.
- It comments with the result and links to the branch/PR when one was created.

## Cross-Backend Comparison

For each fork candidate, run one local Agent Canvas init/update and one replicated automation init/update.

Compare:

- docs file list
- `quickstart.md` navigation quality
- number of pages
- whether claims cite real source paths
- whether update mode touches only affected docs
- final response usefulness
- runtime duration
- failure mode clarity

The two backends do not need byte-identical docs. They do need the same safety properties and roughly the same documentation shape.

## Fork Candidate Notes

Suggested first forks:

- `OpenHands/extensions`: small and directly aligned with skills/plugins.
- `OpenHands/software-agent-sdk`: good medium-sized SDK docs case.
- `OpenHands/agent-canvas`: product surface that matches local testing.

Hold `OpenHands/OpenHands` until the smaller repos are passing. It is useful for scale testing, but it will make it harder to distinguish plugin bugs from repo-size behavior.

## Stop Conditions

Pause and fix the plugin instructions if any run:

- edits source files
- reads or summarizes secrets
- creates docs outside `openwiki/`
- rewrites more than 3 pages during a narrow update
- opens duplicate PRs for no-op updates
- creates branch names or commit messages that are not clearly OpenWiki-scoped
- leaves failed automation runs without a useful error message

## Data To Capture

For each run, record:

- backend: local Agent Canvas or replicated automation
- repo and branch
- command: init or update
- trigger: direct, cron dispatch, label, or comment
- conversation URL
- automation run ID when applicable
- duration
- final response
- changed files
- PR URL if created
- pass/fail and notes
