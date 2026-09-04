---
description: Define ToolsOutputFilters to retain, patch, or convert MCP tool outputs before they reach the model.
---

# Tools Output Filtering

As explained in **[Why reShapr?](../overview/why-reshapr.md)**, reShapr can create secure MCP servers in seconds without coding, just by importing your API's existing artifacts such as **[OpenAPI 3.x](https://www.openapis.org/)** specs, **[GraphQL](https://graphql.org/)** schemas, and **[gRPC/Protobuf](https://grpc.io/)** definitions. Once these artifacts are imported, the **[Custom Tools](./custom-tools-specification.md)** specification lets you redefine the *input* of a tool to fit a specific use case.

`ToolsOutputFilters` is the symmetrical capability on the *output* side: it lets you declaratively control what a tool returns to the model, before the response is wrapped into the JSON-RPC MCP envelope and sent back to the client.

This supports two common requirements:

- **Response scope.** A GraphQL node with many scalar properties or a REST endpoint returning a deeply nested JSON tree can expose fields that are irrelevant to the task. Filtering at the gateway retains only the required response shape.
- **Stable response shape.** Retaining and patching known fields gives the Agent a smaller, more predictable result independent of the underlying API protocol.

In reShapr `0.2.3`, a filter-processing error returns the original Tool response. Treat `ToolsOutputFilters` as response shaping, **not as a security or data-loss-prevention boundary**. Prevent access to sensitive fields in the backend contract and authorization layer.

reShapr applies filtering universally, regardless of the source protocol (REST, GraphQL, gRPC), because filters operate on the canonical JSON response produced by reShapr's protocol converters.

## A first example

Here is a simple `ToolsOutputFilters` artifact that trims the response of a custom GitHub tool down to a few key fields, removes a sensitive field, and adds a value:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: ToolsOutputFilters
service:
  name: GitHub GraphQL
  version: '20250917'
filters:
  get_user_with_latest_followers:
    jsonRetain:
      - /data/user/name
      - /data/user/login
      - /data/user/bio
      - /data/user/avatarUrl
      - /data/user/followers
    jsonPatches:
      - op: add
        path: /data/user/location
        value: "Worldwide"
      - op: remove
        path: /data/user/followers/nodes
```

A `ToolsOutputFilters` artifact follows some simple rules:

- It always contains an identification section made of `apiVersion` and `kind` properties that **must** have the **`reshapr.io/v1alpha1`** and `ToolsOutputFilters` values respectively,
- It **must** be bound to a specific reShapr **[Service](../explanations/services-and-artifacts.md)** using the **`service.name`** and `service.version` properties whose values **must** match an already discovered Service,
- The `filters` section then defines the filters, keyed by tool name:
  - The key (here `get_user_with_latest_followers`) **must** match an existing tool on the Service, either an imported tool or a **[Custom Tool](./custom-tools-specification.md)** previously attached to that Service,
  - A filter entry **must** specify at least one of `jsonRetain`, `jsonPatches`, or `convertToToon`,
  - When both `jsonRetain` and `jsonPatches` are present, `jsonRetain` **is always applied first**, as a pre-processing step that narrows the response, before `jsonPatches` are applied in order,
  - `convertToToon` is applied last, after `jsonRetain` and `jsonPatches`.

You can specify as many tool filters as you want in the same `ToolsOutputFilters` artifact, as long as each key targets a distinct tool of the bound Service.

## The `jsonRetain` operation

`jsonRetain` is reShapr's addition to the JSON Patch vocabulary. Standard JSON Patch (see below) only lets you describe what to *remove*, which is impractical when the response is a large object and you only care about a small subset of it. With `jsonRetain`, you declare the branches you want to *keep*, and everything else is dropped before patches run.

- The value of `jsonRetain` **must** be a non-empty list of **[JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901)** paths,
- Each listed path **must** resolve against the original tool response. Paths that don't resolve are silently ignored (a missing branch isn't an error, it's simply nothing to keep),
- The order of paths in `jsonRetain` is not significant: `jsonRetain` describes a *set* of branches to keep,
- If `jsonRetain` is omitted, the whole response is passed through to the `jsonPatches` step unchanged.

## The `jsonPatches` operation

`jsonPatches` is an ordered sequence of **[JSON Patch](https://jsonpatch.com/)** operations, applied in the listed order to whatever the `jsonRetain` step produced (or to the full response, when `jsonRetain` is omitted).

reShapr supports the six standard JSON Patch operations:

| Operation  | Effect                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `add`      | Adds a value at the given path. Creates the field if it doesn't exist; inserts into arrays.     |
| `replace`  | Replaces the value at the given path. The path **must** already exist.                          |
| `remove`   | Removes the value at the given path.                                                            |
| `copy`     | Copies the value from `from` to `path`.                                                         |
| `move`     | Moves the value from `from` to `path` (equivalent to `copy` + `remove` on the source).          |
| `test`     | Asserts that the value at `path` equals `value`. If the test fails, the patch sequence stops.   |

- The value of `jsonPatches` **must** be a non-empty list of objects, each carrying an `op` property whose value **must** be one of the six operations above,
- `path` **must** be a JSON Pointer that resolves against the working document (the response after `jsonRetain` has been applied),
- `op: copy` and `op: move` **must** additionally specify a `from` JSON Pointer,
- `op: add`, `replace`, and `test` **must** specify a `value`,
- The order of the list is significant: each operation sees the document as modified by the operations that came before it.

For the precise semantics of each operation, refer to **[RFC 6902: JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902)**.

## The `convertToToon` operation

`convertToToon` converts the final filtered JSON output into **[Toon format](https://toonformat.dev/)**, a compact representation intended for LLM consumption.

- The value of `convertToToon` **must** be `true`,
- It is applied **last**, after `jsonRetain` and `jsonPatches` have run,
- It can be used **alone** — without any `jsonRetain` or `jsonPatches` — and it will compact the full raw tool response as-is,
- It works **regardless of the backend protocol**: REST, GraphQL, and gRPC tool responses are all converted to canonical JSON before filters run, so `convertToToon` applies uniformly across all three.

This makes `convertToToon: true` the simplest possible `ToolsOutputFilters` entry: a single key that converts any tool response without requiring you to know its shape upfront.

```yaml
apiVersion: reshapr.io/v1alpha1
kind: ToolsOutputFilters
service:
  name: GitHub GraphQL
  version: '20250917'
filters:
  get_user_with_latest_followers:
    convertToToon: true
```

You can also combine it with `jsonRetain` and `jsonPatches` to both shape and compact the response:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: ToolsOutputFilters
service:
  name: GitHub GraphQL
  version: '20250917'
filters:
  get_user_with_latest_followers:
    jsonRetain:
      - /data/user/name
      - /data/user/login
      - /data/user/bio
      - /data/user/avatarUrl
      - /data/user/followers
    jsonPatches:
      - op: add
        path: /data/user/location
        value: "Worldwide"
      - op: remove
        path: /data/user/followers/nodes
    convertToToon: true
```

## Naming and configuration scope

Like other complementary artifacts, a `ToolsOutputFilters` file is attached to a Service. A **[Configuration Plan](../explanations/configuration-and-exposition.md)** controls whether that attached artifact contributes to an Exposition through its `includedArtifacts` selection.

- When `includedArtifacts` is absent or empty, all complementary artifacts attached to the Service apply, including every attached `ToolsOutputFilters` artifact.
- When `includedArtifacts` contains artifact names, only those attached artifacts apply to the Configuration Plan.

This selection lets two Configuration Plans expose the same Service with different output filters. For example, `partner-plan` can set `includedArtifacts` to `partner-output-filters.yaml`, while `internal-plan` selects `internal-output-filters.yaml`. Each Exposition then uses the filters selected by its Configuration Plan.

## Where filters fit in the request lifecycle

For a given MCP tool call, reShapr applies transformations in this order:

1. The incoming MCP tool call is validated against the tool's input schema (the imported one, or the one defined by a **[Custom Tool](./custom-tools-specification.md)**).
2. The call is converted to a protocol-specific request (REST, GraphQL, gRPC) and dispatched to the backend.
3. The backend response is converted back into a canonical JSON response by reShapr's converters.
4. **If a `ToolsOutputFilters` artifact is attached to the Service and declares a filter for this tool, the filter is applied here: `jsonRetain` first, then `jsonPatches`, then `convertToToon` if set.**
5. The filtered response is wrapped into the JSON-RPC MCP envelope and returned to the client.

Because filtering happens after the converter step and before the MCP envelope, the same `ToolsOutputFilters` artifact applies uniformly whether the underlying tool is backed by REST, GraphQL, or gRPC.

To compare an unfiltered and filtered response with identical Tool arguments, follow **[Context Control in Practice](../tutorials/context-control-in-practice.md)**.
