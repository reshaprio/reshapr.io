---
description: Organize, reconcile, update, and safely remove reShapr Kubernetes resources through a GitOps workflow.
verification:
  product: reShapr controllers
  version: 0.0.3
  date: 2026-09-22
release_review:
  runtime: 1.2.0
  controllers: 0.0.5
  date: 2026-11-20
  scope: release-tagged CRD and reconciler review; no live GitOps replay
---

# Manage reShapr Resources with GitOps

Use this guide to manage reShapr custom resources as desired state without coupling the repository to Flux, Argo CD, or another reconciliation engine.

## Prerequisites

- A Kubernetes cluster with reShapr controllers `0.0.5` installed
- A registered operator identity with access to the target reShapr `1.2.0` organization
- `kubectl` access to the application and `reshapr-system` namespaces
- A Git repository reconciled to the cluster
- A completed **[first GitOps-managed MCP endpoint](../tutorials/first-gitops-mcp-endpoint.md)** or equivalent Service, ConfigurationPlan, and Exposition

The [controllers documentation at `0.0.5`](https://github.com/reshaprio/reshapr-controllers/tree/0.0.5/documentation) owns the complete CRD behavior. This guide focuses on repository structure and lifecycle decisions.

## Organize resources by dependency

Keep shared platform objects separate from endpoint-specific resources, and make dependencies visible in file names or reconciliation units:

```text
environments/
└── production/
    ├── platform/
    │   ├── 10-secret-sources.yaml
    │   └── 20-gateway-groups.yaml
    └── endpoints/
        └── open-meteo/
            ├── 10-service.yaml
            ├── 20-custom-tools.yaml
            ├── 21-resources.yaml
            ├── 30-configuration-plan.yaml
            └── 40-exposition.yaml
```

:::tip
This layout is a suggestion, not a requirement. Organize the resources according to your existing repository structure, naming conventions, and GitOps practices; what matters is that dependencies and reconciliation order remain understandable.
:::

Reconcile a Service and GatewayGroup before the objects that refer to them. Reconcile the Exposition last because it requires a ready Service, ConfigurationPlan, and GatewayGroup in the control plane.

File names alone do not make every GitOps engine wait for readiness. When your engine supports health checks or dependencies, define separate reconciliation units and require the dependencies to become ready before applying the Exposition.

## Keep credentials out of custom resources

Do not commit tokens or passwords directly in a `SecretSource`. Commit only a reference to a Kubernetes Secret in the same namespace:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: SecretSource
metadata:
  name: backend-credentials
  namespace: production
  annotations:
    reshapr.io/instance: reshapr-control-plane-ctrl.reshapr-system
    reshapr.io/organization: reshapr
spec:
  secrets:
    - name: weather-backend-token
      description: Token used to call the weather backend
      type: ENDPOINT
      valuesFrom:
        secretRef: weather-backend-credentials
        tokenKey: token
        tokenHeaderKey: token-header
```

Create the referenced Kubernetes Secret with your secret-management system. The operator requires its separate Secret-reader RBAC to read it. The [`SecretSource` reference](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/secretsource-cr.md) lists the supported keys and cleanup behavior.

Check each synchronized entry rather than relying only on the aggregate state:

```bash
kubectl get secretsource backend-credentials \
  --namespace production \
  --output json | jq '{status: .status.status, observed: .status.observedGeneration, conditions: .status.conditions}'
```

## Observe reconciliation correctly

`Service`, `GatewayGroup`, `ConfigurationPlan`, `Exposition`, and `SecretSource` report their phase in `status.status`. A successful reconciliation sets `status.observedGeneration` to the current `metadata.generation`:

```bash
kubectl get services.reshapr.io,gatewaygroups.reshapr.io,configurationplans.reshapr.io,expositions.reshapr.io,secretsources.reshapr.io \
  --namespace production \
  --output json | jq -r '
    .items[] |
    [.kind, .metadata.name, .status.status, .metadata.generation, .status.observedGeneration, (.status.message // "")] |
    @tsv'
```

Treat a resource as reconciled only when its phase is `READY` and the two generations match. `ERROR` indicates a rejected or unresolved desired state; use `status.message` and the operator logs to diagnose it. `IN_PROGRESS`, `UNKNOWN`, and `PREEXISTING` are not equivalent to `READY`.

`CustomTools`, `Resources`, `Prompts`, `Skills`, and `ToolsOutputFilters` use `status.state` and do not expose `observedGeneration` in controllers `0.0.5`. For example, check the following three artifact kinds:

```bash
kubectl get customtools.reshapr.io,resources.reshapr.io,prompts.reshapr.io \
  --namespace production \
  --output json | jq -r '
    .items[] |
    [.kind, .metadata.name, .status.state, (.status.message // "")] |
    @tsv'
```

Use distinct custom resource names for artifacts attached to the same Service. Controllers `0.0.5` pass the custom resource name as the artifact name. After upgrading, verify existing attachments before pruning any artifact originally attached by an earlier release.

## Update a ConfigurationPlan through Git

Add a request-header policy to the tracked ConfigurationPlan. This example keeps two incoming headers, drops one explicitly, and renames one before the backend call:

```yaml
spec:
  includedOperations:
    - GET /v1/forecast
  headerPolicy:
    request:
      allow:
        - X-Request-Id
        - X-Client-Id
      deny:
        - X-Internal-Debug
      rename:
        - from: X-Client-Id
          to: X-Consumer-Id
```

Review the Kubernetes diff:

```bash
kubectl diff --filename environments/production/endpoints/open-meteo
```

Commit and push the change:

```bash
git add environments/production/endpoints/open-meteo/30-configuration-plan.yaml
git commit -m 'Configure Open-Meteo request headers'
git push
```

Wait for your GitOps controller to apply the commit. Then confirm that the ConfigurationPlan has observed its new generation:

```bash
kubectl get configurationplan open-meteo-gitops-configurationplan \
  --namespace production \
  --output jsonpath='{.status.status}{" generation="}{.metadata.generation}{" observed="}{.status.observedGeneration}{"\n"}'
```

Finish with a real call to the affected MCP endpoint. Kubernetes readiness proves reconciliation, not backend reachability or a successful Tool response.

## Remove resources without leaving surprises

Delete dependants before their dependencies:

1. Expositions
2. ConfigurationPlans
3. CustomTools and Resources
4. Services
5. GatewayGroups that are no longer shared
6. SecretSources that are no longer referenced

Remove the corresponding files in one reviewable change, or split the removal into ordered reconciliation units when your GitOps engine cannot guarantee deletion order.

For `Service`, `GatewayGroup`, `Exposition`, and `SecretSource`, `spec.keepOnDelete` defaults to `false`: deleting the custom resource also asks the operator to delete the corresponding remote object. Set it to `true` before removal only when the remote object must intentionally outlive Kubernetes management.

ConfigurationPlans are cleaned up remotely by their reconciler and do not expose `keepOnDelete` in controllers `0.0.5`.

Controllers `0.0.5` also clean up the attached artifact on deletion of a `CustomTools`, `Resources`, `Prompts`, `Skills`, or `ToolsOutputFilters` custom resource. Set `spec.keepOnDelete: true` before deleting the custom resource to retain its artifact. If the parent Service is deleted, its attached artifacts are removed with it.

Do not remove CRDs as part of an application cleanup. Deleting a CRD deletes every custom resource of that kind across the cluster.

## Result

The repository expresses resource dependencies, sensitive values remain outside tracked custom resources, status checks match each CRD's actual contract, and updates or removals have an explicit verification and cleanup path.

## Limits

- This guide does not configure a GitOps engine or prescribe its dependency and health-check syntax.
- Controllers `0.0.5` do not expose a uniform readiness contract across all ten custom resources. Check each kind's contract in the [Kubernetes API reference](../references/kubernetes-apis.md).
- `keepOnDelete` preserves remote state but does not transfer that state to another Kubernetes resource.
- A successful reconciliation does not test ingress, proxy health, backend authentication, or Tool execution.

## Next step

Use **[Deploy reShapr on Kubernetes for Production](./deploy-kubernetes-production.md)** to turn the surrounding platform into a production-oriented topology, or review **[Kubernetes APIs and Controllers](../references/kubernetes-apis.md)** for the owner of every CRD contract.