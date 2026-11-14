---
description: Run reShapr locally on a Mac with apple/container instead of Docker or Podman.
---

# Run reShapr on apple/container

Use this procedure to run the reShapr control plane, proxy and database on macOS with [apple/container](https://github.com/apple/container), where each container runs in its own lightweight virtual machine. The CLI starts the same stack as the [Docker Compose guide](./docker-compose.md), without Docker or Podman.

## Prerequisites

You need:

- a Mac with Apple silicon and macOS 26 or later;
- **[apple/container](https://github.com/apple/container/releases)** 1.7 or later, with its services started:

```bash
container system start
```

- **[Node.js](https://nodejs.org/)** 20 or later, required by the reShapr CLI;
- the **reShapr CLI** at a release that supports the `apple` engine:

```bash
npm install -g @reshapr/reshapr-cli@<release> --allow-scripts=@scarf/scarf
```

No `sudo` step is needed for this procedure.

## Start reShapr

Select the engine explicitly with `--engine apple`:

```bash
reshapr run --release <release> --engine apple
```

If `docker` and `podman` are not installed, the CLI detects `container` and selects `apple` on its own. When Docker or Podman is also present, the CLI prefers them, so pass `--engine apple` to choose apple/container.

apple/container has no Compose. The CLI downloads the release-owned Compose file, reads each service's image, environment and published ports, and starts the services with `container run` in `depends_on` order. It replays each healthcheck inside its container before starting dependents. Containers reach each other by IP address: the CLI replaces service names found in environment values with the IPs of the started containers.

Add the optional Web UI with `--ui`:

```bash
reshapr run --release <release> --engine apple --ui
```

## Check status

```bash
reshapr status
```

The output lists the services and their state. The control plane is available at **`http://localhost:5555`**, the MCP proxy at **`http://localhost:7777`**, and the Web UI, when enabled, at **`http://localhost:3333`**.

## Log in with the CLI

```bash
reshapr login --server http://localhost:5555
```

Use the default `admin` user and the default `password`, as described in the [Docker Compose guide](./docker-compose.md#log-in-with-the-cli). Then follow **[Your First MCP Endpoint, End to End](../tutorials/getting-started.md)** to import an API, expose it and call a Tool through the proxy.

## Stop the containers

```bash
reshapr stop
```

The CLI stops and deletes the containers it started and cleans up the run state.

## Result

`reshapr status` reports the services as running, the control plane responds at `http://localhost:5555`, and the proxy accepts MCP requests at `http://localhost:7777`.

## Limits

- This topology is intended for local development and testing, not production availability or durability.
- The CLI ignores the Compose `restart`, `extra_hosts` and `volumes` settings. A container that crashes stays stopped, and the host alias `host.docker.internal` is not available. The CLI warns when an environment value refers to it, for example an optional host identity provider.
- Containers are wired by IP address, because name resolution between containers needs a host DNS setup that requires `sudo` (`container system dns create`).
- The CLI refuses to start when containers from a previous run still exist. Run `reshapr stop` first.
- A single proxy runs on this engine. A clustered gateway needs a shared keystore and several A records for one name, which plain containers do not provide. Use Kubernetes for that topology.
- Published ports are the release defaults. If another stack, such as Docker Desktop, already publishes `5555` or `7777`, stop it first.

## Next step

- **[Your First MCP Endpoint, End to End](../tutorials/getting-started.md)**: import, expose and call an API Tool
- **[Docker Compose](./docker-compose.md)**: the same stack on Docker or Podman
- **[Helm Charts Overview](../references/helm-charts.md)**: choose a Kubernetes deployment topology
