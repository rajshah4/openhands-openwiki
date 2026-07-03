# OpenHands Enterprise Automations

Use this path when you want OpenWiki to run as an OpenHands Enterprise automation: on a schedule, by manual dispatch, or from GitHub events.

This is an agent-shaped task because it reads repository context, reasons about documentation impact, edits files, and may open a PR. Use the **plugin preset** automation endpoint so the `openwiki-docs` skill is loaded at run time.

## 1. Preflight The Automation API

Set the host and either pass an API key directly or point at an env file. Do not source secret-bearing files into your shell.

```bash
OPENHANDS_HOST="https://app.replicated.rajistics.com" \
DOTENV_FILE="/path/to/.env" \
./scripts/check-replicated-automation-api.sh
```

Expected output:

```text
Checking automation API at https://app.replicated.rajistics.com
automation list endpoint: ok
replicated automation API preflight passed
```

The helper reads `OPENHANDS_API_KEY` or `OPENHANDS_API_KEY_ORG` assignment lines without printing the value.

## 2. Choose A Trigger

| Trigger | Use When | Notes |
| --- | --- | --- |
| Cron | You want daily or weekly docs maintenance | Easiest first production path; can be manually dispatched for testing |
| GitHub label | You want docs refresh on a PR when a human asks | Requires GitHub event delivery to the Enterprise instance |
| GitHub comment | You want ad hoc `@openhands openwiki` requests | Good for demos and targeted updates |

For local or private deployments that cannot receive inbound GitHub webhooks, start with cron plus manual dispatch.

## 3. Create A Cron Automation

Start with a fork or low-risk repo. Replace the plugin source/ref and target repo before posting.

```bash
curl -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/plugin" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @automations/cron-update.json
```

Recommended prompt shape:

```text
Run /openwiki-docs:init if openwiki/quickstart.md is missing; otherwise run /openwiki-docs:update.

If OpenWiki documentation changed, create a branch named openwiki/update, commit only openwiki/** plus top-level AGENTS.md or CLAUDE.md changes, and open a pull request titled "docs: update OpenWiki".

If no docs changes are needed, do not create a commit or PR. Finish with changed docs, evidence inspected, caveats, and PR status.
```

## 4. Manually Dispatch And Monitor

```bash
curl -X POST "${OPENHANDS_HOST}/api/automation/v1/{automation_id}/dispatch" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}"
```

List recent runs:

```bash
curl "${OPENHANDS_HOST}/api/automation/v1/{automation_id}/runs?limit=20" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}"
```

Run status values:

- `PENDING`
- `RUNNING`
- `COMPLETED`
- `FAILED`

When a run starts a conversation, use the Enterprise UI to inspect the conversation history and final response.

## 5. GitHub Event Automations

### PR Label Trigger

Use `automations/github-label-update.json`.

Trigger:

```json
{
  "type": "event",
  "source": "github",
  "on": "pull_request.labeled",
  "filter": "contains(pull_request.labels[].name, 'openwiki-update')"
}
```

Sample prompt:

```text
A pull request was labeled for OpenWiki documentation maintenance. Inspect the PR repository and branch from the GitHub event payload. Run /openwiki-docs:update focused on the PR changes.

If documentation changed, commit only openwiki/** plus top-level AGENTS.md or CLAUDE.md changes back to the PR branch and leave a concise PR comment. If no docs changes are needed, leave a short comment saying the OpenWiki docs are current.
```

### Comment Trigger

Use `automations/github-comment.json`.

Trigger:

```json
{
  "type": "event",
  "source": "github",
  "on": "issue_comment.created",
  "filter": "icontains(comment.body, '@openhands openwiki') || icontains(comment.body, '/openwiki')"
}
```

Sample comments:

```text
@openhands openwiki initialize docs for this repository
@openhands openwiki update docs for the routing changes in this PR
/openwiki update setup and release notes
```

## 6. Safety Checks

Every automation prompt should keep these constraints:

- Do not read `.env`, private keys, tokens, or secret-bearing files.
- Do not edit application source files.
- Commit only `openwiki/**`, top-level `AGENTS.md`, and top-level `CLAUDE.md`.
- Do not open a PR when docs are already current.
- Keep the final response PR-friendly: changed docs, evidence inspected, caveats, PR status.

Treat any broader diff as a bug in the prompt or skill instructions.

## Verified Smokes

The Rajistics Enterprise instance has run smoke automations against `rajshah4/openwiki-demo-target`.

Post-rename smoke using `github:rajshah4/openhands-openwiki`:

```text
automation_id: bce0b844-2d12-4f61-b8eb-377f608a05e3
run_id: c78fa6a8-f411-454f-97e2-6678588922c2
status: COMPLETED
conversation_id: fdd4ac7c-e0e8-4946-a7c5-223a581f0791
pull_request: https://github.com/rajshah4/openwiki-demo-target/pull/2
enabled_after_dispatch: false
```

Original smoke:

```text
automation_id: 9c875420-0b02-4dad-abe7-4dd0da725986
run_id: 5831e582-14a9-41db-8702-7ab4af2baf47
conversation_id: 545ac5d2-c5d3-4660-8fde-81afc9031fec
pull_request: https://github.com/rajshah4/openwiki-demo-target/pull/1
```

Both runs completed and changed only:

```text
AGENTS.md
openwiki/.last-update.json
openwiki/quickstart.md
```
