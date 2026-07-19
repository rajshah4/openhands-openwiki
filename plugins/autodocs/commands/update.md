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
3. Inspect existing `openwiki/` documentation, `openwiki/.last-update.json`, `openwiki/log.md`, and relevant `index.md` files when present.
4. Use git evidence to identify changes since the last successful docs run.
5. Use GitNexus `detect-changes`, `context`, or `impact` as optional structured evidence if GitNexus is available and indexed for this repository.
6. Update only documentation that is stale, incomplete, or misleading because of those changes.
7. Add or correct OKF front matter for any concept page you edit.
8. Refresh affected `index.md` files and append `openwiki/log.md` only when docs content changed.
9. If no docs changes are needed, leave files untouched and say the docs are current.
10. Refresh the top-level `AGENTS.md` and/or `CLAUDE.md` Autodocs reference section only if missing or stale.
11. Record successful metadata in `openwiki/.last-update.json` only when docs content changed.

## Output

Return a concise summary of changed files, skipped areas, context sources used, and any review notes for the docs PR.
