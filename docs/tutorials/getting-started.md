# Getting started with CLI

This page details the installation and the basic usages of the reShapr Command Line Interface utility.

## Installation

The `reshapr` CLI is an NPM package available at **[https://www.npmjs.com/package/@reshapr/reshapr-cli](https://www.npmjs.com/package/@reshapr/reshapr-cli)**. You can install it globally in your Linux or MacOS system.

In a terminal window, just issue the following command:

```bash
npm install -g @reshapr/reshapr-cli
```

From there, you can check everything is correctly installed with:

```bash
reshapr --version
```

With this output:

```bash
0.0.5
```

The current `version` of the CLI is `0.0.5`.

> We're iterating fast! Make sure you're on the latest version so you don't miss any of the new magic 🚀

You can also check the embedded help with this command:

```bash
reshapr help
```

With this output:

```bash
Usage: reshapr [options] [command]

Reshapr CLI - A command line interface for Reshapr

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  service           Manage services in Reshapr
  secret            Manage secrets in Reshapr
  expo              Manage expositions in Reshapr
  config            Manage configuration plans in Reshapr
  gateway-group     Manage gateway groups in Reshapr
  api-token         Manage API tokens in Reshapr
  login [options]   Login to Reshapr
  info              Display information about current context and the Reshapr Server
  logout            Logout from Reshapr
  import [options]  Import an artifact into Reshapr
  attach [options]  Attach an artifact to a Reshapr Service
  quotas [options]  List and check your Reshapr quotas
  run [options]     Start Reshapr locally using Docker Compose
  status            Show the status of locally running Reshapr
  stop              Stop locally running Reshapr containers
  help [command]    display help for command
```

## Login to reShapr beta

While we use the **[reShapr Online Try](/docs/tutorials/try-reshapr-online)** in this tutorial, you should point the server URL to your own environment if you have one set up. Common URLs include `http://localhost:5555` for Docker Compose or your cluster’s ingress URL for Kubernetes.

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

> 💡 If you're using your own setup, you can authenticate non-interactively with the `--username` and `--password` flags.

You’ll see that your connection information and ephemeral token are stored under your home folder. `reshapr logout` allows you to clean up everything.

Once connected, you can check the platform information:

```bash
reshapr info
```

With this output:

```bash
❯ reshapr info
ℹ️  User Information
  User        : yada
  Organization: yada
  Server      : https://app.try.reshapr.io
ℹ️  Server Information
  Version     : 0.0.4
  Build time  : 2026-03-17T17:26:05Z
  Mode        : on-premises
  Internal IDP: undefined
```

🤔 **From this step, you have two choices**: exploring the detailed concepts step-by-step and executing detailed commands **OR** going directly to the **[All-in-one magic command 🪄](#all-in-one-magic-command-)**

## Import Artifact & Service

Importing an artifact is the first step to expose MCP endpoints for your API. Artifacts enable the discovery of Services as explained in **[Services & Artifacts](../explanations/services-and-artifacts.md)**. Let’s do that using the public **[Open-Meteo OpenAPI specification](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml)**. For that we’ll need the **[Raw URL of this document](https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml)** and we’ll use the `import` command: 

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml
```

With this output:

```bash
✅ Import successful!
ℹ️  Discovered Service Open-Meteo APIs with ID: 0PXEW1ZDWFCZS
```

> 💡 You can also import local files into reShapr using the `-f` option. There’s one caveat though: we’re not able to discover dependencies using this mode.

You can now list and check the discovered Service with the `service` command:

```bash
❯ reshapr service list
ID             NAME             VERSION  TYPE  AGE
0PXEW1ZDWFCZS  Open-Meteo APIs  1.0      REST  19h

❯ reshapr service get 0PXEW1ZDWFCZS
ℹ️  Service details
ID          : 0PXEW1ZDWFCZS
Name        : Open-Meteo APIs
Version     : 1.0
Organization: yada
Type        : REST
Created     : 2026-03-28T19:06:26.029291
Operations :
  - Name: GET /v1/forecast
```

> 💡 In case of mistake or unused Service, you can delete a service using the `reshapr service delete <id>` command.

## Configuring consumption

**[Configuration Plan](../explanations/configuration-and-exposition.md)** will allow you to define how your Service will be consumed by MCP Clients. You’ll define the **backend endpoint** the MCP Gateway will target as well as the **security options** for future expositions. Let’s create a simple configuration plan for the  **[Open-Meteo Service](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml)** we just imported.

For that, we need the Service identifier we got just before (`0PXEW1ZDWFCZS`) and we need to know the public endpoint of this API (`https://api.open-meteo.com`). We’ll use the `config create` command and provide a basic name and description:

```bash
reshapr config create 'open-meteo-manual' --description 'Manual Plan for Open-Meteo APIs' \
--serviceId 0PXEW1ZDWFCZS --backendEndpoint https://api.open-meteo.com
```

With this output:

```bash
✅ Configuration plan 'open-meteo-manual' created successfully with ID: 0PXPDMB4MFE6H
```

> 💡 Likewise the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.

## Exposing an MCP Endpoint

Exposing a Configuration Plan will allow you to define where your Service will be made available to MCP Clients. By creating an exposition, you’ll define the **group of gateways** that will receive all the configuration information and will be in charge of exposing the MCP Endpoints.

To create an exposition, we need the Configuration Plan identifier we got earlier (`0PXPDMB4MFE6H`) and we identify the group of gateways we want to deploy on. The default gateway group has the id `1`. We can then use the `expo create` command for that:

```bash
reshapr expo create --configuration 0PXPDMB4MFE6H --gateway-group 1
```

With this output:

```bash
✅ Exposition created successfully with ID: 0PXPE6HPWFE4H
ℹ️  Exposition details
ID          : 0PXPE6HPWFE4H
Created on  : 2026-03-29T12:44:22.327792751
Organization: yada
Service:
  ID     : 0PXEW1ZDWFCZS
  Name   : Open-Meteo APIs
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
    Endpoints: mcp.try.reshapr.io/mcp/yada/Open-Meteo+APIs/1.0
  - ID       : 0PX4AF4200HQG
    Name     : prod-mcp-try-reshapr-proxy-7f8d7f6d89-jhvtd
    Endpoints: mcp.try.reshapr.io/mcp/yada/Open-Meteo+APIs/1.0
```

> 💡 Likewise the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.

🎉 Hooray! You deployed a MCP Endpoint! Check the `Endpoints` information just above (`mcp.try.reshapr.io/mcp/<organization>/Open-Meteo+APIs/1.0`): you can use this endpoint with `https://` prefix in your favorite MCP Client to access your new MCP Server!

## All-in-one Magic command 🪄

In case you didn’t take the shortcut, here’s the all-in-one command that does the same as above:

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml --backendEndpoint https://api.open-meteo.com
```

With this output:

```bash
✅ Import successful!
ℹ️  Discovered Service Open-Meteo APIs with ID: 0PXEW1ZDWFCZS
✅ Exposition done!
✅ Exposition is now active!
Exposition ID  : 0PXPF1JQWFEF0
Organization   : yada
Created on     : 2026-03-29T12:48:03.775297
Service ID     : 0PXEW1ZDWFCZS
Service Name   : Open-Meteo APIs
Service Version: 1.0
Service Type   : REST -> https://api.open-meteo.com
Endpoints      : mcp.try.reshapr.io/mcp/yada/Open-Meteo+APIs/1.0
```

Easy, No!

🎉 Congrats! You deployed an MCP Endpoint with just one CLI command! Check the `Endpoints` information just above (`mcp.try.reshapr.io/mcp/<organization>/Open-Meteo+APIs/1.0`): you can use this endpoint with `https://` prefix in your favorite MCP Client to access your new MCP Server!
