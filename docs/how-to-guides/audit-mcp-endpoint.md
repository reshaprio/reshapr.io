---
description: Enable audit for an MCP endpoint and verify successful-call and authentication-failure records.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Audit MCP Endpoint Calls

Use this guide to enable audit on one Configuration Plan and verify the records produced by successful and rejected MCP requests. Audit is an endpoint policy: enabling Gateway telemetry alone does not cause every Exposition to emit audit events.

Audit events are [OpenTelemetry](https://opentelemetry.io/) log records marked with `log.type=audit`. The Gateway exports them through its OpenTelemetry Logs pipeline; storage, routing, retention, and access control belong to the configured Collector and telemetry backends.

## Prerequisites

You need:

- a reShapr Gateway and CLI at version `0.2.3`;
- Gateway OpenTelemetry logs configured with **[Observe the reShapr Gateway](./operations/observe-and-audit.md)**;
- a telemetry or audit backend where you can search exported records;
- `reshapr login` completed for the target organization;
- an imported Service, its backend endpoint, and a Gateway Group ID;
- `curl` and `jq`.

Set the resource inputs:

```bash
export SERVICE_ID='<service-id>'
export BACKEND_ENDPOINT='https://api.example.com'
export GATEWAY_GROUP_ID='<gateway-group-id>'
```

## Create an audited Configuration Plan

Create an API-key-protected Plan with audit enabled. Keep the structured response only long enough to extract its ID and generated key:

```bash
CONFIG_JSON="$(
  reshapr config create 'audited-endpoint-check' \
    --serviceId "${SERVICE_ID}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --apiKey \
    --audit \
    --output json
)"

export RESHAPR_CONFIG_ID="$(jq -er '.id' <<<"${CONFIG_JSON}")"
export RESHAPR_API_KEY="$(jq -er '.apiKey' <<<"${CONFIG_JSON}")"
unset CONFIG_JSON
```

The `--audit` option applies to every Exposition created from this Configuration Plan. It does not enable audit globally for other Plans.

Create a named Exposition and capture its ID:

```bash
export EXPOSITION_ID="$(
  reshapr expo create \
    --configuration "${RESHAPR_CONFIG_ID}" \
    --gateway-group "${GATEWAY_GROUP_ID}" \
    --name audited-endpoint-check \
    --output json \
  | jq -er '.id'
)"

reshapr expo get "${EXPOSITION_ID}"
export MCP_URL='https://<gateway-host>/mcp/<organization>/audited-endpoint-check'
```

Wait until the Exposition lists the expected Gateway endpoint before sending requests.

## Generate audit events

Send a successful discovery request with the generated key:

```bash
export MCP_DISCOVERY_REQUEST='{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-audit-check","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}'

curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "x-reshapr-key: ${RESHAPR_API_KEY}" \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}" | jq '.result.supportedVersions'
```

Send the same request with an invalid key:

```bash
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header 'x-reshapr-key: deliberately-invalid' \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}"
```

The first request must return a JSON-RPC result and the second must return HTTP `401`.

## Inspect MCP call events

Allow for Collector batching and export delay, then search the configured audit sink for `log.type=audit` and `event.action=server/discover`.

An MCP call event can contain:

| Attribute | Meaning |
|---|---|
| `log.type` | Always `audit` for an audit record |
| `event.action` | MCP method, such as `server/discover` or `tools/call` |
| `event.outcome` | `success` or `failure` |
| `event.duration` | Gateway call duration in milliseconds |
| `service.name`, `service.version` | Service exposed through the Plan |
| `organization.id` | Owning organization |
| `mcp.request.id` | JSON-RPC request ID, when present |
| `mcp.session.id` | MCP session ID for session-based protocols, when present |
| `mcp.target.name` | Tool or Resource name, when applicable |
| `mcp.error.code` | JSON-RPC error code for a failed call, when present |
| `mcp.response.size` | Response size in bytes |
| `source.ip` | Caller address, when available |
| `user.id` | Authenticated JWT subject, when available |
| `trace.id` | Active trace ID, when available |

The successful discovery request must have at least `event.outcome=success`, the Service and organization attributes, `mcp.request.id`, and `event.duration`.

Call one known read-only Tool from the same Exposition to produce `event.action=tools/call`. Use `mcp.target.name`, `service.name`, and `trace.id` when present to correlate its audit record with Gateway and backend spans.

## Inspect authentication-failure events

Search for `log.type=audit`, `event.action=authentication`, and the affected Service. Authentication-failure records can contain:

| Attribute | Meaning |
|---|---|
| `event.outcome` | Always `failure` |
| `event.reason` | Rejection reason, such as `invalid_api_key`, `missing_bearer_token`, `invalid_token`, or `missing_scope` |
| `http.response.status_code` | HTTP rejection status |
| `service.id`, `service.name`, `service.version` | Affected Service |
| `organization.id` | Owning organization |
| `source.ip` | Caller address, when available |
| `trace.id` | Active trace ID, when available |

The rejected request in this guide must have `event.reason=invalid_api_key` and `http.response.status_code=401`.

Application logs explain runtime behavior, traces connect work across boundaries, and audit records answer which MCP action was attempted and with what outcome. Do not treat audit as a substitute for application diagnostics or distributed tracing.

## Clean up

Delete the temporary Exposition before its Configuration Plan:

```bash
reshapr expo delete "${EXPOSITION_ID}"
reshapr config delete "${RESHAPR_CONFIG_ID}"
unset RESHAPR_API_KEY MCP_DISCOVERY_REQUEST
```

## Result

The Configuration Plan enables audit for its Expositions, and the audit sink contains distinct successful-call and authentication-failure records marked with `log.type=audit`.

## Limits

- Audit must be enabled independently on every Configuration Plan that requires it.
- Audit records are emitted only when OpenTelemetry Logs are available and export succeeds.
- Optional identity, source, session, target, error, and trace attributes depend on the request and authentication mode.
- Audit records can contain identifiers and network metadata. Protect their transport, storage, access, retention, and deletion according to your security requirements.
- reShapr does not provide an audit database, SIEM, compliance policy, or immutable retention mechanism.

## Next step

Use **[Observe the reShapr Gateway](./operations/observe-and-audit.md)** to route records with `log.type=audit` to a dedicated sink. Use **[Security Capabilities and Limits](../explanations/security-model.md)** to review endpoint authentication and audit boundaries.

The release-tagged [audit implementation](https://github.com/reshaprio/reshapr/tree/0.2.3/proxy/src/main/java/io/reshapr/proxy/audit) and [public API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-public-openapi-v0.1.yaml) remain the canonical references.