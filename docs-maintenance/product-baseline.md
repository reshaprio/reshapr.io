# Product baseline

**Baseline date:** 2026-10-21

**Runtime:** reShapr `1.1.0`

**Controllers:** `0.0.4`

**Helm charts:** `0.0.16`

This is the factual index used to review documentation claims. It is not a substitute for release artifacts or owner-repository contracts. A row means that the evidence was reviewed; it does not make this file evidence.

## Reviewed sources

| Repository | Released ref | Released commit | Review ref | Review commit |
|---|---|---|---|---|
| `reshaprio/reshapr` | `1.1.0` | `bd55008a322e56f7d2dac7e96cadc7211e5c09a9` | release-tagged implementation and tests | same commit |
| `reshaprio/reshapr-controllers` | `0.0.4` | `4c11573b91a3361d7b76f4450d39bec9271b2059` | eight CRDs and reconcilers | same commit |
| `reshaprio/reshapr-helm-charts` | `0.0.16` | `3fa540d4a0aaa26e0718152678a24e2cd6a00c83` | release tag and four published OCI charts | same commit |
| `reshaprio/reshapr.io` | current corpus | `10140fb7a8c847b338fe4e0b105518e3d68e8101` | `main` plus reviewed working tree | same HEAD |

Release-update review, 2026-10-21: Helm `0.0.16` removes the proxy's incomplete HPA-specific Deployment and uses the clustering-capable Deployment for both autoscaling modes. The four published OCI artifacts were pulled and installed in isolated Minikube namespaces with runtime `1.1.0` and controllers `0.0.4`. Live checks cover the main production-guide path, a three-member cluster and direct cross-pod sessions, HTTPS UI/readiness, both admission replicas, HPA metrics, and MCP backend dispatch. The [dated Kubernetes replay report](replay/2026-10-21-kubernetes-0.0.16.md) records adaptations, digests, failures corrected, and outstanding full-page checks. Public verification remains historical; alternative certificate providers, enforcing CNI policies, and production infrastructure are not qualified by this local replay.

Historical release-update review, 2026-10-19: the baseline used runtime `1.1.0`, controllers `0.0.4`, and corrected charts `0.0.15` at `c62e8e7e7af77bc008805c117341ae34da6a1fc5`. The Helm `0.0.15` tag was corrected during review; the earlier `bcefdeec15e0faf5119cb5a3e46dadff59e39769` artifact is superseded and must not be used as evidence for eight-CRD packaging. The corrected published controllers chart has digest `sha256:8dbdc4e089ea92a2b387e38b3eeb7f5c5ad54eef224a5e590ada40e83fc28c46`; `helm show crds` confirms all eight kinds and ConfigurationPlan `toolExposureMode`.

The documentation working tree is dirty, and its commit does not include these edits. New `release_review` frontmatter identifies a source-contract review, not a live command replay. Existing `verification` dates and versions remain historical replay evidence; do not interpret them as verification of newly substituted release commands. Changed live procedures still require an isolated-environment replay before their verification markers can advance.

Preflight evidence recorded on 2026-10-19:

- `reshapr-kubernetes-replay.sh`: all four OCI charts accessible; eight controllers 0.0.4 CRD manifests parsed and validated offline with yq; all four charts rendered with pinned runtime/controller versions.
- `reshapr-observability-replay.sh`: proxy OTLP environment settings and ServiceMonitor render checks passed.
- `reshapr-hybrid-replay.sh`: published proxy 1.1.0 image manifest available.
- `helm show crds` on the corrected controllers chart confirms all eight CRDs and the ConfigurationPlan `toolExposureMode` enum.
- No `APPLY=true` checks were run. The configured Minikube API was unreachable; no cluster changes or live backend, host-UI, OIDC, credential, or script execution replay is claimed.

Follow-up live replay, 2026-10-20: the published CLI and Docker images `1.1.0` were exercised in a disposable local stack covering Compose, CLI imports and CI automation, MCP, Context Control, scripted Tools, API-key rotation, administration, synchronization recovery, and the Web UI Quick Start. Review on 2026-10-21 retained current public verification only for the three fully replayed pages: Context Control, Artifact selection and API-key protection. Other pages retain their previous complete verification. The [dated replay report](replay/2026-10-20-runtime-1.1.0.md) keeps partial results and the remaining full-page checks privately. This supersedes the no-live-replay statement above only for the executed paths, not Kubernetes, OIDC/OAuth, audit export, or database encryption rotation.

Published chart digests for the current baseline:

| Chart 0.0.16 | OCI digest |
|---|---|
| control-plane | `sha256:a8576aae43f6e3427f62f70090333e60ce4f9d3cf3ced533855aa546fc683acb` |
| proxy | `sha256:935eab058a2a61e5b7c37cb29d482f38f8c75d1ef884f5d1937ad9f694d28841` |
| web-ui | `sha256:83fa5ac7c2becd08ba9eb42398221ac84795aaf88dba4a35253897cb46a322cd` |
| controllers | `sha256:2a6e87bdbdd6b2cdd133ef0b07a52a1cb209a66f3aa88122736f8b34c99eb7b8` |

Historical published chart digests:

| Chart 0.0.15 | OCI digest |
|---|---|
| control-plane | `sha256:333c1e3d5e645925243d5ebcd5ceb7a4af9b9dcfc934a0591f4ea0021ce7cd07` |
| proxy | `sha256:b3ed62c643b90499cf6e529ddf3351aeca94c852312569004f0633ebef1733bf` |
| web-ui | `sha256:b52c80b905abe0408e17dcc89ee6924d10896f3ebc42cc38071147c74cdb5295` |
| controllers | `sha256:8dbdc4e089ea92a2b387e38b3eeb7f5c5ad54eef224a5e590ada40e83fc28c46` |

Historical OIDC artifact evidence from the previous 1.0.0 baseline (not evidence for 1.1.0 images):

- `registry.reshapr.io/reshapr/reshapr-ctrl:1.0.0`: `sha256:6d47495b52dc535ac9e25561f3513920223c93581b1fb49690117e1c7a0d6791`
- `registry.reshapr.io/reshapr/reshapr-ui:1.0.0`: `sha256:1db5188d4f566d3f4b737628d7158c2395d803c6ef44bbe4d3f86af6a3359723`
- `quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane:0.0.14`: `sha256:d2a6b1b657cdbcd659c09412539db97047980ada2113843c6537da41df03cc99`

## Personas

| ID | Persona | Primary need |
|---|---|---|
| `PER-AGENT-BUILDER` | Developer / agent builder | Turn an API into an MCP server and consume it quickly. |
| `PER-PLATFORM-ENGINEER` | API / platform engineer | Govern Services, Configuration Plans, Expositions, and integrations. |
| `PER-KUBERNETES-OPERATOR` | SRE / Kubernetes operator | Deploy, secure, scale, observe, and troubleshoot the platform. |
| `PER-SECURITY-ARCHITECT` | Security architect | Evaluate trust boundaries, identities, secrets, controls, and residual risks. |
| `PER-TECHNOLOGY-DECISION-MAKER` | Technology decision-maker | Evaluate functional coverage, deployment models, and limitations. |

## Functional domains

| ID | Domain | Scope |
|---|---|---|
| `DOM-CONTEXT-CONTROL` | API transformation and Context Control | Contract ingestion, generated Tools, capability selection, and response reduction. |
| `DOM-MCP` | MCP protocol | Versions, state modes, transport, server methods, Prompts, Resources, and elicitation. |
| `DOM-GOVERNANCE` | Control plane and governance | Managed resources, tenancy, quotas, identity, and live propagation. |
| `DOM-SECURITY` | Security | Endpoint protection, backend credentials, OAuth, encryption, and audit. |
| `DOM-EXPERIENCE` | User experience | CLI, Web UI, automation, and local runtime. |
| `DOM-KUBERNETES` | Kubernetes and GitOps | CRDs, reconciliation, admission, RBAC, and sidecar injection. |
| `DOM-OPERATIONS` | Deployment and operations | Docker Compose, Helm, availability, scaling, networking, upgrades, and observability. |

## Capability registry

Status totals for this baseline are 78 `released`, 1 `main-only`, 5 `partial`, 7 `unsupported`, and 1 `removed`.

### API transformation and Context Control

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-OPENAPI-3-IMPORT` | released | Import OpenAPI 3.x REST descriptions and generate MCP Tools. | `reshapr`: `OpenAPIImporter`, `OpenAPIMcpToolConverter` | `LIM-OPENAPI-2-UNSUPPORTED` |
| `CAP-OPENAPI-2-IMPORT` | unsupported | Import Swagger or OpenAPI 2.x descriptions. | `reshapr`: no importer selected by `ArtifactImporterFactory` | `LIM-OPENAPI-2-UNSUPPORTED` |
| `CAP-GRAPHQL-IMPORT` | released | Import GraphQL schemas and generate query and mutation Tools. | `reshapr`: `GraphQLImporter`, `GraphQLMcpToolConverter` | `LIM-GRAPHQL-METADATA-REQUIRED` |
| `CAP-PROTOBUF-GRPC` | released | Import Protobuf 3 definitions and dispatch Tools to gRPC backends. | `reshapr`: `ProtobufImporter`, `GrpcMcpToolConverter`, `GrpcProxyService` | `LIM-PROTOBUF-DEPENDENCY-RESOLUTION` |
| `CAP-IMPORT-FILE-OR-URL` | released | Import contracts by local file or URL, with name and version overrides. | `reshapr`: `ArtifactResource`, `ReferenceResolver`, CLI import command | `LIM-LOCAL-IMPORT-EXTERNAL-REFS` |
| `CAP-OPERATION-SELECTION` | released | Include or exclude generated API operations from the client-visible surface of a Configuration Plan. | `reshapr`: `OperationNameFilterPredicate`, `ToolCallExecutor` | `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` |
| `CAP-ARTIFACT-ATTACHMENT` | released | Attach Prompts, Resources, Custom Tools, and Tools Output Filters to a Service. | `reshapr`: `ReshaprArtifactBuilder`, `ArtifactType` | none |
| `CAP-ARTIFACT-SELECTION` | released | Select attached artifacts per Configuration Plan. | `reshapr`: `ConfigurationPlan.includedArtifacts` | none |
| `CAP-DECLARATIVE-CUSTOM-TOOLS` | released | Rename, condense, and reshape operations with declarative Custom Tools. | `reshapr`: `ReshaprCustomToolsMcpToolConverter` | none |
| `CAP-SCRIPTED-CUSTOM-TOOLS` | released | Orchestrate declared Tools with JavaScript, including lower-level operations hidden from the client-visible surface. | `reshapr`: `CustomToolScriptRunner`, `ToolCallExecutor`, associated tests | `LIM-SCRIPT-RUNTIME-BOUNDS`, `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` |
| `CAP-CODE-MODE` | released | Select TOOLS, CODE, or HYBRID per Plan; discover selected Tools progressively and run client-supplied JavaScript through search_tools, get_api_types, and execute_code. | `reshapr` 1.1.0: `CodeModeTools`, `CodeModeExecutor`, `ToolCallExecutor`, Code Mode tests; controllers 0.0.4 ConfigurationPlan reconciliation | `LIM-CODE-MODE-BOUNDS`, `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION`, `LIM-DIAGNOSTIC-LOG-SENSITIVE` |
| `CAP-TOOLS-OUTPUT-FILTERING` | released | Retain fields, apply JSON Patch, compact JSON, or convert Tool output. | `reshapr`: `ToolsOutputFiltersApplier`, associated tests | `LIM-OUTPUT-FILTER-FAILS-OPEN` |
| `CAP-TOON-OUTPUT` | released | Encode JSON Tool results as TOON. | `reshapr`: `JToon.encodeJson()` integration | `LIM-TOON-OUTPUT-ONLY` |
| `CAP-ARTIFACT-LIFECYCLE` | released | Read, delete, and analyze the impact of attached artifacts. | `reshapr`: `ArtifactResource`, `ArtifactManagerService` | none |

### MCP protocol

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-MCP-STREAMABLE-HTTP` | released | Serve Exposition endpoints over Streamable HTTP. | `reshapr`: `McpController`, endpoint routing | `LIM-MCP-NO-WEBSOCKET` |
| `CAP-MCP-VERSION-NEGOTIATION` | released | Negotiate MCP `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, and `2026-07-28`. | `reshapr`: `McpSchema.SUPPORTED_PROTOCOL_VERSIONS`, routing tests | none |
| `CAP-MCP-SESSION-MODE` | released | Initialize and pin a server-issued MCP session for versions before `2026-07-28`. | `reshapr`: `McpController`, `SessionStore` | none |
| `CAP-MCP-STATELESS-MODE` | released | Use stateless requests and `server/discover` with MCP `2026-07-28`. | `reshapr`: `ModernProtocolDialect`, modern request validation | none |
| `CAP-MCP-TOOLS` | released | Serve `tools/list` and `tools/call`. | `reshapr`: MCP request handlers and protocol tests | none |
| `CAP-MCP-PROMPTS` | released | Serve `prompts/list` and `prompts/get` from selected artifacts. | `reshapr`: `ReshaprPromptsMcpPromptBuilder` | `LIM-CRD-PROMPTS-FILTERS-ABSENT` |
| `CAP-MCP-RESOURCES` | released | Serve static and templated Resources through list, template-list, and read methods. | `reshapr`: `ReshaprResourcesMcpResourceBuilder` | none |
| `CAP-MCP-APPS-REFERENCES` | released | Reference remotely hosted MCP App HTML through UI Resources and associate the UI with native Tools. | `reshapr` 1.1.0: `ReshaprResourcesMcpResourceBuilder`, `ReshaprCustomToolsMcpToolConverter`, tracked `dev/github-api-resources.yaml` and `dev/github-user-mcp-app/` | `LIM-MCP-APPS-HOST` |
| `CAP-MCP-URL-ELICITATION` | released | Request backend credentials with protocol-specific URL elicitation. | `reshapr`: `ElicitationController`, `ElicitationStore` | `LIM-ELICITATION-IDENTITY-BOUND` |
| `CAP-MCP-CACHE-HINTS` | released | Return `ttlMs` and `cacheScope` client cache hints. | `reshapr`: `ConfigurationPlan.CachePolicy`, `ModernProtocolDialect` | `LIM-CACHE-HINTS-MODERN-ONLY` |
| `CAP-MCP-ADDITIONAL-SERVER-METHODS` | unsupported | Serve logging, subscriptions, roots, or sampling methods. | `reshapr`: absent from `McpController` dispatcher | `LIM-MCP-METHODS-UNSUPPORTED` |

### Control plane and governance

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-SERVICE-VERSION-ADMINISTRATION` | released | Administer imported Services and coexisting versions. | `reshapr`: `ServiceResource`, `ServiceManagerService` | `LIM-SERVICE-NO-IMMUTABLE-ROLLBACK` |
| `CAP-CONFIGURATION-PLANS` | released | Configure backend, timeout, operation and artifact selection, header propagation, audit, and MCP protection. | `reshapr`: `ConfigurationPlan`, REST resource, Web UI editor | none |
| `CAP-EXPOSITIONS` | released | Bind a Service and Plan to a Gateway Group under a named MCP endpoint. | `reshapr`: `Exposition`, REST resource | none |
| `CAP-GATEWAY-GROUPS` | released | Select dynamically registered Gateways through labels and Gateway Groups. | `reshapr`: `GatewayGroup`, `GatewayHealthServiceHandler` | none |
| `CAP-LIVE-CONFIGURATION-PROPAGATION` | released | Stream created, updated, and deleted configuration to connected proxies. | `reshapr`: discovery stream and cluster event broadcaster | `LIM-LIVE-CONFIG-NO-ZERO-DOWNTIME` |
| `CAP-ORGANIZATION-TENANCY` | released | Isolate control-plane data by organization. | `reshapr`: `TenantAwareEntity`, tenant resolver | `LIM-TENANCY-APPLICATION-LEVEL` |
| `CAP-USER-ORGANIZATION-MEMBERSHIP-ADMIN` | released | Administer users, organizations, owners, and memberships. | `reshapr`: admin REST resources and CLI commands | none |
| `CAP-USER-AUTHENTICATION` | released | Authenticate internal users or users from a configured OIDC provider. | `reshapr`: `AuthenticationController`, identity providers | `LIM-OIDC-EXTERNAL-PROVIDER`, `LIM-OIDC-LOGIN-VALIDATION-INCOMPLETE`, `LIM-OIDC-WEBUI-PUBLIC-URL-IGNORED` |
| `CAP-KUBERNETES-SERVICE-ACCOUNT-AUTH` | released | Exchange a projected Kubernetes service-account token for reShapr credentials. | `reshapr`, `reshapr-controllers`: token verifier and provider | `LIM-KUBERNETES-SA-AUDIENCE-FIXED` |
| `CAP-API-TOKENS` | released | Create, list, and delete API tokens for Gateways and automation. | `reshapr`: `TokenResource`, CLI API-token commands | none |
| `CAP-ORGANIZATION-RESOURCE-QUOTAS` | released | Limit governance resource counts by organization. | `reshapr`: `QuotaMetric`, quota interceptors | `LIM-QUOTAS-NOT-RATE-LIMITS` |
| `CAP-BACKEND-AUTHENTICATION-SECRETS` | released | Store token, Basic, certificate, OAuth authorization-code, and OAuth Client Credentials backend credentials. | `reshapr`: `Secret`, protocol proxy services | `LIM-BACKEND-AUTH-PROTOCOL-DEPENDENT` |
| `CAP-BACKEND-OAUTH-CLIENT-CREDENTIALS` | released | Obtain and cache machine-to-machine backend tokens with the OAuth 2.0 Client Credentials grant. | `reshapr`: `SecretAuthMethod`, `ClientCredentialsTokenProvider`, associated tests | `LIM-OAUTH-CLIENT-CREDENTIALS-NO-REFRESH`, `LIM-LOCAL-SECRETS-ENV-ONLY` |
| `CAP-LOCAL-SECRET-REFERENCES` | released | Resolve `${env:VARIABLE}` values locally at a hybrid proxy. | `reshapr`: `SecretReferenceResolver`, `EnvSecretResolver` | `LIM-LOCAL-SECRETS-ENV-ONLY` |
| `CAP-CONTROL-PLANE-SECRET-ENCRYPTION` | released | Encrypt sensitive Secret and Configuration Plan fields at rest with identified AES-256-GCM keys. | `reshapr`: `CipherService`, attribute converters, associated tests | `LIM-SECRET-ENCRYPTION-AES-ECB`, `LIM-SECRET-ROTATION-MANUAL` |
| `CAP-ENCRYPTION-KEY-ROTATION` | released | Re-encrypt stored sensitive fields with an administrator-selected active key. | `reshapr`: `KeyRotationService`, `KeyRotationResource`, admin CLI | `LIM-SECRET-ROTATION-MANUAL` |
| `CAP-BACKEND-HEADER-POLICY` | released | Allow, deny, or rename request headers sent from an MCP client to an HTTP backend or converted to gRPC call metadata. | `reshapr`, `reshapr-controllers`: `HeaderPolicyEngine`, `ProxyService`, `GrpcProxyService`, ConfigurationPlan API and CRD | `LIM-HEADER-POLICY-REQUEST-ONLY` |

### Security and observability

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-MCP-API-KEY-AUTH` | released | Protect an Exposition with an `x-reshapr-key` API key. | `reshapr`: `SecureEndpointFilter` | none |
| `CAP-MCP-OAUTH-BEARER-AUTH` | released | Validate bearer JWTs against configured issuers, JWKS, scopes, and dynamic or static audiences. | `reshapr`: `SecureEndpointFilter`, `MultipleIssuerClaimsVerifier`, associated tests | `LIM-OAUTH-AUDIENCE-NOT-VERIFIED`, `LIM-OAUTH-AUDIENCE-DISABLEABLE`, `LIM-OAUTH-PER-TOOL-UNSUPPORTED` |
| `CAP-OAUTH-PROTECTED-RESOURCE-METADATA` | released | Publish RFC 9728 Protected Resource Metadata for MCP endpoints. | `reshapr`: `WellKnownController` | none |
| `CAP-OAUTH-AUTHORIZATION-SERVER-CONFIG` | partial | Consume configured authorization-server and JWKS metadata. | `reshapr`: `OAuth2ConfigurationEntry`, security filter | `LIM-OAUTH-AS-METADATA-NOT-HOSTED` |
| `CAP-OAUTH-RESOURCE-INDICATOR` | removed | Compare a JWT `resource` claim with the requested endpoint URL. Removed in favor of standard `aud` validation. | `reshapr`: `SecureEndpointFilter` diff and audience-binding tests | `LIM-OAUTH-RESOURCE-CLAIM-ONLY` |
| `CAP-OAUTH-DYNAMIC-CLIENT-REGISTRATION` | unsupported | Register OAuth clients dynamically under RFC 7591. | `reshapr`: no registration endpoint or flow | `LIM-OAUTH-DCR-UNSUPPORTED` |
| `CAP-SPIFFE-IDENTITIES` | unsupported | Authenticate workloads with SPIFFE identities. | all product repositories: no implementation found | `LIM-SPIFFE-UNSUPPORTED` |
| `CAP-OAUTH-PER-TOOL-AUTHORIZATION` | unsupported | Enforce scopes or claims per Tool, Prompt, or Resource. | `reshapr`: policy executes at Exposition boundary | `LIM-OAUTH-PER-TOOL-UNSUPPORTED` |
| `CAP-MCP-RATE-LIMITING` | unsupported | Rate-limit MCP calls. | product repositories: no request-rate limiter found | `LIM-MCP-RATE-LIMITING-UNSUPPORTED` |
| `CAP-MCP-AUDIT-EVENTS` | released | Emit structured MCP call and authentication-failure audit events. | `reshapr`: `AuditLogger`, MCP and security paths | `LIM-AUDIT-CONFIG-REQUIRED` |
| `CAP-PROXY-OPENTELEMETRY` | released | Export proxy traces, metrics, and logs through OpenTelemetry. | `reshapr`: proxy OpenTelemetry configuration and spans | `LIM-OBSERVABILITY-PROXY-ONLY` |
| `CAP-DIAGNOSTIC-LOGGING` | released | Configure Quarkus category logging on runtime and controller components, with Helm injection for admission since charts 0.0.15. | runtime and controllers logging configuration and call sites; charts 0.0.15 admission-deployment extraEnv | `LIM-DIAGNOSTIC-LOG-SENSITIVE`, `LIM-RUNTIME-CONFIG-BUILD-TIME` |

### User experience

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-CLI-PRODUCT-LIFECYCLE` | released | Manage login, imports, artifacts, Services, Secrets, Plans, Expositions, Gateways, tokens, and quotas with the CLI. | `reshapr`: `cli/src/commands` | none |
| `CAP-CLI-ADMINISTRATION` | released | Manage users, organizations, memberships, quotas, and service accounts with the admin CLI. | `reshapr`: admin CLI commands | `LIM-CLI-ADMIN-KEY-REQUIRED` |
| `CAP-CLI-PLAN-EVOLUTION` | released | Create, edit, duplicate, secure, and evolve Configuration Plans with the CLI. | `reshapr`: CLI config command | none |
| `CAP-CLI-SHELL-COMPLETION` | released | Generate shell completion for reShapr CLI commands without authentication. | `reshapr`: `cli/src/completion.ts`, completion tests | none |
| `CAP-WEB-UI-ADMINISTRATION` | released | Manage the primary product and organization resources in the Web UI. | `reshapr`: Web UI application routes | none |
| `CAP-WEB-UI-QUICK-START` | released | Complete the import-to-Exposition journey in the Web UI wizard. | `reshapr`: `QuickStartWizard.svelte` | `LIM-QUICK-START-DEFAULT-GATEWAY-GROUP` |
| `CAP-LOCAL-DOCKER-RUNTIME` | released | Start, inspect, and stop a local release stack with Docker or Podman. | `reshapr`: CLI run/status/stop commands, release Compose | none |
| `CAP-LOCAL-APPLE-CONTAINER-RUNTIME` | main-only | Start, inspect, and stop a local release stack on macOS with apple/container (`reshapr run --engine apple`), without Compose. | `reshapr` `main` (reshaprio/reshapr#620): `cli/src/utils/apple-container.ts`, `cli/src/commands/run.ts`; not in release 1.1.1 | `LIM-APPLE-CONTAINER-COMPOSE-SUBSET` |

### Kubernetes and GitOps

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-KUBERNETES-SEVEN-CRDS` | released | Declare eight CRDs: Service, ConfigurationPlan, Exposition, GatewayGroup, SecretSource, CustomTools, Resources, and Prompts. Stable ID retained from the seven-kind baseline. | `reshapr-controllers` 0.0.4: eight `CustomResource` classes and release CRDs | `LIM-CRD-PROMPTS-FILTERS-ABSENT`, `LIM-KUBERNETES-RESOURCES-CRD-MIGRATION` |
| `CAP-KUBERNETES-RECONCILIATION` | released | Reconcile all eight CRD kinds, including Configuration Plan header policies, Tool exposure mode, Resources, and Prompts. | `reshapr-controllers` 0.0.4: eight reconcilers; prior seven-kind live replay retained as historical evidence, new paths source-reviewed | `LIM-HEADER-POLICY-REQUEST-ONLY`, `LIM-KUBERNETES-RESOURCE-RECONCILIATION-INCOMPATIBLE`, `LIM-KUBERNETES-ARTIFACT-NAME-COLLISION` |
| `CAP-KUBERNETES-STATUS-REPORTING` | released | Report observed generation, remote IDs, states, and conditions in CR status. | `reshapr-controllers`: status classes | none |
| `CAP-KUBERNETES-REMOTE-CLEANUP` | partial | Delete corresponding remote resources when supported CRs are removed. | `reshapr-controllers`: `Cleaner` implementations | `LIM-CRD-ARTIFACT-CLEANUP-INCOMPLETE` |
| `CAP-KUBERNETES-SECRET-SYNC` | released | Synchronize selected Kubernetes Secret values to control-plane Secrets. | `reshapr-controllers`: `SecretSourceReconciler` | `LIM-SECRET-SOURCE-RBAC` |
| `CAP-KUBERNETES-SIDECAR-INJECTION` | released | Inject a configured reShapr proxy sidecar through the admission webhook. | `reshapr-controllers`: `PodMutator` | `LIM-ADMISSION-FAIL-OPEN` |
| `CAP-KUBERNETES-SIDECAR-SERVICES` | released | Create headless discovery and optional MCP Services for injected sidecars. | `reshapr-controllers`: `DeploymentProxyReconciler` | `LIM-SIDECAR-DEPLOYMENT-ONLY` |
| `CAP-KUBERNETES-SIDECAR-CONFIG` | released | Configure sidecars with annotations and a Kubernetes Secret. | `reshapr-controllers`: admission annotation contract | none |
| `CAP-KUBERNETES-WEBHOOK-TLS` | released | Serve the admission webhook over TLS using supported certificate sources. | `reshapr-controllers`: TLS configuration and manifests | none |
| `CAP-KUBERNETES-SEPARATE-RBAC` | released | Apply distinct operator, Secret-read, and admission permissions. | `reshapr-controllers`: RBAC manifests | none |
| `CAP-CONTROLLERS-OBSERVABILITY` | unsupported | Export dedicated operator and admission metrics or traces. | `reshapr-controllers`: no metrics dependency; injected proxy OTEL disabled | `LIM-CONTROLLERS-OBSERVABILITY-UNSUPPORTED` |
| `CAP-KUBERNETES-CRD-REFERENCES` | released | Provide owner documentation for every CRD. | `reshapr-controllers` 0.0.4: eight CRD reference pages, including Prompts | none |

### Deployment and operations

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-HELM-FOUR-OCI-CHARTS` | released | Package control plane, proxy, Web UI, and controllers as separate OCI charts. | `reshapr-helm-charts`: four `Chart.yaml` files | `LIM-HELM-CONTROLLERS-RELEASE-MISMATCH` |
| `CAP-HELM-POSTGRESQL-CHOICE` | released | Choose bundled or external PostgreSQL for the control plane. | `reshapr-helm-charts`: control-plane dependencies and values | `LIM-BUNDLED-POSTGRESQL-NOT-HA` |
| `CAP-HELM-WEB-UI-TOPOLOGY` | released | Install the Web UI independently or as an optional control-plane dependency. | `reshapr-helm-charts`: Web UI and control-plane charts | none |
| `CAP-HELM-EXISTING-SECRETS` | released | Supply existing Kubernetes Secrets for runtime credentials and identified control-plane encryption keys. | `reshapr-helm-charts`: `existingSecret` and `encryptionKey.keys` values and templates | none |
| `CAP-HELM-INGRESS-TLS` | released | Configure Ingress and TLS for runtime components. | `reshapr-helm-charts`: Ingress templates and values | `LIM-INGRESS-CERTIFICATE-MANUAL` |
| `CAP-HELM-PROBES-AND-RESOURCES` | released | Configure runtime liveness, readiness, and resource requests and limits. | `reshapr-helm-charts`: deployment templates and values | `LIM-HELM-PROBES-INCOMPLETE` |
| `CAP-HELM-SECURITY-CONTEXT` | partial | Harden selected containers with pod and container security contexts. | `reshapr-helm-charts`: chart security-context values | `LIM-HELM-SECURITY-CONTEXT-PARTIAL` |
| `CAP-HELM-REPLICATION-AND-PDB` | released | Configure control-plane and Web UI replicas, anti-affinity, and disruption budgets. | `reshapr-helm-charts`: production values and PDB templates | `LIM-HA-INFRASTRUCTURE-DEPENDENT` |
| `CAP-HELM-PROXY-HPA` | released | Autoscale proxy replicas from CPU and memory metrics. | `reshapr-helm-charts`: proxy HPA template | `LIM-HPA-PROXY-ONLY` |
| `CAP-HELM-PROXY-CLUSTERING` | released | Cluster proxies with encrypted Infinispan/JGroups state traffic. | `reshapr-helm-charts`: headless Service and clustering configuration | none |
| `CAP-HELM-NETWORK-POLICY` | partial | Optionally isolate proxy Pod ingress and allow same-release peers on the configured clustering ports. | `reshapr-helm-charts` 0.0.16: proxy NetworkPolicy template; CNI enforcement not qualified | `LIM-HELM-NETWORK-POLICY-PARTIAL` |
| `CAP-HELM-PROMETHEUS-SCRAPING` | released | Expose proxy metrics through an optional Prometheus Operator ServiceMonitor. | `reshapr-helm-charts`: proxy ServiceMonitor template | `LIM-SERVICEMONITOR-PROXY-ONLY` |
| `CAP-HELM-CONTROLLER-TOGGLES` | released | Enable the operator and admission controller independently. | `reshapr-helm-charts`: controllers values and conditionals | `LIM-HELM-CONTROLLERS-RELEASE-MISMATCH` |
| `CAP-HELM-WEBHOOK-CERTIFICATE-PROVIDERS` | released | Choose cert-manager, OpenShift Service CA, or existing webhook certificates. | `reshapr-helm-charts`: controllers certificate values and templates | none |
| `CAP-HELM-ENVIRONMENT-PROFILES` | released | Start from development and production values for every chart. | `reshapr-helm-charts`: `values-dev.yaml`, `values-production.yaml` | `LIM-PRODUCTION-PROFILES-NOT-CERTIFICATION` |
| `CAP-RUNTIME-CONFIGURATION` | released | Tune control-plane and proxy runtime configuration, including script guardrails, HTTP backend response size, and discovery message limits. | `reshapr` 1.1.0 application properties, `ToolCallExecutor`, `ProxyService`, config mappings; Helm extraEnv templates | `LIM-RUNTIME-CONFIG-BUILD-TIME`, `LIM-CODE-MODE-BOUNDS` |
| `CAP-HELM-COSIGN-SIGNATURES` | released | Sign published charts with Cosign and provide verification instructions. | `reshapr-helm-charts`: release workflows and README | none |
| `CAP-HELM-UPGRADE-FOUNDATIONS` | partial | Use rolling updates, startup Flyway migration, retained cluster secrets and CRDs, and operator-triggered database key rotation during upgrades. | `reshapr`, `reshapr-helm-charts`: migration, key rotation, and upgrade surfaces | `LIM-SECRET-ROTATION-MANUAL`, `LIM-UPGRADE-ROLLBACK-MANUAL`, `LIM-HELM-CRDS-RETAINED`, `LIM-KUBERNETES-RESOURCES-CRD-MIGRATION` |

## Limitation registry

Limitations remain in this registry after resolution so historical claims stay traceable. `Applies through` names the last affected release for resolved entries and the current reviewed release for active entries.

| ID | Status | Applies through | Statement | Affected capabilities |
|---|---|---|---|---|
| `LIM-CODE-MODE-BOUNDS` | active | reShapr 1.1.0 | Code Mode executes client-supplied JavaScript under per-execution time, call-count, nesting, linear-memory, code-size, and result-size limits; it is not a concurrency/rate limit or transaction, and completed backend calls are not rolled back. | `CAP-CODE-MODE`, `CAP-RUNTIME-CONFIGURATION` |
| `LIM-MCP-APPS-HOST` | active | reShapr 1.1.0 | MCP Apps require trusted remotely hosted HTML reachable by the proxy and an Apps-capable client host; native Tool UI metadata is not advertised through CODE meta-tools. reShapr does not host the frontend or enforce the host's sandbox policy. | `CAP-MCP-APPS-REFERENCES` |
| `LIM-DIAGNOSTIC-LOG-SENSITIVE` | active | reShapr 1.1.0 / controllers 0.0.4 | DEBUG may disclose client and backend credentials and arguments; audit-enabled Code Mode logs submitted source at INFO. Restrict, redact, and restore levels after diagnosis. | `CAP-DIAGNOSTIC-LOGGING`, `CAP-CODE-MODE` |
| `LIM-RUNTIME-CONFIG-BUILD-TIME` | active | reShapr 1.1.0 | Runtime environment settings do not restore build-time-disabled logging/telemetry or substitute for JVM properties read by Infinispan XML. | `CAP-RUNTIME-CONFIGURATION`, `CAP-DIAGNOSTIC-LOGGING` |
| `LIM-OPENAPI-2-UNSUPPORTED` | active | reShapr 1.1.0 | Swagger and OpenAPI 2.x documents are not recognized; import requires OpenAPI 3.x. | `CAP-OPENAPI-3-IMPORT`, `CAP-OPENAPI-2-IMPORT` |
| `LIM-GRAPHQL-METADATA-REQUIRED` | active | reShapr 1.1.0 | GraphQL imports require explicit Service name and version when the schema does not carry them. | `CAP-GRAPHQL-IMPORT` |
| `LIM-PROTOBUF-DEPENDENCY-RESOLUTION` | active | reShapr 1.1.0 | A Protobuf import fails when compilation dependencies cannot be resolved. | `CAP-PROTOBUF-GRPC` |
| `LIM-LOCAL-IMPORT-EXTERNAL-REFS` | active | reShapr 1.1.0 | Local file import cannot always resolve external references available to URL import. | `CAP-IMPORT-FILE-OR-URL` |
| `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` | active | reShapr 1.1.0 | Operation selection controls the client-visible Tool surface, not backend authorization; a scripted Custom Tool can call its declared lower-level Tools even when they are hidden from clients. | `CAP-OPERATION-SELECTION`, `CAP-SCRIPTED-CUSTOM-TOOLS` |
| `LIM-SCRIPT-RUNTIME-BOUNDS` | active | reShapr 1.1.0 | Script execution time, call depth, arguments, and callable Tools are bounded; scripts are programmable rather than no-code. | `CAP-SCRIPTED-CUSTOM-TOOLS` |
| `LIM-OUTPUT-FILTER-FAILS-OPEN` | active | reShapr 1.1.0 | A filter transformation failure returns the original response, so filtering is not a sensitive-data security boundary. | `CAP-TOOLS-OUTPUT-FILTERING` |
| `LIM-TOON-OUTPUT-ONLY` | active | reShapr 1.1.0 | TOON is an output encoding, not an import format or MCP transport. | `CAP-TOON-OUTPUT` |
| `LIM-MCP-NO-WEBSOCKET` | active | reShapr 1.1.0 | The product does not provide a WebSocket MCP transport. | `CAP-MCP-STREAMABLE-HTTP` |
| `LIM-MCP-METHODS-UNSUPPORTED` | active | reShapr 1.1.0 | Logging, subscriptions, roots, and sampling are not dispatched as server methods. | `CAP-MCP-ADDITIONAL-SERVER-METHODS` |
| `LIM-ELICITATION-IDENTITY-BOUND` | active | reShapr 1.1.0 | Elicited credentials bind to a legacy MCP session or, in stateless mode, an authenticated OAuth user. | `CAP-MCP-URL-ELICITATION` |
| `LIM-CACHE-HINTS-MODERN-ONLY` | active | reShapr 1.1.0 | Cache hints are emitted only in the MCP `2026-07-28` response dialect. | `CAP-MCP-CACHE-HINTS` |
| `LIM-SERVICE-NO-IMMUTABLE-ROLLBACK` | active | reShapr 1.1.0 | Coexisting Service versions do not provide an immutable rollback mechanism. | `CAP-SERVICE-VERSION-ADMINISTRATION` |
| `LIM-LIVE-CONFIG-NO-ZERO-DOWNTIME` | active | reShapr 1.1.0 | Live proxy configuration avoids a configuration restart but is not a platform-wide zero-downtime or rollback guarantee. | `CAP-LIVE-CONFIGURATION-PROPAGATION` |
| `LIM-TENANCY-APPLICATION-LEVEL` | active | reShapr 1.1.0 | Organization isolation is application-level discriminator tenancy, not a physical database per tenant. | `CAP-ORGANIZATION-TENANCY` |
| `LIM-OIDC-EXTERNAL-PROVIDER` | active | reShapr 1.1.0 | OIDC authentication depends on an externally configured identity provider. | `CAP-USER-AUTHENTICATION` |
| `LIM-OIDC-LOGIN-VALIDATION-INCOMPLETE` | active | reShapr 1.1.0 | OIDC login validates final redirects, opaque single-use state, the ID-token nonce, and ID- and access-token expiration, but does not bind state to the initiating browser session or verify JWT signature, issuer, or audience. | `CAP-USER-AUTHENTICATION` |
| `LIM-OIDC-WEBUI-PUBLIC-URL-IGNORED` | resolved | reShapr 1.0.0-rc1 / charts 0.0.13; resolved in reShapr 1.0.0 / charts 0.0.14 | The Web UI login route now uses the separately configured public control-plane URL, while server-side API calls retain the internal URL. | `CAP-USER-AUTHENTICATION` |
| `LIM-KUBERNETES-SA-AUDIENCE-FIXED` | active | controllers 0.0.4 | Kubernetes service-account exchange expects the `https://app.reshapr.io` token audience. | `CAP-KUBERNETES-SERVICE-ACCOUNT-AUTH` |
| `LIM-QUOTAS-NOT-RATE-LIMITS` | active | reShapr 1.1.0 | Organization quotas govern resource counts, not MCP request rate or volume. | `CAP-ORGANIZATION-RESOURCE-QUOTAS`, `CAP-MCP-RATE-LIMITING` |
| `LIM-BACKEND-AUTH-PROTOCOL-DEPENDENT` | active | reShapr 1.1.0 | Available credential forms depend on the backend protocol and Secret configuration. | `CAP-BACKEND-AUTHENTICATION-SECRETS` |
| `LIM-LOCAL-SECRETS-ENV-ONLY` | active | reShapr 1.1.0 | `env` is the only provided local secret resolver, including for OAuth client credentials. | `CAP-LOCAL-SECRET-REFERENCES`, `CAP-BACKEND-OAUTH-CLIENT-CREDENTIALS` |
| `LIM-OAUTH-CLIENT-CREDENTIALS-NO-REFRESH` | active | reShapr 1.1.0 | Client Credentials uses cached access tokens and reacquires them after expiry; refresh tokens are ignored. | `CAP-BACKEND-OAUTH-CLIENT-CREDENTIALS` |
| `LIM-SECRET-ENCRYPTION-AES-ECB` | resolved | reShapr 0.2.3; resolved in 1.0.0-rc1 | New values use AES-256-GCM authenticated encryption; legacy AES/ECB values remain readable only for migration. | `CAP-CONTROL-PLANE-SECRET-ENCRYPTION` |
| `LIM-SECRET-ROTATION-MANUAL` | active | reShapr 1.1.0 / charts 0.0.15 | Database key re-encryption is available but generation, distribution, activation, invocation, and retirement remain operator-driven; general credential rotation is not automated. | `CAP-CONTROL-PLANE-SECRET-ENCRYPTION`, `CAP-ENCRYPTION-KEY-ROTATION`, `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-OAUTH-AUDIENCE-NOT-VERIFIED` | resolved | reShapr 0.2.3; resolved in 1.0.0-rc1 | Standard JWT `aud` is required and checked against dynamic Exposition URLs or configured static audiences by default. | `CAP-MCP-OAUTH-BEARER-AUTH` |
| `LIM-OAUTH-AUDIENCE-DISABLEABLE` | active | reShapr 1.1.0 | Audience validation can be disabled per Configuration Plan for compatibility, weakening token-to-resource binding. | `CAP-MCP-OAUTH-BEARER-AUTH` |
| `LIM-OAUTH-AS-METADATA-NOT-HOSTED` | active | reShapr 1.1.0 | reShapr consumes authorization-server configuration but does not host RFC 8414 authorization-server metadata. | `CAP-OAUTH-AUTHORIZATION-SERVER-CONFIG` |
| `LIM-OAUTH-RESOURCE-CLAIM-ONLY` | resolved | reShapr 0.2.3; resolved by removal in 1.0.0-rc1 | The optional `resource`-claim check was removed and replaced by standard JWT audience validation; reShapr still does not perform the RFC 8707 token-request flow. | `CAP-OAUTH-RESOURCE-INDICATOR`, `CAP-MCP-OAUTH-BEARER-AUTH` |
| `LIM-OAUTH-DCR-UNSUPPORTED` | active | reShapr 1.1.0 | Dynamic Client Registration under RFC 7591 is not implemented. | `CAP-OAUTH-DYNAMIC-CLIENT-REGISTRATION` |
| `LIM-SPIFFE-UNSUPPORTED` | active | reShapr 1.1.0 | SPIFFE workload identities are not implemented. | `CAP-SPIFFE-IDENTITIES` |
| `LIM-OAUTH-PER-TOOL-UNSUPPORTED` | active | reShapr 1.1.0 | OAuth scopes and audiences apply to an entire Exposition, not individual Tools, Prompts, or Resources. | `CAP-MCP-OAUTH-BEARER-AUTH`, `CAP-OAUTH-PER-TOOL-AUTHORIZATION` |
| `LIM-MCP-RATE-LIMITING-UNSUPPORTED` | active | reShapr 1.1.0 | The product does not rate-limit MCP calls. | `CAP-MCP-RATE-LIMITING` |
| `LIM-AUDIT-CONFIG-REQUIRED` | active | reShapr 1.1.0 | Audit events require the Plan audit flag and an operational telemetry destination. | `CAP-MCP-AUDIT-EVENTS` |
| `LIM-OBSERVABILITY-PROXY-ONLY` | active | reShapr 1.1.0 | Equivalent traces, metrics, and logs are not provided across every component. | `CAP-PROXY-OPENTELEMETRY`, `CAP-CONTROLLERS-OBSERVABILITY` |
| `LIM-CLI-ADMIN-KEY-REQUIRED` | active | reShapr 1.1.0 | Administrative CLI operations require a distinct admin API key context. | `CAP-CLI-ADMINISTRATION`, `CAP-ENCRYPTION-KEY-ROTATION` |
| `LIM-QUICK-START-DEFAULT-GATEWAY-GROUP` | active | reShapr 1.1.0 | The Web UI Quick Start depends on the Default Gateway Group. | `CAP-WEB-UI-QUICK-START` |
| `LIM-HEADER-POLICY-REQUEST-ONLY` | active | reShapr 1.1.0 / controllers 0.0.4 | Request allow, deny, and rename rules are enforced for HTTP backends and gRPC call metadata; response rules are represented but reserved and not enforced. | `CAP-BACKEND-HEADER-POLICY`, `CAP-KUBERNETES-RECONCILIATION` |
| `LIM-CRD-PROMPTS-FILTERS-ABSENT` | active | controllers 0.0.4 | Prompts now has a dedicated CRD and reconciler; the remaining boundary is the absence of a ToolsOutputFilters CRD. Keep this ID while narrowing the partially resolved limitation. | `CAP-MCP-PROMPTS`, `CAP-KUBERNETES-SEVEN-CRDS` |
| `LIM-KUBERNETES-RESOURCE-RECONCILIATION-INCOMPATIBLE` | resolved | controllers 0.0.2 / reShapr 1.0.0-rc1; resolved in controllers 0.0.3 | Controllers `0.0.3` use the supported plural `Resources` artifact kind; a replayed Resources CR reached `READY` and its URI was returned by MCP `resources/list`. | `CAP-KUBERNETES-RECONCILIATION` |
| `LIM-KUBERNETES-ARTIFACT-NAME-COLLISION` | active | controllers 0.0.4 / reShapr 1.1.0 | CustomTools, Resources, and Prompts reconciliation uploads artifacts as `artifact.json`; for one Service, later reconciliation can replace the earlier artifact. | `CAP-KUBERNETES-RECONCILIATION` |
| `LIM-KUBERNETES-RESOURCES-CRD-MIGRATION` | active | controllers 0.0.4 / charts 0.0.15 | Upgrading from the singular `Resource` CRD requires deleting and recreating `resources.reshapr.io` because Kubernetes makes `spec.names.kind` immutable; deleting the CRD also deletes its custom resources. | `CAP-KUBERNETES-SEVEN-CRDS`, `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-CRD-ARTIFACT-CLEANUP-INCOMPLETE` | active | controllers 0.0.4 | Deleting CustomTools, Resources, or Prompts CRs does not delete the corresponding remote artifact. | `CAP-KUBERNETES-REMOTE-CLEANUP` |
| `LIM-SECRET-SOURCE-RBAC` | active | controllers 0.0.4 | SecretSource reconciliation requires explicit permission to read referenced Kubernetes Secrets. | `CAP-KUBERNETES-SECRET-SYNC` |
| `LIM-ADMISSION-FAIL-OPEN` | active | controllers 0.0.4 / charts 0.0.15 | The admission webhook defaults to `failurePolicy: Ignore`; unavailable admission can produce Pods without sidecars. | `CAP-KUBERNETES-SIDECAR-INJECTION` |
| `LIM-SIDECAR-DEPLOYMENT-ONLY` | active | controllers 0.0.4 | Automatic sidecar Service management is limited to Deployment-owned workloads. | `CAP-KUBERNETES-SIDECAR-SERVICES` |
| `LIM-CONTROLLERS-OBSERVABILITY-UNSUPPORTED` | active | controllers 0.0.4 | Dedicated operator and admission metrics and traces are not provided; component logs remain available. | `CAP-CONTROLLERS-OBSERVABILITY` |
| `LIM-BUNDLED-POSTGRESQL-NOT-HA` | active | charts 0.0.15 | Bundled PostgreSQL is a development topology, not a high-availability database. | `CAP-HELM-POSTGRESQL-CHOICE` |
| `LIM-INGRESS-CERTIFICATE-MANUAL` | active | charts 0.0.15 | Runtime Ingress is optional and does not uniformly provision its own certificate. | `CAP-HELM-INGRESS-TLS` |
| `LIM-HELM-PROBES-INCOMPLETE` | active | charts 0.0.15 | Runtime charts lack startup probes and controller charts lack explicit probes. | `CAP-HELM-PROBES-AND-RESOURCES` |
| `LIM-HELM-SECURITY-CONTEXT-PARTIAL` | active | charts 0.0.15 | `runAsNonRoot` is not uniformly enforced and controller security contexts are empty by default. | `CAP-HELM-SECURITY-CONTEXT` |
| `LIM-HA-INFRASTRUCTURE-DEPENDENT` | active | charts 0.0.15 | Replicas and PDBs do not make the full system highly available without HA PostgreSQL and suitable infrastructure. | `CAP-HELM-REPLICATION-AND-PDB` |
| `LIM-HPA-PROXY-ONLY` | active | charts 0.0.15 | HPA is provided for the proxy only and scales from CPU and memory metrics. | `CAP-HELM-PROXY-HPA` |
| `LIM-HELM-NETWORK-POLICY-PARTIAL` | active | charts 0.0.15; reviewed 0.0.16 | The optional policy isolates all proxy Pod ingress but allows only configured clustering ports from same-release peers. HTTP ingress and monitoring require additional allows on an enforcing CNI; runtime clustering ports also need qualification. It adds no egress policy. The production example disables this incomplete policy. | `CAP-HELM-NETWORK-POLICY` |
| `LIM-HELM-CONTROLLERS-RELEASE-MISMATCH` | active | charts 0.0.15 / controllers 0.0.4 | The controllers chart packages the controllers `0.0.4` CRDs, but defaults image tags to `nightly` while `Chart.yaml` and installation notes report app version `0.0.1`; pin image tags and inspect running images. | `CAP-HELM-FOUR-OCI-CHARTS`, `CAP-HELM-CONTROLLER-TOGGLES` |
| `LIM-SERVICEMONITOR-PROXY-ONLY` | active | charts 0.0.15 | ServiceMonitor support is optional and limited to proxy metrics. | `CAP-HELM-PROMETHEUS-SCRAPING` |
| `LIM-PRODUCTION-PROFILES-NOT-CERTIFICATION` | active | charts 0.0.15 | Production values are starting profiles, not environment-specific sizing or security certification. | `CAP-HELM-ENVIRONMENT-PROFILES` |
| `LIM-UPGRADE-ROLLBACK-MANUAL` | active | reShapr 1.1.0 / charts 0.0.15 | Generic migration hooks, automated rollback, and general credential rotation are not provided. | `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-HELM-CRDS-RETAINED` | active | charts 0.0.15 | Helm retains CRDs on uninstall; manually deleting a CRD also deletes its custom resources. | `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-APPLE-CONTAINER-COMPOSE-SUBSET` | active | `main` after reShapr 1.1.1 | The apple engine starts containers with `container run` from the release Compose files. It ignores `restart`, `extra_hosts` and `volumes`, warns on `host.docker.internal`, wires containers by IP because name resolution needs a host DNS setup with `sudo`, and refuses to start while containers from a previous run exist. It targets a single-node local stack, not clustered gateways. | `CAP-LOCAL-APPLE-CONTAINER-RUNTIME` |

## Change log

| Date | Baseline | Change |
|---|---|---|
| 2026-11-14 | reShapr `main` after 1.1.1 (not released) | Added `CAP-LOCAL-APPLE-CONTAINER-RUNTIME` as `main-only` and `LIM-APPLE-CONTAINER-COMPOSE-SUBSET` for `reshapr run --engine apple` (reshaprio/reshapr#620), with the `run-on-apple-container` how-to. Commands were checked on `main`, not replayed against a release. Promote the capability to `released` and replay the page after the first release that includes #620. |
| 2026-10-19 | reShapr 1.1.0 / controllers 0.0.4 / corrected charts 0.0.15 | Reviewed Code Mode Tool exposure and execution, hardened script limits, backend HTTP payload bounds, MCP Apps references, Prompts reconciliation, all eight published chart CRDs, and admission extraEnv. Added current guides and runtime/logging references; preserved prior replay markers and historical limitations. |
| 2026-09-22 | reShapr 1.0.0 / controllers 0.0.3 / charts 0.0.14 | Promoted the released runtime and charts to the documentation baseline; verified published images and chart artifacts; validated OIDC nonce and token-expiration checks; and carried forward unaffected documentation after reviewing the release delta. |
| 2026-09-22 | reShapr 1.0.0-rc1 plus reviewed nightly / controllers 0.0.3 / charts 0.0.13 plus reviewed main | Validated opaque single-use OIDC state, final redirect allow-listing, Helm callback derivation, and Web UI public control-plane routing; resolved the ignored public-URL limitation and narrowed the remaining login-validation limitation. |
| 2026-09-21 | reShapr 1.0.0-rc1 / controllers 0.0.3 / charts 0.0.13 | Verified all seven reconcilers with the plural Resources kind; resolved the runtime schema incompatibility; recorded the artifact filename collision and the destructive CRD kind migration; narrowed the controllers chart mismatch to image defaults and stale metadata. |
| 2026-09-18 | reShapr 1.0.0-rc1 / controllers 0.0.2 / charts 0.0.12 | Added Client Credentials, request-header policy, database key rotation, and CLI completion; enabled OAuth audience validation; resolved the ECB and unverified-audience limitations; recorded removal of the legacy `resource`-claim check; recorded the replayed Resource reconciliation and controllers chart packaging limitations. |
| 2026-09-07 | reShapr 0.2.3 / controllers 0.0.1 / charts 0.0.11 | Initialized from the verified product audit and the current documentation corpus. |