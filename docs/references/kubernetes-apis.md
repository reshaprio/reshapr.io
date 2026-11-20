---
description: Find the ten reShapr Kubernetes APIs and understand the operator and admission controller boundaries.
release_review:
  runtime: 1.2.0
  controllers: 0.0.5
  charts: 0.0.18
  date: 2026-11-20
  scope: release-tagged reconcilers, status schemas and published CRD packaging; no live cluster replay
---

# Kubernetes APIs and Controllers Overview

 The [`reshapr-controllers`](https://github.com/reshaprio/reshapr-controllers) repository provides a Kubernetes operator, ten namespaced custom resources, and an admission webhook for proxy sidecar injection. The [0.0.5 documentation index](https://github.com/reshaprio/reshapr-controllers/tree/0.0.5/documentation) and [generated CRDs](https://github.com/reshaprio/reshapr-controllers/tree/0.0.5/deploy/crd) are the canonical references for this baseline.

## Operator model

The operator reconciles Kubernetes resources against a reachable reShapr control plane. Resources use the `reshapr.io/v1alpha1` API and identify their target through `reshapr.io/instance` and `reshapr.io/organization` annotations. Reconciliation progress and control-plane identifiers are reported in each resource's status.

The operator ServiceAccount must be registered as a trusted control-plane client. See the canonical [instance connection flow](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/instance-connection.md) and [operator installation](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/installation-operator.md).

## Custom resources

| Kind | Role and dependencies | Deletion behavior | Canonical reference |
|---|---|---|---|
| `Service` | Imports the primary OpenAPI, GraphQL, or Protobuf artifact | Remote Service cleanup is enabled by default; `keepOnDelete` can retain it | [Service CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/service-cr.md) |
| `GatewayGroup` | Declares the labels used to select Gateways | Remote Gateway Group cleanup is enabled by default; `keepOnDelete` can retain it | [GatewayGroup CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/gatewaygroup-cr.md) |
| `ConfigurationPlan` | Binds an existing Service to a backend endpoint, operation and artifact selection, cache settings, request-header policy, and security configuration | The reconciler cleans up its remote Configuration Plan | [ConfigurationPlan CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/configurationplan-cr.md) |
| `Exposition` | Exposes a Service through a ready Configuration Plan and Gateway Group | Remote Exposition cleanup is enabled by default; `keepOnDelete` can retain it | [Exposition CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/exposition-cr.md) |
| `SecretSource` | Declares control-plane Secrets, optionally sourced from Kubernetes Secrets | Remote Secret cleanup is enabled by default; `keepOnDelete` can retain it | [SecretSource CR](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/secretsource-cr.md) |
| `CustomTools` | Attaches declarative or scripted tools to an existing Service | Deletes the attached artifact unless `keepOnDelete` is set | [CustomTools CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/customtools-cr.md) |
| `Resources` | Declares MCP resources and resource templates for an existing Service | Deletes the attached artifact unless `keepOnDelete` is set | [Resources CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/resources-cr.md) |
| `Prompts` | Attaches MCP Prompts to an existing Service | Deletes the attached artifact unless `keepOnDelete` is set | [Prompts CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/prompts-cr.md) |
| `Skills` | Attaches remotely hosted Agent Skills to an existing Service | Deletes the attached artifact unless `keepOnDelete` is set | [Skills CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/skills-cr.md) |
| `ToolsOutputFilters` | Attaches Tool output transformations to an existing Service | Deletes the attached artifact unless `keepOnDelete` is set | [ToolsOutputFilters CR](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/toolsoutputfilters-cr.md) |

The five artifact CRs report `status.state` and do not expose `observedGeneration`. Chart `0.0.18` packages all ten CRDs, including `Skills`. Apply all ten explicitly when [upgrading an existing installation](../how-to-guides/operations/upgrade-and-rotate.md).

Controllers `0.0.5` update the remote Configuration Plan in place on spec changes. They reconcile `spec.toolExposureMode` (`TOOLS`, `CODE`, or `HYBRID`), `spec.backendTimeout` in milliseconds, and `spec.backendSecretRef`, the name of an existing reShapr Secret. `backendSecretRef` is mutually exclusive with the `oauth2` configuration. See the [ConfigurationPlan CR reference](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/configurationplan-cr.md).

Configuration Plans expose `spec.headerPolicy.request` and `spec.headerPolicy.response` with `allow`, `deny`, and `rename` rules. The operator forwards both to the control plane, but runtime `1.2.0` enforces only request rules.

## Admission controller

The mutating admission webhook injects a reShapr proxy sidecar into Pods annotated with `io.reshapr/inject: "true"`. For workloads owned by a Deployment, its controller can also create the headless clustering Service and the MCP Service used to reach injected proxies.

The webhook is fail-open by default through `failurePolicy: Ignore`. Its serving endpoint requires TLS; the controllers chart supports cert-manager, OpenShift service certificates, or an existing certificate. See the canonical [admission controller](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/admission-controller.md) and [installation guide](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/installation-admission.md).

## Limits

- `CustomTools`, `Resources`, and `Prompts` deletion can leave their remote artifacts in the target Service.
- Controllers `0.0.4` upload `CustomTools`, `Resources`, and `Prompts` artifacts as `artifact.json`; reconciling multiple artifact CRs for one Service can replace the previously attached artifact. Use one artifact CR per Service or manage additional artifacts through another supported interface.
- Reading Kubernetes Secrets for `SecretSource` requires the operator's separate Secret-reader RBAC.
- The admission controller creates supporting Services only for injected Pods owned by a Deployment.
- Controller-specific metrics and traces are not currently documented as a supported observability surface; rely on component logs unless the owner documentation states otherwise.

## Next step

- Use **[Your First GitOps-managed MCP Endpoint](../tutorials/first-gitops-mcp-endpoint.md)** to create and verify an endpoint from these APIs.
- Use **[Manage reShapr Resources with GitOps](../how-to-guides/manage-resources-with-gitops.md)** to operate their update and deletion lifecycle.
- Use **[Helm Charts Overview](./helm-charts.md)** to choose the controllers chart and its dependencies.
- Use **[Product Interfaces](./interfaces.md)** to find the remaining reShapr contracts.