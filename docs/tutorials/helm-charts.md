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
| `reshapr-control-plane` | Control plane API server + database | `quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane` |
| `reshapr-proxy` | MCP gateway (data plane) | `quay.io/reshapr/reshapr-helm-charts/reshapr-proxy` |

The latest released version is **`0.0.2`**.

## Step 1 — Install the control plane

### Development (embedded PostgreSQL)

For local development and testing, you can use the embedded PostgreSQL:

```bash
# Add the Bitnami repository for the PostgreSQL dependency
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install the control plane
helm install reshapr-control-plane \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane --version 0.0.2 \
  --create-namespace --namespace reshapr-system \
  --set postgresql.enabled=true \
  --set postgresql.auth.password=admin \
  --set apiKey.value=dev-api-key-change-me-in-production \
  --set encryptionKey.value=dev-encryption-key-change-me-in-production \
  --set admin.nameValue=admin \
  --set admin.passwordValue=password \
  --set admin.emailValue=reshapr@example.com \
  --set admin.defaultGatewayTokensValue=my-super-secret-token-xyz
```

### Production (external PostgreSQL)

For production, point to your own managed PostgreSQL and use Kubernetes secrets:

```bash
# Create secrets
kubectl create namespace reshapr-system

kubectl create secret generic reshapr-db-credentials \
  --from-literal=password='your-secure-password' \
  --namespace reshapr-system

kubectl create secret generic reshapr-api-key-secret \
  --from-literal=api-key='your-very-long-random-api-key' \
  --namespace reshapr-system

# Install the control plane
helm install reshapr-control-plane \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane --version 0.0.2 \
  --namespace reshapr-system \
  --set postgresql.enabled=false \
  --set externalDatabase.host=postgresql.example.com \
  --set externalDatabase.password=your-secure-password \
  --set apiKey.value=your-very-long-random-api-key \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set ingress.ctrl.host=app.reshapr.example.com
```

### Verify the installation

```bash
helm list -n reshapr-system
kubectl get pods -n reshapr-system
```

You should see the `reshapr-ctrl` pod (and `postgresql` if using embedded mode) running.

```bash
# Check the logs
kubectl logs -n reshapr-system -l app.kubernetes.io/component=ctrl -f
```

## Step 2 — Install the proxy (gateway)

### Development

```bash
helm install reshapr-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  --create-namespace --namespace reshapr-proxies \
  --set gateway.idPrefix=acme \
  --set gateway.labels='env=dev;team=reshapr' \
  --set gateway.fqdns=mcp.acme.loc \
  --set ingress.enabled=true \
  --set 'ingress.hosts[0].host=mcp.acme.loc' \
  --set gateway.controlPlane.host=reshapr-control-plane-ctrl.reshapr-system \
  --set gateway.controlPlane.port=5555 \
  --set gateway.controlPlane.token=my-super-secret-token-xyz
```

### Production (with external secret)

```bash
# Create the token secret
kubectl create namespace reshapr-proxies

kubectl create secret generic reshapr-proxy-token \
  --from-literal=token='your-secure-control-plane-token' \
  --namespace reshapr-proxies

# Install the proxy
helm install reshapr-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  --namespace reshapr-proxies \
  --set gateway.controlPlane.existingSecret=reshapr-proxy-token \
  --set gateway.fqdns=mcp.reshapr.example.com \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set 'ingress.hosts[0].host=mcp.reshapr.example.com'
```

### Verify the proxy

```bash
kubectl get pods -n reshapr-proxies
kubectl logs -n reshapr-proxies -l app.kubernetes.io/instance=reshapr-proxy -f
```

## Step 3 — Start using reShapr

With both the control plane and proxy running, authenticate with the CLI and start exposing MCP endpoints:

```bash
# Point to the control plane (use ingress host or port-forward)
reshapr login --server http://app.reshapr.example.com

# Or, port-forward for local access
kubectl port-forward -n reshapr-system svc/reshapr-control-plane-ctrl 5555:5555
reshapr login --server http://localhost:5555
```

From here, follow the **[Getting Started tutorial](./getting-started.md)** to import services and expose MCP endpoints.

## Configuration reference

### Control plane parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ctrl.replicaCount` | Number of replicas | `1` |
| `ctrl.image.repository` | Image repository | `quay.io/reshapr/reshapr-ctrl` |
| `ctrl.image.tag` | Image tag | `nightly` |
| `ctrl.service.port` | Service port | `5555` |
| `postgresql.enabled` | Enable embedded PostgreSQL | `false` |
| `postgresql.auth.password` | Database password | `""` |
| `externalDatabase.host` | External database host | `""` |
| `externalDatabase.port` | External database port | `5432` |
| `admin.nameValue` | Admin account username | `""` |
| `admin.passwordValue` | Admin account password | `""` |
| `admin.emailValue` | Admin account email | `""` |
| `admin.defaultGatewayTokensValue` | CSV list of gateway tokens | `""` |
| `apiKey.value` | API key for admin operations | `""` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.ctrl.host` | Hostname for ctrl | `""` |

### Proxy parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `quay.io/reshapr/reshapr-proxy` |
| `image.tag` | Image tag | `nightly` |
| `service.port` | Service port | `7777` |
| `gateway.idPrefix` | Gateway ID prefix | `""` |
| `gateway.fqdns` | Gateway FQDNs (comma-separated) | `""` |
| `gateway.labels` | Gateway labels (semi-colon separated) | `env=dev;team=reshapr` |
| `gateway.controlPlane.host` | Control plane host | `reshapr-control-plane-ctrl` |
| `gateway.controlPlane.port` | Control plane port | `5555` |
| `gateway.controlPlane.token` | Control plane token | `""` |
| `gateway.controlPlane.existingSecret` | Existing secret for token | `""` |
| `autoscaling.enabled` | Enable HPA | `false` |
| `autoscaling.minReplicas` | Minimum replicas | `1` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |
| `ingress.enabled` | Enable ingress | `false` |

> 📖 For the full list of parameters, see the chart READMEs on **[GitHub](https://github.com/reshaprio/reshapr-helm-charts)**.

## High availability

### Control plane HA

```yaml
ctrl:
  replicaCount: 3
  podDisruptionBudget:
    enabled: true
    minAvailable: 2

postgresql:
  enabled: false

externalDatabase:
  host: postgresql-ha.database.svc.cluster.local
  existingSecret: reshapr-db-credentials
```

### Proxy autoscaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

gateway:
  idPrefix: "prod-gateway"
  fqdns: "mcp.example.com"
  labels: "env=production;cluster=prod-01"
```

## Multi-region deployment

Deploy distinct proxy instances per region, each connecting back to the same control plane:

```bash
# EU Gateway
helm install reshapr-proxy-eu \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  -n reshapr-proxies \
  --set gateway.idPrefix='eu-west-1' \
  --set gateway.fqdns='mcp-eu.example.com' \
  --set gateway.labels='env=prod;region=eu-west-1' \
  --set gateway.controlPlane.host=reshapr-control-plane-ctrl.reshapr-system

# US Gateway
helm install reshapr-proxy-us \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  -n reshapr-proxies \
  --set gateway.idPrefix='us-east-1' \
  --set gateway.fqdns='mcp-us.example.com' \
  --set gateway.labels='env=prod;region=us-east-1' \
  --set gateway.controlPlane.host=reshapr-control-plane-ctrl.reshapr-system
```

## Upgrading

```bash
helm upgrade reshapr-control-plane \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane --version 0.0.2 \
  --namespace reshapr-system --reuse-values

helm upgrade reshapr-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  --namespace reshapr-proxies --reuse-values
```

## Uninstalling

```bash
helm uninstall reshapr-proxy --namespace reshapr-proxies
helm uninstall reshapr-control-plane --namespace reshapr-system
```

## Troubleshooting

### Control plane

```bash
# Check pod status
kubectl get pods -n reshapr-system -l app.kubernetes.io/instance=reshapr-control-plane

# View logs
kubectl logs -n reshapr-system -l app.kubernetes.io/component=ctrl -f

# Test health
kubectl exec -n reshapr-system deploy/reshapr-control-plane-ctrl \
  -- curl -f http://localhost:5555/q/health/ready
```

### Proxy

```bash
# Check pod status
kubectl get pods -n reshapr-proxies -l app.kubernetes.io/instance=reshapr-proxy

# View logs
kubectl logs -n reshapr-proxies -l app.kubernetes.io/instance=reshapr-proxy -f

# Check connectivity to the control plane
kubectl exec -n reshapr-proxies deploy/reshapr-proxy \
  -- curl -v http://reshapr-control-plane-ctrl.reshapr-system:5555/q/health
```

## Next steps

- **[Getting Started with CLI](./getting-started.md)** — import services and expose MCP endpoints
- **[Docker Compose](./docker-compose.md)** — run reShapr locally for development
- **[How it works](../overview/how-it-works.md)** — understand the reShapr architecture
- **[Security Model](../explanations/security-model.md)** — learn about reShapr security
