---
description: Import OpenAPI 3, GraphQL, or Protobuf 3 API contracts from local files and remote URLs, and resolve common failures.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-05
---

# Import OpenAPI, GraphQL, or Protobuf Artifacts

Import an API contract to create or update its reShapr Service and main Artifact. Choose the source method and metadata according to the contract format and its dependencies.

## Prerequisites

- Access to a reShapr `0.2.3` environment
- Permission to import Artifacts in the current organization
- For CLI procedures, the `reshapr` CLI authenticated against that environment
- For remote sources, network access from the control plane to the source URL

## Choose the format and source

| Contract | Recognition in `0.2.3` | Default Service identity | Recommended source |
|---|---|---|---|
| OpenAPI | An `openapi: 3...` field in JSON or YAML | `info.title` and `info.version` | URL when the document has external `$ref` values |
| GraphQL | A schema, query, mutation, or `# microcksId:` declaration | None; provide name and version | File or URL |
| Protobuf | A `syntax = "proto3";` declaration | Full service name and package-derived version | URL when the root file imports other files |

Swagger and OpenAPI 2.x documents are not supported. Convert them to OpenAPI 3 before importing them.

The Web UI accepts `.json`, `.yaml`, `.yml`, `.graphql`, `.graphqls`, `.gql`, and `.proto` files. Format recognition is based on the document content, not only its extension.

## Import from the Web UI

Open the Service import action or the **Import** stage of **Quick Start**, then choose one of these sources:

- **Local file** uploads one contract from your computer.
- **Remote URL** asks the control plane to retrieve the contract and gives the importer a base URL for resolving dependencies.

For a protected URL, select an existing Secret of type `ARTIFACT`. The control plane uses that Secret only to retrieve the Artifact source. It is not the credential used by a Gateway to call the backend API.

Complete **Service name override** and **Service version override** together when the contract cannot provide the intended identity. Both fields are mandatory for GraphQL. They are optional overrides for OpenAPI and Protobuf.

After import, open the resulting Service and confirm its name, version, protocol type, operations, and main Artifact. Importing the same Service name and version again updates that Service; changing either value creates a different Service identity.

## Import OpenAPI 3

Import the immutable Open-Meteo OpenAPI 3 contract from its URL:

```bash
reshapr import \
  --url https://raw.githubusercontent.com/open-meteo/open-meteo/1.5.6/openapi/forecast.yml
```

The command should report a discovered Service named **Open-Meteo Weather Forecast API**, version `1.0`. Generated Service identifiers differ between environments.

To import a self-contained local document instead, use:

```bash
reshapr import --file ./openapi.yaml
```

For OpenAPI documents with external `$ref` values, prefer `--url`. The importer can then resolve relative and absolute references from the remote source. A local upload contains only the selected file and does not provide sibling files to the control plane.

## Import GraphQL

GraphQL schemas do not define a reShapr Service name or version. Supply both values explicitly.

Create a small local schema:

```bash
cat > inventory.graphql <<'GRAPHQL'
schema {
  query: Query
}

type Query {
  product(sku: ID!): Product
}

type Product {
  sku: ID!
  name: String!
}
GRAPHQL
```

Import it with its Service identity:

```bash
reshapr import --file ./inventory.graphql \
  --serviceName Inventory \
  --serviceVersion 1.0
```

The resulting Service should be named **Inventory**, version `1.0`, with an operation named `product` whose method is `QUERY`.

The same metadata is required for a remote schema:

```bash
reshapr import --url https://example.com/schema.graphql \
  --serviceName Inventory \
  --serviceVersion 1.0
```

The URL in this last command is an example placeholder; replace it with a reachable schema URL.

## Import Protobuf 3

Create a self-contained proto3 contract:

```bash
cat > inventory.proto <<'PROTO'
syntax = "proto3";

package example.inventory.v1;

service InventoryService {
  rpc GetProduct(GetProductRequest) returns (Product);
}

message GetProductRequest {
  string sku = 1;
}

message Product {
  string sku = 1;
  string name = 2;
}
PROTO
```

Import the contract:

```bash
reshapr import --file ./inventory.proto
```

The importer compiles the proto3 document and derives the Service name from the service descriptor. In this example, the package suffix supplies version `v1`. Use `--serviceName` and `--serviceVersion` together to override that identity when needed.

### Resolve Protobuf imports

If the root document contains declarations such as:

```protobuf
import "example/inventory/v1/product.proto";
```

publish the root document and its dependencies under a common, reachable URL hierarchy, then import the root by URL:

```bash
reshapr import \
  --url https://example.com/protos/example/inventory/v1/inventory.proto
```

The URL above is an example placeholder. The control plane resolves imports relative to the remote source while compiling the descriptor. Well-known Protobuf types bundled with the compiler do not need to be published separately.

Uploading only the root `.proto` file does not upload sibling imports. Use a self-contained file or a remote source when dependencies are required.

## Import from a protected URL

Create or select an `ARTIFACT` Secret, then reference its name during URL import:

```bash
reshapr import \
  --url https://artifacts.example.com/contracts/inventory.yaml \
  --secret artifact-registry
```

Both the URL and Secret name in this command are examples. The Secret must already exist in the current organization and contain credentials accepted by the source server. In the Web UI, choose the same Secret in the optional **Secret** field on the **Remote URL** tab.

## Diagnose import failures

| Symptom | Likely cause | Action |
|---|---|---|
| The format is not recognized | The declaration is absent, appears in an unsupported form, or the document is OpenAPI 2.x | Confirm `openapi: 3...`, `syntax = "proto3";`, or a recognizable GraphQL declaration; convert OpenAPI 2.x |
| GraphQL import reports missing Service metadata | Name or version was omitted | Supply both Service name and Service version |
| OpenAPI import fails on an external `$ref` | A local upload has no remote resolution context, or the referenced URL is unavailable | Import the root document by URL and verify every reference from the control-plane network |
| Protobuf parsing reports a missing dependency | An imported `.proto` file could not be resolved or compiled | Publish the dependency at the expected relative URL, then import the root by URL |
| URL import returns an authentication or retrieval error | The control plane cannot reach the URL, or the selected Secret is missing or invalid | Test reachability from the control-plane environment and verify the `ARTIFACT` Secret |
| Import succeeds with an unexpected Service identity | The contract metadata or package-derived version differs from the intended identity | Re-import with name and version overrides; remember that a new identity creates a separate Service |

Use `reshapr service list` and `reshapr service get <service-id>` to inspect the result. For complete command options, see **[CLI Commands](../references/cli-commands.md)**.

## Next steps

- Continue from an imported OpenAPI Service to an MCP endpoint with **[Web UI Quickstart: From Import to Exposition](../tutorials/web-ui-quickstart.md)**.
- Learn how main and attached Artifacts differ in **[Services and Artifacts](../explanations/services-and-artifacts.md)**.
- Add Prompts, Resources, Custom Tools, or output filters with **[Attach and Select reShapr Artifacts](./select-reshapr-artifacts.md)**.

## Evidence and limits

This guide was last verified with reShapr `0.2.3` on 2026-09-05. Format recognition follows the release-tagged **[Artifact importer factory](https://github.com/reshaprio/reshapr/blob/0.2.3/control-plane/src/main/java/io/reshapr/ctrl/artifacts/ArtifactImporterFactory.java)**. Metadata and dependency behavior follow the **[GraphQL importer](https://github.com/reshaprio/reshapr/blob/0.2.3/control-plane/src/main/java/io/reshapr/ctrl/artifacts/GraphQLImporter.java)**, **[Protobuf importer](https://github.com/reshaprio/reshapr/blob/0.2.3/control-plane/src/main/java/io/reshapr/ctrl/artifacts/ProtobufImporter.java)**, and **[OpenAPI importer](https://github.com/reshaprio/reshapr/blob/0.2.3/control-plane/src/main/java/io/reshapr/ctrl/artifacts/OpenAPIImporter.java)**.

Import validates and models a contract; it does not prove that the backend endpoint is reachable or that its runtime behavior matches the contract. Verify those properties after creating a Plan and Exposition.