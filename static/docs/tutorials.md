# reShapr — Tutorials

https://reshapr.io/docs/tutorials/getting-started

---

## Try reShapr Online

https://reshapr.io/docs/tutorials/try-reshapr-online

The fastest way to experience reShapr — no installation required. Head to https://try.reshapr.io to get started instantly.

### Login workflow

1. **Choose an authentication provider** — Select GitHub or Google to authenticate.
2. **Sign in with your provider** — Enter your credentials (e.g. GitHub login).
3. **Two-factor authentication** — If enabled, complete the verification step.
4. **Access the online dashboard** — Once authenticated, you land on the reShapr Try dashboard.
5. **Authenticate with the CLI** — Press Ctrl+C in the browser and log in using the reShapr CLI:
   ```bash
   reshapr login -s https://try.reshapr.io
   ```
   When the browser opens, authorize the CLI — the token is valid for 2 hours.
6. **You're all set!** — Login successful. Follow the Getting Started tutorial to continue.

---

## Getting Started with CLI

https://reshapr.io/docs/tutorials/getting-started

### Installation

```bash
npm install -g @reshapr/reshapr-cli
reshapr --version   # → 0.0.8
```

### Login

```bash
reshapr login -s https://try.reshapr.io
```

### Core workflow

**Step 1 — Import an artifact** (discovers the Service automatically):

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml
# → Discovered Service Open-Meteo APIs with ID: 0PXEW1ZDWFCZS
```

**Step 2 — Create a Configuration Plan** (define backend endpoint + security):

```bash
reshapr config create 'open-meteo-manual' \
  --serviceId 0PXEW1ZDWFCZS \
  --backendEndpoint https://api.open-meteo.com
# → Configuration plan created with ID: 0PXPDMB4MFE6H
```

**Step 3 — Expose** (deploy to a Gateway Group):

```bash
reshapr expo create --configuration 0PXPDMB4MFE6H --gateway-group 1
# → Endpoint: mcp.try.reshapr.io/mcp/<org>/Open-Meteo+APIs/1.0
```

### All-in-one magic command

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml \
  --backendEndpoint https://api.open-meteo.com
# → Endpoint: mcp.try.reshapr.io/mcp/<org>/Open-Meteo+APIs/1.0
```

---

## Docker Compose

https://reshapr.io/docs/how-to-guides/docker-compose

Run reShapr locally using Docker Compose for development and testing.

### Prerequisites

- Docker (with Docker Compose v2)
- Node.js v18+ and the reShapr CLI (`npm install -g @reshapr/reshapr-cli`)

### Quick start with the CLI

```bash
reshapr run                    # pulls latest release, starts containers in background
reshapr status                 # check running containers
reshapr stop                   # shut everything down
```

`reshapr run` downloads `install/docker-compose-all-in-one.yml` from GitHub, configures image tags, saves the file to `~/.reshapr/`, and runs `docker compose up -d`.

Options: `--release <version>` (default: `latest`; also accepts `nightly` or a specific tag like `0.0.8`).

### Create an admin user

```bash
SERVER_URL=http://localhost:5555
SERVER_TOKEN=CzBuQ9B0i8qrUQe6WLiDLqR3gv4iCbxvjTJQP0z0CFGQbjgBHPZSusa9d1gZKwwjdoCsJ8ogRwRzc06GipJSjSDkFOy0BSOKvAa2EjU3As9I5UjgizTzxsJAVJIXtdo2xiXHhcry9KeJa0zRhDtGmm8WMujoXrlfj0ChlJKaHZiZsRthd4UHrWkKur9KySXpPFP21H4C0Cq6OgM1rJpvMZ7Jd2ZzeEcd5lKE4PlchHZBVEdu8jYzjQtU50fkOPoR

curl -XPOST $SERVER_URL/api/admin/users \
  -H "Content-Type: application/json" -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"username":"admin","email":"reshapr@example.com","password":"password","firstname":"Reshapr","lastname":"Admin"}'

curl -XPUT $SERVER_URL/api/admin/users/admin/organization/reshapr/owner \
  -H "x-reshapr-api-key: $SERVER_TOKEN"
```

### Create a regular user and organization

```bash
curl -XPOST $SERVER_URL/api/admin/users \
  -H "Content-Type: application/json" -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"username":"jdoe","email":"jdoe@example.com","password":"my-super-long-password","firstName":"John","lastName":"Doe"}'

curl -XPOST $SERVER_URL/api/admin/users/jdoe/organization \
  -H "Content-Type: application/json" -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"name":"jdoe","description":"Organization for user jdoe"}'

curl -XPOST $SERVER_URL/api/admin/quotas/organization/jdoe \
  -H "Content-Type: application/json" -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '[{"metric":"gateway-group.count","enabled":true,"limit":3},{"metric":"gateway.count","enabled":true,"limit":3},{"metric":"exposition.count","enabled":true,"limit":10}]'
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

## Helm Charts

https://reshapr.io/docs/how-to-guides/kubernetes

Deploy reShapr on Kubernetes using Helm charts for production-grade environments.

### Prerequisites

- Kubernetes 1.25+
- Helm 3.8+
- A PostgreSQL database (or use the embedded one for development)

### Overview

reShapr provides two Helm charts, distributed as OCI artifacts on the reShapr registry:

- `reshapr-control-plane` — Control plane API server + database (`registry.reshapr.io/reshapr/reshapr-ctrl`)
- `reshapr-proxy` — MCP gateway (data plane) (`registry.reshapr.io/reshapr/reshapr-proxy`)

Full installation instructions: https://github.com/reshaprio/reshapr-helm-charts

---

*For the full site index see https://reshapr.io/llms.txt*
