---
description: Understand the security controls and limits at each reShapr trust boundary.
---

import ThemedImage from '@theme/ThemedImage';

# Security Capabilities and Limits

reShapr separates three trust boundaries that require independent controls:

1. **MCP client to proxy:** the proxy decides whether a client can access an Exposition.
2. **Proxy to backend API:** after accepting the MCP request, the proxy authenticates to the REST, GraphQL, or gRPC backend with the credentials configured for that Service.
3. **Proxy to control plane:** the proxy uses a dedicated Gateway API token to register its logical Gateway, advertise health, and synchronize configuration.

Protecting one boundary does not protect the others. For example, an API key can restrict access to the MCP endpoint while a separate Secret authorizes the resulting backend call. The Gateway API token authenticates synchronization, not MCP clients or backend requests.

<ThemedImage
  alt="Security Model"
  sources={{
    light: '/img/docs/security-model-light.svg',
    dark: '/img/docs/security-model-dark.svg',
  }}
/>

## Choose controls by boundary

| Boundary | Available control | What it establishes | Important limit |
|---|---|---|---|
| MCP client to proxy | None | No authentication is performed by reShapr | Appropriate only when another trusted layer controls access or for a bounded test |
| MCP client to proxy | API key | Possession of the Configuration Plan key | No user identity or scopes; the policy covers the complete Exposition |
| MCP client to proxy | OAuth 2.0 bearer JWT | Signed token, accepted issuer, audience, required claims, and configured scopes | Scopes and audiences cover the complete Exposition, not individual Tools, Prompts, or Resources |
| Proxy to HTTP backend | Token or username/password Secret | Bearer or custom-header token, or HTTP Basic authentication | Independent from MCP endpoint authentication |
| Proxy to HTTP, GraphQL, or gRPC backend | OAuth 2.0 Client Credentials Secret | A cached machine-to-machine access token obtained from the backend Authorization Server | No user elicitation or refresh-token flow |
| Proxy to gRPC backend | Token Secret | Authorization metadata or a configured metadata key | Username/password is not applied as gRPC Basic authentication |
| Proxy to gRPC backend | CA certificate Secret | Trust material for the backend TLS channel | This is a custom trust anchor, not a client certificate identity |
| Proxy to backend | Elicited credential | A credential associated with the requesting MCP session or authenticated user | Requires a compatible client flow and does not replace MCP endpoint authentication |
| Proxy to control plane | Gateway API token | Gateway registration, discovery, and health authorization | Separate from an MCP API key and backend Secret |

## MCP endpoint controls

A Configuration Plan selects one endpoint access mode:

- **None:** the proxy does not authenticate the MCP client. Use this only when access is controlled elsewhere or for a bounded test environment.
- **API key:** the proxy compares the `x-reshapr-key` request header with the key assigned to the Configuration Plan. A renewed key is propagated to connected proxies.
- **OAuth 2.0 bearer JWT:** the proxy verifies RSA and RSA-PSS signatures with a configured JWKS, accepts configured issuers, checks the required `sub`, `iat`, `exp`, and `aud` claims, and, when scopes are configured, requires them for the Exposition. By default, at least one audience must match the requested Exposition URL or a configured static audience. This policy applies to the entire Exposition, not to individual Tools, Prompts, or Resources.

The proxy publishes OAuth 2.0 Protected Resource Metadata as defined by [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728). A missing or invalid bearer token, including a missing required `aud` claim, produces a `401` response. An audience mismatch or missing required scope produces `403`.

Its OAuth configuration refers to Authorization Server URLs and a JWKS URI. reShapr does not host an Authorization Server Metadata endpoint defined by [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414). The expected dynamic audience is the requested Exposition URL; configured static audiences are accepted as alternatives. Audience validation can be disabled for compatibility, but doing so weakens confused-deputy protection. reShapr validates the resulting token; it does not perform the token-request flow described by [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html).

TLS for the client-to-proxy connection is a deployment responsibility. For example, a Kubernetes Ingress can terminate TLS when configured with a certificate; TLS is not enabled merely by choosing API key or OAuth authentication.

## Backend authentication {#gateway-access-to-backend-apis}

A backend Secret is independent from MCP endpoint authentication. For REST and GraphQL calls, a token becomes an `Authorization: Bearer` header unless `tokenHeader` names another header. A username and password become HTTP Basic credentials. For gRPC, a token becomes per-call metadata; a PEM certificate configures a custom trust manager for a TLS backend.

Release `1.0.0` also supports OAuth 2.0 Client Credentials for REST, GraphQL, and gRPC backends. The proxy resolves the client ID and secret, requests an access token from the configured token endpoint, and caches it until shortly before expiration. This is a machine-to-machine flow: it does not elicit user credentials and does not use refresh tokens.

The Secret fields are not a promise that every combination applies to every backend protocol. HTTP Basic credentials are handled by the HTTP proxy, while custom CA trust material is handled by the gRPC proxy.

### Request header propagation

A Configuration Plan can allow, deny, or rename request headers before an HTTP or gRPC backend call. For gRPC, surviving headers become call metadata, except `Accept`, `Content-Type`, and `User-Agent`, which the transport manages. The proxy always removes hop-by-hop headers, reShapr authentication headers, and MCP transport headers. Without an explicit policy, it also removes `Authorization` and `Cookie`; explicitly allowing or renaming a header can opt in to the backend credential contract you intend.

Only the client-to-backend request direction is enforced in `1.0.0`. Response rules are represented in the API and Kubernetes CRD but are reserved for future use. Header propagation shapes transport metadata; it does not replace backend authorization.

### Secret references

Backend Secrets can contain literal values stored by the control plane or references resolved locally by a proxy. The `${env:VARIABLE}` scheme lets a hybrid proxy retrieve a sensitive value from its own environment when preparing a backend call, so the control plane stores and propagates only the reference. A value can contain several placeholders, and literal text can surround them.

The current implementation provides only the `env` resolver. An unknown scheme or missing environment variable fails resolution rather than falling back to a literal credential. The release-tagged [public API contract](https://github.com/reshaprio/reshapr/blob/1.0.0/reshapr-public-openapi-v0.1.yaml) defines the Secret fields, while the [secret resolver](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/main/java/io/reshapr/proxy/secret/SecretReferenceResolver.java) defines `1.0.0` resolution behavior.

## Elicited credentials

An Exposition can request a user-specific backend credential instead of relying only on a pre-provisioned Secret. The [MCP elicitation specification](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation) distinguishes form mode, in which data passes through the MCP client, from [URL mode](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-requests), in which the user completes an out-of-band interaction in a browser.

Sensitive credentials must not use MCP form mode because that would expose them to the MCP client. reShapr uses URL mode for both backend authentication flows it supports. The client sees the URL and explanatory message, but the credential entered or issued through that URL does not pass through the MCP client or the LLM context.

### Collect a backend credential

For a backend API key or token, the proxy returns a URL for its own elicitation page. After the user consents to opening it, the browser sends the credential directly to the proxy. The proxy stores the value for the initiating session or authenticated user and applies it to subsequent backend calls. This follows the specification's [URL mode pattern for sensitive data](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data).

The MCP client receives neither the submitted credential nor a form-mode response containing it. It only coordinates opening the URL and retrying or resuming the Tool call.

### Authorize access through OAuth 2.0

When the Secret contains an OAuth client configuration, the elicitation URL starts an OAuth 2.0 authorization-code flow instead of displaying a credential form. The browser follows the proxy redirect to the backend's Authorization Server, where the user authenticates and grants access. The Authorization Server returns the code to the proxy callback, and the proxy exchanges it for an access token and stores that token for backend calls.

The authorization UI, authorization code, and resulting access token do not pass through the MCP client or LLM context. This is the [URL mode pattern for third-party OAuth authorization](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows), not the OAuth flow that authenticates the MCP client to the Gateway. The two tokens protect different boundaries and are not interchangeable.

### Bind the result to a caller

The storage boundary depends on the negotiated MCP version. Protocol versions before `2026-07-28` bind the elicited value to a replicated MCP session and return a `URL_ELICITATION_REQUIRED` error when input is needed. The public `2026-07-28` protocol follows the current [multi-round-trip elicitation model](https://modelcontextprotocol.io/specification/draft/client/elicitation): it returns an `input_required` result containing `elicitation/create` requests and binds the resulting value to the authenticated user's JWT issuer and subject. Stateless elicitation therefore requires a stable authenticated identity. **[MCP Compatibility](./mcp-compatibility.md)** compares both state models and their response dialects.

In `1.0.0`, the proxy associates the completed interaction with the initiating session or MCP identity and validates the opaque OAuth `state` value in stateless callbacks. Its elicitation web routes do not independently reauthenticate the browser user as that same identity. Treat the elicitation URL and identifier as sensitive, show the complete target domain before opening it, never share the URL, and use HTTPS outside local development.

## Storage, propagation, and audit

The control plane encrypts selected sensitive Configuration Plan and Secret fields with AES-256-GCM keys identified by a `kid`. Each value carries its key identifier and a random IV, providing authenticated encryption. Release `1.0.0` can still decrypt legacy AES/ECB values during migration and provides administrator-only status and re-encryption commands.

Key generation, distribution, activation, invocation of the rotation command, retirement, and backup recovery remain operator responsibilities. All control-plane replicas must receive the complete key set before the active key changes, and old keys must remain available until status and rotation checks show that no stored value depends on them.

Configuration updates, including API key renewal, are propagated to connected proxies over the control-plane discovery stream. Applying a configuration change does not require a proxy restart, but this is not an immediate-propagation guarantee.

When audit is enabled on a Configuration Plan, the proxy emits structured events for MCP calls and authentication failures. OpenTelemetry export for proxy traces, metrics, and logs must also be configured. This is fully pluggable with the OpenTelemetry Collector or solution of your choice. You must build dashboards or equivalent telemetry coverage for the control plane, Web UI, operator, and admission controller using your chosen solution.

## Canonical sources

- The [`1.0.0` public API contract](https://github.com/reshaprio/reshapr/blob/1.0.0/reshapr-public-openapi-v0.1.yaml) owns Configuration Plan and Secret fields.
- The [`1.0.0` endpoint security implementation](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/main/java/io/reshapr/proxy/security/SecureEndpointFilter.java) defines API-key and OAuth token validation.
- The [`1.0.0` HTTP](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/main/java/io/reshapr/proxy/proxy/ProxyService.java) and [gRPC](https://github.com/reshaprio/reshapr/blob/1.0.0/proxy/src/main/java/io/reshapr/proxy/proxy/GrpcProxyService.java) proxy implementations define backend credential handling.
- The [`1.0.0` encryption implementation](https://github.com/reshaprio/reshapr/blob/1.0.0/control-plane/src/main/java/io/reshapr/ctrl/security/CipherService.java) defines the control-plane encryption behavior.

## Next step

- **[Protect an MCP Endpoint with an API Key](../how-to-guides/security/api-key.md)** for a reproducible endpoint-access procedure.
- **[Protect an MCP Endpoint with OAuth 2.0](../how-to-guides/security/oauth.md)** to configure issuers, JWKS, scopes, and rejection checks.
- **[Authenticate Backend Calls and Use Elicitation](../how-to-guides/security/backend-auth-and-elicitation.md)** to apply stored, local, or user-provided backend credentials.
- **[Audit MCP Endpoint Calls](../how-to-guides/audit-mcp-endpoint.md)** to enable audit on a Configuration Plan and inspect its event attributes.
- **[Observe the reShapr Proxy](../how-to-guides/operations/observe-and-audit.md)** to export telemetry and route audit logs to a dedicated sink.
- **[Upgrade reShapr and Rotate Runtime Secrets](../how-to-guides/operations/upgrade-and-rotate.md)** to renew API keys, Gateway tokens, and local backend credentials.
- **[Multi-tenancy and Administrative Governance](./multi-tenancy-administrative-governance.md)** to distinguish users, service accounts, administrative credentials, Gateway tokens, and organization boundaries.
- **[Deployment Models and Trust Boundaries](./deployment-models-trust-boundaries.md)** to place these controls in their network context.
- **[Control Plane to Proxy Synchronization](./control-plane-gateway-synchronization.md)** for configuration propagation and recovery behavior.

