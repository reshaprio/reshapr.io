---
description: Create and verify a reShapr MCP endpoint from Kubernetes resources managed through Git.
verification:
  product: reShapr stack
  version: 0.2.3 / controllers 0.0.1 / charts 0.0.11
  date: 2026-09-04
---

# Your First GitOps-managed MCP Endpoint

Install the reShapr controllers, commit a small set of Kubernetes resources, and let the operator create an MCP endpoint for the Open-Meteo API.

## Prerequisites

- Kubernetes 1.25 or later and Helm 3.8 or later
- `kubectl`, Helm, Git, `curl`, and `jq`
- A running reShapr `0.2.3` **[control plane](../how-to-guides/deploy-kubernetes-production.md#3-configure-the-control-plane)** and **[proxy](../how-to-guides/deploy-kubernetes-production.md#6-configure-the-proxy)** reachable from the cluster
- The reShapr `0.2.3` CLI authenticated with administrative access to that control plane
- A proxy registered in the control plane's `Default Gateway Group`
- A Git repository whose manifests are applied to the cluster, either manually or by your GitOps controller

This tutorial uses the released reShapr controllers `0.0.1` through Helm chart `0.0.11`. The [controllers chart documentation](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.11/controllers/README.md) owns the complete values contract.

## 1. Register the operator identity

The operator authenticates with a [projected Kubernetes ServiceAccount token](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection). Register its subject with the control plane before installing the chart. Replace the server and organization settings with values for your environment:

```bash
export RESHAPR_ADMIN_API_KEY='<admin-api-key-from-your-secret-manager>'

reshapr admin --server https://reshapr.example.com \
  service-account create reshapr-system-operator \
  --k8s-subject reshapr-system:reshapr-controllers-operator \
  --allowed-organizations '["reshapr"]' \
  --validity-days 90
```

The subject contains the namespace and ServiceAccount created by the Helm release. The [instance connection flow](https://github.com/reshaprio/reshapr-controllers/blob/0.0.1/documentation/instance-connection.md) describes the token exchange and required annotations.

## 2. Install the controllers

Install chart `0.0.11`, which packages controllers `0.0.1`:

```bash
helm install reshapr-controllers \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-controllers \
  --version 0.0.11 \
  --namespace reshapr-system \
  --create-namespace \
  --set admissionController.enabled=false
```

Wait for the operator and confirm that the custom-resource definitions are installed:

```bash
kubectl rollout status deployment/reshapr-controllers-operator \
  --namespace reshapr-system
kubectl get crd | grep 'reshapr.io'
```

The admission controller is enabled by default and requires a serving certificate. This tutorial disables it because operator reconciliation does not use sidecar injection.

## 3. Add the endpoint resources to Git

Create a directory for one environment:

```bash
mkdir -p environments/dev/open-meteo
```

Add the three released sample manifests in dependency order:

```bash
curl --fail --location \
  https://raw.githubusercontent.com/reshaprio/reshapr-controllers/0.0.1/deploy/samples/open-meteo-api-service.yaml \
  --output environments/dev/open-meteo/10-service.yaml
curl --fail --location \
  https://raw.githubusercontent.com/reshaprio/reshapr-controllers/0.0.1/deploy/samples/open-meteo-gitops-configurationplan.yaml \
  --output environments/dev/open-meteo/20-configuration-plan.yaml
curl --fail --location \
  https://raw.githubusercontent.com/reshaprio/reshapr-controllers/0.0.1/deploy/samples/open-meteo-gitops-exposition.yaml \
  --output environments/dev/open-meteo/30-exposition.yaml
```

The first file is a [`Service` custom resource](https://github.com/reshaprio/reshapr-controllers/blob/0.0.1/documentation/service-cr.md):

```yaml
apiVersion: reshapr.io/v1alpha1
kind: Service
metadata:
  name: open-meteo-api
  annotations:
    reshapr.io/instance: reshapr-control-plane-ctrl.reshapr-system
    reshapr.io/organization: reshapr
spec:
  url: https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi/forecast.yml
```

Instead of imperatively importing this API contract through the reShapr API or CLI, the CR records the same desired outcome in Kubernetes. `apiVersion` and `kind` select the operator contract, the annotations select the target reShapr instance and organization, and `spec.url` identifies the API contract to import. The operator observes this desired state, calls the control-plane API, and reports the result in the CR's `status`.

This declarative model applies to the capabilities represented by the [current reShapr CRDs](../references/kubernetes-apis.md). It does not imply that every API operation or CLI command has a Custom Resource equivalent.

Each resource carries two annotations that select the control-plane instance and organization. Review them before committing:

```bash
grep -R 'reshapr.io/instance\|reshapr.io/organization' environments/dev/open-meteo
```

If your control-plane Service or organization differs from the sample, update both annotations consistently. The released Exposition sample selects the control plane's `Default Gateway Group`.

Commit the desired state:

```bash
git add environments/dev/open-meteo
git commit -m 'Add Open-Meteo MCP endpoint'
git push
```

## 4. Reconcile the resources

If a GitOps controller watches this repository, wait for its next reconciliation. For a first local pass without one, apply the same committed directory directly:

```bash
kubectl apply --filename environments/dev/open-meteo
```

Watch the operator-owned status fields:

```bash
kubectl get services.reshapr.io,configurationplans.reshapr.io,expositions.reshapr.io \
  --namespace default \
  --watch
```

All three resources should reach `READY`. The Exposition status must also report the current Kubernetes generation:

```bash
kubectl get exposition open-meteo-gitops-exposition \
  --namespace default \
  --output jsonpath='{.status.status}{" generation="}{.metadata.generation}{" observed="}{.status.observedGeneration}{"\n"}'
```

If a resource reports `ERROR`, inspect its status message and the operator logs:

```bash
kubectl get exposition open-meteo-gitops-exposition --namespace default --output yaml
kubectl logs --namespace reshapr-system \
  --selector app.kubernetes.io/component=operator
```

## 5. Call the MCP endpoint

Use the MCP URL exposed by the proxy for the Open-Meteo Service. For a standalone proxy without ingress, first forward its Service:

```bash
kubectl port-forward --namespace reshapr-proxies service/reshapr-proxy 7777:7777
```

In another terminal, set the endpoint path for the organization and Service created by the samples:

```bash
export MCP_URL='http://localhost:7777/mcp/reshapr/Open-Meteo+Weather+Forecast+API/1.0'
```

Discover the server and verify that it exposes MCP capabilities:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-gitops-tutorial","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result | {supportedVersions, capabilities}'
```

## Result

The three Kubernetes resources are committed as desired state, their status is `READY`, the Exposition has observed its current generation, and `server/discover` returns the MCP capabilities exposed by your proxy.

## Limits

- Applying the directory with `kubectl` demonstrates the same declarative resources but does not install or configure a GitOps controller.
- The released Service sample imports the Open-Meteo contract from its upstream default branch, so a later reconciliation can observe upstream contract changes.
- A `READY` Exposition confirms control-plane reconciliation; the final MCP call also depends on a healthy proxy registered in the selected Gateway Group.
- The default admission webhook is fail-open and is not required for operator reconciliation.
- Availability, TLS, secret management, and database durability remain responsibilities of the deployed platform.

## Next step

Use **[Manage reShapr Resources with GitOps](../how-to-guides/manage-resources-with-gitops.md)** to organize updates, Secrets, and cleanup for more endpoints. Then use **[Helm Charts Overview](../references/helm-charts.md)** to choose a production topology.