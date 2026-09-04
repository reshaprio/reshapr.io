---
description: Protect a reShapr MCP endpoint with an API key, verify access, and rotate the key without restarting the Gateway.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Protect an MCP Endpoint with an API Key

An API key restricts the client-to-Gateway boundary of an MCP endpoint. reShapr stores the key on the Configuration Plan and applies it to every Exposition created from that plan.

## Prerequisites

- reShapr CLI `0.2.3`, authenticated with `reshapr login`
- A Service ID and its backend endpoint
- `curl` and `jq`

## Create a protected Configuration Plan

Create the plan with `--apiKey` and capture its structured output:

```bash
CONFIG_JSON="$(
  reshapr config create 'protected-open-meteo' \
    --serviceId '<service-id>' \
    --backendEndpoint 'https://api.open-meteo.com' \
    --apiKey \
    --output json
)"
```

The JSON response contains the generated Configuration Plan ID and API key. Extract both without putting the key in shell history:

```bash
RESHAPR_CONFIG_ID="$(jq -er '.id' <<<"$CONFIG_JSON")"
RESHAPR_API_KEY="$(jq -er '.apiKey' <<<"$CONFIG_JSON")"
export RESHAPR_CONFIG_ID RESHAPR_API_KEY
unset CONFIG_JSON
```

Create an Exposition from this plan and set the returned endpoint URL:

```bash
reshapr expo create --configuration "$RESHAPR_CONFIG_ID" --gateway-group 1
export MCP_URL='https://<gateway-host>/mcp/<endpoint-path>'
```

## Verify that the key is required

Send a stateless discovery request without the key and print its HTTP status:

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL"
```

The expected status is `401`.

Repeat the request with the key:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "x-reshapr-key: $RESHAPR_API_KEY" \
  --data '{"jsonrpc":"2.0","id":2,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result.supportedVersions'
```

A JSON-RPC result containing the supported versions confirms that the key was accepted.

## Rotate the key

Keep the current value so that you can verify its revocation, then generate a replacement:

```bash
export RESHAPR_OLD_API_KEY="$RESHAPR_API_KEY"
RESHAPR_API_KEY="$(
  reshapr config renew-api-key "$RESHAPR_CONFIG_ID" --output json \
    | jq -er '.apiKey'
)"
export RESHAPR_API_KEY
```

The Gateway receives the Configuration Plan update without a restart.

Confirm that the old key is rejected:

```bash
curl --silent --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "x-reshapr-key: $RESHAPR_OLD_API_KEY" \
  --data '{"jsonrpc":"2.0","id":3,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL"
```

The expected status is `401`. Repeat the authenticated discovery request with `$RESHAPR_API_KEY`; it must succeed.

## Result

The endpoint rejects requests without the current key, accepts requests with it, and stops accepting the previous key after rotation.

## Limits

- The key protects MCP client access to the Gateway. It does not authenticate Gateway requests to the backend API; configure a Backend Secret for that boundary.
- Anyone holding the key can access every Exposition derived from the Configuration Plan. Use separate plans when consumers need separate credentials.
- API keys do not provide user identity or scopes. Use OAuth 2.0 when the endpoint requires those controls.
- TLS is a deployment concern. Serve protected endpoints over HTTPS so the key is encrypted in transit.

## Next step

- **[Test an MCP endpoint](../test-mcp-endpoint.md)** to list and call its Tools with the key.
- **[Security Capabilities and Limits](../../explanations/security-model.md)** compares the independent authentication boundaries.