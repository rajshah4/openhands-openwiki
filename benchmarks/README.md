# Benchmarks

This directory records representative Autodocs runs and context studies.

## Available Reports

- [OpenHands CLI local Minimax run](openhands-cli-local-minimax/README.md) records a baseline Autodocs generation run that produced OpenWiki-style docs for `OpenHands/OpenHands-CLI`.
- [VS Code GitNexus context run](vscode-gitnexus/README.md) records how GitNexus context helped identify starting points, symbol relationships, and blast radius in `microsoft/vscode`.

The first report shows Autodocs generating durable documentation. The second
shows how a structured context provider can improve Autodocs on a large
codebase.

## Adding A Benchmark

Prefer benchmarks that answer one concrete question:

- How good were the generated docs?
- How much time or model usage did the run require?
- Did a context source help the agent find better starting points?
- Did update mode avoid unnecessary edits?

Include enough detail for another user to reproduce the run: target repo,
commit or ref, OpenHands surface, model/profile, context sources, commands or
prompts, and the result summary.
