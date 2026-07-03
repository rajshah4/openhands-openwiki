# Deployment Notes

These notes assume the OpenHands automation service supports the plugin preset endpoint.

## Create From A JSON Payload

Set these values in your shell:

```bash
OPENHANDS_HOST="https://app.all-hands.dev"
OPENHANDS_API_KEY="sk-oh-..."
```

Then create an automation by posting one of the payloads:

```bash
curl -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/plugin" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @automations/cron-update.json
```

For a local or private deployment that cannot receive inbound GitHub webhooks, use `cron-update.json` first. Event triggers require public webhook delivery.

## Rajistics Smoke Deployment

Published repos:

- Plugin/repo: `https://github.com/rajshah4/openhands-openwiki`
- Smoke target: `https://github.com/rajshah4/openwiki-demo-target`

Created replicated automation on July 2, 2026:

```text
host: https://app.replicated.rajistics.com
payload: automations/rajistics-demo-target-smoke.json
automation_id: 9c875420-0b02-4dad-abe7-4dd0da725986
name: OpenWiki Demo Target Smoke
trigger: 0 8 * * * America/Chicago
```

Manual dispatch result:

```text
run_id: 5831e582-14a9-41db-8702-7ab4af2baf47
status: COMPLETED
conversation_id: 545ac5d2-c5d3-4660-8fde-81afc9031fec
pull_request: https://github.com/rajshah4/openwiki-demo-target/pull/1
```

The PR changed only:

```text
AGENTS.md
openwiki/.last-update.json
openwiki/quickstart.md
```

## First Production Candidate

Use a low-risk repository with:

- GitHub App write access
- passing repo clone through OpenHands
- a small or medium codebase
- no live secrets in tracked docs

Start with daily cron. Once the docs quality looks good, add the PR label trigger.

For testing, prefer forks of representative OpenHands repos first:

- `OpenHands/extensions`
- `OpenHands/software-agent-sdk`
- `OpenHands/agent-canvas`

Save `OpenHands/OpenHands` for later scale testing after the smaller forks pass.

## Expected PR Scope

Automation runs should commit only:

```text
openwiki/**
AGENTS.md
CLAUDE.md
```

Anything else should be treated as a bug in the plugin instructions or the automation prompt.

## Preflight Scripts

Local Agent Canvas:

```bash
./scripts/check-agent-canvas-local.sh http://127.0.0.1:8000
```

Replicated automation API:

```bash
export OPENHANDS_HOST="https://..."
export OPENHANDS_API_KEY="sk-oh-..."
./scripts/check-replicated-automation-api.sh
```
