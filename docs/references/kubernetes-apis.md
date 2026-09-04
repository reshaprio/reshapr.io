---
description: Find the seven reShapr Kubernetes APIs and understand the operator and admission controller boundaries.
---

# Kubernetes APIs and Controllers Overview

The [`reshapr-controllers`](https://github.com/reshaprio/reshapr-controllers) repository provides a Kubernetes operator, seven namespaced custom resources, and an admission webhook for proxy sidecar injection. Its [documentation index](https://github.com/reshaprio/reshapr-controllers/tree/main/documentation) and [generated CRDs](https://github.com/reshaprio/reshapr-controllers/tree/main/deploy/crd) are the canonical references.

## Operator model

The operator reconciles Kubernetes resources against a reachable reShapr control plane. Resources use the `reshapr.io/v1alpha1` API and identify their target through `reshapr.io/instance` and `reshapr.io/organization` annotations. Reconciliation progress and control-plane identifiers are reported in each resource's status.

The operator ServiceAccount must be registered as a trusted control-plane client. See the canonical [instance connection flow](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/instance-connection.md) and [operator installation](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/installation-operator.md).

## Custom resources

| Kind | Role and dependencies | Deletion behavior | Canonical reference |
|---|---|---|---|
| `Service` | Imports the primary OpenAPI, GraphQL, or Protobuf artifact | Remote Service cleanup is enabled by default; `keepOnDelete` can retain it | [Service CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/service-cr.md) |
| `GatewayGroup` | Declares the labels used to select Gateways | Remote Gateway Group cleanup is enabled by default; `keepOnDelete` can retain it | [GatewayGroup CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/gatewaygroup-cr.md) |
| `ConfigurationPlan` | Binds an existing Service to a backend endpoint and security configuration | The reconciler cleans up its remote Configuration Plan | [ConfigurationPlan CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/configurationplan-cr.md) |
| `Exposition` | Exposes a Service through a ready Configuration Plan and Gateway Group | Remote Exposition cleanup is enabled by default; `keepOnDelete` can retain it | [Exposition CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/exposition-cr.md) |
| `SecretSource` | Declares control-plane Secrets, optionally sourced from Kubernetes Secrets | Remote Secret cleanup is enabled by default; `keepOnDelete` can retain it | [SecretSource CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/secretsource-cr.md) |
| `CustomTools` | Attaches declarative or scripted tools to an existing Service | No remote artifact cleanup is implemented when the CR is deleted | [CustomTools CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/customtools-cr.md) |
| `Resource` | Attaches MCP resources and resource templates to an existing Service | No remote artifact cleanup is implemented when the CR is deleted | [Resource CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/resource-cr.md) |

There are no dedicated `Prompts` or `ToolsOutputFilters` CRDs in the current API set.

## Admission controller

The mutating admission webhook injects a reShapr proxy sidecar into Pods annotated with `io.reshapr/inject: "true"`. For workloads owned by a Deployment, its controller can also create the headless clustering Service and the MCP Service used to reach injected proxies.

The webhook is fail-open by default through `failurePolicy: Ignore`. Its serving endpoint requires TLS; the controllers chart supports cert-manager, OpenShift service certificates, or an existing certificate. See the canonical [admission controller](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/admission-controller.md) and [installation guide](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/installation-admission.md).

## Limits

- `CustomTools` and `Resource` deletion can leave their remote artifacts in the target Service.
- Reading Kubernetes Secrets for `SecretSource` requires the operator's separate Secret-reader RBAC.
- The admission controller creates supporting Services only for injected Pods owned by a Deployment.
- Controller-specific metrics and traces are not currently documented as a supported observability surface; rely on component logs unless the owner documentation states otherwise.

## Next step

- Use **[Your First GitOps-managed MCP Endpoint](../tutorials/first-gitops-mcp-endpoint.md)** to create and verify an endpoint from these APIs.
- Use **[Manage reShapr Resources with GitOps](../how-to-guides/manage-resources-with-gitops.md)** to operate their update and deletion lifecycle.
- Use **[Helm Charts Overview](./helm-charts.md)** to choose the controllers chart and its dependencies.
- Use **[Product Interfaces](./interfaces.md)** to find the remaining reShapr contracts.