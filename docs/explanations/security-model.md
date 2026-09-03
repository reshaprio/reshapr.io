description: Trust boundaries and security controls for MCP endpoints, Gateways, and backend APIs.

import ThemedImage from '@theme/ThemedImage';

# Security model

reShapr separates two trust boundaries that require independent controls:

1. **MCP client to Gateway:** the Gateway decides whether a client can access an Exposition.
2. **Gateway to backend API:** after accepting the MCP request, the Gateway authenticates to the REST, GraphQL, or gRPC backend with the credentials configured for that Service.

Protecting one boundary does not protect the other. For example, an API key can restrict access to the MCP endpoint while a separate Secret authorizes the resulting backend call.

<ThemedImage
  alt="Security Model"
  sources={{
    light: '/img/docs/security-model-light.svg',
    dark: '/img/docs/security-model-dark.svg',
  }}
/>

## MCP endpoint access

A Configuration Plan selects one endpoint access mode:

- **None:** the Gateway does not authenticate the MCP client. Use this only when access is controlled elsewhere or for a bounded test environment.
- **API key:** the Gateway compares the `x-reshapr-key` request header with the key assigned to the Configuration Plan. A renewed key is propagated to connected Gateways.
- **OAuth 2.0 bearer JWT:** the Gateway verifies the token signature with a configured JWKS, accepts configured issuers, checks required JWT claims and expiration, and requires the scopes configured for the Exposition. This policy applies to the entire Exposition, not to individual Tools, Prompts, or Resources.

The Gateway publishes OAuth 2.0 Protected Resource Metadata as defined by [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728). Its OAuth configuration refers to Authorization Server URLs and a JWKS URI; reShapr does not host an Authorization Server Metadata endpoint defined by [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414). When a JWT contains a `resource` claim, the Gateway compares it with the called MCP endpoint. This check is related to [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html), but does not implement the complete token-request flow defined by that RFC.

TLS for the client-to-Gateway connection is a deployment responsibility. For example, a Kubernetes Ingress can terminate TLS when configured with a certificate; TLS is not enabled merely by choosing API key or OAuth authentication.

## Gateway access to backend APIs

A backend Secret is independent from MCP endpoint authentication. Depending on the backend protocol and Secret type, the Gateway can apply:


### Secret references

Backend Secrets can contain literal values stored by the control plane or references resolved locally by a Gateway. The `${env:VARIABLE}` scheme lets a hybrid Gateway retrieve a sensitive value from its own environment on each backend call, so the control plane stores and propagates only the reference. The current implementation provides the `env` resolver. The [public API contract](https://github.com/reshaprio/reshapr/blob/main/reshapr-public-openapi-v0.1.yaml) defines the Secret fields, while the tracked [secret resolver](https://github.com/reshaprio/reshapr/blob/main/proxy/src/main/java/io/reshapr/proxy/secret/SecretReferenceResolver.java) is the source of truth for resolution behavior.

## Elicited credentials

An Exposition can request a user-specific backend credential instead of relying only on a pre-provisioned Secret. The Gateway supports URL elicitation for a sensitive value or an OAuth/OIDC authorization flow.

The storage boundary depends on the negotiated MCP version. Protocol versions before `2026-07-28` bind the elicited value to a replicated MCP session. The public `2026-07-28` protocol is stateless, so the Gateway binds the value to the authenticated user's JWT issuer and subject. Stateless elicitation therefore requires a stable authenticated identity.

## Storage, propagation, and audit

Sensitive Configuration Plan and Secret fields stored in the control plane are encrypted with a configured AES key. The current implementation uses simple encryption without authenticated encryption. Treat database access, encryption-key storage, backup protection, and rotation as deployment security responsibilities.

Configuration updates, including API key renewal, are propagated to connected Gateways over the control-plane discovery stream. This removes the need to restart a Gateway for a configuration change; changes and updates are applied on-the-fly.

When audit is enabled on a Configuration Plan, the Gateway emits structured events for MCP calls and authentication failures. OpenTelemetry export for Gateway traces, metrics, and logs must also be configured. This does not imply built-in dashboards or equivalent telemetry coverage for the control plane, Web UI, operator, and admission controller.

