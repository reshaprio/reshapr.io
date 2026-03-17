# Getting started with CLI

This page details the installation and the basic usages of the reShapr Command Line Interface utility.

## Installation

The `reshapr` CLI is an NPM package available at [https://www.npmjs.com/package/reshapr-cli](https://www.npmjs.com/package/reshapr-cli). You can install it globally in your Linux or MacOS system.

In a terminal window, just issue the following command: 

```bash
npm install -g reshapr-cli
```

From there, you can check everything is correctly installed with:

```bash
reshapr --version
```

With this output:

```bash
0.0.8
```

The current `version` of the CLI is `0.0.8`. Please update if you previously used a previous version.

You can also check the embedded help with this command:

```bash
reshapr help
```

With this output:

```bash
Usage: reshapr [options] [command]

reShapr CLI - A command line interface for reShapr

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  oauth2            Manage OAuth2 clients from reShapr internal IDP
  service           Manage services in reShapr
  secret            Manage secrets in reShapr
  expo              Manage expositions in reShapr
  config            Manage configuration plans in reShapr
  gateway-group     Manage gateway groups in reShapr
  api-token         Manage API tokens in reShapr
  login [options]   Login to reShapr
  info              Display information about current context and the reShapr Server
  logout            Logout from reShapr
  import [options]  Import an artifact into reShapr
  attach [options]  Attach an artifact to a reShapr Service
  quotas [options]  List and check your reShapr quotas
  help [command]    display help for command
```

## Login to reShapr beta

As you may have received your login and password to join the beta program, you can use the `reshapr` CLI to connect to the control plane.

Use the following `login` command with the `-s` option (or `--server`) to specify you’re joining the beta platform:

```bash
reshapr login -s https://app.beta.reshapr.io
```

With this output that waits for your completion:

```bash
✔ Enter your reShapr username: <username>
✔ Enter your reShapr password:
ℹ️ Logging into reShapr at https://app.beta.reshapr.io...
✅ Login successful!
ℹ️ Welcome, <username>!
✅ Configuration saved to /Users/<username>/.reshapr/config
```

> 💡 *You can also use the `--username` and `--password` options to login without being prompted by the CLI.*
> 

You’ll see that your connection information and ephemeral token are stored under your home folder. `reshapr logout` allows you to clean up everything.

Once connected, you can check the platform information:

```bash
reshapr info
```

With this output:

```bash
ℹ️  User Information
  User        : <username>
  Organization: <organization>
  Server      : https://app.beta.reshapr.io
ℹ️  Server Information
  Version     : 0.0.1-SNAPSHOT
  Build time  : 2026-01-27T14:51:23Z
  Mode        : on-premises
  Internal IDP: https://idp.beta.reshapr.io
```

🤔 **From this step, you have two choices**: exploring the detailed concepts step-by-step and executing detailed commands **OR** going directly to the [All-in-one magic command 🪄](#all-in-one-magic-command-)

## Import Artifact & Service

Importing an artifact is the first step to expose MCP endpoints for your API. Artifacts enable the discovery of Services as explained in [Services & Artifacts](../explanation/services-and-artifacts.md). Let’s do that using the public [Open-Meteo OpenAPI specification](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml). For that we’ll need the [Raw URL of this document](https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml) and we’ll use the `import` command: 

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml
```

With this output:

```bash
✅ Import successful!
ℹ️ Discovered Service Open-Meteo APIs with ID: 0MX0VH15B5GNS
```

> 💡 *You can also import local files into reShapr using the `-f` option. There’s one caveat though: we’re not able to discover dependencies using this mode.*
> 

You can now list and check the discovered Service with the `service` command:

```bash
$ reshapr service list
==== OUTPUT ====
ID             NAME             VERSION  TYPE  AGE
0MX0VH15B5GNS  Open-Meteo APIs  1.0      REST  38m

$ reshapr service get 0MX0VH15B5GNS
==== OUTPUT ====
ℹ️  Service details
ID          : 0MX0VH15B5GNS
Name        : Open-Meteo APIs
Version     : 1.0
Organization: <organization>
Type        : REST
Created     : 2025-09-09T14:15:37.505+00:00
Operations:
  - Name: GET /v1/forecast
```

> 💡 *In case of mistake or unused Service, you can delete a service using the `reshapr service delete <id>` command.*
> 

## Configuring consumption

[Configuration Plan](../explanation/configuration-and-exposition.md) will allow you to define how your Service will be consumed by MCP Clients. You’ll define the **backend endpoint** the MCP Gateway will target as well as the **security options** for future expositions. Let’s create a simple configuration plan for the  [Open-Meteo Service](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml) we just imported.

For that, we need the Service identifier we got just before (`0MX0VH15B5GNS`) and we need to know the public endpoint of this API (`https://api.open-meteo.com`). We’ll use the `config create` command and provide a basic name and description:

```bash
reshapr config create 'open-meteo-manual' --description 'Manual Plan for Open-Meteo APIs' \
		--serviceId 0MX0VH15B5GNS --backendEndpoint https://api.open-meteo.com
```

With this output:

```bash
✅ Configuration plan 'open-meteo-manual' created successfully with ID: 0MX0VQEH35GPV
```

> 💡 *Likewise the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.*
> 

## Exposing an MCP Endpoint

Exposing a Configuration Plan will allow you to define where your Service will be made available to MCP Clients. By creating an exposition, you’ll define the **group of gateways** that will receive all the configuration information and will be in charge of exposing the MCP Endpoints.

> 🚨 *At time of the beta program launch, you don’t have much choice for now and have to deploy your exposition on default gateways. This will change in the future with different purpose-scoped gateways with different SLA, in different regions, etc. depending on your subscription.*
> 

To create an exposition, we need the Configuration Plan identifier we got earlier (`0MX0VQEH35GPV`) and we identify the group of gateways we want to deploy on. The default gateway group has the id `1`. We can then use the `expo create` command for that:

```bash
reshapr expo create --configuration 0MX0VQEH35GPV --gateway-group 1
```

With this output:

```bash
ℹ️  Exposition details
ID          : 0MX0VS3EB5GQ3
Created on  : 2025-09-09T14:16:43.634+00:00
Organization: <organization>
Service:
  ID     : 0MX0VH15B5GNS
  Name   : Open-Meteo APIs
  Version: 1.0
  Type   : REST
Configuration Plan
  ID             : 0MX0VQEH35GPV
  Name           : open-meteo-manual
  BackendEndpoint: https://api.open-meteo.com
  Included Ops.  : []
  Excluded Ops.  : []
Gateway Group
  ID    : 1
  Name  : Default Gateway Group
  Labels: {"env":"dev","team":"reshapr"}
Gateway Endpoints
  ID       : 0MX0WJKQZ5GZW
  Name     : reshapr-gateway-00
  Labels   : {"env":"dev","team":"reshapr"}
  Endpoints: mcp.beta.reshapr.io/mcp/<organization>/Open-Meteo+APIs/1.0
```

> 💡 *Likewise the `service` command, you can also use sub-commands like `list`, `get` or `delete` to manage your configurations.*
> 

🎉 Hooray! You deployed a MCP Endpoint! Check the `Endpoints` information just above (`mcp.beta.reshapr.io/mcp/<organization>/Open-Meteo+APIs/1.0`): you can use this endpoint with `https://` prefix in your favorite MCP Client to access your new MCP Server!

## All-in-one Magic command 🪄

In case you didn’t take the shortcut, here’s the all-in-one command that does the same as above:

```bash
reshapr import -u https://raw.githubusercontent.com/open-meteo/open-meteo/refs/heads/main/openapi.yml --backendEndpoint https://api.open-meteo.com
```

With this output:

```bash
✅ Import successful!
ℹ️  Discovered Service Open-Meteo APIs with ID: 0N0MYQJRKSYXX
✅ Exposition done!
✅ Exposition is now active!
Exposition ID  : 0N1VE4TZQSX7N
Organization   : reshapr
Created on     : 2025-09-24T14:27:43.997+00:00
Service ID     : 0N0MYQJRKSYXX
Service Name   : Open-Meteo APIs
Service Version: 1.0
Service Type   : REST -> https://api.open-meteo.com
Endpoints      : mcp.beta.reshapr.io/mcp/reshapr/Open-Meteo+APIs/1.0
```

Easy, No? 

🎉 Congrats! You deployed an MCP Endpoint with just one CLI command! Check the `Endpoints` information just above (`mcp.beta.reshapr.io/mcp/<organization>/Open-Meteo+APIs/1.0`): you can use this endpoint with `https://` prefix in your favorite MCP Client to access your new MCP Server!

[Back to Home](../index.mdx)