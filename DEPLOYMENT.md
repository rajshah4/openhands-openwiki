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
