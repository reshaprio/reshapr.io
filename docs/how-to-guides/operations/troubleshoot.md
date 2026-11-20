---
description: Diagnose inactive Expositions, unsynchronized proxies, MCP errors, backend failures, and unresolved Secrets.
verification:
  product: reShapr stack
  version: 1.0.0 / controllers 0.0.3
  date: 2026-09-22
release_review:
  runtime: 1.2.0
  controllers: 0.0.5
  charts: 0.0.18
  date: 2026-11-20
  scope: release-tagged runtime, CRD status and chart review; no complete troubleshooting replay
---

# Troubleshoot an Exposition or Proxy

Use this guide when an Exposition has no endpoint, a proxy does not receive a change, or an MCP request fails. Start with the first failing layer and stop when its recovery check succeeds.

## Prerequisites

You need:

- reShapr runtime `1.2.0` and, for Kubernetes-managed resources, controllers `0.0.5`;
- `reshapr login` completed for the affected organization;
- access to proxy and operator logs;
- `curl`, `jq`, and `kubectl` when the workload runs on Kubernetes;
- the Exposition ID, expected Gateway Group, Gateway labels, and MCP URL.

Set the values relevant to your deployment:

```bash
export EXPOSITION_ID='<exposition-id>'
export MCP_URL='https://<gateway-host>/mcp/<exposition-id>'
export APP_NAMESPACE='<application-namespace>'
export PROXY_NAMESPACE='<gateway-namespace>'
export PLATFORM_NAMESPACE='reshapr-system'
```

## Choose the failing layer

Run these checks in order:

1. `reshapr expo get "${EXPOSITION_ID}"` must show the expected Gateway Group and at least one endpoint.
2. The proxy readiness endpoint must return `UP`.
3. A `server/discover` request must reach the expected Exposition.
4. `tools/list` must contain the expected Tool.
5. A read-only `tools/call` must reach and be accepted by the backend.

An Exposition can be ready in the control plane while no running proxy has registered a matching Gateway. Proxy readiness can also be `UP` while a particular Exposition is absent. Keep these checks separate.

## Exposition has no active endpoint

Inspect the Exposition and its target group:

```bash
reshapr expo get "${EXPOSITION_ID}"
reshapr gateway-group list
```

If no endpoint is listed, compare the target Gateway Group labels with the labels advertised by the intended proxy. For a Kubernetes proxy, inspect the rendered environment:

```bash
kubectl get deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --output json \
  | jq -r '.spec.template.spec.containers[0].env[]
      | select(.name == "RESHAPR_GATEWAY_LABELS")
      | .value'
```

For a standalone container, inspect its startup configuration or logs. A proxy must register a Gateway with labels compatible with the target group. Labels are selection criteria; a mismatch does not set the Exposition or GatewayGroup CR to `ERROR`.

Correct either the advertised Gateway labels or the intended Gateway Group, roll out the affected proxy, and wait for registration. Then repeat:

```bash
reshapr expo get "${EXPOSITION_ID}"
```

Recovery is complete when the expected hostname advertised by the registered Gateway appears in `ENDPOINTS`.

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

`CustomTools`, `Resources`, `Prompts`, `Skills`, and `ToolsOutputFilters` use a different status shape in controllers `0.0.5`. For example, check the following three artifact kinds:

```bash
kubectl get customtools.reshapr.io,resources.reshapr.io,prompts.reshapr.io \
  --namespace "${APP_NAMESPACE}" \
  --output json | jq -r '
    .items[] |
    [.kind, .metadata.name, .status.state, (.status.message // "")] |
    @tsv'
```

Controllers chart `0.0.18` packages all ten release CRDs and defaults to `nightly`. If any CRD is missing after upgrading, follow the [CRD update steps](./upgrade-and-rotate.md). Confirm both the running image and the ConfigurationPlan schema:

```bash
kubectl get deployment/reshapr-controllers-operator \
  --namespace "${PLATFORM_NAMESPACE}" \
  --output jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl get crd configurationplans.reshapr.io \
  --output json \
  | jq '.spec.versions[] | select(.name == "v1alpha1")
      | .schema.openAPIV3Schema.properties.spec.properties
      | {includedOperations, headerPolicy}'
```

The image must end in `:0.0.5`, and both schema properties must be present. If the image differs, set `operator.image.tag=0.0.5` and restart the operator. If an installation upgraded from an earlier chart still has old schemas, apply the release CRDs explicitly because Helm does not upgrade them automatically. Do not apply `resources.reshapr.io` over controllers `0.0.2`: its kind changed immutably, so follow **[Upgrade reShapr and Rotate Runtime Secrets](./upgrade-and-rotate.md#upgrade-the-web-ui-and-controllers)** for that CRD.

Controllers `0.0.4` use the plural `Resources` kind. If Kubernetes reports no match for `kind: Resource`, update the manifest to `kind: Resources` and confirm that the `resources.reshapr.io` CRD also reports `spec.names.kind: Resources`. The old `Unsupported artifact kind and version: Resource - reshapr.io/v1alpha1` error identifies a controllers `0.0.2` operator that still emits the singular artifact kind.

If the status does not explain the failure, inspect the operator logs:

```bash
kubectl logs \
  --namespace "${PLATFORM_NAMESPACE}" \
  --selector app.kubernetes.io/component=operator \
  --tail 200
```

After correcting the resource, rerun the first status command. Recovery requires `READY` with matching generations, followed by an endpoint in `reshapr expo get`.

## Proxy is not ready or Gateway is not registered

Inspect the workload before changing registration settings:

```bash
kubectl get pods --namespace "${PROXY_NAMESPACE}"
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --tail 200
```

Check, in this order:

- DNS and TCP reachability from the proxy to the configured control-plane host and port;
- whether the control-plane connection expects TLS or plaintext;
- the presence and validity of the Gateway API token;
- uniqueness of the Gateway ID among running instances;
- syntactic correctness of advertised FQDNs and labels.

Port-forward the proxy service and query readiness locally:

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

Proxies advertise health for their registered Gateways every two minutes. The control plane considers a registration stale after five minutes without an advertisement, and cleanup runs periodically. Do not use the stale-registration window as a readiness test.

## Proxy did not receive a recent change

First verify that the Kubernetes generation, when applicable, has been observed and that the control-plane representation has the expected values. Then inspect proxy logs for change-stream or re-registration errors:

```bash
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --since 15m
```

An initialized proxy keeps the last configuration it fetched while synchronization is unavailable. During that interval, new or updated Expositions can be absent and deleted ones can remain locally.

During a `1.1.0` Compose replay, the log message `Exposition changes stream has been terminated` coincided with newly created endpoints returning `404`, even though control-plane endpoints were listed and proxy readiness was `UP`. Restarting the affected local proxy restored discovery. Preserve the logs first; for the release-owned local Compose stack, restart only that service and wait for readiness:

```bash
docker compose --file "$HOME/.reshapr/docker-compose-1.1.0.yml" restart gateway-01
docker compose --file "$HOME/.reshapr/docker-compose-1.1.0.yml" \
  up --detach --wait --wait-timeout 180
```

This is a recovery step, not a guarantee of uninterrupted live propagation. Repeat MCP discovery after the restart.

Restore proxy-to-control-plane connectivity and wait for stream retry or health-triggered re-registration. If the process cannot recover, perform a controlled rollout after preserving its logs:

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
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-troubleshooting","version":"1.1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
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

A Tool execution failure normally appears in the JSON-RPC result rather than as an endpoint-authentication status. Inspect the full result and correlate it with proxy logs:

```bash
kubectl logs deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --since 5m
```

Check the configured backend URL, DNS, egress policy, TLS trust, backend timeout, and backend credential independently. A proxy-generated `504` result indicates that the backend exceeded the configured timeout. Other backend HTTP statuses can be propagated into the Tool result.

Run a direct request from an approved diagnostic workload in the same network boundary when policy permits. Do not print credentials or weaken TLS to make the test pass.

Recovery requires a read-only `tools/call` whose result is not marked `isError: true` and whose expected backend content is present.

## Enable debug logs temporarily

:::warning Sensitive diagnostic data
Proxy DEBUG logs can contain incoming MCP headers and arguments and outgoing backend headers after credentials have been injected. Restrict access, redact credentials and personal data before sharing logs, and restore the previous level after diagnosis. Do not enable DEBUG permanently.
:::

Set `QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL=DEBUG` on the proxy process, or `QUARKUS_LOG_CATEGORY__IO_RESHAPR_CTRL__LEVEL=DEBUG` on the control plane. Changing only `QUARKUS_LOG_CONSOLE_LEVEL` does not enable a category's DEBUG messages. A separately restricted console handler must also allow DEBUG.

DEBUG exposes backend URLs, request headers, response statuses, and response headers, not a general dump of backend bodies. Some backend request bodies are logged at TRACE. Setting TRACE at runtime does not restore statements excluded by the image's build-time minimum log level.

### Kubernetes with Helm

Merge the following into a **complete copy of your proxy values**. `extraEnv` replaces the chart's list, so keep `QUARKUS_OTEL_SDK_DISABLED=true` when telemetry is intentionally disabled, or retain your existing OTLP settings instead:

```yaml
extraEnv:
  - name: QUARKUS_OTEL_SDK_DISABLED
    value: "true"
  - name: QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL
    value: DEBUG
```

Upgrade the existing release with all its current settings, not just this fragment. Names below are examples:

```bash
helm upgrade '<proxy-release>' \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version 0.0.18 --namespace "${PROXY_NAMESPACE}" \
  --values '<complete-proxy-values-with-debug.yaml>'
kubectl rollout status deployment/reshapr-proxy --namespace "${PROXY_NAMESPACE}"
kubectl logs deployment/reshapr-proxy --namespace "${PROXY_NAMESPACE}" --since 5m
```

For the control plane, use `ctrl.extraEnv` with `QUARKUS_LOG_CATEGORY__IO_RESHAPR_CTRL__LEVEL`. For the controllers, use `operator.extraEnv` or, since chart `0.0.15`, `admissionController.extraEnv`, with `QUARKUS_LOG_CATEGORY__IO_RESHAPR_KUBERNETES__LEVEL`. Keep existing list entries and pin controller images to `0.0.4`. Inspect the actual Deployment name with `kubectl get deployments` if it differs.

Reproduce one failing call, collect restricted logs, then remove the temporary category entry (or restore its previous value) and repeat the upgrade. Verify the rollout and return to normal logging.

### Docker Compose, including `reshapr run`

The CLI has no arbitrary environment or Compose override flag. For a stack started with `reshapr run --release 1.2.0`, it caches the base file at `~/.reshapr/docker-compose-1.2.0.yml` and passes explicit `-f` arguments: a neighboring `docker-compose.override.yml` is **not** loaded automatically.

Edit the cached file's existing proxy service (`gateway-01`) and add the category to its `environment` list:

```yaml
- QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL=DEBUG
```

For the control-plane service, add `QUARKUS_LOG_CATEGORY__IO_RESHAPR_CTRL__LEVEL=DEBUG` instead. Preserve every other setting. Rerun the same `reshapr run --release 1.2.0` command, including `--ui` if originally used, so Compose recreates the affected container. Then read logs:

```bash
docker logs --since 5m reshapr-gateway-01
```

For a manually managed stack, edit its Compose file and run `docker compose -f '<your-compose-file.yml>' up -d`, preserving its original project name and file list. Do not expect exporting the log variable in the shell to reach the container unless the Compose file explicitly interpolates or passes it.

Remove the temporary entry and rerun the same startup command to restore normal logging. Editing the cached file retains the CLI's recorded file paths, so `reshapr status` and `reshapr stop` continue to target that stack. Replacing the stack manually with a different file/project is not tracked automatically by the CLI.

### Podman and standalone containers

For a CLI-managed Podman stack, use the same cached-file procedure and the same original engine selection; read logs with `podman logs --since 5m reshapr-gateway-01`. For manually managed Compose, use `podman compose` with the same file/project arguments as the initial deployment. A Compose provider must be installed.

For standalone `docker run` or `podman run`, add `--env QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL=DEBUG` to the original launch configuration and recreate the container while preserving volumes, networking, credentials, and other options. `docker exec export ...` cannot reconfigure the running Java process. Remove the option and recreate again after diagnosis.

See [Logging](../../references/logging.md) for component categories, handler thresholds, Web UI console output, and the distinction between DEBUG and TRACE. Debug logging can expose credentials; keep the warning above with any copied runbook.

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

The first failing layer now has an observable recovery check: reconciled desired state, a matching and ready proxy, a synchronized MCP surface, accepted endpoint credentials, or a successful backend call.

## Limits

- A `READY` custom resource proves control-plane reconciliation, not Gateway selection, proxy synchronization, ingress, or backend health.
- Proxy readiness proves initial control-plane connectivity, not that every Exposition is loaded or every backend is reachable.
- Release `1.1.0` retains the last fetched local registry during synchronization loss; this is not an offline-operation guarantee.
- Controllers `0.0.4` do not expose one uniform status contract for all custom resources.
- Logs and telemetry depend on the deployment's collection and retention configuration.

## Next step

Use **[Observe the reShapr Proxy](./observe-and-audit.md)** to export the signals used here. Review **[Control Plane to Proxy Synchronization](../../explanations/control-plane-gateway-synchronization.md)** for the registration, streaming, heartbeat, and recovery model.

The release-tagged [reShapr runtime](https://github.com/reshaprio/reshapr/tree/1.1.0) and [controllers documentation](https://github.com/reshaprio/reshapr-controllers/tree/0.0.5/documentation) remain the canonical behavioral references.