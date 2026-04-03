# Docker Compose

Learn how to run reShapr locally using Docker Compose for development and testing purposes.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **[Docker](https://docs.docker.com/get-docker/)** (with Docker Compose v2)
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

```bash
ℹ️  Resolved 'latest' to release '0.0.8'.
ℹ️  Downloading compose file from https://raw.githubusercontent.com/reshaprio/reshapr/refs/tags/0.0.8/install/docker-compose-all-in-one.yml...
✅ Compose file saved to /Users/you/.reshapr/docker-compose-0.0.8.yml
ℹ️  Starting Reshapr containers (release: 0.0.8)...
✅ Reshapr containers started successfully.
```

By default this pulls the **latest** stable release. You can also target a specific release or use the **nightly** build:

Run a specific release:

```bash
reshapr run --release 0.0.8
```

Run the nightly build (latest from main branch):

```bash
reshapr run --release nightly
```

The compose file is cached at `~/.reshapr/docker-compose-<release>.yml`, so subsequent runs reuse it without re-downloading.

## Check status

Once the containers are running, verify their status:

```bash
reshapr status
```

```bash
ℹ️  Reshapr containers (release: 0.0.8, started at: 2026-04-01T10:30:00.000Z)
NAME                           IMAGE                                        ...   STATUS
reshapr-ctrl-1                 registry.reshapr.io/reshapr/reshapr-ctrl:0.0.8           ...   Up 2 minutes
reshapr-proxy-1                registry.reshapr.io/reshapr/reshapr-proxy:0.0.8          ...   Up 2 minutes
reshapr-db-1                   postgres:17                                  ...   Up 2 minutes
```

The control plane is available at **`http://localhost:5555`** and the MCP gateway at **`http://localhost:7777`**.

## Log in with the CLI

With your user created, authenticate the CLI against your local control plane:

```bash
reshapr login --server http://localhost:5555
```

You'll be prompted for your username and password. Once authenticated:

:::info
The default username is `admin`, and the default password is `password`.
:::

```bash
reshapr login --server http://localhost:5555
```

```bash
ℹ️  Enter your credentials
✅ Login successful!
ℹ️  Welcome, admin!
ℹ️  Organization: reshapr
✅ Configuration saved to /Users/you/.reshapr/config
```

> From here, you can follow the **[Getting Started tutorial](../tutorials/getting-started.md)** to import services, create configuration plans, and expose MCP endpoints just point everything at your local instance.

## Stop the containers

When you're done, shut everything down:

```bash
reshapr stop
```

```bash
ℹ️  Stopping Reshapr containers (release: 0.0.8)...
✅ Reshapr containers stopped successfully.
```

This runs `docker compose down` on the saved compose file and cleans up the run state.

## Manual setup (without the CLI)

If you prefer to manage Docker Compose directly, clone the reShapr repository and use the provided scripts:

```bash
git clone https://github.com/reshaprio/reshapr.git
```

```bash
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
  registry.reshapr.io/reshapr/reshapr-proxy:nightly
```

The `install/` folder also includes helper scripts:

- `start-control-plane.sh` - a simple script to run the `docker compose` command above
- `start-proxy.sh` - a simple script to run the `docker run` command above

:::info
The `host.docker.internal` mapping lets the proxy container reach the control plane running on your host machine.
:::

## Next steps

- **[Getting Started with CLI](../tutorials/getting-started.md)** — import services and expose MCP endpoints
- **[Install on Kubernetes](./kubernetes.md)** — deploy reShapr using Helm charts
- **[How it works](../overview/how-it-works.md)** — understand the reShapr architecture
