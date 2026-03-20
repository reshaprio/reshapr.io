# Configuration Plan & Exposition

Before being turned into an MCP Server endpoint, a reShapr [Service](services-and-artifacts.md) must have a *Configuration Plan* defined. A Configuration Plan will allow you to define how your Service will be consumed by MCP Clients. You’ll define the **backend endpoint** the reShapr Gateway will target as well as the **security options** you want to apply to future expositions.

In a nutshell, a Configuration Plan will allow you to define:

- The backend endpoint URL of the existing service or API implementation you’re targeting,
- The list of the Service operations you’d like to expose - you can choose, for example to restrict access to read-only operations only, or to hide non-relevant operations,
- The [security options](security-model.md) you’ll like to enable for securing the access of the MCP endpoints - you can choose to secure access with an API key or using an OAuth Authorization Server,
- The required permissions needed to access the MCP Server tools, resources or prompts - you can specify additional scopes for the write operations for example.
- The [credentials Secret](services-and-artifacts.md) the MCP Server will present to authorize the access to the backend endpoint.

<aside>
💡

A reShapr Service can have multiple Configuration Plans that matches with different environments or lifecycle stages. A Configuration Plan is always associated to a specific version of a Service and has to be replicated for other versions.

</aside>

Creating a Configuration Plan is not enough for your MCP Server to be ready and usable by your MCP Client. In order to do, you must expose - ie **create an Exposition** - of your Configuration Plan. This last step before consuming a reShapr MCP Server endpoint is a simple declaration that allows you to target a reShapr Gateway. As introduced in[Why reShapr?](../overview/why-reshapr.md), reShapr allows deployment on different types and locations of Gateways depending on your subscription plan.

Creating an exposition is a simple operation that just associate a Configuration Plan to a Gateway Group - a logical representation of gateways actually running MCP Servers. Check our next [Gateway Group & Gateway](gateway-groups-and-gateways.md) section if you want to learn more. 

[Back to Home](../index.mdx)