# OpenHands OpenWiki

OpenHands OpenWiki is a lightweight OpenHands skill and automation recipe for creating durable repository documentation in `openwiki/`.

It is inspired by [LangChain's OpenWiki](https://github.com/langchain-ai/openwiki): give humans and future coding agents a reliable place to start, then keep that documentation fresh as the repo changes. OpenHands is a perfect complement, because OpenHands can handle repo access, LLM profile configuration, tool runtime, scheduling, and GitHub integration. All we need is to use skills with the OpenHands conversation and automation surfaces.

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
benchmarks/                     # Recorded a sample run to show you what it does
demo-target/                    # Tiny local smoke-test repository
plugins/openwiki-docs/          # The OpenHands plugin and skill
```

## Run It With OpenHands

[Agent Canvas](https://github.com/OpenHands/agent-canvas) and Enterprise use the same OpenWiki loop:

1. Load the `openwiki-docs` plugin.
2. Point OpenHands at a target repository.
3. Ask OpenHands to initialize or update the OpenWiki docs.
4. Keep the diff scoped to `openwiki/**`, `AGENTS.md`, and `CLAUDE.md`.

Agent Canvas works great for local conversations and local automations. Enterprise uses the same automation model, with stronger shared integrations, managed credentials, GitHub event delivery, and team visibility.

Use these plugin settings when creating an OpenWiki plugin automation in Agent Canvas or Enterprise:

```text
source: github:rajshah4/openhands-openwiki
repo_path: plugins/openwiki-docs
ref: main
```

## Setup

Let's start with Agent Canvas doing this as a dry run.

1. Open Agent Canvas at `http://127.0.0.1:8000`.
2. Select an LLM profile. OpenWiki does not require a specific profile; choose based on your quality, latency, and cost goals. In my quick testing, a lighter profile was enough to write useful repo docs.
3. Make the target repository available to the local runtime.
4. Load this repo's `openwiki-docs` plugin from `plugins/openwiki-docs`.
5. Start a conversation with a prompt like:

```text
Use the openwiki-docs plugin in this repository and initialize OpenWiki docs.
Focus on architecture, setup, tests, and release process.

Constraints:
- Write documentation under openwiki/.
- Update only top-level AGENTS.md or CLAUDE.md outside openwiki/ if needed.
- Do not edit application source files.
- Verify generated file listing, relative links, and git status before finishing.
```

Once this works, use the automation server in Agent Canvas or Enterprise. Cron automations are the simplest first step because they work locally and can be manually dispatched. Event automations are useful for GitHub workflows, but they need the deployment and integration setup to receive those events. See the [automation docs for more details](https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations).

```text
Create an OpenHands automation for OpenWiki docs maintenance.
Use the plugin preset with source github:rajshah4/openhands-openwiki,
repo_path plugins/openwiki-docs, and ref main.
Run against https://github.com/OWNER/REPO every weekday at 8 AM.
Initialize OpenWiki docs if openwiki/quickstart.md is missing;
otherwise update the existing OpenWiki docs.
Commit only openwiki/** plus top-level AGENTS.md or CLAUDE.md changes,
and open a PR only when docs changed.
```

The automation server also supports events. If your Agent Canvas or Enterprise deployment can receive GitHub events, ask it to generate an automation for a new PR or a labeled PR. For a PR label trigger, ask for a GitHub `pull_request.labeled` event with this filter.

```text
contains(pull_request.labels[].name, 'openwiki-update')
```

The durable behavior lives in [`plugins/openwiki-docs/skills/openwiki-docs/SKILL.md`](plugins/openwiki-docs/skills/openwiki-docs/SKILL.md). The plugin also includes thin command wrappers for OpenHands surfaces that expose plugin commands, but you can use plain language prompts like the examples above.

## Benchmark

To give you a sense of how this works, I ran a quick benchmark against `OpenHands/OpenHands-CLI`, which generated six documentation pages plus metadata in 203 seconds. That run used my local `Minimax` LLM profile (`openhands/minimax-m2.7`), but OpenWiki itself is not tied to that profile.

See [the benchmark report](benchmarks/openhands-cli-local-minimax/README.md) for generated docs, resource usage, and quality notes.
