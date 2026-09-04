---
description: Protect a reShapr MCP endpoint with OAuth 2.0 bearer JWT validation and verify accepted and rejected requests.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Protect an MCP Endpoint with OAuth 2.0

Use OAuth 2.0 when an MCP endpoint needs authenticated user identity and scopes rather than a shared API key. reShapr validates bearer JWTs at the client-to-Gateway boundary and applies the policy to the complete Exposition.

:::info Client ID Metadata Document compatibility
reShapr accepts bearer JWTs issued after an MCP client registers through a [Client ID Metadata Document (CIMD)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents). CIMD lets the Authorization Server identify the MCP client from a metadata document hosted at its HTTPS `client_id` URL; the Authorization Server, not CIMD, issues the access token.

The Gateway does not participate in that client-registration step. It validates the resulting JWT in the same way as any other bearer token: against the configured issuer, JWKS, required claims, expiration, and scopes.
:::

## Prerequisites

You need:

- the reShapr `0.2.3` CLI, authenticated with `reshapr login`;
- an imported Service, its backend endpoint, and a Gateway Group ID;
- an OAuth 2.0 test issuer and HTTPS JWKS endpoint reachable by the Gateway;
- `curl` and `jq`;
- RSA- or RSA-PSS-signed test access tokens containing `sub`, `iat`, `exp`, and `iss`.

Configure the test issuer to mint these tokens with the same trusted signing key:

- a valid token containing the required `mcp:invoke` scope;
- an expired token;
- a token whose `iss` is not in the accepted issuer list;
- a valid token without the required scope.

The procedure for creating clients, users, and test tokens is specific to your identity provider. Do not use production tokens for these tests.

Set the non-sensitive inputs:

```bash
export SERVICE_ID='<service-id>'
export BACKEND_ENDPOINT='https://api.example.com'
export GATEWAY_GROUP_ID='<gateway-group-id>'
export OAUTH_ISSUER='https://idp.example.com/realms/mcp'
export OAUTH_JWKS_URI='https://idp.example.com/realms/mcp/protocol/openid-connect/certs'
```

Read the four test tokens without adding them to shell history:

```bash
read -r -s -p 'Valid access token: ' VALID_ACCESS_TOKEN; printf '\n'
read -r -s -p 'Expired access token: ' EXPIRED_ACCESS_TOKEN; printf '\n'
read -r -s -p 'Wrong-issuer access token: ' WRONG_ISSUER_ACCESS_TOKEN; printf '\n'
read -r -s -p 'Missing-scope access token: ' MISSING_SCOPE_ACCESS_TOKEN; printf '\n'
export VALID_ACCESS_TOKEN EXPIRED_ACCESS_TOKEN WRONG_ISSUER_ACCESS_TOKEN MISSING_SCOPE_ACCESS_TOKEN
```

## Create an OAuth-protected Configuration Plan

Create a Configuration Plan that accepts the test issuer, retrieves keys from its JWKS endpoint, and requires `mcp:invoke`:

```bash
export RESHAPR_CONFIG_ID="$(
  reshapr config create-oauth 'oauth-protected' \
    --serviceId "${SERVICE_ID}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --oauth2AuthorizationServers "[\"${OAUTH_ISSUER}\"]" \
    --oauth2jwksUri "${OAUTH_JWKS_URI}" \
    --oauth2Scopes '["mcp:invoke"]' \
    --output json \
    | jq -er '.id'
)"
```

The configured scopes authorize access to the entire Exposition. They do not define different permissions for individual Tools, Prompts, or Resources.

## Create the Exposition

Create a named Exposition so that its endpoint remains readable:

```bash
export EXPOSITION_ID="$(
  reshapr expo create \
    --configuration "${RESHAPR_CONFIG_ID}" \
    --gateway-group "${GATEWAY_GROUP_ID}" \
    --name oauth-protected \
    --output json \
    | jq -er '.id'
)"
```

Inspect the Exposition and set the exact named endpoint returned by the CLI:

```bash
reshapr expo get "${EXPOSITION_ID}"
export MCP_URL='https://<gateway-host>/mcp/<organization>/oauth-protected'
export RESOURCE_METADATA_URL='https://<gateway-host>/.well-known/oauth-protected-resource/mcp/<organization>/oauth-protected'
```

## Inspect Protected Resource Metadata

Fetch the metadata published by the Gateway:

```bash
curl --fail --silent --show-error "${RESOURCE_METADATA_URL}" \
  | jq '{resource, authorization_servers, jwks_uri, scopes_supported}'
```

Verify that:

- `resource` equals the MCP endpoint URL;
- `authorization_servers` contains `$OAUTH_ISSUER`;
- `jwks_uri` equals `$OAUTH_JWKS_URI`;
- `scopes_supported` contains `mcp:invoke`.

## Verify endpoint access

Use one stateless discovery request for all checks:

```bash
export MCP_DISCOVERY_REQUEST='{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-oauth-check","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

First call the endpoint without a bearer token:

```bash
curl --silent --show-error --dump-header - --output /dev/null \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}"
```

The response must be `401` and its `WWW-Authenticate` header must contain the `resource_metadata` URL.

Repeat the request with the valid token:

```bash
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "Authorization: Bearer ${VALID_ACCESS_TOKEN}" \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}" | jq '.result.supportedVersions'
```

A JSON-RPC result containing `2026-07-28` confirms that the issuer, signature, required claims, expiration, and scope were accepted.

## Verify rejected tokens

An expired token must return `401`:

```bash
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "Authorization: Bearer ${EXPIRED_ACCESS_TOKEN}" \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}"
```

A token with an issuer outside the configured list must also return `401`:

```bash
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "Authorization: Bearer ${WRONG_ISSUER_ACCESS_TOKEN}" \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}"
```

A valid token without `mcp:invoke` must return `403`:

```bash
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --header "Authorization: Bearer ${MISSING_SCOPE_ACCESS_TOKEN}" \
  --data "${MCP_DISCOVERY_REQUEST}" \
  "${MCP_URL}"
```

Use Gateway authentication-failure audit events for additional diagnosis when audit and OpenTelemetry export are configured on the Configuration Plan.

## Roll back

Delete the Exposition before its Configuration Plan:

```bash
reshapr expo delete "${EXPOSITION_ID}"
reshapr config delete "${RESHAPR_CONFIG_ID}"
unset VALID_ACCESS_TOKEN EXPIRED_ACCESS_TOKEN WRONG_ISSUER_ACCESS_TOKEN MISSING_SCOPE_ACCESS_TOKEN
```

This does not remove clients, users, keys, or test tokens from the identity provider. Revoke or delete those resources there.

## Result

The MCP endpoint publishes its OAuth Protected Resource Metadata, accepts a correctly signed and scoped bearer JWT, rejects expired or unexpected issuers with `401`, and rejects a missing required scope with `403`.

## Limits

- reShapr validates access tokens but does not operate the Authorization Server or its RFC 8414 metadata endpoint.
- Release `0.2.3` accepts RSA and RSA-PSS JWT signatures. Symmetric HMAC tokens are rejected.
- The standard JWT `aud` claim is not checked by this validation path as per version `0.2.3`
- OAuth scopes apply to the Exposition, not to individual Tools, Prompts, or Resources.
- Dynamic Client Registration is not provided.

## Next step

- **[Test an MCP Endpoint](../test-mcp-endpoint.md)** to list and call Tools with `$VALID_ACCESS_TOKEN`.
- **[Security Capabilities and Limits](../../explanations/security-model.md)** explains the controls and non-goals at each trust boundary.
- **[Deployment Models and Trust Boundaries](../../explanations/deployment-models-trust-boundaries.md)** covers placement and network responsibilities.