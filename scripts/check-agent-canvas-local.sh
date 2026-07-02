#!/bin/zsh
set -euo pipefail

BASE="${1:-http://127.0.0.1:8000}"
KEY_FILE="${HOME}/.openhands/agent-canvas/session-api-key.txt"

fetch() {
  local url="$1"
  local attempt

  for attempt in 1 2 3 4 5; do
    if /bin/zsh -lc 'curl -fsS "$1"' _ "${url}"; then
      return 0
    fi
    sleep 1
  done

  return 1
}

echo "Checking Agent Canvas at ${BASE}"

if ! server_info="$(fetch "${BASE}/server_info")"; then
  if [[ "${BASE}" == http://localhost:* ]]; then
    fallback_base="${BASE/localhost/127.0.0.1}"
    echo "localhost failed; retrying ${fallback_base}"
    BASE="${fallback_base}"
    server_info="$(fetch "${BASE}/server_info")"
  else
    exit 1
  fi
fi
echo "server_info: ok"
printf "%s\n" "${server_info}" | grep -Eo '"(title|version|sdk_version)"[[:space:]]*:[[:space:]]*"[^"]+"' || true

openapi="$(fetch "${BASE}/openapi.json")"
echo "openapi: ok"

for endpoint in \
  '"/api/conversations"' \
  '"/api/plugins"' \
  '"/api/plugins/install"' \
  '"/api/skills"' \
  '"/api/skills/install"' \
  '"/api/workspaces"'
do
  if ! printf "%s" "${openapi}" | grep -q "${endpoint}"; then
    echo "missing expected endpoint: ${endpoint}" >&2
    exit 1
  fi
done

if [[ -f "${KEY_FILE}" ]]; then
  session_key="$(cat "${KEY_FILE}")"
  if /bin/zsh -lc 'curl -fsS --retry 3 --retry-delay 1 "$1" -H "X-Session-API-Key: $2"' \
    _ "${BASE}/api/plugins/installed" "${session_key}" >/dev/null &&
    /bin/zsh -lc 'curl -fsS --retry 3 --retry-delay 1 "$1" -H "X-Session-API-Key: $2"' \
      _ "${BASE}/api/skills/installed" "${session_key}" >/dev/null; then
    echo "authenticated plugin/skill probes: ok"
  else
    echo "authenticated plugin/skill probes: skipped or unauthorized"
    echo "server_info and openapi preflight still passed"
  fi
else
  echo "session key not found at ${KEY_FILE}; skipped authenticated probes"
fi

echo "local Agent Canvas preflight passed"
