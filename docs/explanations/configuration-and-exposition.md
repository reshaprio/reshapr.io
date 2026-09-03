---
description: Define Configuration Plans and Expositions to control how Services become MCP Server endpoints.
---

# Configuration Plan & Exposition

Before being turned into an MCP Server endpoint, a reShapr **[Service](services-and-artifacts.md)** must have a *Configuration Plan* defined. A Configuration Plan will allow you to define how your Service will be consumed by MCP Clients. You’ll define the **backend endpoint** the reShapr Gateway will target as well as the **security options** you want to apply to future expositions.

In a nutshell, a Configuration Plan will allow you to define:

- The backend endpoint URL of the existing service or API implementation you’re targeting,
- The list of the Service operations you’d like to expose - you can choose, for example, to restrict access to read-only operations only, or to hide non-relevant operations,
- The attached Prompts, Resources, Custom Tools, and output filters to include. When no artifact is selected, all artifacts attached to the Service are included,
- The client cache policy for MCP `2026-07-28`, when clients support the corresponding cache hints,
- Whether the Gateway emits audit events for calls made through the Plan,
- The **[security options](security-model.md)** you’d like to enable for securing the access of the MCP endpoints - you can choose to secure access with an API key or using an OAuth Authorization Server,
- The OAuth scopes required to access an Exposition. These scopes protect the Exposition as a whole; reShapr does not apply different OAuth scopes or claims to individual tools, Resources, or Prompts,
- The **[credentials Secret](services-and-artifacts.md)** the MCP Server will present to authorize access to the backend endpoint.

A reShapr Service can have multiple Configuration Plans that match different environments or lifecycle stages. A Configuration Plan is always associated with a specific version of a Service and has to be replicated for other versions.

Creating a Configuration Plan is not enough for your MCP Server to be ready and usable by your MCP Client. To do so, you must expose - ie **create an Exposition** - of your Configuration Plan. This last step before consuming a reShapr MCP Server endpoint is a simple declaration that allows you to target a reShapr Gateway.

Creating an exposition is a simple operation that associates a Configuration Plan to a Gateway Group - a logical representation of gateways actually running MCP Servers. Check our next **[Gateway Group & Gateway](gateway-groups-and-gateways.md)** section if you want to learn more.
