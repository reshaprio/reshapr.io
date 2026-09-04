---
description: Upgrade a Kubernetes reShapr deployment and rotate endpoint, Gateway, and backend credentials with explicit recovery boundaries.
verification:
  product: reShapr stack
  version: 0.2.3 / controllers 0.0.1 / charts 0.0.11
  date: 2026-09-04
---

# Upgrade reShapr and Rotate Runtime Secrets

Use this runbook to upgrade an existing Kubernetes deployment to reShapr `0.2.3`, controllers `0.0.1`, and Helm charts `0.0.11`. It also covers manual rotation of an Exposition API key, a Gateway registration token, and a backend credential referenced through `${env:...}`.

This is not a universal upgrade path from every earlier release. Validate the exact source-to-target path in staging before changing production.

## Prerequisites

You need:

- the four reShapr releases installed as described in **[Deploy reShapr on Kubernetes for Production](../deploy-kubernetes-production.md)**;
- tracked and reviewable Helm values for every installed release;
- access to the [reShapr `0.2.3` release](https://github.com/reshaprio/reshapr/releases/tag/0.2.3) and [charts `0.0.11` release](https://github.com/reshaprio/reshapr-helm-charts/releases/tag/0.0.11);
- an externally managed PostgreSQL service with a tested backup and restore procedure;
- maintenance authority for Gateway and client credentials;
- one active Exposition and one non-destructive Tool for post-upgrade checks;
- Helm, `kubectl`, `curl`, `jq`, and reShapr CLI `0.2.3`.

Set the release names and namespaces used by this runbook:

```bash
export PLATFORM_NAMESPACE='reshapr-system'
export PROXY_NAMESPACE='reshapr-proxies'
export CONTROL_PLANE_RELEASE='reshapr-control-plane'
export WEB_UI_RELEASE='reshapr-ui'
export CONTROLLERS_RELEASE='reshapr-controllers'
export PROXY_RELEASE='reshapr-proxy'
export TARGET_CHART_VERSION='0.0.11'
export TARGET_RUNTIME_VERSION='0.2.3'
export TARGET_CONTROLLERS_VERSION='0.0.1'
export MCP_URL='https://<gateway-host>/mcp/<organization>/<exposition-name>'
export EXPOSITION_ID='<exposition-id>'
```

## Review the upgrade before applying it

Read both target release notes. Check for compatibility requirements, removed values, changed defaults, database migrations, and manual steps. Do not infer runtime compatibility from the chart version alone.

Record the installed releases and user-supplied values:

```bash
mkdir -p upgrade-evidence

helm list --all-namespaces > upgrade-evidence/helm-list-before.txt
helm get values "${CONTROL_PLANE_RELEASE}" --namespace "${PLATFORM_NAMESPACE}" --output yaml \
  > upgrade-evidence/control-plane-values-before.yaml
helm get values "${WEB_UI_RELEASE}" --namespace "${PLATFORM_NAMESPACE}" --output yaml \
  > upgrade-evidence/web-ui-values-before.yaml
helm get values "${CONTROLLERS_RELEASE}" --namespace "${PLATFORM_NAMESPACE}" --output yaml \
  > upgrade-evidence/controllers-values-before.yaml
helm get values "${PROXY_RELEASE}" --namespace "${PROXY_NAMESPACE}" --output yaml \
  > upgrade-evidence/proxy-values-before.yaml
```

Inspect the target defaults next to your tracked values:

```bash
helm show values \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version "${TARGET_CHART_VERSION}" \
  > upgrade-evidence/control-plane-target-defaults.yaml

helm show values \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version "${TARGET_CHART_VERSION}" \
  > upgrade-evidence/proxy-target-defaults.yaml
```

Repeat `helm show values` for installed optional charts. Merge every required current override into the tracked target values rather than relying on `--reuse-values` across a changed values schema.

For chart `0.0.11`, replace the deprecated `gateway.controlPlane.token` proxy value with `gateway.controlPlane.existingSecret` and `gateway.controlPlane.tokenKey`. Never copy secret values into a values file.

Pin these image fields in the reviewed files:

| File | Field | Target |
|---|---|---|
| `values/control-plane.yaml` | `ctrl.image.tag` | `0.2.3` |
| `values/web-ui.yaml` | `image.tag` | `0.2.3` |
| `values/proxy.yaml` | `image.tag` | `0.2.3` |
| `values/controllers.yaml` | `operator.image.tag` | `0.0.1` |
| `values/controllers.yaml` | `admissionController.image.tag` | `0.0.1` |

Render and review each target release with `helm template` in staging or CI before proceeding.

## Establish the recovery point

Run the database owner's backup procedure and restore that backup into an isolated database. Record the successful backup identifier and restore test:

```bash
export DATABASE_BACKUP_ID='<tested-backup-id>'
test -n "${DATABASE_BACKUP_ID}"
```

The charts do not create or test PostgreSQL backups. Do not continue if the restore has not been exercised for this upgrade.

Capture the current Helm revisions and baseline behavior:

```bash
helm history "${CONTROL_PLANE_RELEASE}" --namespace "${PLATFORM_NAMESPACE}"
helm history "${PROXY_RELEASE}" --namespace "${PROXY_NAMESPACE}"
reshapr info
reshapr expo get "${EXPOSITION_ID}"
```

Send a `server/discover` request and one known read-only Tool call. Retain their non-sensitive outcomes for comparison after the upgrade.

When proxy clustering is enabled with the chart-generated keystore, record the mounted Secret name and UID without reading its data:

```bash
export PROXY_KEYSTORE_SECRET="$(
  kubectl get deployment/reshapr-proxy \
    --namespace "${PROXY_NAMESPACE}" \
    --output json \
  | jq -er '.spec.template.spec.volumes[]
      | select(.name == "cluster-keystore")
      | .secret.secretName'
)"

export PROXY_KEYSTORE_UID="$(
  kubectl get secret "${PROXY_KEYSTORE_SECRET}" \
    --namespace "${PROXY_NAMESPACE}" \
    --output jsonpath='{.metadata.uid}'
)"
```

Skip this check when clustering is disabled. The generated Secret has Helm's `keep` policy and must be reused by every pod in the rolling upgrade.

## Upgrade the control plane

The control plane runs Flyway migrations at startup. Upgrade it first and wait for readiness before changing its clients:

```bash
helm upgrade "${CONTROL_PLANE_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version "${TARGET_CHART_VERSION}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  --values values/control-plane.yaml

kubectl rollout status deployment/reshapr-control-plane-ctrl \
  --namespace "${PLATFORM_NAMESPACE}" \
  --timeout 5m
```

Inspect startup output for Flyway or database errors, then check readiness and the reported runtime version:

```bash
kubectl logs deployment/reshapr-control-plane-ctrl \
  --namespace "${PLATFORM_NAMESPACE}" \
  --since 15m

curl --fail --silent https://<control-plane-host>/q/health/ready | jq -er '.status'
reshapr info
```

Stop the rollout if readiness fails or the server does not report `0.2.3`. Preserve logs and database state before attempting recovery.

## Upgrade the Web UI and controllers

Upgrade only the optional releases you have installed:

```bash
helm upgrade "${WEB_UI_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-web-ui \
  --version "${TARGET_CHART_VERSION}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  --values values/web-ui.yaml

helm upgrade "${CONTROLLERS_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-controllers \
  --version "${TARGET_CHART_VERSION}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  --values values/controllers.yaml
```

Wait for their workloads and inspect reconciled resources:

```bash
kubectl get pods --namespace "${PLATFORM_NAMESPACE}" \
  --selector app.kubernetes.io/instance="${WEB_UI_RELEASE}"
kubectl get pods --namespace "${PLATFORM_NAMESPACE}" \
  --selector app.kubernetes.io/instance="${CONTROLLERS_RELEASE}"

kubectl get services.reshapr.io,gatewaygroups.reshapr.io,configurationplans.reshapr.io,expositions.reshapr.io,secretsources.reshapr.io \
  --all-namespaces
```

Helm retains CRDs and does not treat them like ordinary release templates. Never delete a CRD as an upgrade or rollback step: deletion removes every custom resource of that kind across namespaces. Follow release-specific CRD instructions when a target changes their schemas.

## Upgrade the Gateways

Apply the reviewed proxy values and wait for the rollout:

```bash
helm upgrade "${PROXY_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version "${TARGET_CHART_VERSION}" \
  --namespace "${PROXY_NAMESPACE}" \
  --values values/proxy.yaml

kubectl rollout status deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --timeout 5m

curl --fail --silent https://<gateway-host>/q/health/ready | jq -er '.status'
```

If you recorded a chart-generated clustering keystore, verify that the same Secret survived:

```bash
test "$(
  kubectl get secret "${PROXY_KEYSTORE_SECRET}" \
    --namespace "${PROXY_NAMESPACE}" \
    --output jsonpath='{.metadata.uid}'
)" = "${PROXY_KEYSTORE_UID}"
```

Do not delete or regenerate this Secret during a rolling upgrade. Rotating the clustering key is a separate, disruptive operation because all members must restart with the same key.

## Verify the upgraded path

Confirm the Exposition still lists the expected Gateway endpoint:

```bash
reshapr expo get "${EXPOSITION_ID}"
```

Discover the MCP server through its public route:

```bash
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-upgrade-check","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "${MCP_URL}" | jq -er '.result.supportedVersions'
```

Repeat the baseline read-only Tool call and compare its result. Also inspect error rate, latency, Gateway logs, and audit signals through at least one normal telemetry interval before closing the maintenance window.

## Recover from a failed upgrade

Use `helm history` to identify the previous release revision. For Web UI, controllers, or proxy manifest failures, roll back the affected release and repeat its health checks:

```bash
helm rollback '<release-name>' '<previous-revision>' \
  --namespace '<release-namespace>' \
  --wait
```

Do not blindly apply this command to a failed control-plane upgrade. `helm rollback` reapplies Kubernetes manifests, but it does not reverse Flyway migrations, restore database contents, or downgrade CRDs.

For a control-plane failure:

1. stop application writes according to your incident procedure;
2. determine from the release notes whether the previous runtime is compatible with the migrated schema;
3. if it is compatible, roll back the control-plane Helm revision and verify it;
4. if it is not compatible, follow the database owner's tested restore procedure for `${DATABASE_BACKUP_ID}` and restore the matching Helm revision;
5. verify control-plane readiness, Gateway registration, the Exposition, and the read-only Tool call.

These are manual recovery decisions. reShapr does not provide automated application rollback, schema rollback, or database restore.

## Rotate an Exposition API key

Renew the key on the Configuration Plan used by the Exposition:

```bash
export CONFIGURATION_PLAN_ID='<configuration-plan-id>'
reshapr config renew-api-key "${CONFIGURATION_PLAN_ID}"
```

The CLI displays the new key once. Store it in the client secret manager immediately and treat the previous key as invalid. Update authorized MCP clients, verify that the new key succeeds, and verify that the old key receives HTTP `401`.

There is no documented overlap or scheduled rotation mechanism in `0.2.3`. Coordinate clients before renewal when an immediate cutover would interrupt them.

## Rotate a Gateway registration token

Create a replacement token without deleting the current one:

```bash
reshapr api-token create 'prod-gateway-rotation' --validity-days 30
```

Store the displayed value immediately. Update the `token` key in the Kubernetes Secret referenced by `gateway.controlPlane.existingSecret`. Use your secret manager's normal synchronization path; for a controlled manual update, read the value without adding it to shell history:

```bash
read -r -s -p 'Replacement Gateway token: ' NEW_GATEWAY_TOKEN
printf '\n'

printf '%s' "${NEW_GATEWAY_TOKEN}" \
  | kubectl create secret generic reshapr-gateway-token \
      --namespace "${PROXY_NAMESPACE}" \
      --from-file=token=/dev/stdin \
      --dry-run=client \
      --output yaml \
  | kubectl apply --filename -

unset NEW_GATEWAY_TOKEN
kubectl rollout restart deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}"
kubectl rollout status deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --timeout 5m
```

Require readiness `UP`, an endpoint in `reshapr expo get`, and a successful MCP discovery. Then list tokens, identify the old token by ID, and revoke it:

```bash
reshapr api-token list
reshapr api-token delete '<old-token-id>'
```

Repeat this sequence for every Gateway release that uses the old token. Token creation, workload replacement, verification, and old-token revocation are operator-managed steps.

## Rotate a backend `${env:...}` credential

When a control-plane Secret stores a reference such as `${env:BACKEND_API_TOKEN}`, update `BACKEND_API_TOKEN` in the secret manager that supplies the Gateway workload. Keep the reference itself unchanged.

Kubernetes environment variables are fixed for the lifetime of a container. Trigger a rollout so new pods receive the new value:

```bash
kubectl rollout restart deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}"
kubectl rollout status deployment/reshapr-proxy \
  --namespace "${PROXY_NAMESPACE}" \
  --timeout 5m
```

Verify Gateway readiness and repeat a read-only Tool call that requires the backend credential. Revoke the previous backend credential only after the new value is accepted. Coordinate an overlap in the backend credential system when uninterrupted calls are required.

## Result

The Helm releases use charts `0.0.11`, runtime workloads use `0.2.3`, controllers use `0.0.1`, the database recovery point remains external and tested, and each rotated credential has an explicit replacement and verification step.

## Limits

- Flyway migrations run at control-plane startup. Helm rollback cannot reverse them or restore data.
- PostgreSQL backup, restore, retention, and recovery testing belong to the database operator.
- Helm does not provide automatic CRD downgrade or deletion during rollback.
- The generated proxy clustering keystore is retained across upgrades; rotating it requires a separately planned simultaneous restart.
- API-key, Gateway-token, and `${env:...}` rotations are not scheduled or automated by reShapr `0.2.3`.
- A successful rollout does not by itself validate ingress, Exposition propagation, endpoint authorization, or backend behavior.

## Next step

Use **[Troubleshoot an Exposition or Gateway](./troubleshoot.md)** when a post-upgrade check fails, and **[Observe the reShapr Gateway](./observe-and-audit.md)** to compare telemetry across the maintenance window.

The release-tagged [Helm chart documentation](https://github.com/reshaprio/reshapr-helm-charts/tree/0.0.11) and [reShapr runtime](https://github.com/reshaprio/reshapr/tree/0.2.3) remain the canonical references.