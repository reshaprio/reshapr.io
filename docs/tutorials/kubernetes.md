# Helm Charts

Learn how to deploy reShapr on Kubernetes using Helm charts for production-grade environments.

## Prerequisites

- Kubernetes 1.25+
- Helm 3.8+
- A PostgreSQL database (or use the embedded one for development)

## Overview

reShapr provides two Helm charts, distributed as OCI artifacts on **[Quay.io](https://quay.io)**:

| Chart | Purpose | Registry |
|-------|---------|----------|
| `reshapr-control-plane` | Control plane API server + database | `registry.reshapr.io/reshapr/reshapr-ctrl` |
| `reshapr-proxy` | MCP gateway (data plane) | `registry.reshapr.io/reshapr/reshapr-proxy` |

## All instructions are on GitHub

Please read 👉 [https://github.com/reshaprio/reshapr-helm-charts](https://github.com/reshaprio/reshapr-helm-charts)

## Next steps

- **[Getting Started with CLI](./getting-started.md)** — import services and expose MCP endpoints
- **[Run using Docker Compose](./docker-compose.md)** — run reShapr locally for development
- **[How it works](../overview/how-it-works.md)** — understand the reShapr architecture
- **[Security Model](../explanations/security-model.md)** — learn about reShapr security
