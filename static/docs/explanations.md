# reShapr — Explanation

https://reshapr.io/docs/explanations/services-and-artifacts

---

## Services & Artifacts

https://reshapr.io/docs/explanations/services-and-artifacts

A **Service** in reShapr is a versioned functional unit — e.g. "User Management Service v1.0" — discovered from an imported artifact. Services are versioned so multiple versions can coexist. Updating a service means re-importing its reference artifact; if the name and version match, the definition is updated in place. When a version is no longer needed, you can delete it — but existing expositions for that version will be automatically removed.

Supported artifact types and how reShapr discovers service identity:

- **OpenAPI 3.x** — uses `info.name` and `info.version`
- **gRPC / Protobuf** — uses the `service` definition name and the last element of the `package` directive as version (e.g. `<package>.<serviceName>`)
- **GraphQL** — requires explicit `--serviceName` and `--serviceVersion` flags on import (schema has no built-in identity)

Importing is done via the reShapr CLI `reshapr import` command. Local files (`-f`) and remote URLs (`-u`) are supported.

---

## Configuration Plan & Exposition

https://reshapr.io/docs/explanations/configuration-and-exposition

A **Configuration Plan** defines how a Service is consumed by MCP clients. It specifies:

- Backend endpoint URL of the existing service or API implementation
- Operation filter (include or exclude specific operations, restrict to read-only, etc.)
- Security options (None / API Key / OAuth2 Bearer)
- Required permissions (scopes per tool)
- Backend credentials (Secret)

A Service can have multiple Configuration Plans for different environments or lifecycle stages. A Configuration Plan is always associated to a specific version of a Service.

An **Exposition** is the final step: it associates a Configuration Plan with a **Gateway Group**, making the MCP server live on the matching gateways. Creating an exposition is a lightweight declaration — gateways auto-discover and load it without downtime.

---

## Gateway Groups & Gateways

https://reshapr.io/docs/explanations/gateway-groups-and-gateways

A **Gateway Group** is a named, label-based policy target owned by an organization. Labels represent deployment criteria: region, SLO tier, lifecycle environment, or any combination. Expositions target a Gateway Group, not individual gateways.

A **Gateway** is a runtime process that advertises itself to the control plane at startup using label selectors. If its selectors match a group, it picks up all MCP server configurations for that group. A single gateway can match multiple groups.

### Gateway lifecycle

1. **Registration** — gateway connects to control plane, authenticates with API token, provides its unique identifier and label selectors, fetches its config
2. **Health check** — every 2 minutes; missed checks (5-minute timeout) trigger re-registration. MCP serving continues uninterrupted during health check issues
3. **Changes streaming** — control plane pushes config updates in real time; servers update without interruption
4. **Termination** — gateway notifies control plane, streaming and health checks stop, MCP servers drain

---

## Security Model

https://reshapr.io/docs/explanations/security-model

Security covers two layers: the MCP endpoint itself, and the backend API the gateway calls.

### MCP endpoint security options

- **None** — no auth; headers forwarded to backend as-is (dev/testing only)
- **API Key** — gateway validates `x-reshapr-key` header; key generated at config time, renewable via CLI
- **OAuth2 Bearer** — gateway validates a Bearer token against configured authorization servers; implements:
  - OAuth 2.0 Protected Resource Metadata (RFC9728)
  - OAuth 2.0 Authorization Server Metadata (RFC8414)
  - OAuth 2.0 Resource Indicators (RFC 8707)
  - Optional reShapr Internal OAuth2 IDP with Dynamic Client Registration (RFC7591)

### Backend secrets

Stored securely in reShapr; injected at runtime by the gateway:

- **Username/password** → `Authorization: Basic <base64>`
- **Token** → `Authorization: Bearer <token>` (or custom header via `--tokenHeader`)
- **X.509 certificate** → mTLS to backend

### Elicitation-based secrets (MCP spec 2025-11-25)

No pre-provisioning required. When the MCP server needs credentials it returns an elicitation request to the user:

- **Sensitive data mode** — user provides their own token/API key inline
- **OAuth flow mode** — user completes an OAuth/OIDC authorization code flow; reShapr exchanges the code for a backend access token

Recommended production combination: **OAuth2 endpoint security + Elicitation-based backend secret**.

---

*For the full site index see https://reshapr.io/llms.txt*
