---
description: Deploy the reShapr control plane, proxy, Web UI, and controllers as a production-oriented Kubernetes topology.
verification:
  product: reShapr stack
  version: 1.0.0 / controllers 0.0.3 / charts 0.0.14
  date: 2026-09-22
release_review:
  runtime: 1.2.1
  controllers: 0.0.5
  charts: 0.0.18
  date: 2026-11-23
  scope: live replica readiness, admission, disruption budgets, autoscaler metrics, and cross-pod MCP session; external ingress and failover not replayed
---

# Deploy reShapr on Kubernetes for Production

Deploy the four reShapr Helm charts with explicit release tags, external persistence, Kubernetes Secrets, TLS ingress, and workload availability controls.

This is a production-oriented starting point, not a universal production certification. Adapt capacity, topology, policies, and recovery procedures to your platform requirements.

## Prerequisites

- Kubernetes 1.25 or later and Helm 3.8 or later
- Cluster-admin access for CRDs, cluster-scoped RBAC, and admission configuration
- An ingress controller and a certificate-management process
- An externally managed PostgreSQL service with tested backup and restore procedures
- DNS names for the control plane, Web UI, and MCP proxy
- A metrics pipeline when enabling the proxy HPA
- Prometheus Operator CRDs when enabling `ServiceMonitor`
- reShapr CLI `1.2.0` with administrative access after the control plane starts

This guide uses Helm charts `0.0.18`, controllers `0.0.5`, and runtime images `1.2.0`. The charts default to `nightly`, so the overrides below pin the reviewed releases instead.

The [chart release](https://github.com/reshaprio/reshapr-helm-charts/releases/tag/0.0.18) owns packaging. The [reShapr release](https://github.com/reshaprio/reshapr/releases/tag/1.2.0) owns runtime behavior.

## 1. Choose the topology

This guide shows all four charts as separate Helm releases. Select the optional components according to your operating model:

| Release | Namespace | Role |
|---|---|---|
| `reshapr-control-plane` | `reshapr-system` | APIs, configuration, authentication, and database access |
| `reshapr-ui` | `reshapr-system` | Optional administration Web UI |
| `reshapr-controllers` | `reshapr-system` | Optional operator and admission webhook |
| `reshapr-proxy` | `reshapr-proxies` | MCP data plane and backend dispatch |

:::info
These are the default namespaces, not fixed requirements. You can change them to match your cluster conventions and deploy multiple proxy releases in different namespaces, for example to isolate environments, teams, or Gateway Groups.
:::

`reshapr-ui` is optional when administrators use the CLI or APIs instead. Consider `reshapr-controllers` when you want to reconcile reShapr resources from Kubernetes manifests as part of a **[GitOps workflow](../tutorials/first-gitops-mcp-endpoint.md)**, or when you want the admission webhook to inject a reShapr proxy as a sidecar container into application Pods. See **[Kubernetes APIs and Controllers](../references/kubernetes-apis.md#admission-controller)** for the boundaries of both controller modes.

The control-plane chart can embed the Web UI as a subchart. Separate releases make independent rollout and ownership explicit; use the composed option when one release lifecycle is more appropriate for your platform.

## 2. Provision external dependencies and Secrets

Create the namespaces first:

```bash
kubectl create namespace reshapr-system
kubectl create namespace reshapr-proxies
```

Provision these Secrets with your external secret manager, encrypted Git workflow, or another organization-approved mechanism:

| Namespace | Secret | Required keys | Consumer |
|---|---|---|---|
| `reshapr-system` | `reshapr-db-credentials` | `password` | Control plane external PostgreSQL |
| `reshapr-system` | `reshapr-admin-credentials` | `name`, `password`, `email`, `default-gateway-tokens` | Initial administrator and Gateway token |
| `reshapr-system` | `reshapr-api-key-secret` | `api-key` | Control plane admin API |
| `reshapr-system` | `reshapr-encryption-key-secret` | `encryption-key-v1`, `encryption-key` | Sensitive data encryption |
| `reshapr-system` | `reshapr-jwt-keys-secret` | `private-key.pem`, `public-key.pem` | JWT signing and verification |
| `reshapr-system` | `reshapr-web-ui-api-key` | `api-key` | Web UI server-side API access |
| `reshapr-proxies` | `reshapr-gateway-token` | `token` | Proxy registration with the control plane |

Generate each AES-256 key as 32 random bytes encoded with Base64, for example with `openssl rand -base64 32`. Do not pass secret values with Helm `--set`: they can remain in shell history and Helm release metadata. The [control-plane values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/control-plane/values.yaml), [proxy values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/proxy/values.yaml), and [Web UI values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/web-ui/values.yaml) define the exact Secret contracts.

Chart `0.0.18` requires the legacy `encryption-key` entry even on a fresh installation because the Deployment references it unconditionally. Supply a separate 16-, 24-, or 32-character legacy key as well as the Base64-encoded AES-256 key. New encrypted values use `encryption-key-v1`; retain the original legacy key when migrating an existing database.

Store raw bootstrap Gateway tokens in `default-gateway-tokens`. The proxy Secret's `token` entry must contain `<organization-id>-<raw-token>`, for example `reshapr-<raw-token>` for the bootstrap organization. The organization prefix is required for Gateway authentication.

Provision TLS Secrets of type `kubernetes.io/tls` containing `tls.crt` and `tls.key`: `reshapr-ctrl-tls` and `reshapr-web-ui-tls` in `reshapr-system`, and `reshapr-gateway-tls` in `reshapr-proxies`. Their certificates must cover the configured public DNS names and be trusted by your clients. The ingress examples reference these Secrets; the charts do not issue these public certificates.

## 3. Configure the control plane

Create `values/control-plane.yaml` with environment-specific hosts, resource sizing, and scheduling rules. This bounded example shows the required production decisions without replacing the chart reference:

```yaml
ctrl:
  replicaCount: 3
  image:
    tag: "1.2.0"
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: "1"
      memory: 1Gi
  podDisruptionBudget:
    enabled: true
    minAvailable: 2

postgresql:
  enabled: false

externalDatabase:
  host: postgresql-ha.database.svc.cluster.local
  port: 5432
  database: reshapr
  username: reshapr
  existingSecret: reshapr-db-credentials
  passwordKey: password

admin:
  existingSecret: reshapr-admin-credentials
  defaultGatewayLabels: "env=production;region=eu-west-1;cluster=prod-01"
apiKey:
  existingSecret: reshapr-api-key-secret
encryptionKey:
  existingSecret: reshapr-encryption-key-secret
  activeKeyId: v1
  keys:
    v1:
      key: encryption-key-v1
jwtKeys:
  existingSecret: reshapr-jwt-keys-secret

ingress:
  enabled: true
  className: "<ingress-class>"
  ctrl:
    host: app.reshapr.example.com
    paths:
      - path: /
        pathType: Prefix
  tls:
    - secretName: reshapr-ctrl-tls
      hosts:
        - app.reshapr.example.com
```

  Replace `<ingress-class>` with an `IngressClass` supported by your Kubernetes platform. List the available classes with `kubectl get ingressclass`, then follow that controller's documentation for any required annotations or TLS behavior. The reShapr charts create standard `networking.k8s.io/v1` Ingress resources but do not install or qualify an ingress controller.

Add pod anti-affinity, topology spread, tolerations, and node selection according to your cluster. The release-tagged [`values-production.yaml`](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/control-plane/values-production.yaml) provides a larger example, but keep the `1.2.0` image override above.

Install the release:

```bash
helm upgrade --install reshapr-control-plane \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version 0.0.18 \
  --namespace reshapr-system \
  --values values/control-plane.yaml
```

Wait for the deployment, check its public health endpoint, then authenticate the CLI and confirm the runtime version:

```bash
kubectl rollout status deployment/reshapr-control-plane-ctrl \
  --namespace reshapr-system --timeout 5m
curl --fail --silent https://app.reshapr.example.com/q/health/ready | jq
reshapr login --server https://app.reshapr.example.com
reshapr info
```

The reported server version must be `1.2.0` before continuing.

## 4. Configure the Web UI

Create `values/web-ui.yaml`:

```yaml
replicaCount: 2
image:
  repository: registry.reshapr.io/reshapr/reshapr-ui
  tag: "1.2.0"
  pullPolicy: IfNotPresent
podDisruptionBudget:
  enabled: true
  minAvailable: 1
controlPlane:
  url: http://reshapr-control-plane-ctrl.reshapr-system.svc.cluster.local:5555
  publicUrl: https://app.reshapr.example.com
apiKey:
  existingSecret: reshapr-web-ui-api-key
  key: api-key
publicUrl: https://ui.reshapr.example.com
ingress:
  enabled: true
  className: "<ingress-class>"
  annotations:
    nginx.ingress.kubernetes.io/proxy-buffer-size: "16k"
  hosts:
    - host: ui.reshapr.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: reshapr-web-ui-tls
      hosts:
        - ui.reshapr.example.com
```

The buffer annotation is specific to ingress-nginx. Its default response-header buffer can reject the Web UI's headers with HTTP 502 and `upstream sent too big header`; the example increases it to 16 KiB. For another ingress controller, configure the equivalent response-header limit according to its documentation.

Install and verify it:

```bash
helm upgrade --install reshapr-ui \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-web-ui \
  --version 0.0.18 \
  --namespace reshapr-system \
  --values values/web-ui.yaml
kubectl get pods --namespace reshapr-system \
  --selector app.kubernetes.io/instance=reshapr-ui
curl --fail --silent --head https://ui.reshapr.example.com
```

## 5. Configure the controllers

Pin controllers `0.0.5` when using charts `0.0.18`. Create `values/controllers.yaml`:

```yaml
operator:
  enabled: true
  image:
    tag: "0.0.5"
  replicaCount: 1
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi
admissionController:
  enabled: true
  image:
    tag: "0.0.5"
  replicaCount: 2
  certificate:
    provider: cert-manager
    certManager:
      issuerRef:
        name: reshapr-admission-issuer
        kind: Issuer
```

Create a ready cert-manager `Issuer` named `reshapr-admission-issuer` in `reshapr-system` before installing this release. Use a signer with a non-empty issuer distinguished name, for example an existing CA-backed issuer. The default self-signed setup failed with an empty issuer name when loading the webhook's PKCS12 keystore in the preceding baseline.

Use `openshift` or `existing` instead when those certificate providers match your platform. The [controllers chart reference](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/controllers/README.md) documents all three modes. On a fresh install, the chart installs all ten CRDs. For an existing installation, follow the [upgrade runbook](./operations/upgrade-and-rotate.md).

Install the release:

```bash
helm upgrade --install reshapr-controllers \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-controllers \
  --version 0.0.18 \
  --namespace reshapr-system \
  --values values/controllers.yaml
```

Register the operator ServiceAccount with the control plane:

```bash
export RESHAPR_ADMIN_API_KEY='<admin-api-key-from-your-secret-manager>'

reshapr admin --server https://app.reshapr.example.com \
  service-account create reshapr-system-operator \
  --k8s-subject reshapr-system:reshapr-controllers-operator \
  --allowed-organizations '["*"]' \
  --validity-days 90
```

Then verify the workloads and CRDs:

```bash
kubectl get pods --namespace reshapr-system \
  --selector app.kubernetes.io/instance=reshapr-controllers
kubectl get crd | grep 'reshapr.io'
```

## 6. Configure the proxy

Create `values/proxy.yaml`:

```yaml
replicaCount: 3
image:
  tag: "1.2.0"
  pullPolicy: IfNotPresent
gateway:
  idPrefix: prod-gateway
  fqdns: mcp.reshapr.example.com
  labels: "env=production;region=eu-west-1;cluster=prod-01"
  controlPlane:
    host: reshapr-control-plane-ctrl.reshapr-system.svc.cluster.local
    port: 5555
    existingSecret: reshapr-gateway-token
    tokenKey: token
clustering:
  enabled: true
  networkPolicy:
    enabled: false
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
podDisruptionBudget:
  enabled: false
serviceMonitor:
  enabled: true
  additionalLabels:
    prometheus: kube-prometheus
ingress:
  enabled: true
  className: "<ingress-class>"
  hosts:
    - host: mcp.reshapr.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: reshapr-gateway-tls
      hosts:
        - mcp.reshapr.example.com
```

The `admin.defaultGatewayLabels` value in the control-plane example matches these proxy labels so that the bootstrap `Default Gateway Group` selects the production proxies. If you use another Gateway Group, match that group's selectors instead; a `READY` Exposition assigned to a group with no matching proxy cannot serve MCP requests.

The chart encrypts JGroups traffic and can generate its clustering keystore. For controlled rotation and disaster recovery, provision `clustering.encryption.existingSecret` instead and manage the keystore lifecycle explicitly.

Use chart `0.0.16` or later when enabling both clustering and autoscaling. Chart `0.0.15` omitted the clustering configuration from its HPA-specific Deployment template.

The bundled JGroups NetworkPolicy is disabled in this example. In chart `0.0.18`, it isolates ingress to proxy Pods but permits only its configured JGroups ports: on an enforcing CNI, HTTP traffic from ingress and monitoring also needs an allow policy. Before enabling it, add reviewed policies for the required flows, qualify health probes, and verify that the allowed clustering ports match the runtime's actual listening ports. Define egress policies separately. `ServiceMonitor` requires the Prometheus Operator CRD; disable it when that API is unavailable.

Install the release:

```bash
helm upgrade --install reshapr-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version 0.0.18 \
  --namespace reshapr-proxies \
  --values values/proxy.yaml
```

Verify its rollout, HPA, and cluster-facing health:

```bash
kubectl rollout status deployment/reshapr-proxy \
  --namespace reshapr-proxies --timeout 5m
kubectl get hpa,pods,networkpolicy,servicemonitor \
  --namespace reshapr-proxies
curl --fail --silent https://mcp.reshapr.example.com/q/health/ready | jq
```

## 7. Verify a functional MCP endpoint

Create an endpoint with **[Your First GitOps-managed MCP Endpoint](../tutorials/first-gitops-mcp-endpoint.md)** or use an existing ready Exposition. Set its public URL:

```bash
export MCP_URL='https://mcp.reshapr.example.com/mcp/<organization>/<service-name>/<service-version>'
```

Discover the MCP server through the production ingress:

```bash
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-production-check","version":"1.1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result | {supportedVersions, capabilities}'
```

Health probes show that workloads can serve traffic. This MCP request additionally verifies DNS, ingress, proxy registration, Exposition propagation, and endpoint routing. Complete the check with a real `tools/call` for a non-destructive operation from your Service.

## Result

The four charts are installed at `0.0.18`, the runtime workloads use `1.2.0`, the controllers use `0.0.5`, PostgreSQL and credentials are externally managed, public routes use TLS, and a production ingress answers a functional MCP request.

## Limits

- Multiple replicas and PodDisruptionBudgets do not provide end-to-end availability by themselves. PostgreSQL, ingress, DNS, cluster capacity, and failure-domain placement remain part of the design.
- The proxy HPA requires working resource metrics and tested scaling thresholds. Control-plane and Web UI autoscaling are not configured by these charts.
- The operator remains a single replica in this example; the admission webhook has two replicas.
- The generated clustering keystore is retained across Helm upgrades. Database encryption-key rotation is administrator-triggered; general credential rotation and backup are not automated.
- The charts do not provide automated rollback or database backup and restore.
- TLS terminates at ingress in this topology. Internal transport security depends on your cluster network and service-mesh policy.
- NetworkPolicy enforcement is CNI-dependent. The bundled policy is disabled here; qualify cluster, HTTP, health, and monitoring connectivity before enabling reviewed policies.
- A `ServiceMonitor` only creates a scrape target. Alerting, retention, dashboards, and SLOs remain external responsibilities.

## Next step

Use **[Observe the reShapr Proxy](./operations/observe-and-audit.md)** to connect the proxy to your telemetry pipeline. Use **[Upgrade reShapr and Rotate Runtime Secrets](./operations/upgrade-and-rotate.md)** to prepare the next maintenance window, or **[Manage reShapr Resources with GitOps](./manage-resources-with-gitops.md)** to operate endpoint desired state and cleanup.

Use the release-tagged [chart READMEs and values](https://github.com/reshaprio/reshapr-helm-charts/tree/0.0.18) when adapting this bounded topology.