# OpenHands OpenWiki

OpenHands OpenWiki is a lightweight OpenHands skill and automation recipe for creating durable repository documentation in `openwiki/`.

It is inspired by the OpenWiki idea: give humans and future coding agents a reliable place to start, then keep that documentation fresh as the repo changes. In OpenHands, the scheduling, repo cloning, model configuration, tool runtime, and GitHub integration already exist, so this repo focuses on the portable docs contract and the prompts that make it useful.

## What It Does

OpenWiki runs inside an OpenHands conversation or automation and:

1. Reads repository structure, existing docs, tests, config, and selected git history.
2. Creates or updates `openwiki/quickstart.md` plus a small set of supporting pages.
3. Adds a top-level `AGENTS.md` or `CLAUDE.md` reference to the OpenWiki quickstart.
4. Tracks successful updates in `openwiki/.last-update.json`.
5. Keeps diffs scoped to documentation and agent guidance files.

The output is meant to help a new engineer or future agent answer:

- What does this project do?
- Where are the important workflows?
- How do I verify common changes?
- What should I read before editing?

## Repository Layout

```text
automations/                    # OpenHands Enterprise plugin-preset payloads
benchmarks/                     # Recorded benchmark runs and generated docs
demo-target/                    # Tiny local smoke-test repository
docs/                           # Local and Enterprise usage guides
plugins/openwiki-docs/          # The OpenHands plugin and skill
scripts/                        # Preflight, local launcher, and validation helpers
TESTING_PLAN.md                 # Cross-backend test plan
```

## Quick Start: Local Agent Canvas

Verify local Agent Canvas:

```bash
./scripts/check-agent-canvas-local.sh http://127.0.0.1:8000
```

Run OpenWiki against a local clone using the verified `Minimax` profile:

```bash
OPENWIKI_WORKSPACE=/private/tmp/my-target-repo \
OPENWIKI_PROFILE=Minimax \
OPENWIKI_MODE=init \
OPENWIKI_FOCUS="architecture, setup, tests, and release process" \
OPENWIKI_MAX_ITERATIONS=140 \
node scripts/run-agent-canvas-openwiki.mjs
```

See [Local Agent Canvas Usage](docs/local-agent-canvas.md) for the full workflow and sample prompts.

## Quick Start: OpenHands Enterprise Automations

Verify the automation API:

```bash
OPENHANDS_HOST="https://app.replicated.rajistics.com" \
DOTENV_FILE="/path/to/.env" \
./scripts/check-replicated-automation-api.sh
```

Create a plugin-preset automation:

```bash
curl -X POST "${OPENHANDS_HOST}/api/automation/v1/preset/plugin" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @automations/cron-update.json
```

See [OpenHands Enterprise Automations](docs/openhands-enterprise-automations.md) for cron, manual dispatch, GitHub label, and GitHub comment examples.

## Plugin Commands

Use these inside an OpenHands conversation with the plugin loaded:

```text
/openwiki-docs:init
/openwiki-docs:update
/openwiki-docs:update API and routing changes
```

The command files are intentionally thin. The durable behavior lives in [`plugins/openwiki-docs/skills/openwiki-docs/SKILL.md`](plugins/openwiki-docs/skills/openwiki-docs/SKILL.md).

## Automation Payloads

- [`automations/cron-update.json`](automations/cron-update.json): daily documentation maintenance.
- [`automations/fork-smoke-template.json`](automations/fork-smoke-template.json): first manual smoke against a fork.
- [`automations/github-label-update.json`](automations/github-label-update.json): run when a PR gets the `openwiki-update` label.
- [`automations/github-comment.json`](automations/github-comment.json): run when someone comments with `@openhands openwiki`.
- [`automations/rajistics-demo-target-smoke.json`](automations/rajistics-demo-target-smoke.json): recorded smoke automation for `rajshah4/openwiki-demo-target`.

Before deploying, replace placeholder repos and review the plugin source/ref.

## Safety Contract

OpenWiki runs should edit only:

```text
openwiki/**
AGENTS.md
CLAUDE.md
```

They should not read `.env`, private keys, tokens, or other secret-bearing files. They should not edit application source. If docs are current, update mode should leave the worktree clean.

## Benchmark

A local Agent Canvas benchmark against `OpenHands/OpenHands-CLI` generated six documentation pages plus metadata in 203 seconds using the `Minimax` profile.

See [the benchmark report](benchmarks/openhands-cli-local-minimax/README.md) for generated docs, resource usage, and quality notes.

The headline finding: the docs were useful and scoped correctly, but init mode used 1.54M prompt tokens on a 388-file repository. That is the next optimization target before broad customer rollout.

## Validate This Repo

```bash
./scripts/validate.sh
node --check scripts/run-agent-canvas-openwiki.mjs
```

## Status

This repo is ready for customer-facing experiments on forks and low-risk repositories. The recommended next trials are:

- one local no-op update benchmark
- one OpenHands Enterprise cron automation on a fork
- one GitHub label-triggered update on a fork PR
