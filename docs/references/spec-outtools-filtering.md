---
description: Define ToolsFilters to trim, reshape, and conditionally rewrite MCP tool outputs before they reach the model, keeping the context window lean and the response surface deterministic.
---

# Tools Output Filtering

As explained in **[Why reShapr?](../overview/why-reshapr.md)**, reShapr can create secure MCP servers in seconds without coding, just by importing your API's existing artifacts such as **[OpenAPI 3.x](https://www.openapis.org/)** specs, **[GraphQL](https://graphql.org/)** schemas, and **[gRPC/Protobuf](https://grpc.io/)** definitions. Once these artifacts are imported, the **[Custom Tools](./custom-tools-specification.md)** specification lets you redefine the *input* of a tool to fit a specific use case.

`ToolsFilters` is the symmetrical capability on the *output* side: it lets you declaratively control what a tool returns to the model, before the response is wrapped into the JSON-RPC MCP envelope and sent back to the client.

This matters for two reasons:

- **Context economics.** A GraphQL node with many scalar properties, or a REST endpoint returning a deeply nested JSON tree, can easily consume thousands of tokens, most of which are irrelevant to the task at hand. Filtering at the gateway keeps the context window focused on what the model actually needs.
- **Security and determinism.** Reusing a broad existing API often surfaces fields you'd rather not expose to an agent (PII, internal identifiers, expensive sub-trees). Filtering at the gateway gives you a single, declarative point of control, independent of the underlying API.

reShapr applies filtering universally, regardless of the source protocol (REST, GraphQL, gRPC), because filters operate on the canonical JSON response produced by reShapr's protocol converters.

## A first example

Here is a simple `ToolsFilters` artifact that trims the response of a custom GitHub tool down to a single branch, removes a few sensitive or noisy fields, and rewrites one value:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: ToolsFilters
service:
  name: GitHub GraphQL
  version: '20250917'
filters:
  get_user_with_latest_followers:
    retain:
      - /userInfo
    patches:
      - op: add
        path: /userInfo/country
        value: "France"
      - op: remove
        path: /userInfo/age
      - op: remove
        path: /userInfo/bioHTML
      - op: remove
        path: /userInfo/companyHTML
      - op: remove
        path: /userInfo/copilotEndpoints
      - op: remove
        path: /userInfo/monthlyEstimatedSponsorsIncomeInCents
      - op: replace
        path: /userInfo/city
        value: Parigne Le Polin
```

A `ToolsFilters` artifact follows some simple rules:

- It always contains an identification section made of `apiVersion` and `kind` properties that **must** have the **`reshapr.io/v1alpha1`** and `ToolsFilters` values respectively,
- It **must** be bound to a specific reShapr **[Service](../explanations/services-and-artifacts.md)** using the **`service.name`** and `service.version` properties whose values **must** match an already discovered Service,
- The `filters` section then defines the filters, keyed by tool name:
  - The key (here `get_user_with_latest_followers`) **must** match an existing tool on the Service, either an imported tool or a **[Custom Tool](./custom-tools-specification.md)** previously attached to that Service,
  - A filter entry **may** specify a `retain` block, an ordered `patches` block, or both,
  - When both are present, `retain` **is always applied first**, as a pre-processing step that narrows the response, before `patches` are applied in order.

You can specify as many tool filters as you want in the same `ToolsFilters` artifact, as long as each key targets a distinct tool of the bound Service.

## The `retain` operation

`retain` is reShapr's addition to the JSON Patch vocabulary. Standard JSON Patch (see below) only lets you describe what to *remove*, which is impractical when the response is a large object and you only care about a small subset of it. With `retain`, you declare the branches you want to *keep*, and everything else is dropped before patches run.

- The value of `retain` **must** be a list of **[JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901)** paths,
- Each listed path **must** resolve against the original tool response. Paths that don't resolve are silently ignored (a missing branch isn't an error, it's simply nothing to keep),
- The order of paths in `retain` is not significant: `retain` describes a *set* of branches to keep,
- If `retain` is omitted, the whole response is passed through to the `patches` step unchanged.

## The `patches` operation

`patches` is an ordered sequence of **[JSON Patch](https://jsonpatch.com/)** operations, applied in the listed order to whatever the `retain` step produced (or to the full response, when `retain` is omitted).

reShapr supports the six standard JSON Patch operations:

| Operation  | Effect                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `add`      | Adds a value at the given path. Creates the field if it doesn't exist; inserts into arrays.     |
| `replace`  | Replaces the value at the given path. The path **must** already exist.                          |
| `remove`   | Removes the value at the given path.                                                            |
| `copy`     | Copies the value from `from` to `path`.                                                         |
| `move`     | Moves the value from `from` to `path` (equivalent to `copy` + `remove` on the source).          |
| `test`     | Asserts that the value at `path` equals `value`. If the test fails, the patch sequence stops.   |

- The value of `patches` **must** be a list of objects, each carrying an `op` property whose value **must** be one of the six operations above,
- `path` **must** be a JSON Pointer that resolves against the working document (the response after `retain` has been applied),
- `op: copy` and `op: move` **must** additionally specify a `from` JSON Pointer,
- `op: add`, `replace`, and `test` **must** specify a `value`,
- The order of the list is significant: each operation sees the document as modified by the operations that came before it.

For the precise semantics of each operation, refer to **[RFC 6902: JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902)**.

## Conditional filtering

Some tools return very different payloads depending on their inputs: a search endpoint that returns a person or an organisation, a polymorphic GraphQL union, a versioned REST resource. For these cases, `ToolsFilters` supports a conditional form where the filter for a tool is expressed as a **list** of branches, each guarded by a `test`:

```yaml
filters:
  get_user_with_latest_followers:
    - test:
        path: /userInfo/type
        value: PhysicalPerson
      retain:
        - /userInfo/person
      patches:
        - op: remove
          path: /userInfo/person/ssn
    - test:
        path: /userInfo/type
        value: MoralPerson
      retain:
        - /userInfo/entity
      patches:
        - op: remove
          path: /userInfo/entity/taxId
```

Rules for the conditional form:

- A conditional filter is a **list** of branches (as opposed to the simple form, which is a single object),
- Each branch **must** declare a `test` block with `path` and `value`, using the same semantics as JSON Patch's `test` operation,
- Each branch **may** declare `retain` and/or `patches`, with the same meaning as in the simple form,
- Branches are evaluated **in order**. The first branch whose `test` succeeds is the one whose `retain` and `patches` are applied; remaining branches are skipped,
- If no branch's `test` matches, the response is returned unchanged.

## Naming and configuration scope

Unlike `Prompts`, `Resources`, and `CustomTools`, which directly transform a Service, `ToolsFilters` is often driven by *deployment-time* concerns (security posture, audience, token budget) rather than by the Service itself. The same Service and the same Custom Tools can legitimately be exposed multiple times on different gateways, each with its own filter set: a public partner-facing Exposition might strip more fields than an internal one.

For this reason, a future revision of the spec is expected to introduce a top-level `name` attribute on a `ToolsFilters` artifact, so that a **[Configuration Plan](../explanations/configuration-and-exposition.md)** can explicitly reference which filter set to apply at exposition time. Until that lands, a `ToolsFilters` artifact is bound to a Service and applies whenever that Service is exposed.

## Where filters fit in the request lifecycle

For a given MCP tool call, reShapr applies transformations in this order:

1. The incoming MCP tool call is validated against the tool's input schema (the imported one, or the one defined by a **[Custom Tool](./custom-tools-specification.md)**).
2. The call is converted to a protocol-specific request (REST, GraphQL, gRPC) and dispatched to the backend.
3. The backend response is converted back into a canonical JSON response by reShapr's converters.
4. **If a `ToolsFilters` artifact is attached to the Service and declares a filter for this tool, the filter is applied here: `retain` first, then `patches`.**
5. The filtered response is wrapped into the JSON-RPC MCP envelope and returned to the client.

Because filtering happens after the converter step and before the MCP envelope, the same `ToolsFilters` artifact applies uniformly whether the underlying tool is backed by REST, GraphQL, or gRPC.
