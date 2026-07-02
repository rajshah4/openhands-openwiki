#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${OPENHANDS_HOST:-}" ]]; then
  echo "OPENHANDS_HOST is required" >&2
  exit 1
fi

if [[ -z "${OPENHANDS_API_KEY:-}" ]]; then
  echo "OPENHANDS_API_KEY is required" >&2
  exit 1
fi

host="${OPENHANDS_HOST%/}"

echo "Checking automation API at ${host}"

curl -fsS "${host}/api/automation/v1?limit=1" \
  -H "Authorization: Bearer ${OPENHANDS_API_KEY}" >/dev/null

echo "automation list endpoint: ok"
echo "replicated automation API preflight passed"
