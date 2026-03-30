# reShapr — How-to Guides

https://reshapr.io/docs/tutorials/docker-compose

---

## Run using Docker Compose

https://reshapr.io/docs/tutorials/docker-compose

Run reShapr locally using Docker Compose for development and testing.

### Prerequisites

- Docker (with Docker Compose v2) or Podman
- Node.js v18+ and the reShapr CLI (`npm install -g @reshapr/reshapr-cli`)

### Quick start with the CLI

```bash
reshapr run                    # pulls latest release, starts containers in background
reshapr status                 # check running containers
reshapr stop                   # shut everything down
```

`reshapr run` downloads `install/docker-compose-all-in-one.yml` from GitHub, configures image tags, saves the file to `~/.reshapr/`, and runs `docker compose up -d`.

Options: `--release <version>` (default: `latest`; also accepts `nightly` or a specific tag like `0.0.5`).

### Create an admin user

```bash
SERVER_URL=http://localhost:5555
SERVER_TOKEN=<default-api-key>

curl -XPOST $SERVER_URL/api/admin/users \
  -H "Content-Type: application/json" -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"username":"admin","email":"reshapr@example.com","password":"password","firstname":"Reshapr","lastname":"Admin"}'

curl -XPUT $SERVER_URL/api/admin/users/admin/organization/reshapr/owner \
  -H "x-reshapr-api-key: $SERVER_TOKEN"
```

### Login and use

```bash
reshapr login --server http://localhost:5555
```

Control plane: `http://localhost:5555` — MCP gateway: `http://localhost:7777`.

### Manual setup (without the CLI)

```bash
git clone https://github.com/reshaprio/reshapr.git
cd reshapr/install
docker compose -f docker-compose-all-in-one.yml up
```

Helper scripts included: `create-admin.sh`, `create-user+org.sh`.

---

## Install on Kubernetes

https://reshapr.io/docs/tutorials/kubernetes

Deploy reShapr on Kubernetes using Helm charts. Two OCI-based charts are available on Quay.io (latest version: 0.0.2):

- `reshapr-control-plane` — Control plane API server + database
- `reshapr-proxy` — MCP gateway (data plane)

### Install the control plane (development)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update

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

### Install the proxy (development)

```bash
helm install reshapr-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy --version 0.0.2 \
  --create-namespace --namespace reshapr-proxies \
  --set gateway.idPrefix=acme \
  --set gateway.labels='env=dev;team=reshapr' \
  --set gateway.fqdns=mcp.acme.loc \
  --set gateway.controlPlane.host=reshapr-control-plane-ctrl.reshapr-system \
  --set gateway.controlPlane.port=5555 \
  --set gateway.controlPlane.token=my-super-secret-token-xyz
```

### Key parameters

Control plane: `ctrl.replicaCount`, `postgresql.enabled`, `externalDatabase.host`, `admin.*`, `apiKey.value`, `ingress.enabled`.

Proxy: `replicaCount`, `gateway.idPrefix`, `gateway.fqdns`, `gateway.labels`, `gateway.controlPlane.*`, `autoscaling.enabled`, `ingress.enabled`.

### Production notes

- Use external PostgreSQL with `postgresql.enabled=false` and `externalDatabase.*`
- Store tokens in Kubernetes secrets (`gateway.controlPlane.existingSecret`, `apiKey.existingSecret`)
- Enable ingress with TLS for both charts
- Enable HPA for the proxy with `autoscaling.enabled=true`

Full parameter reference: https://github.com/reshaprio/reshapr-helm-charts

---

## Deploy a Hybrid Gateway

https://reshapr.io/docs/how-to-guides/deploy-hybrid-gateway

Run reShapr gateways inside your own infrastructure while the control plane stays in reShapr's cloud. Your application traffic never leaves your datacenter.

### Prerequisites

- reShapr Gateway container image (URL provided by the reShapr team via ttl.sh)
- reShapr CLI installed and logged in

### Overview

In hybrid mode:
- Gateway Groups are the abstract target of your MCP Server exposition (owned by an organization, defines labels for matching Gateways)
- Gateways are the concrete elements that expose your MCP Servers (they receive deployment directives and configuration plans from the reShapr control plane)
- The control plane only holds configuration — all application data stays in your datacenter

### Step 1 — Retrieve an API Token

```bash
reshapr login
reshapr api-token create <my-gateway-token> -v 90
# → ⚠ API Token: acme-oXYvTI8f8BeuJ5-HlNuon6vs2wSao8qS7WRNIYwoFW4
# Store securely — shown only once.
```

### Step 2 — Create or identify a Gateway Group

```bash
reshapr gateway-group list
# Default Gateway Group ID: 1

reshapr gateway-group create 'QA Gateway Group' --labels '{"env":"qa","project":"xyz"}'
# → ID: 0P58T3XKK1MEQ
```

### Step 3 — Start the Gateway container

```bash
docker run -it --rm -p 7777:7777 \
  -e RESHAPR_CTRL_HOST=app.beta.reshapr.io \
  -e RESHAPR_CTRL_PORT=443 \
  -e RESHAPR_CTRL_TLS_PLAINTEXT=false \
  -e RESHAPR_CTRL_TOKEN=<api-token> \
  -e RESHAPR_GATEWAY_ID=acme-gateway-01 \
  -e RESHAPR_GATEWAY_FQDNS=mcp-1.qa.acme.com \
  -e RESHAPR_GATEWAY_LABELS=env=qa \
  ttl.sh/reshapr-gateway-<uuid>:12h
```

Key environment variables:
- `RESHAPR_CTRL_HOST` — control plane hostname
- `RESHAPR_CTRL_TOKEN` — API token from step 1
- `RESHAPR_GATEWAY_ID` — unique identifier (must be unique across all gateways)
- `RESHAPR_GATEWAY_LABELS` — must match the Gateway Group labels

### Step 4 — Deploy your MCP Endpoint to the Gateway

```bash
reshapr expo create --configuration <configId> --gateway-group 0P58T3XKK1MEQ
```

The gateway auto-discovers and loads the MCP server configuration without interruption.

### Gateway lifecycle

1. **Registration** — gateway connects, authenticates with API token, fetches config
2. **Health check** — every 2 minutes; 5-minute timeout triggers re-registration (MCP serving continues)
3. **Changes streaming** — control plane pushes updates; MCP servers update without interruption
4. **Termination** — notification sent, streaming stops, MCP servers drain

### Security notes

- Gateway → control plane communication is always gateway-initiated (no ingress required)
- Transport: gRPC over HTTP/2 with TLS + token-based auth
- API tokens are generated, renewed, and revoked by the control plane (shared or per-gateway)
- Control plane only holds configuration; all application data stays in your datacenter
- Gateways can access private Authorization Servers or IDPs in your environment

---

*For the full site index see https://reshapr.io/llms.txt*
