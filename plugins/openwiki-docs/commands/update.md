---
argument-hint: [focus]
description: Update existing OpenWiki-style documentation from recent repository changes
---

# OpenWiki Docs Update

Refresh durable repository documentation for the current workspace.

Optional focus: **$ARGUMENTS**

## Instructions

1. Use the `openwiki-docs` skill.
2. Run in update mode.
3. Inspect existing `openwiki/` documentation and `openwiki/.last-update.json` when present.
4. Use git evidence to identify changes since the last successful docs run.
5. Update only documentation that is stale, incomplete, or misleading because of those changes.
6. If no docs changes are needed, leave files untouched and say the wiki is current.
7. Refresh the top-level `AGENTS.md` and/or `CLAUDE.md` OpenWiki reference section only if missing or stale.
8. Record successful metadata in `openwiki/.last-update.json` only when OpenWiki content changed.

## Output

Return a concise summary of changed files, skipped areas, and any review notes for the docs PR.
