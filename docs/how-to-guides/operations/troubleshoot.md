---
description: Diagnose inactive Expositions, unsynchronized Gateways, MCP errors, backend failures, and unresolved Secrets.
verification:
  product: reShapr stack
  version: 0.2.3 / controllers 0.0.1
  date: 2026-09-04
---

# Troubleshoot an Exposition or Gateway

Use this guide when an Exposition has no endpoint, a Gateway does not receive a change, or an MCP request fails. Start with the first failing layer and stop when its recovery check succeeds.

## Prerequisites

You need:

- reShapr runtime `0.2.3` and, for Kubernetes-managed resources, controllers `0.0.1`;
- `reshapr login` completed for the affected organization;
- access to Gateway and operator logs;
- `curl`, `jq`, and `kubectl` when the workload runs on Kubernetes;
- the Exposition ID, expected Gateway Group, Gateway labels, and MCP URL.

Set the values relevant to your deployment:

```bash
export EXPOSITION_ID='<exposition-id>'
export MCP_URL='https://<gateway-host>/mcp/<organization>/<exposition-name>'
export APP_NAMESPACE='<application-namespace>'
export PROXY_NAMESPACE='<gateway-namespace>'
export PLATFORM_NAMESPACE='reshapr-system'
```

## Choose the failing layer

Run these checks in order:

1. `reshapr expo get "${EXPOSITION_ID}"` must show the expected Gateway Group and at least one endpoint.
2. The Gateway readiness endpoint must return `UP`.
3. A `server/discover` request must reach the expected Exposition.
4. `tools/list` must contain the expected Tool.
5. A read-only `tools/call` must reach and be accepted by the backend.

An Exposition can be ready in the control plane while no running Gateway matches its group. Gateway readiness can also be `UP` while a particular Exposition is absent. Keep these checks separate.

## Exposition has no active endpoint

Inspect the Exposition and its target group:

```bash
reshapr expo get "${EXPOSITION_ID}"
reshapr gateway-group list
```

If no endpoint is listed, compare the target Gateway Group labels with the labels advertised by the intended Gateway. For a Kubernetes Gateway, inspect the rendered environment:

```bash
kubectl get deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --output json \
  | jq -r '.spec.template.spec.containers[0].env[]
      | select(.name == "RESHAPR_GATEWAY_LABELS")
      | .value'
```

For a standalone container, inspect its startup configuration or logs. A Gateway must advertise labels compatible with the target group. Labels are selection criteria; a mismatch does not set the Exposition or GatewayGroup CR to `ERROR`.

Correct either the Gateway labels or the intended Gateway Group, roll out the affected workload, and wait for registration. Then repeat:

```bash
reshapr expo get "${EXPOSITION_ID}"
```

Recovery is complete when the expected Gateway hostname appears in `ENDPOINTS`.

## Kubernetes resource is not ready

When controllers manage the Exposition, inspect every dependency and compare desired and observed generations:

```bash
kubectl get services.reshapr.io,gatewaygroups.reshapr.io,configurationplans.reshapr.io,expositions.reshapr.io,secretsources.reshapr.io \
  --namespace "${APP_NAMESPACE}" \
  --output json | jq -r '
    .items[] |
    [.kind, .metadata.name, .status.status, .metadata.generation,
     .status.observedGeneration, (.status.message // "")] |
    @tsv'
```

For `Service`, `GatewayGroup`, `ConfigurationPlan`, `Exposition`, and `SecretSource`, require both:

- `status.status` is `READY`;
- `status.observedGeneration` equals `metadata.generation`.

Use `status.message` to resolve an `ERROR`. An Exposition in `IN_PROGRESS` commonly waits for its Service, ConfigurationPlan, or GatewayGroup to exist remotely. Correct the named dependency first.

`CustomTools` and `Resource` use a different status shape in controllers `0.0.1`:

```bash
kubectl get customtools.reshapr.io,resources.reshapr.io \
  --namespace "${APP_NAMESPACE}" \
  --output json | jq -r '
    .items[] |
    [.kind, .metadata.name, .status.state, (.status.message // "")] |
    @tsv'
```

If the status does not explain the failure, inspect the operator logs:

```bash
kubectl logs \
  --namespace "${PLATFORM_NAMESPACE}" \
  --selector app.kubernetes.io/component=operator \
  --tail 200
```

After correcting the resource, rerun the first status command. Recovery requires `READY` with matching generations, followed by an endpoint in `reshapr expo get`.

## Gateway is not ready or registered

Inspect the workload before changing registration settings:

```bash
kubectl get pods --namespace "${PROXY_NAMESPACE}"
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --tail 200
```

Check, in this order:

- DNS and TCP reachability from the Gateway to the configured control-plane host and port;
- whether the control-plane connection expects TLS or plaintext;
- the presence and validity of the Gateway API token;
- uniqueness of the Gateway ID among running instances;
- syntactic correctness of advertised FQDNs and labels.

Port-forward the Gateway service and query readiness locally:

```bash
kubectl port-forward \
  --namespace "${PROXY_NAMESPACE}" \
  service/reshapr-proxy 7777:7777
```

In another terminal:

```bash
curl --fail --silent http://localhost:7777/q/health/ready | jq -er '.status'
```

Recovery requires `UP`, followed by the expected endpoint in `reshapr expo get`. Readiness proves initial control-plane connectivity, not backend reachability.

Gateways advertise health every two minutes. The control plane considers a registration stale after five minutes without an advertisement, and cleanup runs periodically. Do not use the stale-registration window as a readiness test.

## Gateway did not receive a recent change

First verify that the Kubernetes generation, when applicable, has been observed and that the control-plane representation has the expected values. Then inspect Gateway logs for change-stream or re-registration errors:

```bash
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --since 15m
```

An initialized Gateway keeps the last configuration it fetched while synchronization is unavailable. During that interval, new or updated Expositions can be absent and deleted ones can remain locally.

Restore Gateway-to-control-plane connectivity and wait for stream retry or health-triggered re-registration. If the process cannot recover, perform a controlled rollout after preserving its logs:

```bash
kubectl rollout restart deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}"
kubectl rollout status deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --timeout 5m
```

Recovery requires readiness `UP` and a fresh `server/discover` or `tools/list` response showing the changed MCP surface.

## MCP request returns 400, 401, 403, or 404

Capture the HTTP status, headers, and JSON-RPC body together:

```bash
curl --include --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-troubleshooting","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "${MCP_URL}"
```

Use the status and returned error together:

| Status | Check | Recovery check |
|---|---|---|
| `400` | Validate JSON-RPC and the protocol version. For MCP `2026-07-28`, make `Mcp-Method`, optional `Mcp-Name`, and the request body agree. | `server/discover` returns `result.supportedVersions`. |
| `401` | Add the configured `x-reshapr-key` or bearer token. For OAuth, check expiry, signature, issuer, and required claims. | The same request succeeds with a valid credential. |
| `403` | For OAuth, compare the token resource and service claims with the endpoint, then check the Exposition scopes. | A token with the correct resource and scope succeeds. |
| `404` | Check the organization and Exposition path, then verify the requested method exists in the selected protocol mode. | `server/discover` and `tools/list` find the intended surface. |

For an audited Configuration Plan, search the exported audit logs for `event.action=authentication`. Its `event.reason` distinguishes failures such as `invalid_api_key`, `missing_bearer_token`, `invalid_token`, or `missing_scope`.

## Tool reaches reShapr but the backend fails

A Tool execution failure normally appears in the JSON-RPC result rather than as an endpoint-authentication status. Inspect the full result and correlate it with Gateway logs:

```bash
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --since 5m
```

Check the configured backend URL, DNS, egress policy, TLS trust, backend timeout, and backend credential independently. A Gateway-generated `504` result indicates that the backend exceeded the configured timeout. Other backend HTTP statuses can be propagated into the Tool result.

Run a direct request from an approved diagnostic workload in the same network boundary when policy permits. Do not print credentials or weaken TLS to make the test pass.

Recovery requires a read-only `tools/call` whose result is not marked `isError: true` and whose expected backend content is present.

## SecretSource cannot resolve a credential

Inspect the aggregate state and each per-Secret condition:

```bash
kubectl get secretsource '<secret-source-name>' \
  --namespace "${APP_NAMESPACE}" \
  --output json \
  | jq '{status: .status.status,
         generation: .metadata.generation,
         observed: .status.observedGeneration,
         message: .status.message,
         conditions: .status.conditions}'
```

For a `secretRef`, confirm that the Kubernetes Secret exists in the same namespace and contains every named key:

```bash
kubectl get secret '<kubernetes-secret-name>' \
  --namespace "${APP_NAMESPACE}" \
  --output json \
  | jq '.data | keys'
```

Do not decode or log the values. Confirm that the operator has its Secret-reader RBAC, then correct the reference or missing key. A Kubernetes Secret update triggers SecretSource reconciliation.

Recovery requires the SecretSource to be `READY` with matching generations and successful per-Secret conditions. Finish with a read-only Tool call because reconciliation does not prove that the backend accepts the credential.

## Tool call is waiting for elicitation

For stateless MCP `2026-07-28`, an expected elicitation response has `result.resultType=input_required`, one or more `elicitation/create` URLs, and an opaque `requestState`. This is not a Gateway outage.

Use a compatible MCP client to open the returned URL over trusted TLS, complete the credential or OAuth flow, and resume the Tool call while preserving `requestState`. Stateless elicitation requires an OAuth-protected Exposition because reShapr associates the value with the token's `iss` and `sub` claims.

If the request instead returns `400` for a missing client capability, use a client that declares elicitation support. Clients using a protocol before `2026-07-28` receive the `URL_ELICITATION_REQUIRED` JSON-RPC error and bind the value to their MCP session.

When a previously working elicited credential causes a backend `401`, reShapr evicts it. Complete elicitation again with a current credential. Recovery requires the resumed Tool call to return expected backend content.

## Result

The first failing layer now has an observable recovery check: reconciled desired state, a matching and ready Gateway, a synchronized MCP surface, accepted endpoint credentials, or a successful backend call.

## Limits

- A `READY` custom resource proves control-plane reconciliation, not Gateway selection, synchronization, ingress, or backend health.
- Gateway readiness proves initial control-plane connectivity, not that every Exposition is loaded or every backend is reachable.
- Release `0.2.3` retains the last fetched local registry during synchronization loss; this is not an offline-operation guarantee.
- Controllers `0.0.1` do not expose one uniform status contract for all custom resources.
- Logs and telemetry depend on the deployment's collection and retention configuration.

## Next step

Use **[Observe the reShapr Gateway](./observe-and-audit.md)** to export the signals used here. Review **[Control Plane to Gateway Synchronization](../../explanations/control-plane-gateway-synchronization.md)** for the registration, streaming, heartbeat, and recovery model.

The release-tagged [reShapr runtime](https://github.com/reshaprio/reshapr/tree/0.2.3) and [controllers documentation](https://github.com/reshaprio/reshapr-controllers/tree/0.0.1/documentation) remain the canonical behavioral references.