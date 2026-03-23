import ThemedImage from '@theme/ThemedImage';

# Hybrid deployment

As introduced in [Why reShapr?](../overview/why-reshapr.md), the reShapr architecture allows deployment on several types and locations of Gateways, depending on your subscription plan. Thanks to this flexible architecture, the reShapr solution can be used in a **hybrid deployment** mode where you, as the *Acme Company*, can choose to host some reShapr Gateways within your own trust domain, close to your AI workloads and API backend endpoints. This gives you **full control over the data plane,** ensuring that your data never leaves your trusted environment!

This page explains how a reShapr hybrid deployment is working and how to implement it.

## Overview

The [Gateway Group & Gateway](../explanation/gateway-groups-and-gateways.md) page introduces the core concepts of this deployment architecture:

- The *Gateway Groups* represent the abstract target of your MCP Server exposition - it is owned by an organization and defines labels for matching *Gateways*,
- The *Gateways* are the concrete elements that expose your MCP Servers - they receive deployment directives and configuration plans from the reShapr control plane. **

<ThemedImage
  alt="Hybrid Deployment"
  sources={{
    light: '/img/docs/deploy-hybrid-gateway-light.svg',
    dark: '/img/docs/deploy-hybrid-gateway-dark.svg',
  }}
/>

When it’s running, a reShapr Gateway discovers the MCP Servers it has to expose from the control plane. This discovery is made according to the [Exposition](../explanation/configuration-and-exposition.md) you previously created and the Gateway Groups you chose. To do so, the Gateway presents **a set of label selectors** that will be used during the discovery and throughout its lifetime to synchronize its [Service](../explanation/services-and-artifacts.md) definitions and [Configuration Plans](../explanation/configuration-and-exposition.md). While it is alive, an ephemeral Gateway representation is tied to the Gateway Group in the control plane.

<aside>
💡

A Gateway is not necessarily attached to a single Gateway Group; it can be attached to many groups as long as its selectors match the group's labels! You could have a set of Gateways with a unique selector `org=acme` matching all the Acme’s Gateway Groups.

</aside>

### Lifecycle

A *Gateway* starts, lives, and terminates according to a certain lifecycle. Below are the different elements covering this lifecycle:

1.  The first stage of a Gateway life is the **Registration phase**. A Gateway is configured to be connected to a control plane instance (a hostname and a port). During startup, the Gateway advertises itself to the control plane, providing an API Token for authentication, its unique identifier, its label selectors, and the information of the URLs which can be used for reaching this Gateway. 
    1. If authentication is successful, then the Gateway is registered into the control plane, and it fetches its [Service](../explanation/services-and-artifacts.md) definitions and [Configuration Plans](../explanation/configuration-and-exposition.md) for exposing the MCP Servers,
    2. If authentication failed, then the Gateway stops with an error message.
2. After successful registration, the Gateway starts a **Health check** process. This health check will be done every 2 minutes and is acknowledged by the control plane. 
    1. If a health check cannot happen because of the control plane being unavailable, the Gateway is considered as *unsynchronized* - a **Registration** phase will be done upon reconnection,
    2. If the control plane doesn’t receive a health check from the Gateway in a 5-minute period, it removes this Gateway from its internal list and marks it as *unsynchronized*. It will force a new **Registration**.
    3. MCP Servers execution is not interrupted during health check issues. 
3. After successful registration, the Gateway also starts a **Changes Streaming** process: the control plane is able to push it the relevant notification changes based on its label selectors. 
    1. Upon changes reception, the MCP Servers are immediately updated or removed without interruption.
    2. If a new **Registration** happen (due to a connectivity issue), this streaming process is updated accordingly.
4. On process shutdown, the Gateway starts the **Termination** phase: 
    1. Health checks are stopped, and a termination notification is sent to the control plane for the removal of its internal Gateway representation.
    2. The changes streaming process is stopped, and communication is cleaned. 
    3. MCP Servers stop handling incoming requests.
    

### Security

It’s worth noting the following security characteristics of this architecture:

- Communication between the control plane and Gateways is always at the initiative of the gateways through an upstream network channel. The Gateway must be able to reach out to the control plane, and then bi-directional streaming is set up on the same communication channel. Network admin doesn’t have to set up any ingress access for the control plane to reach out to the Gateway - only the egress route to the control plane is necessary.
- Communication is done over [gRPC](https://en.wikipedia.org/wiki/GRPC) protocol, that used [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) with [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security). On top of that, reShapr implements token-based authorization with an API Token that is generated, renewed, and revoked by the control plane. You can decide to share the API Token among different gateways or have an API Token per-gateway,
- When running in this hybrid mode, the control plane only holds the configuration of your MCP Servers: the [Services & Artifacts](../explanation/services-and-artifacts.md) definition as well as the [Configuration Plan & Exposition](../explanation/configuration-and-exposition.md). All the application data : the exchanges between your Agents, LLM, MCP Clients, and your backend API (included the reShapr MCP Servers) stay in your datacenter!
- Because the Gateway runs in the location of your choice, they can now access any private Authorization Server or IDP you may want to use via the [Security options & Secrets](../explanation/security-model.md)!

 

## Installation

### Prerequisites: Get the reShapr Gateway container image

First thing you'll need is access to the Gateway container image. As of now, you need to pull it from a temporary location with an ephemeral and dedicated URL. The container image is hosted on [ttl.sh](https://ttl.sh/), and you have to get your own unique URL from the reShapr team.

For example, a typical URL for the reShapr Gateway container image looks like this: `ttl.sh/reshapr-gateway-276ee61b-1378-470c-9651-72cdb094c6e4:12h`

### Retrieve an API Token for your Gateway(s)

To retrieve an API token for your gateway(s), follow these steps from the reShapr CLI.

1. Log in to the Control Plane using the following command:
    
    ```bash
    reshapr login
    ```
    
2. Once logged in, use the following command to generate a new API token with a validity period of 90 days (which is the maximum allowed):
    
    ```bash
    reshapr api-token create <my-gateway-token> -v 90
    ```
    
    This command will display the value of the newly created API token in the terminal. Typically, something like:
    
    ```bash
    ⚠️  The API Token to register Gateway is: acme-oXYvTI8f8BeuJ5-HlNuon6vs2wSao8qS7WRNIYwoFW4
    ⚠️  Make sure to store it securely, as it will not be shown again.
    ```
    
3. Copy the displayed API token and store it securely, as it will not be shown again. You will need this token to register your gateway(s) with the Control Plane.

### Define or identify a Gateway Group for your Gateway(s)

Before registering your gateway(s), you need to define or identify a Gateway Group in the Control Plane.
A Gateway Group is a logical grouping of gateways that share common configurations and policies.

1. You can list your gateway groups using the following CLI command. If you already have a Gateway Group that you want to use, make a note of its ID and labels.
    
    ```bash
    reshapr gateway-group list
    ```
    
    This is the default output you'll get the first time:
    
    ```bash
    ID             ORG     NAME                        LABELS
    1              reshapr  Default Gateway Group       {"env":"dev","team":"reshapr"}
    ```
    
2. If you do not have an existing Gateway Group that suits your needs, you can create a new one using the following command.
You can use labels that will help you identify and manage your gateways effectively and are appropriate for your use case:
    
    ```bash
    reshapr gateway-group create 'QA Gateway Group for XYY' --labels '{"env":"qa", "project":"xyz"}'
    ```
    
    This command will create a new Gateway Group and display its details, similar to the following:
    
    ```bash
    ✅ Gateway group 'QA Gateway Group for XYY' created successfully with ID: 0P58T3XKK1MEQ
    ```
    
3. Make a note of the *Gateway Group* ID and labels, as you will need them when registering your gateway(s).

### Start/Register your Gateway(s) with the Control Plane

To start and register your gateway(s) with the control plane, you will need to provide the API token and *Gateway Group* information you obtained in the previous steps.

When starting the reShapr Gateway container, you need to set the following environment variables:

- `RESHAPR_CTRL_HOST`: The hostname of the reShapr Control Plane (e.g., `app.beta.reshapr.io`).
- `RESHAPR_CTRL_PORT`: The port number of the reShapr Control Plane (e.g., `443`).
- `RESHAPR_CTRL_TLS_PLAINTEXT` : A flag to disable plain text communication over TLS. Set it to `false`.
- `RESHAPR_CTRL_TOKEN`: The API token you retrieved to authorize your gateway.
- `RESHAPR_GATEWAY_ID`: A unique identifier for your gateway (e.g., `acme-gateway-01`).
- `RESHAPR_GATEWAY_FQDNS`: A comma-separated list of *Fully Qualified Domain Names* that represent the hosts that can be used to reach out to your gateway. If none are provided, it defaults to `localhost`.
- `RESHAPR_GATEWAY_LABELS`: The labels associated with your gateway, in the format `key1=value1,key2=value2`. These labels must match the ones from the *Gateway Group* you're targeting (e.g., `env=qa,region=eu-west-3`).

> ⚠️ **Important:** The Gateway ID must be unique across all gateways registered in the Control Plane! We recommend using a naming convention that includes your organization to ensure uniqueness.
> 

The port `7777` is the default port used by the reShapr Gateway for incoming traffic. You can adjust this port mapping as needed.

Here is an example `docker run` command to start the reShapr Gateway container with the necessary environment variables:

```bash
docker run -it --rm -p 7777:7777 \\
    -e RESHAPR_CTRL_HOST=app.beta.reshapr.io \
    -e RESHAPR_CTRL_PORT=443 \
    -e RESHAPR_CTRL_TLS_PLAINTEXT=false \
    -e RESHAPR_CTRL_TOKEN=acme-oXYvTI8f8BeuJ5-HlNuon6vs2wSao8qS7WRNIYwoFW4 \
    -e RESHAPR_GATEWAY_ID=acme-gateway-01 \
    -e RESHAPR_GATEWAY_FQDNS=mcp-1.qa.acme.com,mcp-2.qa.acme.com \
    -e RESHAPR_GATEWAY_LABELS=env=qa \
    ttl.sh/reshapr-gateway-276ee61b-1378-470c-9651-72cdb094c6e4:12h
```

### Deploy your MCP Endpoint on the Gateway

Once your reShapr Gateway is up and running and registered with the Control Plane, you can deploy your MCP Endpoint on it. Actually, you don't directly deploy the MCP Endpoint on the Gateway, but you rather specify a Gateway Group that should be used when exposing your MCP Endpoint. If your Gateway belongs to that Gateway Group and is started, the MCP Endpoint will be automatically deployed on that Gateway.

Using the reShapr CLI, you can specify the `--gateway-group` parameter to indicate which Gateway Group should be used for that endpoint.
Reusing the Gateway Group created in the previous steps, here is an example command to create an MCP Endpoint associated with that Gateway Group:

```bash
reshapr expo create --configuration 0P5GDHQHB1MZS --gateway-group 0P58T3XKK1MEQ
```

You should then see some logs on the Gateway side that receive information about your MCP Server to expose.

[Back to Home](../index.mdx)