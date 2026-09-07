---
description: Verified matrix of MCP protocol versions, state modes, server methods, elicitation behavior, and response dialects supported by reShapr.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-07
---

# MCP Support Matrix

This reference records the MCP server behavior implemented by the reShapr `0.2.3` Gateway. It distinguishes protocol vocabulary declared in code from methods that the server dispatcher actually handles.

For the reasoning behind the two modes, see **[MCP Compatibility: Session and Stateless Modes](../explanations/mcp-compatibility.md)**. For executable requests, see **[Test an MCP Endpoint](../how-to-guides/test-mcp-endpoint.md)**.

## Protocol versions and modes

| Protocol version | Mode | First request | State on later requests | Result dialect | Backend credential elicitation | Client cache hints |
|---|---|---|---|---|---|---|
| `2024-11-05` | Session-based | `initialize` | `MCP-Session-Id` | Legacy | `URL_ELICITATION_REQUIRED`, bound to the session | No |
| `2025-03-26` | Session-based | `initialize` | `MCP-Session-Id` | Legacy | `URL_ELICITATION_REQUIRED`, bound to the session | No |
| `2025-06-18` | Session-based | `initialize` | `MCP-Session-Id` | Legacy | `URL_ELICITATION_REQUIRED`, bound to the session | No |
| `2025-11-25` | Session-based | `initialize` | `MCP-Session-Id` | Legacy | `URL_ELICITATION_REQUIRED`, bound to the session | No |
| `2026-07-28` | Stateless | `server/discover` | Protocol header and request metadata; no session ID | Modern | `input_required` with `elicitation/create`, bound to authenticated `iss` and `sub` | `ttlMs` and `cacheScope` |

`2026-07-28` is a public protocol version supported by reShapr. Versions not listed here are not accepted merely because they sort after a supported date.

## Implemented server methods

| Area | Method | Session-based versions | Stateless `2026-07-28` | Notes |
|---|---|---:|---:|---|
| Lifecycle | `initialize` | Yes | Removed | Negotiates a historical version and creates a session. Modern requests receive HTTP `404` and JSON-RPC `-32601`. |
| Discovery | `server/discover` | Not the session entry point | Yes | Returns server information, capabilities, and supported versions for stateless clients. |
| Tools | `tools/list` | Yes | Yes | Lists operations selected by the Configuration Plan. |
| Tools | `tools/call` | Yes | Yes | Dispatches REST, GraphQL, gRPC, or Custom Tool execution. |
| Prompts | `prompts/list` | Yes | Yes | Lists selected Prompt Artifacts. |
| Prompts | `prompts/get` | Yes | Yes | Resolves a Prompt and its declared arguments. |
| Resources | `resources/list` | Yes | Yes | Lists selected static and templated Resources. |
| Resources | `resources/templates/list` | Yes | Yes | Lists Resource templates. |
| Resources | `resources/read` | Yes | Yes | Reads a static Resource or resolves a Resource template. |

These nine methods are the cases handled by the `McpController` dispatcher. Notifications sent by a client and requests sent by the server are not additional server endpoints in this table.

## Declared but unavailable server methods

| Method or area | Session-based versions | Stateless `2026-07-28` | Classification |
|---|---:|---:|---|
| `ping` | Not dispatched | Removed | Declared lifecycle method, not an implemented reShapr server method. |
| `logging/setLevel` | Not dispatched | Removed | Removed from the modern revision and not dispatched for historical sessions. |
| `resources/subscribe` | Not dispatched | Removed | Resource subscriptions are not implemented. |
| `resources/unsubscribe` | Not dispatched | Removed | Resource subscriptions are not implemented. |
| `roots/list` | Not dispatched | Not dispatched | A schema constant does not establish server support. |
| `sampling/createMessage` | Not dispatched | Not dispatched | Sampling is not exposed as a reShapr server capability. |
| Completion | Not dispatched | Not dispatched | An unimplemented surviving modern method returns in-band JSON-RPC `-32601`. |

For a method removed by the `2026-07-28` revision, the Gateway returns HTTP `404` with JSON-RPC `-32601`. For another method that remains valid protocol vocabulary but is not implemented, it returns the ordinary JSON-RPC `-32601` response in HTTP `200`.

## Modern request contract

| Element | Source of truth | Validation in `0.2.3` |
|---|---|---|
| Protocol version | `params._meta["io.modelcontextprotocol/protocolVersion"]` | Must name one of the five supported versions when the modern envelope is present. |
| `MCP-Protocol-Version` | Mirrors the protocol metadata | If present, it must equal the version in the request body. Non-handshake stateless calls require it to select stateless mode. |
| `Mcp-Method` | Mirrors JSON-RPC `method` | If present, it must equal the body method. |
| `Mcp-Name` | Mirrors `params.name` or `params.uri` | If present, it must equal the Tool, Prompt, or Resource target in the body. |
| `MCP-Session-Id` | Historical session identifier | Do not send it with a stateless request. |

A mirror mismatch returns HTTP `400` with JSON-RPC `-32020`. An unsupported version in a modern envelope returns HTTP `400` with JSON-RPC `-32022` and the supported version list in `error.data`.

## Result dialects

| Result feature | Legacy dialect | Modern `2026-07-28` dialect |
|---|---:|---:|
| Existing payload fields such as `tools`, `prompts`, `resources`, `contents`, or `content` | Yes | Yes |
| `resultType` discriminator | No | Yes, `complete` for completed results |
| `ttlMs` cache hint | No | Yes, when configured for the result |
| `cacheScope` hint | No | Yes, when configured for the result |

Cache hints apply to compatible list and Resource-read results. They communicate client caching policy; they do not enable response caching in the Gateway.

## Elicitation roles

`elicitation/create` in the stateless row is a request produced by the reShapr server for a capable client. It is not a method that an MCP client calls on the reShapr server.

Historical clients receive the implementation-specific `URL_ELICITATION_REQUIRED` error and keep the resulting backend credential associated with their MCP session. Stateless clients receive an `input_required` result and must support the returned URL-mode elicitation request. reShapr binds the completed value to the authenticated issuer and subject, so stateless elicitation requires an OAuth-protected Exposition.

## Transport and endpoint scope

The matrix applies to MCP over Streamable HTTP on all three reShapr endpoint forms:

- the deterministic Exposition identifier endpoint;
- the organization and Exposition-name endpoint;
- the historical organization, Service, and version endpoint.

The historical Service endpoint can advertise the deterministic Exposition endpoint through `X-Reshapr-Preferred-Endpoint`. reShapr `0.2.3` does not expose an MCP WebSocket transport.

## Verification sources

- **[McpSchema](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/McpSchema.java)** declares the supported versions, headers, protocol metadata key, and method vocabulary.
- **[McpController](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/McpController.java)** owns endpoint routing, request validation, lifecycle handling, and the method dispatcher.
- **[LegacyProtocolDialect](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/LegacyProtocolDialect.java)** and **[ModernProtocolDialect](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/main/java/io/reshapr/proxy/mcp/ModernProtocolDialect.java)** define version-specific result shapes.
- **[McpProtocolVersionRoutingTest](https://github.com/reshaprio/reshapr/blob/0.2.3/proxy/src/test/java/io/reshapr/proxy/mcp/McpProtocolVersionRoutingTest.java)** verifies session/stateless routing, modern headers, unsupported versions, removed methods, and unimplemented methods.
- The **[official MCP specification](https://modelcontextprotocol.io/specification/)** owns the protocol semantics beyond reShapr's implementation boundary.

This matrix was last verified with reShapr `0.2.3` on 2026-09-07. Recheck the owner code and tests before changing a version, mode, or method classification.