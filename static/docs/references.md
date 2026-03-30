# reShapr — Reference

https://reshapr.io/docs/references/features

---

## Features Overview

https://reshapr.io/docs/references/features

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

https://reshapr.io/docs/references/cli-commands

Install: `npm install -g @reshapr/reshapr-cli`

### Artifact commands

`reshapr import` — import an artifact (URL or local file); options:
- `-u <url>` / `-f <file>` — source
- `--sn <name>` / `--sv <version>` — override service identity (required for GraphQL)
- `--io <ops>` / `--eo <ops>` — include/exclude operations
- `--backendEndpoint <url>` — creates a default config plan + exposition automatically
- `--apiKey` / `--internalOAuth2` — add security to the auto-created exposition
- `--backendSecret <id>` — attach a backend secret

`reshapr attach` — attach supplementary artifacts (Prompts, CustomTools, Resources) to an existing service

### Secret commands

`reshapr secret create <name>` — create a backend or artifact secret
- `-A` artifact scope / `-B` backend scope
- `-u` username / `-p` password (Basic auth)
- `-t <token>` / `-th <header>` (token auth)
- `-c <path>` (X.509 certificate in PEM format)

`reshapr secret create-elicitation <name>` — Elicitation-based secret
- `-t <token>` for Sensitive Data mode
- `--oc <clientId>` / `--oae <authEndpoint>` / `--ote <tokenEndpoint>` for OAuth flow mode

### Configuration plan commands

`reshapr config create <name>` — create a configuration plan
- `-s <serviceId>` / `--be <backendUrl>` (required)
- `--filter` — interactive operation filter
- `--io` / `--eo` — include/exclude operations (non-interactive)
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
`reshapr quotas` — list and check your reShapr quotas
`reshapr run` — start reShapr locally using Docker Compose
`reshapr status` — show the status of locally running reShapr
`reshapr stop` — stop locally running reShapr containers

All commands accept `-o json` or `-o yaml` for structured output (pipe-friendly with `jq`/`yq`).

---

## Prompts Specification

https://reshapr.io/docs/references/prompts-specification

Prompts can't and shouldn't be directly inferred from an API contract. They provide users with accelerators on how to interact with the model, offer additional instructions and guardrails, or detail how to orchestrate tool calls.

reShapr allows defining Prompts using YAML (`Prompts` specification) and attaching them to a Service via `reshapr attach`.

A `Prompts` artifact:
- Has `apiVersion: reshapr.io/v1alpha1` and `kind: Prompts`
- Must be bound to a specific Service via `service.name` and `service.version`
- Defines prompts in a `prompts` section, each with a `result` (returned to the model)
- Prompts may have `title`, `description`, and `arguments`
- Arguments support `${}` expressions for user-provided values

---

## Custom Tools Specification

https://reshapr.io/docs/references/custom-tools-specification

MCP Servers should rarely be used as-is without polishing the context. Custom Tools let you rename, condense, and translate default operations into LLM-friendly tools for specific use cases.

reShapr allows defining Custom Tools using YAML (`CustomTools` specification) and attaching them to a Service via `reshapr attach`.

A `CustomTools` artifact:
- Has `apiVersion: reshapr.io/v1alpha1` and `kind: CustomTools`
- Must be bound to a specific Service via `service.name` and `service.version`
- Defines tools in a `customTools` section
- Each tool must reference an original `tool` it overrides
- Must provide an `input` schema description
- May specify `arguments` with `${}` expressions for input substitution

---

## Resources Specification

https://reshapr.io/docs/references/resources-specification

Resources allow MCP servers to share data that provides context to LLMs — files, database schemas, or application-specific information. Unlike tools (model-controlled actions), resources are application-driven data for reading and referencing.

reShapr allows defining Resources using YAML (`Resources` specification) and attaching them to a Service via `reshapr attach`.

A `Resources` artifact:
- Has `apiVersion: reshapr.io/v1alpha1` and `kind: Resources`
- Must be bound to a specific Service via `service.name` and `service.version`
- Defines resources in a `resources` section with URIs as keys (must start with protocol like `file://`)
- Each resource must have a `name`; may have `title`, `description`, `mimeType`, `icons`, `annotations`
- Content can be `text` (plain text) or `blob` (Base64 encoded)
- Also supports `resourceTemplates` — parameterized URIs using `{path}` syntax for dynamic content fetching from the backend endpoint

---

*For the full site index see https://reshapr.io/llms.txt*
