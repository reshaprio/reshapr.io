---
description: Understand how reShapr negotiates historical session-based MCP versions and the public stateless 2026-07-28 protocol.
---

# MCP Compatibility: Session and Stateless Modes

reShapr supports several MCP protocol versions through one Streamable HTTP endpoint. The negotiated version determines how the client establishes context, which state it must carry, and which response shape the Gateway returns.

The important boundary is MCP `2026-07-28`. Earlier versions use a server-managed session. Version `2026-07-28` uses a stateless request model and a modern response dialect.

## Two modes share one endpoint

The Gateway selects a mode from the request and its headers:

| Mode | Supported versions | Negotiation | State on later requests |
|---|---|---|---|
| Session-based | `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25` | The client calls `initialize` with a protocol version. | The client returns the server-issued `MCP-Session-Id`. |
| Stateless | `2026-07-28` | The client calls `server/discover`. | Every request identifies its protocol version; no MCP session ID is created. |

These modes are alternatives. A client must not add a legacy session ID to a stateless request or omit the session ID from a non-handshake legacy request.

The five entries are versions reShapr `0.2.3` explicitly recognizes. This does not imply support for an unknown later MCP version: the modern request envelope is validated against the declared list before dispatch.

## Historical clients establish a session

For a version before `2026-07-28`, `initialize` negotiates the protocol and creates an MCP session. The response includes `MCP-Session-Id`, and the Gateway stores the negotiated version with that session.

Later requests return the session ID. The Gateway reads the pinned protocol version from its session store and selects the legacy response dialect. If a client sends a historical version on a non-handshake request without a valid session, the Gateway rejects the request rather than silently creating one.

The session can be shared across clustered Gateway replicas through the configured runtime state store. This is protocol state, not an application login session and not a guarantee that a session survives every deployment or administrative operation.

## The public 2026-07-28 mode is stateless

MCP `2026-07-28` replaces session initialization with `server/discover`. No `MCP-Session-Id` is issued. Each subsequent request carries the negotiated version in `MCP-Protocol-Version` and in `params._meta` under `io.modelcontextprotocol/protocolVersion`.

Modern requests can also mirror body routing data in HTTP headers:

- `Mcp-Method` mirrors the JSON-RPC `method`;
- `Mcp-Name` mirrors `params.name` for `tools/call` and `prompts/get`, or `params.uri` for `resources/read`;
- `MCP-Protocol-Version` mirrors the protocol version in `params._meta`.

When a mirror header is present, it must agree with the body. A mismatch is rejected before method dispatch with HTTP `400` and JSON-RPC error `-32020`. An unsupported version in the modern envelope is rejected with HTTP `400` and error `-32022`.

`2026-07-28` is a public version supported by reShapr `0.2.3`. It is not an experimental mode.

## Dialects change the result shape

Both modes expose the same implemented Tools, Prompts, and Resources operations, but their result records differ.

The legacy dialect returns the historical result shape. It deliberately omits modern-only fields such as `resultType`, `ttlMs`, and `cacheScope`.

The modern dialect adds `resultType: complete` to completed results. When a Configuration Plan defines a client cache policy, modern list and read results can also include:

- `ttlMs`, the suggested cache lifetime in milliseconds;
- `cacheScope`, the suggested sharing scope.

These values are hints for compatible clients. They do not create a Gateway response cache, and historical dialects ignore them.

## Elicitation follows the state model

Backend credential elicitation must preserve who supplied a secret without exposing it to the model context. The association changes with the protocol mode:

| Mode | Elicitation response | Credential association |
|---|---|---|
| Session-based | Implementation-specific `URL_ELICITATION_REQUIRED` JSON-RPC error | The MCP session |
| Stateless `2026-07-28` | An `input_required` result containing one or more `elicitation/create` requests | The authenticated user's issuer and subject |

Stateless elicitation therefore requires an OAuth-protected Exposition that supplies a stable authenticated identity. This requirement concerns backend credentials requested during a Tool call; it is separate from choosing whether the MCP endpoint itself uses an API key or OAuth.

See **[Authenticate Backend Calls and Use Elicitation](../how-to-guides/security/backend-auth-and-elicitation.md)** for the operational procedure and security boundaries.

## Constants are not capabilities

The MCP schema contains names for methods used in requests, responses, and client/server interactions. A constant alone does not mean that reShapr implements that method as a server capability.

The Gateway dispatcher in `0.2.3` handles:

- `initialize` and `server/discover` for the applicable lifecycle mode;
- `tools/list` and `tools/call`;
- `prompts/list` and `prompts/get`;
- `resources/list`, `resources/templates/list`, and `resources/read`.

Methods such as roots, sampling, completion, logging, and Resource subscriptions are not dispatched as reShapr server capabilities. In modern mode, methods removed by the `2026-07-28` revision, including `initialize`, `ping`, `logging/setLevel`, `resources/subscribe`, and `resources/unsubscribe`, return HTTP `404` with JSON-RPC `-32601`. Another unimplemented method returns the ordinary in-band `-32601` response.

Use the **[MCP Support Matrix](../references/mcp-support.md)** for the method-level view. Use **[Test an MCP Endpoint](../how-to-guides/test-mcp-endpoint.md)** for executable requests in both modes.

## Choose a mode from the client

Use the version and mode implemented by the MCP client that will call the endpoint. Prefer `2026-07-28` for clients that implement its stateless discovery and request envelope. Retain a historical version when the client still performs `initialize` and manages `MCP-Session-Id`.

Do not translate one mode into the other by changing headers alone. Negotiation, state ownership, elicitation, and result shapes form one protocol contract.

## Evidence and limits

This explanation describes reShapr `0.2.3`, verified on 2026-09-07. The release-tagged **[MCP schema](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/McpSchema.java)** owns the version list and protocol vocabulary. The **[MCP controller](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/McpController.java)** owns negotiation and dispatch, while the **[legacy](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/LegacyProtocolDialect.java)** and **[modern](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/ModernProtocolDialect.java)** dialects own response shaping.

reShapr exposes MCP over Streamable HTTP. It does not provide a WebSocket MCP transport, and this page does not claim client-side support in any particular agent framework or SDK.