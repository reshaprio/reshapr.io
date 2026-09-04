---
description: Validate a reShapr MCP endpoint by negotiating a protocol mode, listing Tools, calling one Tool, and interpreting common errors.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Test an MCP Endpoint with an MCP Client

Use these requests to validate an MCP endpoint before connecting it to an agent. The examples use `curl` so that the HTTP exchange remains visible.

## Prerequisites

- A reachable reShapr MCP endpoint
- `curl` and `jq`
- An API key or bearer token when the endpoint is protected
- The name and valid arguments of one Tool exposed by the endpoint

Set the endpoint returned by the Exposition:

```bash
export MCP_URL='https://<gateway-host>/mcp/<endpoint-path>'
```

## Choose a protocol mode

| Mode | Protocol | First request | State carried by the client |
|---|---|---|---|
| Stateless | `2026-07-28` | `server/discover` | Protocol metadata on every request; no session ID |
| Session-based | `2025-11-25` or earlier | `initialize` | Protocol version and the returned `MCP-Session-Id` |

Use one mode consistently. Do not send a legacy session ID with a stateless request.

## Test the stateless protocol

### Discover the server

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq .
```

The response should identify the server and include `2026-07-28` among its supported versions.

### List Tools

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/list' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result.tools[] | {name, description}'
```

### Call a Tool

Replace the Tool name and arguments with values returned by `tools/list`:

```bash
export MCP_TOOL='get_v1_forecast'

curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/call' \
  --header "Mcp-Name: $MCP_TOOL" \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_v1_forecast","arguments":{"latitude":"48.8566","longitude":"2.3522","current":["temperature_2m","weather_code","wind_speed_10m"],"timezone":"Europe/Paris"},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq .
```

The `Mcp-Method`, `Mcp-Name`, and `MCP-Protocol-Version` headers must agree with the request body when supplied.

## Test a session-based protocol

Initialize the session and capture the response headers:

```bash
export MCP_HEADERS="$(mktemp)"

curl --silent --show-error --dump-header "$MCP_HEADERS" \
  --header 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"reshapr-curl","version":"1.0"}}}' \
  "$MCP_URL" | jq .

export MCP_SESSION_ID="$(awk 'tolower($1) == "mcp-session-id:" {print $2}' "$MCP_HEADERS" | tr -d '\r')"
test -n "$MCP_SESSION_ID"
```

Send both negotiated headers on later requests:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2025-11-25' \
  --header "MCP-Session-Id: $MCP_SESSION_ID" \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  "$MCP_URL" | jq '.result.tools[] | {name, description}'
```

Reuse the same two headers for `tools/call`. If the session is lost or expires, initialize a new one.

## Add endpoint authentication

For an endpoint protected by a reShapr API key, add:

```bash
--header "x-reshapr-key: $RESHAPR_API_KEY"
```

For an endpoint protected by OAuth 2.0, add:

```bash
--header "Authorization: Bearer $ACCESS_TOKEN"
```

These headers protect access to the MCP endpoint. Backend authentication is configured separately by the Configuration Plan.

## Diagnose a failed request

| Symptom | Likely cause | Check |
|---|---|---|
| HTTP `400` | Invalid JSON-RPC request, unsupported version, or modern mirror-header mismatch | Compare the method, target name, protocol header, and `_meta` values |
| HTTP `401` | Missing or invalid endpoint credentials | Add the configured API key or bearer token |
| HTTP `403` | Authenticated token lacks an accepted issuer or required Exposition scope | Inspect the OAuth configuration and token claims |
| HTTP `404` | Unknown Exposition or method unavailable in the selected protocol | Check the endpoint URL and protocol mode |
| JSON-RPC `error` | The MCP request reached the server but could not be processed | Read `error.code`, `error.message`, and `error.data` |
| `result.isError: true` | The Tool ran but the backend or Tool execution failed | Inspect `result.content` and Gateway logs |

Use `curl --include` when you need to inspect the HTTP status and response headers together.

## Result

The endpoint is ready for an MCP client when negotiation succeeds, `tools/list` returns the expected Tool, and `tools/call` returns content without a JSON-RPC error or `result.isError: true`.

## Limits

- This guide validates Streamable HTTP endpoints; reShapr does not expose an MCP WebSocket transport.
- Supported protocol details evolve. Use the protocol mode implemented by the client you intend to connect.
- A successful Tool call validates the selected endpoint and backend operation, not every Tool in the Exposition.

## Next step

- **[Create your first MCP endpoint](../tutorials/getting-started.md)** if you do not have one yet.
- **[Protect an MCP endpoint with an API key](./security/api-key.md)** before sharing an unprotected endpoint.
- **[Protect an MCP Endpoint with OAuth 2.0](./security/oauth.md)** when clients need authenticated identity and scopes.
- **[Security Capabilities and Limits](../explanations/security-model.md)** explains the client-to-Gateway and Gateway-to-backend trust boundaries.