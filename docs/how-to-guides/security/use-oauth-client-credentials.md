---
description: Authenticate reShapr proxy calls to a backend with an OAuth 2.0 Client Credentials machine identity and locally resolved client secret.
verification:
  product: reShapr
  version: 1.0.0
  date: 2026-09-22
---

# Use OAuth Client Credentials for Backend Calls

Use the OAuth 2.0 Client Credentials grant when every call through a Configuration Plan should reach the backend as one machine identity. This flow authenticates the reShapr proxy to the backend; it does not authenticate the MCP client to the Exposition.

This guide keeps the OAuth client secret out of control-plane storage by resolving `${env:...}` on the proxy, attaches the resulting Secret to a Configuration Plan, and verifies a backend call.

## Prerequisites

You need:

- reShapr `1.0.0` and its CLI;
- an imported Service and a read-only backend operation;
- an OAuth client authorized to call that backend;
- a token endpoint that supports `grant_type=client_credentials` and `client_secret_basic`;
- control of the target proxy workload environment;
- a Gateway Group and a reachable Exposition route;
- `curl` and `jq`.

Set the non-sensitive inputs:

```bash
export SERVICE_ID='<service-id>'
export BACKEND_ENDPOINT='https://api.example.com'
export OAUTH_CLIENT_ID='<client-id>'
export OAUTH_TOKEN_ENDPOINT='https://idp.example.com/oauth/token'
export OAUTH_SCOPES='backend.read'
export GATEWAY_GROUP_ID='<gateway-group-id>'
```

## Make the client secret available to the proxy

Store the OAuth client secret in the workload platform's secret manager and expose it to the proxy as `BACKEND_OAUTH_CLIENT_SECRET`. Do not put its value in a Configuration Plan, command argument, image, or committed manifest.

For a Docker proxy, pass the existing environment value without expanding it into the command line:

```bash
--env BACKEND_OAUTH_CLIENT_SECRET
```

For Kubernetes, map a Secret key to an environment variable in the proxy container and roll out the workload. The proxy resolves the reference when it needs a token; the control plane stores only the placeholder.

## Create the Client Credentials Secret

Create the reShapr Secret and extract its identifier directly:

```bash
export BACKEND_SECRET_ID="$(
  reshapr secret create-client-credentials backend-machine-identity \
    --oauth2ClientID "${OAUTH_CLIENT_ID}" \
    --oauth2ClientSecret '${env:BACKEND_OAUTH_CLIENT_SECRET}' \
    --oauth2TokenEndpoint "${OAUTH_TOKEN_ENDPOINT}" \
    --oauth2Scopes "${OAUTH_SCOPES}" \
    --description 'Machine identity for the protected backend' \
    --output json \
    | jq -er '.id'
)"
```

The scope option accepts comma-separated or whitespace-separated values. reShapr sends them as one space-separated `scope` parameter; it does not map scopes to individual Tools.

Inspect the stored configuration without revealing the runtime value:

```bash
reshapr secret get "${BACKEND_SECRET_ID}" --output json \
  | jq -e \
      --arg endpoint "${OAUTH_TOKEN_ENDPOINT}" \
      '.authMethod == "OAUTH2_CLIENT_CREDENTIALS"
       and .oauth2ClientConfiguration.tokenEndpoint == $endpoint'
```

## Attach the Secret to a Configuration Plan

Create a Plan that uses the machine identity for backend calls:

```bash
export CONFIGURATION_PLAN_ID="$(
  reshapr config create backend-client-credentials \
    --serviceId "${SERVICE_ID}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --backendSecret "${BACKEND_SECRET_ID}" \
    --output json \
    | jq -er '.id'
)"
```

Protect the MCP endpoint independently with **[an API key](./api-key.md)** or **[OAuth 2.0](./oauth.md)** before exposing it to untrusted clients.

Create a named Exposition:

```bash
export EXPOSITION_ID="$(
  reshapr expo create \
    --configuration "${CONFIGURATION_PLAN_ID}" \
    --gateway-group "${GATEWAY_GROUP_ID}" \
    --name backend-client-credentials \
    --output json \
    | jq -er '.exposition.id'
)"

reshapr expo get "${EXPOSITION_ID}"
```

## Verify token acquisition and the backend call

Set the returned endpoint and a read-only Tool:

```bash
export MCP_URL='https://<gateway-host>/mcp/<organization>/backend-client-credentials'
export TOOL_NAME='<read-only-tool-name>'
export TOOL_ARGUMENTS='{}'
```

Call the Tool as described in **[Test an MCP Endpoint](../test-mcp-endpoint.md)**. A successful backend result confirms that the proxy obtained an access token and sent it as `Authorization: Bearer <access-token>`.

For an isolated verification tenant, inspect the Authorization Server logs and call the same Tool twice before the token expires. The first call should reach the token endpoint; the second should reuse the cached token. Do not log the Basic authorization header, client secret, or access token.

The token request has these properties in `1.0.0`:

- method `POST` and content type `application/x-www-form-urlencoded`;
- body parameter `grant_type=client_credentials`;
- optional, space-separated `scope` parameter;
- client authentication through HTTP Basic when a client secret is configured;
- required JSON response field `access_token`, with optional `expires_in` in seconds.

## Understand token caching

The proxy stores the acquired access token in its replicated backend-token cache. The cache key is scoped by strategy and Secret reference, so all calls using that Secret share the machine token across proxy replicas in the same cluster.

When the token endpoint returns `expires_in`, the cache lifespan is 15 seconds shorter than that duration, with a minimum of 5 seconds. Without a usable `expires_in`, the lifespan is 300 seconds. After expiry or a cache restart, the next backend call requests a new access token.

reShapr ignores refresh tokens for this flow. It always repeats the Client Credentials grant when a new token is needed.

## Rotate the client secret

Rotate the credential in this order:

1. create or activate the replacement secret at the Authorization Server;
2. update `BACKEND_OAUTH_CLIENT_SECRET` in the workload secret manager;
3. restart or roll out every proxy replica that consumes it as an environment variable;
4. wait for readiness and registration;
5. invoke the read-only Tool and confirm that the backend accepts the token;
6. revoke the previous OAuth client secret.

An access token already in the cache can remain usable until its cache lifespan ends. Plan the overlap at the Authorization Server when immediate revocation would interrupt calls.

## Recover from a failed token exchange

Check the proxy logs and the Authorization Server without printing credentials. Common causes are a missing environment variable, invalid client credentials, an unreachable token endpoint, rejected scopes, a non-`200` response, or a response without `access_token`.

Fix the owning system, then repeat the Tool call. A failed acquisition is not cached as a valid token. If an obsolete token is still accepted from cache, wait for its bounded lifespan or restart the proxy cluster during a controlled recovery window.

## Result

The Configuration Plan uses a proxy-local OAuth client secret to obtain and cache a machine access token. A read-only Tool call reaches the backend with that token, while the MCP endpoint authentication remains an independent policy.

## Limits

- Client Credentials represents one shared machine identity, not an MCP user's delegated identity.
- reShapr `1.0.0` does not use OAuth refresh tokens for this flow.
- Configured scopes apply to the token request, not to per-Tool authorization in reShapr.
- The token cache is runtime state, not persistent credential storage; a cluster restart causes a new exchange.
- Environment-backed secret rotation requires the workload platform to replace or restart the consuming proxy processes.
- `env` is the only provided local-reference scheme in `1.0.0`.

## Next step

Use **[Authenticate Backend Calls and Use Elicitation](./backend-auth-and-elicitation.md)** to compare this shared identity with direct credentials and per-user elicitation. Use **[Security Capabilities and Limits](../../explanations/security-model.md)** to review the complete trust boundary.

The release-tagged [Client Credentials provider](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/main/java/io/reshapr/proxy/secret/ClientCredentialsTokenProvider.java), [token request implementation](https://github.com/reshaprio/reshapr/blob/1.0.0/commons/src/main/java/io/reshapr/security/OidcUtils.java), and [provider tests](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/test/java/io/reshapr/proxy/secret/ClientCredentialsTokenProviderTest.java) own the behavior described here.