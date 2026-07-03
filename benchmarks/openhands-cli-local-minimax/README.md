# Benchmark: OpenHands CLI on Local Agent Canvas + Minimax

This benchmark initializes OpenWiki documentation for the public
[`OpenHands/OpenHands-CLI`](https://github.com/OpenHands/OpenHands-CLI) repository using the local
Agent Canvas API and the `Minimax` profile.

## Target

| Field | Value |
| --- | --- |
| Repository | `OpenHands/OpenHands-CLI` |
| Commit | `2df8a2835d3f1bd2f2eadf5a7a2e1ad0dfb0d271` |
| Baseline size | 388 files, 10 MB clone |
| Backend | Local Agent Canvas at `http://127.0.0.1:8000` |
| Profile/model | `Minimax` / `openhands/minimax-m2.7` |
| Conversation | `ece45900-c862-4a44-b85e-c48ecb1a021c` |

## Prompt Focus

```text
OpenHands CLI architecture, package entrypoints, setup/install flow,
TUI and GUI launch behavior, tests, build/release process, and
future-agent change guidance
```

## Results

| Metric | Value |
| --- | ---: |
| Status | finished |
| Duration | 203 seconds |
| Iterations | 28 |
| Prompt tokens | 1,536,752 |
| Completion tokens | 11,980 |
| Cache read tokens | 1,452,281 |
| Reasoning tokens | 1,005 |
| Generated Markdown pages | 6 |
| Generated Markdown lines | 820 |

Generated docs:

- `openwiki/quickstart.md`
- `openwiki/architecture.md`
- `openwiki/commands.md`
- `openwiki/setup.md`
- `openwiki/testing.md`
- `openwiki/build-release.md`
- `openwiki/.last-update.json`
- top-level `AGENTS.md` OpenWiki reference section

Saved artifacts:

- `metrics.json` has the API stats and final response.
- `generated/openwiki/` contains the generated wiki only.
- `generated/AGENTS.md` contains the updated top-level agent guidance.

The full target repository snapshot used for local link checking is intentionally not kept in this repo. The generated docs include repo-relative links that resolve when applied to `OpenHands/OpenHands-CLI`.

## Verification

Passed:

- Local Agent Canvas conversation finished successfully.
- Relative Markdown links resolved in the full benchmark workspace before the generated docs were copied here.
- `openwiki/.last-update.json` used the runtime clock: `2026-07-03T00:42:12.000Z`.
- Changed file scope was limited to top-level `AGENTS.md` and `openwiki/**`.
- Final response listed evidence inspected and was PR-friendly.

Not run:

- The target repository's unit test suite was not run. This benchmark validates OpenWiki documentation generation, link integrity, metadata, and edit scope rather than application behavior.

## Quality Notes

The generated docs are useful as first-pass onboarding material. The strongest pages are:

- `quickstart.md`, which gives a compact repository map and future-agent change guidance.
- `commands.md`, which clearly explains CLI modes and entrypoint dispatch.
- `testing.md`, which captures unit, snapshot, binary, and CI testing expectations.

The run stayed within the intended page budget and did not edit application source.

The main concern is resource use: 1.54M prompt tokens for a 388-file, 10 MB repository. Heavy cache reads soften the cost, but this is still enough to justify optimization before broad customer use. Good next improvements:

- Add a deterministic repository inventory phase before the model reads files.
- Encourage a smaller fixed page set for medium repos unless the agent can justify more.
- Capture source evidence in a structured scratch note so later turns do not repeatedly rediscover the same files.
- Benchmark update/no-op runs separately; those should be far cheaper than init.
