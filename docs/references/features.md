description: Verified reShapr capabilities, availability, scope, and canonical references.

# reShapr features

**Last verified with reShapr 0.2.3 on September 3, 2026.**

`Available with limits` means that the capability requires configuration or has a narrower scope than its general name might suggest. Links point to the owning reference when implementation details change frequently.

## API translation and Context Control

| Capability | Availability | Scope | Reference |
|---|---|---|---|
| OpenAPI import | Available | OpenAPI 3.x documents are converted into REST-backed MCP Tools. Swagger/OpenAPI 2.x import is not provided. | [Services and Artifacts](../explanations/services-and-artifacts.md) |
| GraphQL import | Available | Queries and mutations become Tools. Service name and version must be supplied when the schema does not provide them. | [Services and Artifacts](../explanations/services-and-artifacts.md) |
| Protobuf/gRPC import | Available | Protobuf 3 services become Tools backed by gRPC. Imports are resolves before compilation. | [Services and Artifacts](../explanations/services-and-artifacts.md) |
| Import by file or URL | Available | Both paths support service name and version overrides. URL imports can resolve external dependencies that are unavailable to a local file import. | [CLI commands](cli-commands.md) |
| Operation selection | Available | A Configuration Plan can include or exclude API operations; inclusion takes precedence. | [Configuration Plan and Exposition](../explanations/configuration-and-exposition.md) |
| reShapr artifacts | Available | Prompts, Resources, Custom Tools, and Tools Output Filters can be attached to a Service and selected per Configuration Plan. | [Configuration Plan and Exposition](../explanations/configuration-and-exposition.md) |
| Declarative Custom Tools | Available | Rename, condense, or reshape existing operations without creating a new backend. | [Custom Tools specification](custom-tools-specification.md) |
| Scripted Custom Tools | Available with limits | JavaScript orchestration can call allowed Tools with bounded execution time and depth. This extension is programmable rather than no-code. | [Custom Tools specification](custom-tools-specification.md#scripted-custom-tools) |
| Output filtering and TOON | Available | Gateway-side rules can retain fields, apply JSON Patch, compact JSON, or encode JSON output as TOON before returning it to the MCP client. | [Tools Output Filtering](spec-outtools-filtering.md) |

## MCP protocol

| Capability | Availability | Scope | Reference |
|---|---|---|---|
| Protocol versions | Available | `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, and the public `2026-07-28` version are negotiated by the Gateway. | [MCP specification](https://modelcontextprotocol.io/specification/) |
| Streamable HTTP | Available | Expositions provide MCP endpoints over HTTP; TLS termination depends on the deployment. WebSocket transport is not provided. | [Configuration Plan and Exposition](../explanations/configuration-and-exposition.md) |
| Session and stateless modes | Available | Versions before `2026-07-28` use a server-issued session ID. `2026-07-28` uses stateless requests and `server/discover`. | [MCP specification](https://modelcontextprotocol.io/specification/) |
| Tools | Available | `tools/list` and `tools/call` dispatch to REST, GraphQL, gRPC, or Custom Tools selected by the Plan. | [Custom Tools specification](custom-tools-specification.md) |
| Prompts | Available | `prompts/list` and `prompts/get` serve Prompts artifacts selected by the Plan. | [Prompts specification](prompts-specification.md) |
| Resources | Available | Static and templated Resources support list, template list, and read operations. | [Resources specification](resources-specification.md) |
| URL elicitation | Available with limits | Backend credentials can be requested through legacy session-bound errors or `2026-07-28` stateless elicitation bound to an authenticated user. | [Security model](../explanations/security-model.md) |
| Client cache hints | Available with limits | `ttlMs` and `cacheScope` are returned only for the `2026-07-28` protocol shape. | [Configuration Plan and Exposition](../explanations/configuration-and-exposition.md) |

Methods such as roots, sampling, and subscriptions are not exposed as server capabilities. A dedicated compatibility matrix will document method-level behavior separately.

## Security and governance

| Capability | Availability | Scope | Reference |
|---|---|---|---|
| MCP endpoint API key | Available | The Gateway validates `x-reshapr-key`; keys can be renewed and propagated to connected Gateways. | [Security model](../explanations/security-model.md) |
| MCP endpoint OAuth 2.0 | Available | The Gateway validates signed bearer JWTs against configured issuers and JWKS, publishes RFC 9728 metadata, checks required Exposition scopes, and checks a `resource` claim when present. | [Security model](../explanations/security-model.md) |
| Backend authentication | Available with limits | Basic, token/header, certificate, and OAuth credentials depend on the backend protocol and Secret configuration. | [Security model](../explanations/security-model.md#gateway-access-to-backend-apis) |
| Local secret references | Available with limits | Hybrid Gateways resolve `${env:VARIABLE}` references locally on each backend call. `env` is the provided resolver. | [Security model](../explanations/security-model.md#gateway-access-to-backend-apis) |
| Audit events | Available with limits | A Gateway emits structured MCP-call and authentication-failure events when audit is enabled on the Configuration Plan. | [Security model](../explanations/security-model.md) |
| Multi-tenancy | Available | Control-plane data is isolated by organization through application-level discriminator tenancy. | [Project architecture](https://github.com/reshaprio/reshapr/blob/main/AGENTS.md) |
| Organization quotas | Available with limits | Quotas limit governance resources such as Expositions and Gateways. They are not request-rate limits. | [Public API](https://github.com/reshaprio/reshapr/blob/main/reshapr-public-openapi-v0.1.yaml) |
| Administrative identities | Available | Users, organizations, memberships, service accounts, and Gateway API tokens are managed through dedicated control-plane surfaces. | [Admin API](https://github.com/reshaprio/reshapr/blob/main/reshapr-admin-ctrl-openapi-v0.1.yaml) |

## Product interfaces

| Capability | Availability | Scope | Reference |
|---|---|---|---|
| Public and administrative APIs | Available | OpenAPI contracts cover product resources, authentication, and administration. | [reShapr API contracts](https://github.com/reshaprio/reshapr) |
| CLI | Available | The CLI covers login, import, Services, artifacts, Secrets, Plans, Expositions, Gateway Groups, tokens, quotas, and administrative workflows. | [CLI](https://github.com/reshaprio/reshapr/tree/main/cli) |
| Web UI | Available | The Web UI covers the main import-to-Exposition workflow and organization administration. | [Web UI](https://github.com/reshaprio/reshapr/tree/main/web-ui) |
| Live configuration propagation | Available | Configuration events are streamed to connected Gateways without requiring a Gateway restart. This is not a general zero-downtime or rollback guarantee. | [Project architecture](https://github.com/reshaprio/reshapr/blob/main/AGENTS.md) |
| Gateway observability | Available with limits | The Gateway can export OpenTelemetry traces, metrics, and logs; audit events remain conditional. Equivalent coverage is not provided across every component. | [Gateway configuration](https://github.com/reshaprio/reshapr/blob/main/proxy/src/main/resources/application.properties) |

## Deployment and Kubernetes

| Capability | Availability | Scope | Reference |
|---|---|---|---|
| Local runtime | Available | The CLI starts and stops a release Docker Compose stack with Docker or Podman and can include the Web UI. | [reShapr project](https://github.com/reshaprio/reshapr) |
| Kubernetes APIs and operator | Available with limits | Seven `v1alpha1` CRDs manage Services, Plans, Expositions, Gateway Groups, Secret sources, Custom Tools, and Resources. Custom Tools and Resources do not currently clean up remote artifacts on deletion. | [Controller documentation](https://github.com/reshaprio/reshapr-controllers/tree/main/documentation) |
| Sidecar injection | Available with limits | The admission controller injects Gateway sidecars and creates discovery/MCP Services for supported Deployment-owned workloads. It is fail-open by default. | [Admission controller](https://github.com/reshaprio/reshapr-controllers/blob/main/documentation/admission-controller.md) |
| Helm packaging | Available | Four OCI charts package the control plane, proxy, Web UI, and controllers. | [Helm charts](https://github.com/reshaprio/reshapr-helm-charts) |
| PostgreSQL topology | Available with limits | The control-plane chart supports bundled or external PostgreSQL. The bundled development database is not a high-availability setup. | [Control-plane chart](https://github.com/reshaprio/reshapr-helm-charts/tree/main/control-plane) |
| Runtime scaling and availability | Available with limits | Production profiles configure replicas and PDBs for the control plane and Web UI; the proxy adds clustering and HPA. End-to-end availability still depends on PostgreSQL and the target infrastructure. | [Helm charts](https://github.com/reshaprio/reshapr-helm-charts) |
| Network and metrics integration | Available with limits | The proxy chart provides optional NetworkPolicy and ServiceMonitor resources. Coverage is not uniform across all four charts. | [Proxy chart](https://github.com/reshaprio/reshapr-helm-charts/tree/main/proxy) |
| Installation profiles and signatures | Available | All charts provide development and production values; published charts are signed with Cosign. | [Helm chart verification](https://github.com/reshaprio/reshapr-helm-charts#verifying-chart-signatures) |
| Upgrades | Available with limits | Kubernetes rolling updates, startup database migrations, retained clustering secrets, and retained CRDs support upgrades. Automated rollback and general secret rotation are not provided. | [Helm upgrade guidance](https://github.com/reshaprio/reshapr-helm-charts#upgrading) |

