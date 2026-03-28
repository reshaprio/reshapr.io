# reShapr — Reference

https://reshapr.io/docs/reference/features

---

## Features Overview

https://reshapr.io/docs/reference/features

### API Translation
- OpenAPI 2.x/3.x, GraphQL, gRPC Protobuf → MCP Server (no code)
- Rename operations, split APIs by inclusion/exclusion, define CustomTools

### MCP Support
- Protocol versions: 2023-11-25 and 2025-06-18
- Streamable HTTP transport
- Tools, Prompts, and Resources
- Elicitation (URL Mode for sensitive data and OAuth flows)
- OAuth Authorization for endpoint security

### Security
- TLS transport
- API key management
- OAuth2 with RFC7591, RFC9728, RFC8414, RFC8707
- SPIFFE support
- Custom authorization server integration
- Configurable scopes/claims per tool
- Header transmission and translation
- Static backend secrets (Basic, token, certificate)
- Elicitation-based backend secrets (sensitive data + OAuth flows)

### Operations
- Rate limiting
- CLI for full lifecycle management
- OpenTelemetry observability
- SaaS, hybrid, or on-premises deployment
- Auto-discovery of new gateways
- Zero-downtime config propagation
- Multi-tenant with strict domain segregation
- GitOps-friendly YAML configuration

---

## CLI Commands

https://reshapr.io/docs/reference/cli-commands

Install: `npm install -g reshapr-cli`

### Artifact commands

`reshapr import` — import an artifact (URL or local file); options:
- `-u <url>` / `-f <file>` — source
- `--sn <name>` / `--sv <version>` — override service identity (required for GraphQL)
- `--io <ops>` / `--eo <ops>` — include/exclude operations
- `--backendEndpoint <url>` — creates a default config plan + exposition automatically
- `--apiKey` / `--internalOAuth2` — add security to the auto-created exposition
- `--backendSecret <id>` — attach a backend secret

`reshapr attach` — attach supplementary artifacts (Prompts, CustomTools) to an existing service

### Secret commands

`reshapr secret create <name>` — create a backend or artifact secret
- `-A` artifact scope / `-B` backend scope
- `-u` username / `-p` password (Basic auth)
- `-t <token>` / `-th <header>` (token auth)

`reshapr secret create-elicitation <name>` — Elicitation-based secret
- `--oc <clientId>` / `--oae <authEndpoint>` / `--ote <tokenEndpoint>`

### Configuration plan commands

`reshapr config create <name>` — create a configuration plan
- `-s <serviceId>` / `--be <backendUrl>` (required)
- `--filter` — interactive operation filter
- `--apiKey` / `--internalOAuth2` / `--bs <secretId>` — security options

`reshapr config create-oauth <name>` — config plan with third-party OAuth2
- `--oas <servers>` / `--oju <jwksUri>` / `--osc <scopes>` (all required)

`reshapr config renew-api-key <configId>` — revoke and regenerate API key

### Other commands

`reshapr service list|get|delete` — manage services
`reshapr expo create|list|get|delete` — manage expositions
`reshapr gateway-group create|list` — manage gateway groups
`reshapr api-token create <name> -v <days>` — create gateway API tokens
`reshapr oauth2 auth-client <clientId>` — authenticate via Internal IDP
`reshapr info` — show current context and server info
`reshapr login / logout` — session management

All commands accept `-o json` or `-o yaml` for structured output (pipe-friendly with `jq`/`yq`).

---

## Prompts Specification

https://reshapr.io/docs/reference/prompts-specification

---

## Custom Tools Specification

https://reshapr.io/docs/reference/custom-tools-specification

---

## Resources Specification

https://reshapr.io/docs/reference/resources-specification

---

*For the full site index see https://reshapr.io/llms.txt*
