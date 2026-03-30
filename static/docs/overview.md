# reShapr — Overview

https://reshapr.io/docs/overview/why-reshapr

---

## Why reShapr?

https://reshapr.io/docs/overview/why-reshapr

Building your own MCP server is a trap! At first glance it may seem straightforward, but most teams quickly realize:

- It's more than OpenAPI: you need translation layers, prompt guards, retries, rate limiting, and grounding logic.
- Security gets messy fast: how do you avoid exposing credentials in LLM prompts? How do you enforce identity, scope, and input validation?
- Fragility creeps in: most DIY solutions end up as brittle pipelines of JSON transforms, hardcoded logic, and embedded hacks.

This approach duplicates your API logic into a parallel MCP layer, creating unnecessary complexity and maintenance overhead. A smarter approach is to extend your existing API infrastructure, not reinvent it.

reShapr exists to solve this exact problem. Import your existing artifact — OpenAPI 3.x spec, GraphQL schema, or gRPC Protobuf definition — and reShapr instantly translates it into a secure, production-ready MCP server. Zero code. No rewrites. No custom Agents. No vendor lock-in.

---

## How It Works

https://reshapr.io/docs/overview/how-it-works

reShapr is a zero-code AI translation layer. It supports ingesting:

- OpenAPI 3.x specifications
- GraphQL schemas
- gRPC / Protocol Buffer definitions

Once reShapr discovers your services you configure:

1. Security mechanisms (None, API Key, OAuth2 Bearer)
2. Exposition options (all operations, read-only, custom inclusion/exclusion list)
3. Backend endpoint targets

reShapr then exposes your MCP server through gateways in a multi-tenant, secure way.

### Architecture

reShapr has two major parts:

- **Control plane**: centralises exposition configuration and policies
- **Data plane**: gateways that expose MCP servers and route runtime traffic

### Deployment models

1. **Cloud** — reShapr hosts both control plane and data plane
2. **Hybrid** — you host some gateways in your own trust domain; reShapr manages control
3. **On-premises** — both control and data plane in your own environment

### See also

- Why reShapr? — https://reshapr.io/docs/overview/why-reshapr
- Configuration Plan and Exposition — https://reshapr.io/docs/explanations/configuration-and-exposition
- Security Options and Secrets — https://reshapr.io/docs/explanations/security-model
- Hybrid Deployment — https://reshapr.io/docs/how-to-guides/deploy-hybrid-gateway

---

*For the full site index see https://reshapr.io/llms.txt*
