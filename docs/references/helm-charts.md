---
description: Choose among the four reShapr Helm charts and continue with their canonical installation and values documentation.
---

# Helm Charts Overview

reShapr components are packaged as four independently versioned Helm charts. This page helps you choose a topology; the [`reshapr-helm-charts`](https://github.com/reshaprio/reshapr-helm-charts) repository owns installation commands, values, and release artifacts.

## Prerequisites

The current charts declare Kubernetes 1.25 or later and require Helm 3.8 or later for OCI support. Installing the controllers also requires cluster-level permissions for CRDs and RBAC.

`cert-manager` is required when the Web UI uses TLS and when the admission controller uses its default certificate provider. The controllers chart also documents OpenShift and existing-certificate alternatives.

## Choose a chart

| Chart | Role | Typical placement | Canonical documentation |
|---|---|---|---|
| `reshapr-control-plane` | Control plane API and configuration management | Core platform namespace | [README](https://github.com/reshaprio/reshapr-helm-charts/blob/main/control-plane/README.md) and [commands](https://github.com/reshaprio/reshapr-helm-charts/blob/main/control-plane/COMMANDS.md) |
| `reshapr-proxy` | MCP Gateway and data plane | Dedicated proxy namespace or close to workloads | [README](https://github.com/reshaprio/reshapr-helm-charts/blob/main/proxy/README.md) and [commands](https://github.com/reshaprio/reshapr-helm-charts/blob/main/proxy/COMMANDS.md) |
| `reshapr-web-ui` | Administration dashboard | Platform namespace, connected to the control plane | [README](https://github.com/reshaprio/reshapr-helm-charts/blob/main/web-ui/README.md) and [commands](https://github.com/reshaprio/reshapr-helm-charts/blob/main/web-ui/COMMANDS.md) |
| `reshapr-controllers` | Kubernetes operator and admission webhook | `reshapr-system` by default | [README](https://github.com/reshaprio/reshapr-helm-charts/blob/main/controllers/README.md) and [commands](https://github.com/reshaprio/reshapr-helm-charts/blob/main/controllers/COMMANDS.md) |

## Topology choices

### Core platform

Install the control-plane chart as the platform anchor. It can provision PostgreSQL and the Web UI as optional subcharts, or connect to separately managed instances. Add one or more proxy releases for MCP traffic.

### Standalone components

Install the proxy or Web UI chart independently when their lifecycle, namespace, or scaling must remain separate from the control plane. Both still require connectivity to a running control plane.

### Kubernetes-native management

Install the controllers chart to manage reShapr resources through Kubernetes APIs or inject proxy sidecars through the admission webhook. The operator and admission controller are enabled together by default and can be selected independently.

See **[Kubernetes APIs and Controllers](./kubernetes-apis.md)** before choosing this path.

## Development and production values

Each chart directory owns its `values.yaml`, `values-dev.yaml`, and `values-production.yaml`. Use those files as the current source for image tags, resources, replicas, ingress, security contexts, and component-specific settings:

- [Control plane values](https://github.com/reshaprio/reshapr-helm-charts/blob/main/control-plane/values.yaml)
- [Proxy values](https://github.com/reshaprio/reshapr-helm-charts/blob/main/proxy/values.yaml)
- [Web UI values](https://github.com/reshaprio/reshapr-helm-charts/blob/main/web-ui/values.yaml)
- [Controllers values](https://github.com/reshaprio/reshapr-helm-charts/blob/main/controllers/values.yaml)

For a reproducible installation, select an immutable version from the [Helm chart releases](https://github.com/reshaprio/reshapr-helm-charts/releases) and use documentation and values from the same tag.

## Limits

- Chart versions are not necessarily identical across all four components; verify each selected release.
- Helm does not remove CRDs when the controllers chart is uninstalled. Deleting CRDs manually also deletes their custom resources across namespaces.
- This overview does not duplicate the complete values schema or installation commands. Review the selected chart's owner documentation before deployment.

## Next step

- Use **[Deploy reShapr on Kubernetes for Production](../how-to-guides/deploy-kubernetes-production.md)** to install all four charts with production-oriented settings.
- Use **[Product Interfaces](./interfaces.md)** to find API and CLI contracts.
- Use **[Kubernetes APIs and Controllers](./kubernetes-apis.md)** to choose CRDs or sidecar injection.
