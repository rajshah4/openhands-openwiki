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
benchmarks/                     # Recorded benchmark runs and generated docs
demo-target/                    # Tiny local smoke-test repository
plugins/openwiki-docs/          # The OpenHands plugin and skill
TESTING_PLAN.md                 # Cross-backend test plan
```

## Run It With OpenHands

The local Agent Canvas and Enterprise automation paths use the same OpenWiki loop:

1. Load the `openwiki-docs` plugin.
2. Point OpenHands at a target repository.
3. Run `/openwiki-docs:init` or `/openwiki-docs:update`.
4. Keep the diff scoped to `openwiki/**`, `AGENTS.md`, and `CLAUDE.md`.

Enterprise has the advantage when you want durable scheduling, GitHub events, repo cloning, JSON event payloads, and PR/comment integrations. Local Agent Canvas is useful for fast dry runs and benchmarking before you schedule the workflow.

Use these plugin settings in Enterprise automations:

```text
source: github:rajshah4/openhands-openwiki
repo_path: plugins/openwiki-docs
ref: main
```

## Local Agent Canvas Dry Run

Use local Agent Canvas when you want a quick interactive dry run before scheduling anything.

1. Open Agent Canvas at `http://127.0.0.1:8000`.
2. Select the `Minimax` profile, which maps to `openhands/minimax-m2.7` in the verified test environment.
3. Make the target repository available to the local runtime. On macOS, `/private/tmp/my-target-repo` is usually easier than a repo under `~/Documents`.
4. Load this repo's `openwiki-docs` plugin from `plugins/openwiki-docs`.
5. Start a conversation with a prompt like:

```text
Use the openwiki-docs plugin in this repository and run /openwiki-docs:init.
Focus on architecture, setup, tests, and release process.

Constraints:
- Write documentation under openwiki/.
- Update only top-level AGENTS.md or CLAUDE.md outside openwiki/ if needed.
- Do not edit application source files.
- Verify generated file listing, relative links, and git status before finishing.
```

## Enterprise Automation

Ask the OpenHands automation skill to create the automation. Start with cron for the first production path because it works well for manual dispatch, private deployments, and one-or-many repo maintenance:

```text
Create an OpenHands Enterprise automation for OpenWiki docs maintenance.
Use the plugin preset with source github:rajshah4/openhands-openwiki,
repo_path plugins/openwiki-docs, and ref main.
Run against https://github.com/OWNER/REPO every weekday at 8 AM.
Run /openwiki-docs:init if openwiki/quickstart.md is missing;
otherwise run /openwiki-docs:update.
Commit only openwiki/** plus top-level AGENTS.md or CLAUDE.md changes,
and open a PR only when docs changed.
```

The automation server also supports events. For a PR label trigger, ask for a GitHub `pull_request.labeled` event with this filter:

```text
contains(pull_request.labels[].name, 'openwiki-update')
```

For a comment trigger, ask for a GitHub `issue_comment.created` event with this filter:

```text
icontains(comment.body, '@openhands openwiki') || icontains(comment.body, '/openwiki')
```

Event automations should read the GitHub event payload, inspect the repo or PR branch from that payload, run the OpenWiki command, and comment with the result. If the Enterprise instance cannot receive GitHub events, use cron plus manual dispatch or polling.

## Plugin Commands

Use these inside an OpenHands conversation with the plugin loaded:

```text
/openwiki-docs:init
/openwiki-docs:update
/openwiki-docs:update API and routing changes
```

The command files are intentionally thin. The durable behavior lives in [`plugins/openwiki-docs/skills/openwiki-docs/SKILL.md`](plugins/openwiki-docs/skills/openwiki-docs/SKILL.md).

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

## Status

This repo is ready for customer-facing experiments on forks and low-risk repositories. The recommended next trials are:

- one local no-op update benchmark
- one OpenHands Enterprise cron automation on a fork
- one GitHub label-triggered update on a fork PR
