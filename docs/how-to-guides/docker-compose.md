# Docker Compose

Learn how to run reShapr locally using Docker Compose for development and testing purposes.

**Last verified with reShapr 0.2.3 on September 3, 2026.**

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **[Docker](https://docs.docker.com/get-docker/)** with Docker Compose v2, or **[Podman](https://podman.io/)** with Compose support
- **[Node.js](https://nodejs.org/)** 20 or later, required by the reShapr CLI
- The **reShapr CLI** installed globally:

```bash
npm install -g @reshapr/reshapr-cli --allow-scripts=@scarf/scarf
```

## Quick start with the CLI

The simplest way to run reShapr locally is through `reshapr run`. Pin the release so the downloaded Compose file, container images, and this guide use the same version:

```bash
reshapr run --release 0.2.3
```

The CLI downloads the release-owned [`docker-compose-all-in-one.yml`](https://github.com/reshaprio/reshapr/blob/0.2.3/install/docker-compose-all-in-one.yml), updates its reShapr image tags to `0.2.3`, caches it under `~/.reshapr/`, and starts the stack in the background.

Without `--release`, the CLI resolves `latest` through GitHub Releases. Use an explicit release for a reproducible environment. Use `nightly` only when you deliberately want artifacts from the `main` branch:

```bash
reshapr run --release nightly
```

The CLI auto-detects Docker or Podman. To select one explicitly, use `--engine`:

```bash
reshapr run --release 0.2.3 --engine podman
```

Add the optional Web UI with `--ui`:

```bash
reshapr run --release 0.2.3 --ui
```

The Web UI addon is downloaded from the same release and becomes available at `http://localhost:3333`. The compose files are cached at `~/.reshapr/docker-compose-<release>.yml` and `~/.reshapr/docker-compose-ui-addon-<release>.yml`.

## Check status

Once the containers are running, verify their status:

```bash
reshapr status
```

The output identifies the selected release and container engine, then reports the Compose service status. Names and timestamps depend on your local engine and are not stable identifiers.

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

> From here, you can follow the **[Getting Started tutorial](../tutorials/getting-started.md)** to import services, create configuration plans, and expose MCP endpoints; just point everything at your local instance.

## Stop the containers

When you're done, shut everything down:

```bash
reshapr stop
```

This runs the selected engine's Compose `down` command on every saved compose file, including the Web UI addon when enabled, and cleans up the run state.

## Manual setup (without the CLI)

If you prefer to manage Docker Compose directly, check out the same release used by this guide:

```bash
git clone --branch 0.2.3 --depth 1 https://github.com/reshaprio/reshapr.git
cd reshapr
```

Start all services (control plane, gateway, and database) at once:

```bash
docker compose -f install/docker-compose-all-in-one.yml up -d
```

To include the Web UI, compose the addon with the base file:

```bash
docker compose -f install/docker-compose-all-in-one.yml \
  -f install/docker-compose-ui-addon.yml up -d
```

With Podman, replace `docker compose` with `podman compose` in these commands.

```bash
podman compose -f install/docker-compose-all-in-one.yml up -d
```

```bash
docker compose -f install/docker-compose-all-in-one.yml down
```

## Next steps

- **[Getting Started with CLI](../tutorials/getting-started.md)** — import services and expose MCP endpoints
- **[Helm Charts Overview](../references/helm-charts.md)** — choose a Kubernetes deployment topology
- **[How it works](../overview/how-it-works.md)** — understand the reShapr architecture
