---
description: Understand the security controls and limits at each reShapr trust boundary.
---

import ThemedImage from '@theme/ThemedImage';

# Security Capabilities and Limits

reShapr separates three trust boundaries that require independent controls:

1. **MCP client to Gateway:** the Gateway decides whether a client can access an Exposition.
2. **Gateway to backend API:** after accepting the MCP request, the Gateway authenticates to the REST, GraphQL, or gRPC backend with the credentials configured for that Service.
3. **Gateway to control plane:** the Gateway uses a dedicated API token to register, advertise health, and synchronize configuration.

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
| MCP client to Gateway | None | No authentication is performed by reShapr | Appropriate only when another trusted layer controls access or for a bounded test |
| MCP client to Gateway | API key | Possession of the Configuration Plan key | No user identity or scopes; the policy covers the complete Exposition |
| MCP client to Gateway | OAuth 2.0 bearer JWT | Signed token, accepted issuer, required claims, and configured scopes | Scopes cover the complete Exposition, not individual Tools, Prompts, or Resources |
| Gateway to HTTP backend | Token or username/password Secret | Bearer or custom-header token, or HTTP Basic authentication | Independent from MCP endpoint authentication |
| Gateway to gRPC backend | Token Secret | Authorization metadata or a configured metadata key | Username/password is not applied as gRPC Basic authentication |
| Gateway to gRPC backend | CA certificate Secret | Trust material for the backend TLS channel | This is a custom trust anchor, not a client certificate identity |
| Gateway to backend | Elicited credential | A credential associated with the requesting MCP session or authenticated user | Requires a compatible client flow and does not replace MCP endpoint authentication |
| Gateway to control plane | Gateway API token | Gateway registration, discovery, and health authorization | Separate from an MCP API key and backend Secret |

## MCP endpoint controls

A Configuration Plan selects one endpoint access mode:

- **None:** the Gateway does not authenticate the MCP client. Use this only when access is controlled elsewhere or for a bounded test environment.
- **API key:** the Gateway compares the `x-reshapr-key` request header with the key assigned to the Configuration Plan. A renewed key is propagated to connected Gateways.
- **OAuth 2.0 bearer JWT:** the Gateway verifies RSA and RSA-PSS signatures with a configured JWKS, accepts configured issuers, checks the required `sub`, `iat`, and `exp` claims, and, when scopes are configured, requires them for the Exposition. This policy applies to the entire Exposition, not to individual Tools, Prompts, or Resources.

The Gateway publishes OAuth 2.0 Protected Resource Metadata as defined by [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728). A missing or invalid bearer token produces a `401` response; a mismatched optional `resource` or `serviceId` claim, or a missing required scope, produces `403`.

Its OAuth configuration refers to Authorization Server URLs and a JWKS URI. reShapr does not host an Authorization Server Metadata endpoint defined by [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414). When a JWT contains a `resource` claim, the Gateway compares it with the called MCP endpoint. This check is related to [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html), but does not implement the complete token-request flow defined by that RFC. The standard `aud` claim is not verified by this validation path.

TLS for the client-to-Gateway connection is a deployment responsibility. For example, a Kubernetes Ingress can terminate TLS when configured with a certificate; TLS is not enabled merely by choosing API key or OAuth authentication.

## Backend authentication {#gateway-access-to-backend-apis}

A backend Secret is independent from MCP endpoint authentication. For REST and GraphQL calls, a token becomes an `Authorization: Bearer` header unless `tokenHeader` names another header. A username and password become HTTP Basic credentials. For gRPC, a token becomes per-call metadata; a PEM certificate configures a custom trust manager for a TLS backend.

The Secret fields are not a promise that every combination applies to every backend protocol. In release `0.2.3`, HTTP Basic credentials are handled by the HTTP proxy, while custom CA trust material is handled by the gRPC proxy.

### Secret references

Backend Secrets can contain literal values stored by the control plane or references resolved locally by a Gateway. The `${env:VARIABLE}` scheme lets a hybrid Gateway retrieve a sensitive value from its own environment when preparing a backend call, so the control plane stores and propagates only the reference. A value can contain several placeholders, and literal text can surround them.

The current implementation provides only the `env` resolver. An unknown scheme or missing environment variable fails resolution rather than falling back to a literal credential. The release-tagged [public API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-public-openapi-v0.1.yaml) defines the Secret fields, while the [secret resolver](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/secret/SecretReferenceResolver.java) defines `0.2.3` resolution behavior.

## Elicited credentials

An Exposition can request a user-specific backend credential instead of relying only on a pre-provisioned Secret. The [MCP elicitation specification](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation) distinguishes form mode, in which data passes through the MCP client, from [URL mode](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-requests), in which the user completes an out-of-band interaction in a browser.

Sensitive credentials must not use MCP form mode because that would expose them to the MCP client. reShapr uses URL mode for both backend authentication flows it supports. The client sees the URL and explanatory message, but the credential entered or issued through that URL does not pass through the MCP client or the LLM context.

### Collect a backend credential

For a backend API key or token, the Gateway returns a URL for its own elicitation page. After the user consents to opening it, the browser sends the credential directly to the Gateway. The Gateway stores the value for the initiating session or authenticated user and applies it to subsequent backend calls. This follows the specification's [URL mode pattern for sensitive data](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data).

The MCP client receives neither the submitted credential nor a form-mode response containing it. It only coordinates opening the URL and retrying or resuming the Tool call.

### Authorize access through OAuth 2.0

When the Secret contains an OAuth client configuration, the elicitation URL starts an OAuth 2.0 authorization-code flow instead of displaying a credential form. The browser follows the Gateway redirect to the backend's Authorization Server, where the user authenticates and grants access. The Authorization Server returns the code to the Gateway callback, and the Gateway exchanges it for an access token and stores that token for backend calls.

The authorization UI, authorization code, and resulting access token do not pass through the MCP client or LLM context. This is the [URL mode pattern for third-party OAuth authorization](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows), not the OAuth flow that authenticates the MCP client to the Gateway. The two tokens protect different boundaries and are not interchangeable.

### Bind the result to a caller

The storage boundary depends on the negotiated MCP version. Protocol versions before `2026-07-28` bind the elicited value to a replicated MCP session and return a `URL_ELICITATION_REQUIRED` error when input is needed. The public `2026-07-28` protocol follows the current [multi-round-trip elicitation model](https://modelcontextprotocol.io/specification/draft/client/elicitation): it returns an `input_required` result containing `elicitation/create` requests and binds the resulting value to the authenticated user's JWT issuer and subject. Stateless elicitation therefore requires a stable authenticated identity.

In `0.2.3`, the Gateway associates the completed interaction with the initiating session or MCP identity and validates the opaque OAuth `state` value in stateless callbacks. Its elicitation web routes do not independently reauthenticate the browser user as that same identity. Treat the elicitation URL and identifier as sensitive, show the complete target domain before opening it, never share the URL, and use HTTPS outside local development.

## Storage, propagation, and audit

The control plane encrypts selected sensitive Configuration Plan and Secret fields with its configured AES key. Release `0.2.3` uses `AES/ECB/PKCS5Padding`; this provides confidentiality without authenticated integrity and with visible repeated-block patterns. Automatic key rotation is not provided. Treat database access, encryption-key storage, backup protection, and rotation as deployment security responsibilities.

:::warning
These limitations are meant to be removed towards the `1.0` release of Reshapr.
:::

Configuration updates, including API key renewal, are propagated to connected Gateways over the control-plane discovery stream. Applying a configuration change does not require a Gateway restart, but this is not an immediate-propagation guarantee.

When audit is enabled on a Configuration Plan, the Gateway emits structured events for MCP calls and authentication failures. OpenTelemetry export for Gateway traces, metrics, and logs must also be configured. This is made to be fully pluggable with the OpemTelemetry collector or solution of your choice. You'll have to built dashboards or equivalent telemetry coverage for the control plane, Web UI, operator, and admission controller using your solution of choice.

## Canonical sources

- The [`0.2.3` public API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-public-openapi-v0.1.yaml) owns Configuration Plan and Secret fields.
- The [`0.2.3` endpoint security implementation](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/security/SecureEndpointFilter.java) defines API-key and OAuth token validation.
- The [`0.2.3` HTTP](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/proxy/ProxyService.java) and [gRPC](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/proxy/GrpcProxyService.java) proxy implementations define backend credential handling.
- The [`0.2.3` encryption implementation](https://github.com/reshaprio/reshapr/blob/0.2.3/control-plane/src/main/java/io/reshapr/ctrl/security/CipherService.java) defines the control-plane encryption behavior.

## Next step

- **[Protect an MCP Endpoint with an API Key](../how-to-guides/security/api-key.md)** for a reproducible endpoint-access procedure.
- **[Protect an MCP Endpoint with OAuth 2.0](../how-to-guides/security/oauth.md)** to configure issuers, JWKS, scopes, and rejection checks.
- **[Authenticate Backend Calls and Use Elicitation](../how-to-guides/security/backend-auth-and-elicitation.md)** to apply stored, local, or user-provided backend credentials.
- **[Deployment Models and Trust Boundaries](./deployment-models-trust-boundaries.md)** to place these controls in their network context.
- **[Control Plane to Gateway Synchronization](./control-plane-gateway-synchronization.md)** for configuration propagation and recovery behavior.

