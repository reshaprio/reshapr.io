# Docker Compose

Learn how to run reShapr locally using Docker Compose for development and testing purposes.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **[Docker](https://docs.docker.com/get-docker/)** (with Docker Compose v2) or **[Podman](https://podman.io/docs/installation)**
- **[Node.js](https://nodejs.org/)** (v18 or later) needed for the reShapr CLI
- The **reShapr CLI** installed globally:

```bash
npm install -g @reshapr/reshapr-cli
```

## Quick start with the CLI

The simplest way to run reShapr locally is through the `reshapr run` command. It automatically downloads the correct Docker Compose file from GitHub, configures the container images for the requested release, and starts everything in the background.

```bash
reshapr run
```

With this output:

```bash
ℹ️  Resolved 'latest' to release '0.0.5'.
ℹ️  Downloading compose file from https://raw.githubusercontent.com/reshaprio/reshapr/refs/tags/0.0.5/install/docker-compose-all-in-one.yml...
✅ Compose file saved to /Users/you/.reshapr/docker-compose-0.0.5.yml
ℹ️  Starting Reshapr containers (release: 0.0.5)...
✅ Reshapr containers started successfully.
```

By default this pulls the **latest** stable release. You can also target a specific release or use the **nightly** build:

```bash
# Run a specific release
reshapr run --release 0.0.5

# Run the nightly build (latest from main branch)
reshapr run --release nightly
```

The compose file is cached at `~/.reshapr/docker-compose-<release>.yml`, so subsequent runs reuse it without re-downloading.

## Check status

Once the containers are running, verify their status:

```bash
reshapr status
```

With this output:

```bash
ℹ️  Reshapr containers (release: 0.0.5, started at: 2026-04-01T10:30:00.000Z)
NAME                           IMAGE                                        ...   STATUS
reshapr-ctrl-1                 quay.io/reshapr/reshapr-ctrl:0.0.5           ...   Up 2 minutes
reshapr-proxy-1                quay.io/reshapr/reshapr-proxy:0.0.5          ...   Up 2 minutes
reshapr-db-1                   postgres:17                                  ...   Up 2 minutes
```

The control plane is available at **`http://localhost:5555`** and the MCP gateway at **`http://localhost:7777`**.

## Create an admin user

The control plane exposes an admin API for initial setup. Use `curl` to create an admin user and assign them as owner of the default `reshapr` organization:

```bash
# Server properties
SERVER_URL=http://localhost:5555
SERVER_TOKEN=CzBuQ9B0i8qrUQe6WLiDLqR3gv4iCbxvjTJQP0z0CFGQbjgBHPZSusa9d1gZKwwjdoCsJ8ogRwRzc06GipJSjSDkFOy0BSOKvAa2EjU3As9I5UjgizTzxsJAVJIXtdo2xiXHhcry9KeJa0zRhDtGmm8WMujoXrlfj0ChlJKaHZiZsRthd4UHrWkKur9KySXpPFP21H4C0Cq6OgM1rJpvMZ7Jd2ZzeEcd5lKE4PlchHZBVEdu8jYzjQtU50fkOPoR

# Create the admin user
curl -XPOST $SERVER_URL/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"username":"admin", "email":"reshapr@example.com", "password":"password", "firstname":"Reshapr", "lastname":"Admin"}'

# Set admin as owner of the reshapr organization
curl -XPUT $SERVER_URL/api/admin/users/admin/organization/reshapr/owner \
  -H "x-reshapr-api-key: $SERVER_TOKEN"
```

> ⚠️ The `SERVER_TOKEN` above is the **default** API key. If you have changed it in your deployment configuration, use your own token instead.

## Create a regular user and organization

For day-to-day usage, create a regular user with their own organization and resource quotas:

```bash
# User properties
USERNAME=jdoe
EMAIL=jdoe@example.com
PASSWORD=my-super-long-password-that-should-be-changed

# Create the user
curl -XPOST $SERVER_URL/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"username":"'$USERNAME'", "email":"'$EMAIL'", "password":"'$PASSWORD'", "firstName":"John", "lastName":"Doe"}'

# Create the organization
curl -XPOST $SERVER_URL/api/admin/users/$USERNAME/organization \
  -H "Content-Type: application/json" \
  -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '{"name":"'$USERNAME'", "description":"Organization for user '$USERNAME'"}'

# Assign quotas to the organization
curl -XPOST $SERVER_URL/api/admin/quotas/organization/$USERNAME \
  -H "Content-Type: application/json" \
  -H "x-reshapr-api-key: $SERVER_TOKEN" \
  -d '[{"metric": "gateway-group.count", "enabled":true, "limit": 3}, {"metric": "gateway.count", "enabled":true, "limit": 3}, {"metric": "exposition.count", "enabled": true, "limit": 10}]'
```

## Log in with the CLI

With your user created, authenticate the CLI against your local control plane:

```bash
reshapr login --server http://localhost:5555
```

You'll be prompted for your username and password. Once authenticated:

```bash
❯ reshapr login --server http://localhost:5555
ℹ️  Enter your credentials
✅ Login successful!
ℹ️  Welcome, jdoe!
ℹ️  Organization: jdoe
✅ Configuration saved to /Users/you/.reshapr/config
```

From here, you can follow the **[Getting Started tutorial](./getting-started.md)** to import services, create configuration plans, and expose MCP endpoints just point everything at your local instance.

## Stop the containers

When you're done, shut everything down:

```bash
reshapr stop
```

With this output:

```bash
ℹ️  Stopping Reshapr containers (release: 0.0.5)...
✅ Reshapr containers stopped successfully.
```

This runs `docker compose down` on the saved compose file and cleans up the run state.

## Manual setup (without the CLI)

If you prefer to manage Docker Compose directly, clone the reShapr repository and use the provided scripts:

```bash
git clone https://github.com/reshaprio/reshapr.git
cd reshapr/install
```

Start all services (control plane, gateway, and database) at once:

```bash
docker compose -f docker-compose-all-in-one.yml up
```

The `install/` folder also includes helper scripts:

- `start-all.sh`- a simple script to run the `docker compose` command above

Or start components separately, the control plane first:

```bash
docker compose up
```

Then the gateway proxy in a separate terminal:

```bash
docker run -it --rm -p 7777:7777 \
  -e RESHAPR_CTRL_HOST=host.docker.internal \
  --add-host=host.docker.internal:host-gateway \
  quay.io/reshapr/reshapr-proxy:nightly
```

The `install/` folder also includes helper scripts:

- `start-control-plane.sh` - a simple script to run the `docker compose` command above
- `start-proxy.sh` - a simple script to run the `docker run` command above

> 💡 The `host.docker.internal` mapping lets the proxy container reach the control plane running on your host machine.

The `install/` folder also includes helper scripts for user and organization setup:

- `create-admin.sh` — creates an admin user and assigns ownership of the `reshapr` organization
- `create-user+org.sh` — creates a regular user with an organization and default quotas

## Next steps

- **[Getting Started with CLI](./getting-started.md)** — import services and expose MCP endpoints
- **[Helm Charts](./helm-charts.md)** — deploy reShapr on Kubernetes
- **[How it works](../overview/how-it-works.md)** — understand the reShapr architecture

