#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  ".claude-plugin/marketplace.json"
  "plugins/openwiki-docs/.claude-plugin/plugin.json"
  "plugins/openwiki-docs/commands/init.md"
  "plugins/openwiki-docs/commands/update.md"
  "plugins/openwiki-docs/skills/openwiki-docs/SKILL.md"
  "automations/cron-update.json"
  "automations/github-label-update.json"
  "automations/github-comment.json"
  "demo-target/README.md"
  "demo-target/src/server.js"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "${ROOT}/${file}" ]]; then
    echo "missing required file: ${file}" >&2
    exit 1
  fi
done

python3 -m json.tool "${ROOT}/.claude-plugin/marketplace.json" >/dev/null
python3 -m json.tool "${ROOT}/plugins/openwiki-docs/.claude-plugin/plugin.json" >/dev/null
python3 -m json.tool "${ROOT}/automations/cron-update.json" >/dev/null
python3 -m json.tool "${ROOT}/automations/github-label-update.json" >/dev/null
python3 -m json.tool "${ROOT}/automations/github-comment.json" >/dev/null

grep -q "## OpenWiki" "${ROOT}/plugins/openwiki-docs/skills/openwiki-docs/SKILL.md"
grep -q "/openwiki-docs:init" "${ROOT}/README.md"
grep -q "/openwiki-docs:update" "${ROOT}/README.md"

echo "prototype structure looks good"
