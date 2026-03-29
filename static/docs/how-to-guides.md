# reShapr — How-to Guides

https://reshapr.io/docs/tutorials/docker-compose

---

## Docker Compose (coming soon)

https://reshapr.io/docs/tutorials/docker-compose

Run reShapr locally using Docker Compose for development and testing. Full guide coming soon.

---

## Helm Charts (coming soon)

https://reshapr.io/docs/tutorials/helm-charts

Deploy reShapr on Kubernetes using Helm for production-grade environments. Full guide coming soon.

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
