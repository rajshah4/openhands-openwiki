---
argument-hint: "[focus]"
description: Update existing durable repository documentation from recent repository changes
---

# Autodocs Update

Refresh durable repository documentation for the current workspace.

Optional focus: **$ARGUMENTS**

## Instructions

1. Use the `autodocs` skill.
2. Run in update mode.
3. Inspect existing `openwiki/` documentation and `openwiki/.last-update.json` when present.
4. Use git evidence to identify changes since the last successful docs run.
5. Use GitNexus `detect-changes`, `context`, or `impact` as optional structured evidence if GitNexus is available and indexed for this repository.
6. Update only documentation that is stale, incomplete, or misleading because of those changes.
7. If no docs changes are needed, leave files untouched and say the docs are current.
8. Refresh the top-level `AGENTS.md` and/or `CLAUDE.md` Autodocs reference section only if missing or stale.
9. Record successful metadata in `openwiki/.last-update.json` only when docs content changed.

## Output

Return a concise summary of changed files, skipped areas, context sources used, and any review notes for the docs PR.
