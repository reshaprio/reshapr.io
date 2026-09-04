---
description: Understand how API and reShapr Artifacts define a versioned Service and contribute capabilities to each MCP Exposition.
---

# Services and Artifacts

A reShapr **Service** is the versioned model of an API that can be shaped and exposed through MCP. **Artifacts** provide the contracts and complementary definitions from which reShapr builds that model.

## The main Artifact defines the Service

Importing an API contract through the CLI, Web UI, or API creates or updates a Service. The imported contract becomes its **main Artifact** and determines:

- the Service name and version;
- the source protocol: OpenAPI, GraphQL, or gRPC;
- the operations from which reShapr can generate MCP Tools.

Only one main Artifact belongs to a Service. It is always available to the Service's Configuration Plans and cannot be excluded through `includedArtifacts`.

reShapr derives Service identity differently for each contract type:

| Contract | Service identity |
|---|---|
| OpenAPI 3.x | The document's title and version identify the Service. |
| gRPC/Protobuf | The first `service` definition and its package identify the Service; the final package segment supplies its version. |
| GraphQL | The schema has no Service metadata, so the importer must provide the name and version. |

Importing another contract with the same name and version updates the existing Service. A different version creates a separate Service that can have its own Plans and Expositions.

## Attached Artifacts enrich the Service

Attached reShapr Artifacts add capabilities or transformations without changing the source API contract:

| Artifact type | Contribution |
|---|---|
| **[Prompts](../references/prompts-specification.md)** | Reusable instructions exposed through MCP Prompts. |
| **[Resources](../references/resources-specification.md)** | Static or remote context exposed through MCP Resources. |
| **[Custom Tools](../references/custom-tools-specification.md)** | Task-oriented Tools that map to or orchestrate API operations. |
| **[Tools Output Filters](../references/spec-outtools-filtering.md)** | Response retention, JSON Patch transformations, and optional TOON encoding. |

Each attached Artifact declares the target `service.name` and `service.version`. Attaching the same source again updates the Artifact and recomputes its metadata.

## Derived capabilities make composition visible

When reShapr imports an attached Artifact, it extracts a concise capability list:

- Prompt names from `prompts`;
- Custom Tool names from `customTools`;
- Resource and Resource Template URIs from `resources` and `resourceTemplates`;
- target Tool names from `filters`.

These derived capabilities help operators inspect what an Artifact contributes without reading its complete source. They preserve declaration order and remove duplicates. They are available through Artifact API representations, the CLI, and the Web UI's Service, Artifact, and Plan views.

Capability metadata is descriptive. It does not replace MCP discovery, authorize a Tool call, or guarantee that a capability is included in every Exposition.

## Configuration Plans select attached Artifacts

A Service can have several **Configuration Plans**, each selecting a different set of operations and attached Artifacts. `includedArtifacts` contains Artifact names:

- a non-empty list selects only those attached Artifacts;
- an absent or empty list selects all attached Artifacts;
- the main Artifact, and any schema derived from it, remain available regardless of this setting.

This lets one Service support distinct MCP surfaces. For example, an internal Plan can include operational Resources and detailed output, while a partner Plan selects a narrower Custom Tool and response filter.

The selected Artifacts contribute to every Exposition created from that Plan. See **[Service, Artifact, Plan, Exposition, Gateway: The Lifecycle](./resource-lifecycle.md)** for the complete resource chain.

## Updates and deletion propagate

Updating a main or attached Artifact refreshes the affected Service representation. Connected Gateways receive the resulting Exposition updates through control-plane discovery.

Deletion has wider consequences:

- deleting an Exposition removes its endpoint from the target Gateway Group;
- deleting a Configuration Plan removes its Expositions;
- deleting a Service removes its Artifacts, Plans, and Expositions;
- deleting an attached Artifact removes its name from Plans that selected it.

The last case needs particular care. If removing an Artifact leaves a Plan with an empty `includedArtifacts` list, that empty list means **all remaining attached Artifacts**. Adjust or remove the Plan before deleting the Artifact when this fallback would broaden its MCP surface.

## Apply the model

- **[Attach and Select reShapr Artifacts](../how-to-guides/select-reshapr-artifacts.md)** shows how to inspect capabilities and create two Plan-specific selections.
- **[Context Control](./context-control.md)** compares operation selection, Artifact selection, Custom Tools, and output transformations.
- **[CLI Commands](../references/cli-commands.md)** documents Artifact inspection commands and options.
