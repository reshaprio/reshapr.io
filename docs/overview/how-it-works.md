# How It Works

reShapr is a zero-code AI translation layer. Instead of building an MCP server from scratch, you can use reShapr to instantly translate your existing APIs (REST, gRPC, GraphQL) into AI-native endpoints.

With reShapr, you can create secure MCP servers in seconds without coding by connecting the platform to your existing API artifacts.

As of today, reShapr supports ingesting:

- OpenAPI 3.x specifications
- GraphQL schemas
- gRPC/Protocol Buffer definitions

Once reShapr discovers your services, you configure:

- Security mechanisms
- Exposition options (all operations, read-only operations, etc.)
- Existing backend endpoint targets

Then reShapr exposes your MCP server through gateways in a multi-tenant and secure way.

:::info Core Architecture
At the core of reShapr is a robust architecture built to support service-level objectives and location constraints.

The platform has two major parts:

- **Control plane**: centralizes exposition configuration and policies.
- **Data plane**: gateways that expose MCP servers and route runtime traffic.
:::

This architecture supports multiple deployment models:

1. **Cloud SaaS**: reShapr hosts both control plane and data plane.
2. **Hybrid**: you host some gateways in your own trust domain while reShapr manages control.
3. **On-premises** (roadmap): both control and data planes in your own environment.

This is what flexibility means for enterprise MCP adoption.

See also:

- [Why reShapr?](./why-reshapr.md)
- [Configuration Plan and Exposition](../explanation/configuration-and-exposition.md)
- [Security Options and Secrets](../explanation/security-model.md)
- [Cloud Options and Plans](../reference/cloud-plans.md)
- [Hybrid Deployment](../how-to-guides/deploy-hybrid-gateway.md)
