---
argument-hint: "[focus]"
description: Initialize durable repository documentation for the current repository
---

# Autodocs Init

Initialize durable repository documentation for the current workspace.

Optional focus: **$ARGUMENTS**

## Instructions

1. Use the `autodocs` skill.
2. Run in init mode.
3. Inspect the repository enough to identify major architecture, workflows, domains, integrations, operations, and test surfaces.
4. Use GitNexus as optional structured evidence if it is available and indexed for this repository.
5. Write default OpenWiki-style documentation under `openwiki/`, with `openwiki/quickstart.md` as the required entrypoint.
6. Add or update only the top-level `AGENTS.md` and/or `CLAUDE.md` Autodocs reference section.
7. Record successful metadata in `openwiki/.last-update.json`.

## Output

Return a concise summary of created files, context sources used, key caveats, and recommended next verification.
