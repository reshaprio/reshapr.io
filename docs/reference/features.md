# reShapr Features

Want to get all the features in a nutshell? This is where you can find all of them with pointers to the documentation and demos!  

## API Translation

- OpenAPI 2.x & 3.x ([🎬](https://www.youtube.com/watch?v=W1xfiBpGzI0)), GraphQL Schema ([🎬](https://www.youtube.com/watch?v=5dLpRzFJkqU)), gRPC Protobuffer 3 ([🎬](https://www.youtube.com/watch?v=eptKmTh5r6Y)) to MCP Server no-code translation
- Full API re-shaping capabilities:
  - Rename existing API ([🎬](https://www.youtube.com/watch?v=5dLpRzFJkqU))
  - Split an existing API by including or excluding chosen API operations
  - Adapt to your Agentic context, defining `CustomTools` by renaming, condensing, translating default operations ([🎬](https://www.youtube.com/watch?v=3PU0iQzTuYI))

## MCP support

- Support of [2023-11-25](https://modelcontextprotocol.io/specification/2025-11-25) and [2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) versions
- MCP [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http)
- `Tools`, `Prompts` and `Resources` ([📄](prompts-specification.md))
- [URL Mode with Elicitation Required Error](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-with-elicitation-required-error-flow) ([📄](../explanation/security-model.md))
- [OAuth Authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) for endpoint security ([📄](../explanation/security-model.md))

## Security

- **MCP Endpoint security:**
  - HTTP with TLS Transport
  - API key management ([📄](cli-commands.md))
  - OAuth Authorization with support of OAuth 2.0 Dynamic Client Registration Protocol ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)), OAuth 2.0 Protected Resource Metadata ([RFC9728](https://datatracker.ietf.org/doc/html/rfc9728)), OAuth 2.0 Authorization Server Metadata ([RFC8414](https://datatracker.ietf.org/doc/html/rfc8414)), OAuth 2.0 Resource Indicators ([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html)) ([📄](../explanation/security-model.md))
  - Secure Production Identity Framework for Everyone ([SPIFFE](https://spiffe.io/)) support
  - Custom Authorization Server integration
  - Configurable scopes or claims per tool
- **End-user / backend endpoint security:**
  - Header transmission and header translation
  - [URL Mode Elicitation for Sensitive Data](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data) retrieval ([🎬](https://www.youtube.com/watch?v=0f2cdKAV730))
  - [URL Mode Elicitation for OAuth flows](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows) authorization
  - Static backend secrets for basic, token-based or certificate-based authentication ([🎬](https://www.youtube.com/watch?v=eptKmTh5r6Y))

## Operations

- MCP Server endpoints rate limiting
- [User-friendly CLI](https://www.npmjs.com/package/reshapr-cli) for importing API definitions, declaring secrets and configuring deployment ([📄](cli-commands.md))
- Full-stack observability with [Open Telemetry](https://opentelemetry.io/) support
- Flexible deployment: SaaS, hybrid or on-premises
- Scalable model with auto-discovery of new Gateways
- Fully multi-tenant, with strict segregation between domains and customers.
- Zero downtime deployments with auto-propagation on configuration changes
- GitOps-friendly with YAML-based configuration

**For more details, check out the reShapr [blog](https://reshaprio.medium.com/) posts and [demos](https://www.youtube.com/@reShapr).**
