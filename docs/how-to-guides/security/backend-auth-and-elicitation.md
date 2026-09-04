---
description: Authenticate reShapr Gateway calls to backend APIs with stored, locally resolved, or elicited credentials.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Authenticate Backend Calls and Use Elicitation

Backend authentication controls the Gateway-to-backend boundary. It is independent from the API key or OAuth policy that protects an MCP endpoint.

Use this guide to choose a backend Secret, attach it to a Configuration Plan, and verify a non-destructive Tool call. The main procedure uses a local environment reference so that the credential value does not enter control-plane storage.

## Prerequisites

You need:

- the reShapr `0.2.3` CLI, authenticated with `reshapr login`;
- an imported Service for a protected test backend;
- a Gateway Group and a Gateway whose runtime configuration you control;
- a read-only backend operation and its expected successful response;
- `curl` and `jq`;
- the backend credential stored in a secret manager rather than shell history.

Set the non-sensitive inputs:

```bash
export SERVICE_ID='<service-id>'
export BACKEND_ENDPOINT='https://api.example.com'
export GATEWAY_GROUP_ID='<gateway-group-id>'
```

## Choose a backend authentication mode

| Backend | Secret fields | Gateway behavior |
|---|---|---|
| REST or GraphQL with bearer token | `token` | Sends `Authorization: Bearer <token>` |
| REST or GraphQL with API key | `token` and `tokenHeader` | Sends the token through the named HTTP header |
| REST or GraphQL with Basic authentication | `username` and `password` | Sends HTTP Basic credentials |
| gRPC with token | `token`, optionally `tokenHeader` | Adds per-call gRPC metadata |
| gRPC with a private CA | `certPem` | Uses the PEM certificate as a custom TLS trust anchor |
| REST, GraphQL, or gRPC with elicitation | `useElicitation` and a header or OAuth client configuration | Requests a credential for the current MCP session or authenticated user |

In release `0.2.3`, username/password is not applied as gRPC Basic authentication, and `certPem` is not used by the HTTP proxy. The certificate field configures gRPC server trust; it is not a client certificate.

## Create a locally resolved Secret

Read the backend token into the shell environment without echoing it:

```bash
read -r -s -p 'Backend API token: ' BACKEND_API_TOKEN
export BACKEND_API_TOKEN
printf '\n'
```

Create a backend Secret containing a reference, not the token value. Keep the single quotes so the shell does not expand the placeholder:

```bash
export BACKEND_SECRET_ID="$(
  reshapr secret create hybrid-backend-token \
    --backend \
    --token '${env:BACKEND_API_TOKEN}' \
    --description 'Resolved by the target Gateway' \
    --output json \
    | jq -er '.id'
)"
```

For a backend API key carried by a custom header, add `--tokenHeader '<header-name>'`. For HTTP Basic authentication, replace the token option with:

```bash
--username '${env:BACKEND_USERNAME}' \
--password '${env:BACKEND_PASSWORD}'
```

The Gateway resolves each placeholder when preparing a backend call. Release `0.2.3` provides the `env` scheme; an unknown scheme or missing value fails the call.

## Make the value available to the Gateway

Inject the variable through the workload's secret mechanism. For the Docker command in **[Deploy a Hybrid Gateway](../deploy-hybrid-gateway.md)**, add this option when creating the container:

```bash
--env BACKEND_API_TOKEN
```

This form passes the value from the current environment without placing it in the `docker run` arguments. For Kubernetes, map a Secret key to an environment variable in the Gateway container instead of committing the value to a manifest.

Check the Gateway logs after startup. A missing variable is reported when the first matching backend call tries to resolve it.

## Attach the Secret to a Configuration Plan

Create a Configuration Plan for the protected backend:

```bash
export RESHAPR_CONFIG_ID="$(
  reshapr config create 'local-backend-auth' \
    --serviceId "${SERVICE_ID}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --backendSecret "${BACKEND_SECRET_ID}" \
    --output json \
    | jq -er '.id'
)"
```

Endpoint access defaults to no authentication in this example. Protect it with **[an API key](./api-key.md)** or **[OAuth 2.0](./oauth.md)** before allowing untrusted clients to reach it.

Create and inspect a named Exposition:

```bash
export EXPOSITION_ID="$(
  reshapr expo create \
    --configuration "${RESHAPR_CONFIG_ID}" \
    --gateway-group "${GATEWAY_GROUP_ID}" \
    --name backend-auth-check \
    --output json \
    | jq -er '.id'
)"

reshapr expo get "${EXPOSITION_ID}"
```

## Verify the backend call

Set the exact endpoint returned by `reshapr expo get` and select a read-only Tool:

```bash
export MCP_URL='https://<gateway-host>/mcp/<organization>/backend-auth-check'
export TOOL_NAME='<read-only-tool-name>'
export TOOL_ARGUMENTS='{}'
```

Call the Tool:

```bash
jq -n \
  --arg name "${TOOL_NAME}" \
  --argjson arguments "${TOOL_ARGUMENTS}" \
  '{jsonrpc:"2.0",id:1,method:"tools/call",params:{name:$name,arguments:$arguments,_meta:{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{name:"reshapr-backend-auth-check",version:"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' | \
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/call' \
  --header "Mcp-Name: ${TOOL_NAME}" \
  --data @- \
  "${MCP_URL}" | jq '.result'
```

An expected backend response confirms that the Gateway resolved the reference and applied the credential. A backend `401` usually means the value is missing, expired, or sent through the wrong header.

## Rotate a local value

reShapr does not cache the resolved Secret value between backend calls. Whether a changed value becomes visible without replacing the Gateway depends on the configuration source.

Environment variables of an existing Docker container cannot be changed in place. To rotate this example:

1. replace `BACKEND_API_TOKEN` in the secret manager or deployment environment;
2. recreate the Gateway container with the same Gateway ID, labels, and `--env BACKEND_API_TOKEN` option;
3. wait for readiness and registration;
4. repeat the read-only Tool call and confirm that the backend accepts the new value;
5. revoke the previous backend token.

The Secret stored by the control plane remains `${env:BACKEND_API_TOKEN}` throughout this rotation. Kubernetes workloads likewise need a rollout when a Secret is consumed as an environment variable.

## Use direct credential elicitation

Use elicitation when each MCP user must provide a backend credential instead of sharing one provisioned for the Gateway. Stateless elicitation with MCP `2026-07-28` requires an OAuth-protected Exposition because reShapr associates the elicited value with the bearer token's `iss` and `sub` claims.

Create an elicitation Secret whose `--token` option names the backend header that will receive the user-provided value:

```bash
export ELICITATION_SECRET_ID="$(
  reshapr secret create-elicitation user-backend-key \
    --token 'X-API-Key' \
    --description 'Request one backend API key per MCP user' \
    --output json \
    | jq -er '.id'
)"
```

Create an OAuth-protected Configuration Plan as described in **[Protect an MCP Endpoint with OAuth 2.0](./oauth.md)** and add:

```bash
--backendSecret "${ELICITATION_SECRET_ID}"
```

Create an Exposition from that plan. Call a Tool with a valid endpoint bearer token before providing the backend credential. The JSON-RPC result has this shape:

```json
{
  "result": {
    "resultType": "input_required",
    "inputRequests": {
      "<elicitation-id>": {
        "method": "elicitation/create",
        "params": {
          "mode": "url",
          "elicitationId": "<elicitation-id>",
          "url": "https://<gateway-host>/elicitation/form?elicitationId=<elicitation-id>"
        }
      }
    },
    "requestState": "<opaque-value>"
  }
}
```

Open the supplied URL over a trusted TLS connection, enter the backend credential, and let the MCP client resume the Tool call while preserving the opaque `requestState`. A successful backend response confirms completion. If the backend later returns `401`, the Gateway evicts the elicited value so that the user can provide a replacement.

Clients using a protocol before `2026-07-28` receive a `URL_ELICITATION_REQUIRED` JSON-RPC error instead. The elicited value is then associated with the MCP session rather than the authenticated `iss` and `sub` identity.

## Use OAuth elicitation for the backend

An elicitation Secret can redirect the user through a backend Authorization Server instead of displaying a token form:

```bash
reshapr secret create-elicitation backend-oauth \
  --oauth2ClientID '<client-id>' \
  --oauth2ClientSecret '${env:BACKEND_OAUTH_CLIENT_SECRET}' \
  --oauth2AuthorizationEndpoint 'https://idp.example.com/authorize?scope=backend.read' \
  --oauth2TokenEndpoint 'https://idp.example.com/token'
```

Register `https://<gateway-host>/elicitation/callback` as an allowed redirect base with the backend Authorization Server. The Gateway adds the elicitation identifier, `client_id`, `redirect_uri`, `response_type=code`, and stateless `state` parameters. It resolves the optional client-secret reference locally before exchanging the authorization code.

This flow cannot be validated without a real Authorization Server, a compatible MCP client, and a callback URL reachable through the Gateway. Test it in an isolated identity-provider tenant before production use.

## Roll back

Delete resources in dependency order:

```bash
reshapr expo delete "${EXPOSITION_ID}"
reshapr config delete "${RESHAPR_CONFIG_ID}"
reshapr secret delete "${BACKEND_SECRET_ID}"
```

Delete any additional elicitation Secrets and their Configuration Plans after removing the Expositions that use them. Revoke test credentials and OAuth clients in their owning systems.

## Result

The Gateway authenticates a read-only backend call with a locally resolved credential. You can distinguish that shared runtime credential from a user-specific elicited credential and from the independent policy protecting the MCP endpoint.

## Limits

- Release `0.2.3` provides only the `env` local-reference scheme. It does not integrate directly with a general external secret-provider API.
- Environment-variable rotation requires the workload platform to make the new value visible. Docker and Kubernetes environment variables require container or pod replacement.
- HTTP Basic credentials are not applied to gRPC calls. Custom CA certificates are applied to gRPC TLS, not HTTP backends, and are not client certificates.
- Elicited credentials are runtime values associated with a session or authenticated user. They are not a substitute for MCP endpoint authentication or authorization.
- Elicitation requires a compatible client. OAuth elicitation additionally requires an Authorization Server and a reachable callback route.

## Next step

- **[Security Capabilities and Limits](../../explanations/security-model.md)** compares the controls and their boundaries.
- **[Deploy a Hybrid Gateway](../deploy-hybrid-gateway.md)** shows where to inject Gateway-local environment variables.
- **[Test an MCP Endpoint](../test-mcp-endpoint.md)** covers stateless and session-based MCP requests.