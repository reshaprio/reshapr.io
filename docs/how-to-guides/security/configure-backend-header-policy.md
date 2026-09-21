---
description: Control which MCP request headers the reShapr proxy forwards to HTTP and gRPC backends, including explicit allow, deny, and rename rules.
verification:
  product: reShapr
  version: 1.0.0-rc1 / controllers 0.0.3
  date: 2026-09-21
---

# Configure Backend Request Header Policy

Use a request header policy when an HTTP or gRPC backend needs selected MCP client headers, such as a trace identifier, while other client-supplied headers must be removed or renamed. For gRPC calls, surviving headers become call metadata. The policy applies at the proxy-to-backend boundary; it does not authorize an MCP operation or replace backend authorization.

This guide shows the CLI and Kubernetes forms of the same policy, then verifies the headers observed by a test backend. Use only one ownership path for a given Configuration Plan.

## Prerequisites

You need:

- reShapr `1.0.0-rc1` and its CLI;
- for the Kubernetes path, controllers `0.0.3`;
- an imported REST, GraphQL, or gRPC Service;
- an OAuth-protected Configuration Plan or the inputs needed to create one;
- a test backend operation that returns or records received request headers;
- an Exposition for the Configuration Plan;
- `curl` and `jq`.

Set the identifiers used by the CLI example:

```bash
export SERVICE_ID='<service-id>'
export BACKEND_ENDPOINT='https://echo-api.example.com'
export AUTHORIZATION_SERVER='https://idp.example.com'
export JWKS_URI='https://idp.example.com/.well-known/jwks.json'
```

## Choose the request rules

Request rules are case-insensitive and have three roles:

- `allow` explicitly forwards a named header and can re-enable the normally protected `Authorization` or `Cookie` header;
- `deny` removes additional headers;
- `rename` moves a forwarded source header to another name after filtering.

The proxy always removes transport and internal headers before applying these rules:

```text
Host, Connection, Keep-Alive, Proxy-Authenticate, Proxy-Authorization,
TE, Trailer, Transfer-Encoding, Upgrade, Content-Length, X-Reshapr-Key,
MCP-Session-Id, MCP-Protocol-Version, Mcp-Method, Mcp-Name
```

An `allow` rule cannot restore one of those headers. Without an explicit `allow`, the proxy also removes `Authorization` and `Cookie`. To pass a client credential under another backend header, prefer an explicit rename such as `X-Backend-Authorization` to `Authorization` rather than forwarding every client header.



## Configure the policy with the CLI

Create an OAuth-protected Configuration Plan and pass the request rules as one JSON object:

```bash
export CONFIGURATION_PLAN_ID="$(
  reshapr config create-oauth header-policy-check \
    --serviceId "${SERVICE_ID}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --oauth2AuthorizationServers "[\"${AUTHORIZATION_SERVER}\"]" \
    --oauth2jwksUri "${JWKS_URI}" \
    --requestHeaderPolicy '{
      "allow": ["X-Trace-Id"],
      "deny": ["X-Internal-Only"],
      "rename": ["X-Backend-Authorization:Authorization"]
    }' \
    --output json \
    | jq -er '.id'
)"
```

:::tip Authorization passthrough
The CLI option `--passthrough` is shorthand for a request policy containing `allow: ["Authorization"]`. It forwards the MCP client's `Authorization` header to the backend and is mutually exclusive with `--requestHeaderPolicy`.

Use it only when the backend is intentionally meant to receive the same bearer credential as the MCP endpoint. Otherwise, keep endpoint and backend credentials separate and configure an explicit backend Secret.
:::

Inspect the resulting Plan:

```bash
reshapr config get "${CONFIGURATION_PLAN_ID}" --output json \
  | jq -e '
      .headerPolicy.request.allow == ["X-Trace-Id"]
      and .headerPolicy.request.deny == ["X-Internal-Only"]
      and .headerPolicy.request.rename == [
        {"from":"X-Backend-Authorization","to":"Authorization"}
      ]'
```

## Configure the policy with Kubernetes

For a controller-owned Configuration Plan, express the same rules under `spec.headerPolicy.request`:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: ConfigurationPlan
metadata:
  name: header-policy-check
spec:
  headerPolicy:
    request:
      allow:
        - X-Trace-Id
      deny:
        - X-Internal-Only
      rename:
        - from: X-Backend-Authorization
          to: Authorization
```

Add this block to a complete Configuration Plan manifest whose Service, backend endpoint, endpoint OAuth policy, and Secret references are already defined. Apply it through the same GitOps workflow that owns the Plan, then wait for its status to become `READY`.

The controller API also reserves `spec.headerPolicy.response`. In controllers `0.0.3` and reShapr `1.0.0-rc1`, response rules are not enforced by the proxy. Do not configure them as a security control.

## Verify the forwarded headers

Create an Exposition for the Plan as described in **[Protect an MCP Endpoint with OAuth 2.0](./oauth.md)**. Set its URL, a read-only Tool backed by the echo service, and a valid endpoint access token:

```bash
export MCP_URL='https://<gateway-host>/mcp/<organization>/<exposition-name>'
export TOOL_NAME='<echo-request-headers-tool>'
export MCP_ACCESS_TOKEN='<endpoint-access-token>'
```

Call the Tool with one allowed header, one denied header, and one renamed header:

```bash
jq -n \
  --arg name "${TOOL_NAME}" \
  '{
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: $name,
      arguments: {},
      _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientInfo": {
          name: "reshapr-header-policy-check",
          version: "1.0.0-rc1"
        },
        "io.modelcontextprotocol/clientCapabilities": {}
      }
    }
  }' | \
curl --silent --show-error --fail-with-body \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/call' \
  --header "Mcp-Name: ${TOOL_NAME}" \
  --header "Authorization: Bearer ${MCP_ACCESS_TOKEN}" \
  --header 'X-Trace-Id: trace-policy-check' \
  --header 'X-Internal-Only: must-not-arrive' \
  --header 'X-Backend-Authorization: backend-policy-check' \
  --data @- \
  "${MCP_URL}" | jq '.result'
```

In the backend result or access log, verify all three postconditions:

- `X-Trace-Id` is `trace-policy-check`;
- `X-Internal-Only` is absent;
- `Authorization` is `backend-policy-check`, and `X-Backend-Authorization` is absent.

Also confirm that MCP transport headers such as `MCP-Protocol-Version` did not reach the backend.

## Limits

- For gRPC backends, the same request policy applies before headers become call metadata. The proxy additionally removes `Accept`, `Content-Type`, and `User-Agent`, which the gRPC transport manages.
- Response header rules are reserved but not enforced in reShapr `1.0.0-rc1`.
- Explicitly allowing `Authorization` or `Cookie` transfers their security impact to the backend.
- Rename rules express an intentional trust transition and can target a normally denied header such as `Authorization`.
- Header filtering does not restrict which Tools are visible or callable.

## Next step

Use **[Authenticate Backend Calls and Use Elicitation](./backend-auth-and-elicitation.md)** when the backend credential should come from a reShapr Secret instead of an MCP client header. Review **[Configuration Plans and Expositions](../../explanations/configuration-and-exposition.md)** for the wider composition model.

The release-tagged [header policy engine](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/proxy/src/main/java/io/reshapr/proxy/proxy/HeaderPolicyEngine.java), [gRPC proxy integration](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/proxy/src/main/java/io/reshapr/proxy/proxy/GrpcProxyService.java), [runtime tests](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/proxy/src/test/java/io/reshapr/proxy/proxy/HeaderPolicyEngineTest.java), and [controllers API](https://github.com/reshaprio/reshapr-controllers/blob/0.0.3/api/src/main/java/io/reshapr/kubernetes/api/configurationplan/v1alpha1/HeaderPolicy.java) own the behavior described here.