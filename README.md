# OpenWiki for OpenHands Prototype

This is a quick prototype of the OpenWiki idea rebuilt as an OpenHands-native plugin plus automation recipes.

OpenWiki's product loop is:

1. Initialize durable repo docs in `openwiki/`.
2. Teach future agents to start from `openwiki/quickstart.md`.
3. Periodically inspect git changes and update only stale docs.
4. Open a docs PR when the wiki changed.

In OpenHands, model configuration, sandbox tools, repo cloning, GitHub integration, and automation triggers already exist. That means the portable piece is the docs contract, not the original CLI implementation.

## What Is Included

```text
.
├── .claude-plugin/
│   └── marketplace.json
├── automations/
│   ├── cron-update.json
│   ├── fork-smoke-template.json
│   ├── github-comment.json
│   └── github-label-update.json
├── demo-target/
│   ├── README.md
│   └── src/
│       └── server.js
├── plugins/
│   └── openwiki-docs/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── commands/
│       │   ├── init.md
│       │   └── update.md
│       └── skills/
│           └── openwiki-docs/
│               └── SKILL.md
└── scripts/
    ├── check-agent-canvas-local.sh
    ├── check-replicated-automation-api.sh
    └── validate.sh
```

## Plugin Commands

Use these inside an OpenHands conversation that has the plugin loaded:

```text
/openwiki-docs:init
/openwiki-docs:update
/openwiki-docs:update API and routing changes
```

The command files are intentionally thin. The long-lived behavior lives in `plugins/openwiki-docs/skills/openwiki-docs/SKILL.md`.

## Automation Options

Use the plugin preset for work that should run as an agent:

- `automations/cron-update.json`: daily documentation maintenance.
- `automations/fork-smoke-template.json`: first manual smoke against a fork.
- `automations/github-label-update.json`: run when a PR gets the `openwiki-update` label.
- `automations/github-comment.json`: run when someone comments with `@openhands openwiki`.

Before deploying, replace placeholders:

- `OPENHANDS_HOST`
- `OPENHANDS_API_KEY`
- `ORG/REPO`
- plugin source/ref

The examples are intentionally payload-shaped JSON files so they can be pasted into the OpenHands automation API request body.

## Dual-Backend Testing

This prototype is intended to run from both:

- local Agent Canvas / Agent Server at `http://localhost:8000`
- a replicated OpenHands automation service

Start here:

```bash
./scripts/check-agent-canvas-local.sh http://127.0.0.1:8000
```

For the replicated instance:

```bash
export OPENHANDS_HOST="https://..."
export OPENHANDS_API_KEY="sk-oh-..."
./scripts/check-replicated-automation-api.sh
```

The full plan is in `TESTING_PLAN.md`. The recommended first real trials are forks of `OpenHands/extensions`, `OpenHands/software-agent-sdk`, and `OpenHands/agent-canvas`.

## Suggested First Test

1. Open a fresh OpenHands conversation with this plugin loaded.
2. Use `demo-target/` as the repository.
3. Run:

```text
/openwiki-docs:init
```

Expected result:

- `demo-target/openwiki/quickstart.md` is created.
- `demo-target/AGENTS.md` is created or updated with the OpenWiki reference.
- `demo-target/openwiki/.last-update.json` is written.

Then make a small change to `demo-target/src/server.js` and run:

```text
/openwiki-docs:update routing behavior
```

Expected result:

- Only affected docs change.
- If the docs are still accurate, no files change.

## Why This Shape

This prototype treats OpenWiki as an agent skill and OpenHands automations as the scheduling and PR loop. That gives us:

- reusable behavior across repos
- repo-local docs as code
- GitHub-triggered or scheduled updates
- human-reviewable docs PRs
- no custom credential setup inside the plugin

The next step after this prototype is to copy `plugins/openwiki-docs/` into an OpenHands plugin marketplace repo and deploy one automation against a real low-risk repository.
