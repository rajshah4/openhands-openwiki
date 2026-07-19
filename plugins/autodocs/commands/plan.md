---
argument-hint: "[focus]"
description: Plan durable repository documentation without editing files
---

# Autodocs Plan

Plan durable repository documentation for the current workspace without writing files.

Optional focus: **$ARGUMENTS**

## Instructions

1. Use the `autodocs` skill.
2. Run in plan mode.
3. Inspect the repository enough to identify likely documentation areas, existing docs, tests, config, workflows, and operational surfaces.
4. Check whether GitNexus appears available and useful for this repository. Do not require GitNexus.
5. Do not create, edit, move, or delete files.
6. Return a recommended documentation plan and the evidence that should be inspected before writing docs.
7. Include OKF readiness: expected concept pages, needed `index.md` files, whether `openwiki/log.md` exists or should be created, and any legacy pages that would need front matter during init or update.

## Output

Return:

- recommended documentation format
- proposed docs pages
- context sources to use
- GitNexus availability and likely value
- OKF readiness
- risks or unknowns
- suggested next prompt or command
