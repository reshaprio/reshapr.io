---
description: Turn a versioned Open-Meteo contract into a reShapr MCP endpoint, then discover, list, and call its generated Tool.
---

# Your First MCP Endpoint, End to End

Import an OpenAPI contract, create a Configuration Plan and Exposition, then call a generated Tool and observe live weather data returned through reShapr.

**Last verified with reShapr 0.2.3 on September 4, 2026.**

## Prerequisites

- Node.js 20 or later
- `curl` and `jq`
- Access to the **[reShapr Online Try](./try-reshapr-online.md)** or a **[local reShapr 0.2.3 environment](../how-to-guides/docker-compose.md)**
- Outbound access to GitHub and `https://api.open-meteo.com`

## Installation

The `reshapr` CLI is an NPM package available at **[https://www.npmjs.com/package/@reshapr/reshapr-cli](https://www.npmjs.com/package/@reshapr/reshapr-cli)**. It requires Node.js 20 or later and can be installed globally on Linux or macOS.

We recommend installing the CLI with anonymous usage telemetry enabled:

```bash
npm install -g @reshapr/reshapr-cli --allow-scripts=@scarf/scarf
```

The `--allow-scripts=@scarf/scarf` option explicitly authorizes Scarf's installation telemetry script. These anonymous metrics help the community measure adoption and support the project's future donation to the **[Agentic AI Foundation (AAIF)](https://aaif.io/)**.

Telemetry is optional. **[Learn why we collect these metrics](https://github.com/reshaprio/reshapr.io/issues/27)**.

To install the CLI without enabling telemetry, use:

```bash
npm install -g @reshapr/reshapr-cli
```

The CLI remains fully functional when telemetry is not enabled.

To remember your approval for future global installations, you can optionally configure npm at the user level:

```bash
npm config set allow-scripts=@scarf/scarf --location=user
```

Check that everything is correctly installed:

```bash
reshapr --version
```

Then inspect the current command index:

```bash
reshapr --help
```

The command list evolves with the CLI. Use the embedded help as the source of truth and the **[CLI reference](../references/cli-commands.md)** for command details.

## Login to reShapr

While we use the **[reShapr Online Try](./try-reshapr-online.md)** in this tutorial, you should point the server URL to your own environment if you have one set up. Common URLs include `http://localhost:5555` for Docker Compose or your cluster’s ingress URL for Kubernetes.

Use the following `login` command with the `-s` option (or `--server`) to specify you’re joining the beta platform:

```bash
reshapr login -s https://try.reshapr.io
```

Once this output appears, the system will wait for you to complete the authentication process:

```bash
❯ reshapr login -s https://try.reshapr.io
ℹ️  Opening browser: https://try.reshapr.io/cli/login?redirect_uri=http://localhost:5556
ℹ️  Listening for authentication callback on http://localhost:5556
✅ Login successful!
ℹ️  Welcome, yada!
ℹ️  Organization: yada
✅ Configuration saved to /Users/yacine/.reshapr/config
```

:::info
If you're using your own setup, you can authenticate non-interactively with the `--username` and `--password` flags.
:::

You’ll see that your connection information and ephemeral token are stored under your home folder. `reshapr logout` allows you to clean up everything.

Once connected, you can check the platform information:

```bash
reshapr info
```

Example output (user, organization, paths, and URLs vary):

```bash
❯ reshapr info
ℹ️  User Information
  User        : yada
  Organization: yada
  Server      : https://app.try.reshapr.io
ℹ️  Server Information
  Version     : 0.2.3
  Build time  : <build timestamp>
  Mode        : on-premises
  Internal IDP: undefined
```

:::info
**From this step, you have two choices**: exploring the detailed concepts step-by-step and executing detailed commands **OR** going directly to the **[All-in-one magic command 🪄](#all-in-one-magic-command-)**
:::

## Import Artifact & Service

Importing an artifact is the first step to exposing MCP endpoints for your API. Artifacts enable the discovery of Services as explained in **[Services & Artifacts](../explanations/services-and-artifacts.md)**. Let’s do that using the public **[Open-Meteo 1.5.6 OpenAPI specification](https://github.com/open-meteo/open-meteo/blob/1.5.6/openapi/forecast.yml)** and its immutable raw URL:

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/1.5.6/openapi/forecast.yml
```

Example output (the generated identifier will differ):

```bash
✅ Import successful!
ℹ️  Discovered Service Open-Meteo Weather Forecast API with ID: 0PXEW1ZDWFCZS
```

:::info
You can also import local files into reShapr using the `-f` option. There’s one caveat, though: we’re not able to discover dependencies using this mode.
:::

You can now list and check the discovered Service with the `service` command:

```bash
❯ reshapr service list
ID             NAME                             VERSION  TYPE  AGE
0PXEW1ZDWFCZS  Open-Meteo Weather Forecast API  1.0      REST  19h

❯ reshapr service get 0PXEW1ZDWFCZS
ℹ️  Service details
ID          : 0PXEW1ZDWFCZS
Name        : Open-Meteo Weather Forecast API
Version     : 1.0
Organization: yada
Type        : REST
Created     : 2026-03-28T19:06:26.029291
Operations :
  - Name: GET /v1/forecast
```

:::info
In case of a mistake or unused Service, you can delete a service using the `reshapr service delete <id>` command.
:::

## Configuring consumption

**[Configuration Plan](../explanations/configuration-and-exposition.md)** will allow you to define how your Service will be consumed by MCP Clients. You’ll define the **backend endpoint** the MCP Gateway will target as well as the **security options** for future expositions. Let’s create a simple configuration plan for the **[Open-Meteo Service](https://github.com/open-meteo/open-meteo/blob/1.5.6/openapi/forecast.yml)** we just imported.

For that, we need the Service identifier we got just before (`0PXEW1ZDWFCZS`), and we need to know the public endpoint of this API (`https://api.open-meteo.com`). We’ll use the `config create` command and provide a basic name and description:

```bash
reshapr config create 'open-meteo-manual' --description 'Manual Plan for Open-Meteo APIs' \
--serviceId 0PXEW1ZDWFCZS --backendEndpoint https://api.open-meteo.com
```

Example output (the generated identifier will differ):

```bash
✅ Configuration plan 'open-meteo-manual' created successfully with ID: 0PXPDMB4MFE6H
```

> Like the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.

## Exposing an MCP Endpoint

Exposing a Configuration Plan will allow you to define where your Service will be made available to MCP Clients. By creating an exposition, you’ll define the **group of gateways** that will receive all the configuration information and will be in charge of exposing the MCP Endpoints.

To create an exposition, we need the Configuration Plan identifier we got earlier (`0PXPDMB4MFE6H`), and we identify the group of gateways we want to deploy on. The default gateway group has the id `1`. We can then use the `expo create` command for that:

```bash
reshapr expo create --configuration 0PXPDMB4MFE6H --gateway-group 1
```

Example output (identifiers, Gateway names, and endpoints will differ):

```bash
✅ Exposition created successfully with ID: 0PXPE6HPWFE4H
ℹ️  Exposition details
ID          : 0PXPE6HPWFE4H
Created on  : 2026-03-29T12:44:22.327792751
Organization: yada
Service:
  ID     : 0PXEW1ZDWFCZS
  Name   : Open-Meteo Weather Forecast API
  Version: 1.0
  Type   : REST
Configuration Plan
  ID             : 0PXPDMB4MFE6H
  Name           : open-meteo-manual
  BackendEndpoint: https://api.open-meteo.com
  Included Ops.  : []
  Excluded Ops.  : []
Gateway Group
  ID    : 1
  Name  : Default Gateway Group
  Labels: {"env":"dev","team":"reshapr"}
Gateway Endpoints
  - ID       : 0PX4AF0BM0H7Z
    Name     : prod-mcp-try-reshapr-proxy-7f8d7f6d89-c5jln
    Endpoints: mcp.try.reshapr.io/mcp/yada/Open-Meteo+Weather+Forecast+API/1.0
  - ID       : 0PX4AF4200HQG
    Name     : prod-mcp-try-reshapr-proxy-7f8d7f6d89-jhvtd
    Endpoints: mcp.try.reshapr.io/mcp/yada/Open-Meteo+Weather+Forecast+API/1.0
```

> Like the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.

🎉 Congrats! You now have an MCP endpoint. Use the endpoint returned by the command, including its `https://` prefix, for the following verification.

## Verify the MCP endpoint

Set the exact endpoint URL returned by `reshapr expo create`:

```bash
export MCP_URL='https://mcp.try.reshapr.io/mcp/<organization>/Open-Meteo+Weather+Forecast+API/1.0'
```

Discover the server using the stateless MCP `2026-07-28` protocol:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result | {supportedVersions, capabilities, serverInfo: ._meta["io.modelcontextprotocol/serverInfo"]}'
```

The response must include `2026-07-28` in `supportedVersions`.

List the available Tools and confirm the Open-Meteo operation is present:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/list' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq '.result.tools[].name'
```

The list must contain `get_v1_forecast`. Call it and inspect the current weather returned by the backend:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/call' \
  --header 'Mcp-Name: get_v1_forecast' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_v1_forecast","arguments":{"latitude":"48.8566","longitude":"2.3522","current":["temperature_2m","weather_code","wind_speed_10m"],"timezone":"Europe/Paris"},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "$MCP_URL" | jq -r '.result.content[0].text | fromjson | .current'
```

A JSON object containing the current temperature and weather values confirms that the Exposition, Gateway, and backend call work end to end.

:::tip Compatibility
reShapr also supports earlier MCP versions. Clients using `2025-11-25` or earlier use the legacy `initialize` handshake and a server-issued `MCP-Session-Id`. Session headers must not be used with stateless `2026-07-28` requests.
:::

## All-in-one Magic command 🪄

In case you didn’t take the shortcut, here’s the all-in-one command that does the same as above:

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/1.5.6/openapi/forecast.yml --backendEndpoint https://api.open-meteo.com
```

Example output (identifiers and endpoint will differ):

```bash
✅ Import successful!
ℹ️  Discovered Service Open-Meteo Weather Forecast API with ID: 0PXEW1ZDWFCZS
✅ Exposition done!
✅ Exposition is now active!
Exposition ID  : 0PXPF1JQWFEF0
Organization   : yada
Created on     : 2026-03-29T12:48:03.775297
Service ID     : 0PXEW1ZDWFCZS
Service Name   : Open-Meteo Weather Forecast API
Service Version: 1.0
Service Type   : REST -> https://api.open-meteo.com
Endpoints      : mcp.try.reshapr.io/mcp/yada/Open-Meteo+Weather+Forecast+API/1.0
```

🎉 Congrats! You deployed an MCP Endpoint with just one CLI command! Use the returned endpoint with the verification steps above to confirm the one-command path end to end.

## Result

You imported a versioned OpenAPI contract, created the Service, Configuration Plan, and Exposition, then proved the endpoint works with `server/discover`, `tools/list`, and a live `tools/call` response from Open-Meteo.

## Limits

- The Configuration Plan in this tutorial leaves the MCP endpoint unauthenticated. Protect it before sharing its URL.
- Open-Meteo is an external service with its own availability and usage terms; the returned weather values vary by time.
- One successful Tool call validates this Exposition and operation, not every operation in the imported contract.

## Next step

- **[Context Control in Practice](./context-control-in-practice.md)** turns this generated operation into a focused Tool and measures response filtering.
- **[Test an MCP endpoint](../how-to-guides/test-mcp-endpoint.md)** with stateless or session-based clients and diagnose common errors.
- **[Protect the endpoint with an API key](../how-to-guides/security/api-key.md)** and verify key rotation.
