#!/usr/bin/env bash
set -euo pipefail

RUNTIME_VERSION="${RUNTIME_VERSION:-1.0.0}"
CONTAINER_ENGINE="${CONTAINER_ENGINE:-docker}"
RESHAPR_IMAGE="${RESHAPR_IMAGE:-registry.reshapr.io/reshapr/reshapr-proxy:${RUNTIME_VERSION}}"
CONTAINER_NAME="${CONTAINER_NAME:-reshapr-docs-hybrid-replay}"
PROXY_PORT="${PROXY_PORT:-17778}"
APPLY="${APPLY:-false}"

require() {
  command -v "$1" >/dev/null || { printf 'Required command not found: %s\n' "$1" >&2; exit 1; }
}

require "$CONTAINER_ENGINE"
require curl
require jq

"$CONTAINER_ENGINE" manifest inspect "$RESHAPR_IMAGE" >/dev/null
printf 'Verified hybrid proxy image: %s\n' "$RESHAPR_IMAGE"

if [[ "$APPLY" != true ]]; then
  printf 'Image check passed. Set APPLY=true and the required environment variables for a live replay.\n'
  exit 0
fi

for variable in RESHAPR_CTRL_HOST RESHAPR_CTRL_PORT RESHAPR_CTRL_TOKEN EXPOSITION_ID; do
  [[ -n "${!variable:-}" ]] || { printf '%s is required when APPLY=true\n' "$variable" >&2; exit 1; }
done

if "$CONTAINER_ENGINE" container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  printf 'Refusing to replace existing container: %s\n' "$CONTAINER_NAME" >&2
  exit 1
fi

cleanup() {
  "$CONTAINER_ENGINE" rm --force "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

"$CONTAINER_ENGINE" run --detach \
  --name "$CONTAINER_NAME" \
  --publish "${PROXY_PORT}:7777" \
  --env "RESHAPR_CTRL_HOST=$RESHAPR_CTRL_HOST" \
  --env "RESHAPR_CTRL_PORT=$RESHAPR_CTRL_PORT" \
  --env "RESHAPR_CTRL_TLS_PLAINTEXT=${RESHAPR_CTRL_TLS_PLAINTEXT:-false}" \
  --env "RESHAPR_CTRL_TOKEN=$RESHAPR_CTRL_TOKEN" \
  --env "RESHAPR_GATEWAY_ID=${RESHAPR_GATEWAY_ID:-docs-hybrid-replay}" \
  --env "RESHAPR_GATEWAY_FQDNS=localhost:${PROXY_PORT}" \
  --env "RESHAPR_GATEWAY_LABELS=${RESHAPR_GATEWAY_LABELS:-environment=docs-replay}" \
  "$RESHAPR_IMAGE" >/dev/null

for _ in {1..60}; do
  if curl --fail --silent "http://localhost:${PROXY_PORT}/q/health/ready" \
    | jq -e '.status == "UP"' >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

curl --fail --silent "http://localhost:${PROXY_PORT}/q/health/ready" \
  | jq -e '.status == "UP"' >/dev/null

mcp_url="http://localhost:${PROXY_PORT}/mcp/${EXPOSITION_ID}"
discovery="$(curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{}}' \
  "$mcp_url")"
jq -e '.result.supportedVersions | index("2026-07-28") != null' <<<"$discovery" >/dev/null

curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: tools/list' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  "$mcp_url" | jq -e '.result.tools | type == "array"' >/dev/null

printf 'Hybrid gateway replay passed with %s\n' "$RESHAPR_IMAGE"
