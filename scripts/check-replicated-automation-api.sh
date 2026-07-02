#!/usr/bin/env bash
set -euo pipefail

dotenv_get() {
  local key="$1"
  local file="${DOTENV_FILE:-}"

  if [[ -z "${file}" || ! -f "${file}" ]]; then
    return 0
  fi

  awk -v key="${key}" '
    {
      line = $0
      sub(/^[[:space:]]*/, "", line)
      prefix = key "="
      if (index(line, prefix) == 1) {
        print substr(line, length(prefix) + 1)
      }
    }
  ' "${file}" | tail -n 1 | sed -E "s/^[\"']//; s/[\"']$//"
}

OPENHANDS_HOST="${OPENHANDS_HOST:-$(dotenv_get OPENHANDS_HOST)}"
OPENHANDS_API_KEY="${OPENHANDS_API_KEY:-$(dotenv_get OPENHANDS_API_KEY)}"
OPENHANDS_API_KEY="${OPENHANDS_API_KEY:-$(dotenv_get OPENHANDS_API_KEY_ORG)}"

if [[ -z "${OPENHANDS_HOST:-}" ]]; then
  echo "OPENHANDS_HOST is required" >&2
  echo "Set it directly or provide DOTENV_FILE with OPENHANDS_HOST." >&2
  exit 1
fi

if [[ -z "${OPENHANDS_API_KEY:-}" ]]; then
  echo "OPENHANDS_API_KEY is required" >&2
  echo "Set OPENHANDS_API_KEY, OPENHANDS_API_KEY_ORG, or provide DOTENV_FILE containing one of them." >&2
  exit 1
fi

host="${OPENHANDS_HOST%/}"

echo "Checking automation API at ${host}"

curl -fsS "${host}/api/automation/v1?limit=1" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" >/dev/null

echo "automation list endpoint: ok"
echo "replicated automation API preflight passed"
