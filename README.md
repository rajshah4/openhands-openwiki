# OpenHands Autodocs

OpenHands Autodocs is an OpenHands plugin and skill workflow for creating and maintaining durable repository documentation.

It is inspired by [LangChain's OpenWiki](https://github.com/langchain-ai/openwiki): give humans and future coding agents a reliable place to start, then keep that documentation fresh as the repo changes. Autodocs keeps that default OpenWiki-style output, including [OpenWiki 0.2's OKF-compatible structure](https://www.langchain.com/blog/openwiki-0-2-adds-okf-support), but is designed to be flexible enough to use other documentation formats and structured context sources, including [GitNexus](https://github.com/abhigyanpatwari/GitNexus).

OpenHands is a natural runtime for this workflow because it already handles repository access, LLM profile configuration, tool runtime, scheduling, GitHub integration, and PR creation.

## What It Does

Autodocs runs inside an OpenHands conversation or automation and:

1. Reads repository structure, existing docs, tests, config, selected git history, and current diffs.
2. Creates or updates default OpenWiki-style, OKF-compatible docs under `openwiki/`, starting at `openwiki/quickstart.md`.
3. Adds or refreshes a top-level `AGENTS.md` or `CLAUDE.md` reference to the generated docs.
4. Tracks successful updates in `openwiki/log.md` and `openwiki/.last-update.json`.
5. Keeps diffs scoped to documentation and agent guidance files.
6. Optionally uses GitNexus graph context when the repository has a GitNexus index.

The output is meant to help a new engineer or future coding agent answer:

- What does this project do?
- Where are the important workflows?
- How do I verify common changes?
- What should I read before editing?
- Which areas are structurally risky to change?

## Modes

Autodocs supports three practical modes:

- **Standard Autodocs**: OpenHands inspects source files, existing docs, tests, config, scripts, and git history.
- **GitNexus-enriched Autodocs**: If GitNexus is available and the repository is indexed, OpenHands can use graph-backed module maps, symbol context, impact analysis, traces, and change detection as additional evidence.
- **Planning mode**: OpenHands inspects the repo and returns a proposed documentation plan without writing docs.

GitNexus is optional. Autodocs should still produce useful documentation when GitNexus is not installed or the target repository has not been indexed.

## OpenWiki And OKF Compatibility

Autodocs stays lightweight, but its default OpenWiki-style output follows [Google Open Knowledge Format (OKF) v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) conventions where they help agents navigate and maintain docs:

- Every non-reserved Markdown concept page under `openwiki/` should include YAML front matter with a non-empty `type`.
- Recommended front matter fields are `title`, `description`, `resource`, `tags`, and `timestamp`.
- `description` should be one to two useful sentences because future retrieval tools can use it for targeted search.
- `index.md` files summarize sibling docs and directories. The root `openwiki/index.md` can declare `okf_version: "0.1"`.
- `openwiki/log.md` records documentation changes over time, while `openwiki/.last-update.json` remains the machine-readable update marker.
- Standard Markdown links between docs should explain real relationships, such as runtime flow, dependency, ownership, configuration, data flow, or verification paths.

Some descriptions of OKF use `logs.md`; the current OpenWiki 0.2 implementation reserves `log.md` singular, so Autodocs follows `log.md` for compatibility.

## Repository Layout

```text
benchmarks/                 # Recorded runs, context studies, and quality notes
plugins/autodocs/           # The OpenHands plugin, commands, and skill
```

## Run It With OpenHands

Autodocs can run from [Agent Canvas](https://github.com/OpenHands/agent-canvas), remote Agent Canvas, OpenHands Cloud, and OpenHands Enterprise. The loop is the same:

1. Load the `autodocs` plugin.
2. Point OpenHands at a target repository.
3. Ask OpenHands to plan, initialize, or update docs.
4. Keep the diff scoped to `openwiki/**`, top-level `AGENTS.md`, and top-level `CLAUDE.md`.

Use these plugin settings when creating an Autodocs plugin automation in any OpenHands surface:

```text
source: github:rajshah4/openhands-autodocs
repo_path: plugins/autodocs
ref: main
```

## Setup

Start with Agent Canvas doing this as a dry run.

1. Open Agent Canvas, for example locally at `http://127.0.0.1:8000`.
2. Select an LLM profile. Autodocs does not require a specific profile; choose based on your quality, latency, and cost goals.
3. Make the target repository available to the OpenHands runtime.
4. Load this repo's `autodocs` plugin from `plugins/autodocs`.
5. Start with a planning prompt:

```text
Use the autodocs plugin in this repository and plan durable repository docs.
Focus on architecture, setup, tests, and release process.

Constraints:
- Do not edit files yet.
- Identify the smallest useful documentation set.
- Note whether GitNexus appears available and useful.
- Return the evidence you would inspect before writing docs.
```

Then initialize docs:

```text
Use the autodocs plugin in this repository and initialize docs.
Focus on architecture, setup, tests, and release process.

Constraints:
- Write default OpenWiki-style, OKF-compatible documentation under openwiki/.
- Update only top-level AGENTS.md or CLAUDE.md outside openwiki/ if needed.
- Do not edit application source files.
- If GitNexus is available and indexed for this repo, use it as optional evidence.
- Verify generated file listing, relative links, and git status before finishing.
```

## Optional GitNexus Enrichment

Autodocs can work without [GitNexus](https://github.com/abhigyanpatwari/GitNexus). When GitNexus is installed and the repository has been indexed, it can improve the documentation workflow by giving OpenHands structured context:

- `query` to find the best starting points for a concept or workflow.
- `context` to explain a symbol's callers, callees, interface relationships, and process membership.
- `impact` to identify risky symbols and blast radius before documenting or changing a workflow.
- `trace` to explain execution paths between important symbols.
- `detect-changes` to map current diffs to indexed symbols and affected flows during update mode.

A typical setup is:

```bash
npx -y gitnexus@latest analyze /path/to/repo --name my-repo
```

Then connect GitNexus as an MCP server in OpenHands:

```text
Name: gitnexus
Type: stdio
Command: npx
Arguments:
-y
gitnexus@latest
mcp
```

Autodocs should treat GitNexus output as evidence, not as the only source of truth. Source files, existing docs, tests, config, and git history still matter.

GitNexus MCP enrichment requires OpenHands Agent Server `1.31.0` or newer. Older `1.29.x` Agent Server / SDK builds can fail while loading MCP tools whose schemas include a valid argument named `kind`. If you are running Agent Canvas locally before its default Agent Server pin has been updated, start it with:

```bash
OH_AGENT_SERVER_VERSION=1.31.0 npm run dev
```

## Extend With More Context

Autodocs is meant to be extended with the context sources your team already
uses. OpenHands can inspect local files and git history by default, and it can
also use tools, plugins, MCP servers, and custom integrations to bring in more
evidence before writing docs.

Good extension sources include:

- [GitNexus](https://github.com/abhigyanpatwari/GitNexus) or other code intelligence tools
- OpenAPI specs, GraphQL schemas, protobuf files, and SDK docs
- database schemas, migrations, and data dictionaries
- ADRs, runbooks, incident notes, and architecture docs
- issue trackers, project specs, release notes, and customer-facing docs
- CI results, test reports, coverage reports, and eval outputs
- observability exports such as service maps or dependency inventories

The important rule is the same for every integration: treat external context as
evidence, summarize what matters, and keep the generated docs grounded in
verifiable repository or tool output.

## Automation

Once the manual flow works, use the automation server in Agent Canvas, remote Agent Canvas, OpenHands Cloud, or OpenHands Enterprise. Cron automations are the simplest first step because they can be manually dispatched and work well for validation. See the [automation docs](https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations) for more details.

```text
Create an OpenHands automation for Autodocs maintenance.
Use the plugin preset with source github:rajshah4/openhands-autodocs,
repo_path plugins/autodocs, and ref main.
Run against https://github.com/OWNER/REPO every weekday at 8 AM.
Initialize docs if openwiki/quickstart.md is missing;
otherwise update the existing docs.
Keep the docs OKF-compatible with front matter, index.md files, and openwiki/log.md.
If GitNexus is available and indexed, use it for module, symbol, impact, and change context.
Commit only openwiki/** plus top-level AGENTS.md or CLAUDE.md changes,
and open a PR only when docs changed.
```

The automation server also supports events. For example, when your OpenHands surface can receive GitHub events, use the automation server to trigger on a new PR or a labeled PR.

The durable behavior lives in [`plugins/autodocs/skills/autodocs/SKILL.md`](plugins/autodocs/skills/autodocs/SKILL.md). The plugin also includes thin command wrappers for OpenHands surfaces that expose plugin commands, but plain language prompts work too.

## Benchmarks

To give you a sense of the baseline workflow, I ran a quick benchmark against `OpenHands/OpenHands-CLI`, which generated six OpenWiki-style documentation pages plus metadata in 203 seconds. That run used my local `Minimax` LLM profile (`openhands/minimax-m2.7`), but Autodocs itself is not tied to that profile.

See the [benchmarks index](benchmarks/README.md) for all reports.

The [OpenHands CLI benchmark](benchmarks/openhands-cli-local-minimax/README.md) includes generated docs, resource usage, and quality notes.

For a larger structured-context example, see the [VS Code GitNexus benchmark](benchmarks/vscode-gitnexus/README.md). It records how GitNexus helped identify `CommandService.executeCommand`, summarize symbol context, and measure the blast radius of `localize` in a large TypeScript/Electron codebase.
