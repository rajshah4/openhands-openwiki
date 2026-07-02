---
argument-hint: [focus]
description: Initialize OpenWiki-style documentation for the current repository
---

# OpenWiki Docs Init

Initialize durable repository documentation for the current workspace.

Optional focus: **$ARGUMENTS**

## Instructions

1. Use the `openwiki-docs` skill.
2. Run in init mode.
3. Inspect the repository enough to identify major architecture, workflows, domains, integrations, operations, and test surfaces.
4. Write the initial documentation under `openwiki/`, with `openwiki/quickstart.md` as the required entrypoint.
5. Add or update only the top-level `AGENTS.md` and/or `CLAUDE.md` OpenWiki reference section.
6. Record successful metadata in `openwiki/.last-update.json`.

## Output

Return a concise summary of created files, key caveats, and recommended next verification.
