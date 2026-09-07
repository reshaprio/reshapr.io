# Product baseline

**Baseline date:** 2026-09-07  
**Runtime:** reShapr `0.2.3`  
**Controllers:** `0.0.1`  
**Helm charts:** `0.0.11`

This is the factual index used to review documentation claims. It is not a substitute for release artifacts or owner-repository contracts. A row means that the evidence was reviewed; it does not make this file evidence.

## Reviewed sources

| Repository | Released ref | Released commit | Review ref | Review commit |
|---|---|---|---|---|
| `reshaprio/reshapr` | `0.2.3` | `0ed842f8a23e377965d9bca0258d9bd5edb6168f` | `main` | `331a0c8da5914ea5d277cd01c669c7c535af8072` |
| `reshaprio/reshapr-controllers` | `0.0.1` | `9f2c38876d4f3255379f52169b2405e6160cf860` | `main` | `3d1e27118a019a1889ca34e6c33c20f77bd77604` |
| `reshaprio/reshapr-helm-charts` | `0.0.11` | `331e8edd3c1e4478255c023512808a0b1cade0c6` | `main` | `10e749010cf6942c7b03cf59a514fd8dd884e1a5` |
| `reshaprio/reshapr.io` | current corpus | `78458e2dc08ae691c1b8350dac117ca0a7ccdcbc` | `main` plus reviewed working tree | same HEAD |

The Helm release ref was verified against `origin`; it was not present in the local clone. Review commits are recorded for change discovery only. A capability is `released` only when it is supported by the released refs above.

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

Status totals for this baseline are 69 `released`, 7 `partial`, and 7 `unsupported`.

### API transformation and Context Control

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-OPENAPI-3-IMPORT` | released | Import OpenAPI 3.x REST descriptions and generate MCP Tools. | `reshapr`: `OpenAPIImporter`, `OpenAPIMcpToolConverter` | `LIM-OPENAPI-2-UNSUPPORTED` |
| `CAP-OPENAPI-2-IMPORT` | unsupported | Import Swagger or OpenAPI 2.x descriptions. | `reshapr`: no importer selected by `ArtifactImporterFactory` | `LIM-OPENAPI-2-UNSUPPORTED` |
| `CAP-GRAPHQL-IMPORT` | released | Import GraphQL schemas and generate query and mutation Tools. | `reshapr`: `GraphQLImporter`, `GraphQLMcpToolConverter` | `LIM-GRAPHQL-METADATA-REQUIRED` |
| `CAP-PROTOBUF-GRPC` | released | Import Protobuf 3 definitions and dispatch Tools to gRPC backends. | `reshapr`: `ProtobufImporter`, `GrpcMcpToolConverter`, `GrpcProxyService` | `LIM-PROTOBUF-DEPENDENCY-RESOLUTION` |
| `CAP-IMPORT-FILE-OR-URL` | released | Import contracts by local file or URL, with name and version overrides. | `reshapr`: `ArtifactResource`, `ReferenceResolver`, CLI import command | `LIM-LOCAL-IMPORT-EXTERNAL-REFS` |
| `CAP-OPERATION-SELECTION` | released | Include or exclude generated API operations in a Configuration Plan. | `reshapr`: `OperationNameFilterPredicate`, `ToolCallExecutor` | `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` |
| `CAP-ARTIFACT-ATTACHMENT` | released | Attach Prompts, Resources, Custom Tools, and Tools Output Filters to a Service. | `reshapr`: `ReshaprArtifactBuilder`, `ArtifactType` | none |
| `CAP-ARTIFACT-SELECTION` | released | Select attached artifacts per Configuration Plan. | `reshapr`: `ConfigurationPlan.includedArtifacts` | none |
| `CAP-DECLARATIVE-CUSTOM-TOOLS` | released | Rename, condense, and reshape operations with declarative Custom Tools. | `reshapr`: `ReshaprCustomToolsMcpToolConverter` | none |
| `CAP-SCRIPTED-CUSTOM-TOOLS` | released | Orchestrate allowed Tools with JavaScript in a Custom Tool. | `reshapr`: `CustomToolScriptRunner`, associated tests | `LIM-SCRIPT-RUNTIME-BOUNDS` |
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
| `CAP-MCP-URL-ELICITATION` | released | Request backend credentials with protocol-specific URL elicitation. | `reshapr`: `ElicitationController`, `ElicitationStore` | `LIM-ELICITATION-IDENTITY-BOUND` |
| `CAP-MCP-CACHE-HINTS` | released | Return `ttlMs` and `cacheScope` client cache hints. | `reshapr`: `ConfigurationPlan.CachePolicy`, `ModernProtocolDialect` | `LIM-CACHE-HINTS-MODERN-ONLY` |
| `CAP-MCP-ADDITIONAL-SERVER-METHODS` | unsupported | Serve logging, subscriptions, roots, or sampling methods. | `reshapr`: absent from `McpController` dispatcher | `LIM-MCP-METHODS-UNSUPPORTED` |

### Control plane and governance

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-SERVICE-VERSION-ADMINISTRATION` | released | Administer imported Services and coexisting versions. | `reshapr`: `ServiceResource`, `ServiceManagerService` | `LIM-SERVICE-NO-IMMUTABLE-ROLLBACK` |
| `CAP-CONFIGURATION-PLANS` | released | Configure backend, timeout, operation and artifact selection, audit, and MCP protection. | `reshapr`: `ConfigurationPlan`, REST resource, Web UI editor | none |
| `CAP-EXPOSITIONS` | released | Bind a Service and Plan to a Gateway Group under a named MCP endpoint. | `reshapr`: `Exposition`, REST resource | none |
| `CAP-GATEWAY-GROUPS` | released | Select dynamically registered Gateways through labels and Gateway Groups. | `reshapr`: `GatewayGroup`, `GatewayHealthServiceHandler` | none |
| `CAP-LIVE-CONFIGURATION-PROPAGATION` | released | Stream created, updated, and deleted configuration to connected proxies. | `reshapr`: discovery stream and cluster event broadcaster | `LIM-LIVE-CONFIG-NO-ZERO-DOWNTIME` |
| `CAP-ORGANIZATION-TENANCY` | released | Isolate control-plane data by organization. | `reshapr`: `TenantAwareEntity`, tenant resolver | `LIM-TENANCY-APPLICATION-LEVEL` |
| `CAP-USER-ORGANIZATION-MEMBERSHIP-ADMIN` | released | Administer users, organizations, owners, and memberships. | `reshapr`: admin REST resources and CLI commands | none |
| `CAP-USER-AUTHENTICATION` | released | Authenticate internal users or users from a configured OIDC provider. | `reshapr`: `AuthenticationController`, identity providers | `LIM-OIDC-EXTERNAL-PROVIDER` |
| `CAP-KUBERNETES-SERVICE-ACCOUNT-AUTH` | released | Exchange a projected Kubernetes service-account token for reShapr credentials. | `reshapr`, `reshapr-controllers`: token verifier and provider | `LIM-KUBERNETES-SA-AUDIENCE-FIXED` |
| `CAP-API-TOKENS` | released | Create, list, and delete API tokens for Gateways and automation. | `reshapr`: `TokenResource`, CLI API-token commands | none |
| `CAP-ORGANIZATION-RESOURCE-QUOTAS` | released | Limit governance resource counts by organization. | `reshapr`: `QuotaMetric`, quota interceptors | `LIM-QUOTAS-NOT-RATE-LIMITS` |
| `CAP-BACKEND-AUTHENTICATION-SECRETS` | released | Store token, Basic, certificate, and OAuth backend credentials. | `reshapr`: `Secret`, protocol proxy services | `LIM-BACKEND-AUTH-PROTOCOL-DEPENDENT` |
| `CAP-LOCAL-SECRET-REFERENCES` | released | Resolve `${env:VARIABLE}` values locally at a hybrid proxy. | `reshapr`: `SecretReferenceResolver`, `EnvSecretResolver` | `LIM-LOCAL-SECRETS-ENV-ONLY` |
| `CAP-CONTROL-PLANE-SECRET-ENCRYPTION` | partial | Encrypt sensitive secret fields at rest in the control plane. | `reshapr`: `CipherService`, attribute converter | `LIM-SECRET-ENCRYPTION-AES-ECB`, `LIM-SECRET-ROTATION-MANUAL` |

### Security and observability

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-MCP-API-KEY-AUTH` | released | Protect an Exposition with an `x-reshapr-key` API key. | `reshapr`: `SecureEndpointFilter` | none |
| `CAP-MCP-OAUTH-BEARER-AUTH` | released | Validate bearer JWTs against configured issuers, JWKS, scopes, and optional resource claim. | `reshapr`: `SecureEndpointFilter`, `MultipleIssuerClaimsVerifier` | `LIM-OAUTH-AUDIENCE-NOT-VERIFIED`, `LIM-OAUTH-PER-TOOL-UNSUPPORTED` |
| `CAP-OAUTH-PROTECTED-RESOURCE-METADATA` | released | Publish RFC 9728 Protected Resource Metadata for MCP endpoints. | `reshapr`: `WellKnownController` | none |
| `CAP-OAUTH-AUTHORIZATION-SERVER-CONFIG` | partial | Consume configured authorization-server and JWKS metadata. | `reshapr`: `OAuth2ConfigurationEntry`, security filter | `LIM-OAUTH-AS-METADATA-NOT-HOSTED` |
| `CAP-OAUTH-RESOURCE-INDICATOR` | partial | Compare a JWT `resource` claim with the requested endpoint URL. | `reshapr`: resource-claim branch in `SecureEndpointFilter` | `LIM-OAUTH-RESOURCE-CLAIM-ONLY` |
| `CAP-OAUTH-DYNAMIC-CLIENT-REGISTRATION` | unsupported | Register OAuth clients dynamically under RFC 7591. | `reshapr`: no registration endpoint or flow | `LIM-OAUTH-DCR-UNSUPPORTED` |
| `CAP-SPIFFE-IDENTITIES` | unsupported | Authenticate workloads with SPIFFE identities. | all product repositories: no implementation found | `LIM-SPIFFE-UNSUPPORTED` |
| `CAP-OAUTH-PER-TOOL-AUTHORIZATION` | unsupported | Enforce scopes or claims per Tool, Prompt, or Resource. | `reshapr`: policy executes at Exposition boundary | `LIM-OAUTH-PER-TOOL-UNSUPPORTED` |
| `CAP-MCP-RATE-LIMITING` | unsupported | Rate-limit MCP calls. | product repositories: no request-rate limiter found | `LIM-MCP-RATE-LIMITING-UNSUPPORTED` |
| `CAP-MCP-AUDIT-EVENTS` | released | Emit structured MCP call and authentication-failure audit events. | `reshapr`: `AuditLogger`, MCP and security paths | `LIM-AUDIT-CONFIG-REQUIRED` |
| `CAP-PROXY-OPENTELEMETRY` | released | Export proxy traces, metrics, and logs through OpenTelemetry. | `reshapr`: proxy OpenTelemetry configuration and spans | `LIM-OBSERVABILITY-PROXY-ONLY` |

### User experience

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-CLI-PRODUCT-LIFECYCLE` | released | Manage login, imports, artifacts, Services, Secrets, Plans, Expositions, Gateways, tokens, and quotas with the CLI. | `reshapr`: `cli/src/commands` | none |
| `CAP-CLI-ADMINISTRATION` | released | Manage users, organizations, memberships, quotas, and service accounts with the admin CLI. | `reshapr`: admin CLI commands | `LIM-CLI-ADMIN-KEY-REQUIRED` |
| `CAP-CLI-PLAN-EVOLUTION` | released | Create, edit, duplicate, secure, and evolve Configuration Plans with the CLI. | `reshapr`: CLI config command | none |
| `CAP-WEB-UI-ADMINISTRATION` | released | Manage the primary product and organization resources in the Web UI. | `reshapr`: Web UI application routes | none |
| `CAP-WEB-UI-QUICK-START` | released | Complete the import-to-Exposition journey in the Web UI wizard. | `reshapr`: `QuickStartWizard.svelte` | `LIM-QUICK-START-DEFAULT-GATEWAY-GROUP` |
| `CAP-LOCAL-DOCKER-RUNTIME` | released | Start, inspect, and stop a local release stack with Docker or Podman. | `reshapr`: CLI run/status/stop commands, release Compose | none |

### Kubernetes and GitOps

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-KUBERNETES-SEVEN-CRDS` | released | Declare Service, ConfigurationPlan, Exposition, GatewayGroup, SecretSource, CustomTools, and Resource CRDs. | `reshapr-controllers`: seven `CustomResource` classes | `LIM-CRD-PROMPTS-FILTERS-ABSENT` |
| `CAP-KUBERNETES-RECONCILIATION` | released | Reconcile all seven CRDs with the control plane. | `reshapr-controllers`: seven reconcilers | none |
| `CAP-KUBERNETES-STATUS-REPORTING` | released | Report observed generation, remote IDs, states, and conditions in CR status. | `reshapr-controllers`: status classes | none |
| `CAP-KUBERNETES-REMOTE-CLEANUP` | partial | Delete corresponding remote resources when supported CRs are removed. | `reshapr-controllers`: `Cleaner` implementations | `LIM-CRD-ARTIFACT-CLEANUP-INCOMPLETE` |
| `CAP-KUBERNETES-SECRET-SYNC` | released | Synchronize selected Kubernetes Secret values to control-plane Secrets. | `reshapr-controllers`: `SecretSourceReconciler` | `LIM-SECRET-SOURCE-RBAC` |
| `CAP-KUBERNETES-SIDECAR-INJECTION` | released | Inject a configured reShapr proxy sidecar through the admission webhook. | `reshapr-controllers`: `PodMutator` | `LIM-ADMISSION-FAIL-OPEN` |
| `CAP-KUBERNETES-SIDECAR-SERVICES` | released | Create headless discovery and optional MCP Services for injected sidecars. | `reshapr-controllers`: `DeploymentProxyReconciler` | `LIM-SIDECAR-DEPLOYMENT-ONLY` |
| `CAP-KUBERNETES-SIDECAR-CONFIG` | released | Configure sidecars with annotations and a Kubernetes Secret. | `reshapr-controllers`: admission annotation contract | none |
| `CAP-KUBERNETES-WEBHOOK-TLS` | released | Serve the admission webhook over TLS using supported certificate sources. | `reshapr-controllers`: TLS configuration and manifests | none |
| `CAP-KUBERNETES-SEPARATE-RBAC` | released | Apply distinct operator, Secret-read, and admission permissions. | `reshapr-controllers`: RBAC manifests | none |
| `CAP-CONTROLLERS-OBSERVABILITY` | unsupported | Export dedicated operator and admission metrics or traces. | `reshapr-controllers`: no metrics dependency; injected proxy OTEL disabled | `LIM-CONTROLLERS-OBSERVABILITY-UNSUPPORTED` |
| `CAP-KUBERNETES-CRD-REFERENCES` | released | Provide owner documentation for every CRD. | `reshapr-controllers`: seven CRD reference pages | none |

### Deployment and operations

| ID | Status | Capability | Owner and direct evidence | Limit IDs |
|---|---|---|---|---|
| `CAP-HELM-FOUR-OCI-CHARTS` | released | Package control plane, proxy, Web UI, and controllers as separate OCI charts. | `reshapr-helm-charts`: four `Chart.yaml` files | none |
| `CAP-HELM-POSTGRESQL-CHOICE` | released | Choose bundled or external PostgreSQL for the control plane. | `reshapr-helm-charts`: control-plane dependencies and values | `LIM-BUNDLED-POSTGRESQL-NOT-HA` |
| `CAP-HELM-WEB-UI-TOPOLOGY` | released | Install the Web UI independently or as an optional control-plane dependency. | `reshapr-helm-charts`: Web UI and control-plane charts | none |
| `CAP-HELM-EXISTING-SECRETS` | released | Supply existing Kubernetes Secrets for runtime credentials. | `reshapr-helm-charts`: `existingSecret` values and templates | none |
| `CAP-HELM-INGRESS-TLS` | released | Configure Ingress and TLS for runtime components. | `reshapr-helm-charts`: Ingress templates and values | `LIM-INGRESS-CERTIFICATE-MANUAL` |
| `CAP-HELM-PROBES-AND-RESOURCES` | released | Configure runtime liveness, readiness, and resource requests and limits. | `reshapr-helm-charts`: deployment templates and values | `LIM-HELM-PROBES-INCOMPLETE` |
| `CAP-HELM-SECURITY-CONTEXT` | partial | Harden selected containers with pod and container security contexts. | `reshapr-helm-charts`: chart security-context values | `LIM-HELM-SECURITY-CONTEXT-PARTIAL` |
| `CAP-HELM-REPLICATION-AND-PDB` | released | Configure control-plane and Web UI replicas, anti-affinity, and disruption budgets. | `reshapr-helm-charts`: production values and PDB templates | `LIM-HA-INFRASTRUCTURE-DEPENDENT` |
| `CAP-HELM-PROXY-HPA` | released | Autoscale proxy replicas from CPU and memory metrics. | `reshapr-helm-charts`: proxy HPA template | `LIM-HPA-PROXY-ONLY` |
| `CAP-HELM-PROXY-CLUSTERING` | released | Cluster proxies with encrypted Infinispan/JGroups state traffic. | `reshapr-helm-charts`: headless Service and clustering configuration | none |
| `CAP-HELM-NETWORK-POLICY` | partial | Restrict proxy clustering ingress with an optional NetworkPolicy. | `reshapr-helm-charts`: proxy NetworkPolicy template | `LIM-HELM-NETWORK-POLICY-PARTIAL` |
| `CAP-HELM-PROMETHEUS-SCRAPING` | released | Expose proxy metrics through an optional Prometheus Operator ServiceMonitor. | `reshapr-helm-charts`: proxy ServiceMonitor template | `LIM-SERVICEMONITOR-PROXY-ONLY` |
| `CAP-HELM-CONTROLLER-TOGGLES` | released | Enable the operator and admission controller independently. | `reshapr-helm-charts`: controllers values and conditionals | none |
| `CAP-HELM-WEBHOOK-CERTIFICATE-PROVIDERS` | released | Choose cert-manager, OpenShift Service CA, or existing webhook certificates. | `reshapr-helm-charts`: controllers certificate values and templates | none |
| `CAP-HELM-ENVIRONMENT-PROFILES` | released | Start from development and production values for every chart. | `reshapr-helm-charts`: `values-dev.yaml`, `values-production.yaml` | `LIM-PRODUCTION-PROFILES-NOT-CERTIFICATION` |
| `CAP-HELM-COSIGN-SIGNATURES` | released | Sign published charts with Cosign and provide verification instructions. | `reshapr-helm-charts`: release workflows and README | none |
| `CAP-HELM-UPGRADE-FOUNDATIONS` | partial | Use rolling updates, startup Flyway migration, retained cluster secrets, and retained CRDs during upgrades. | `reshapr`, `reshapr-helm-charts`: migration and upgrade surfaces | `LIM-UPGRADE-ROLLBACK-MANUAL`, `LIM-HELM-CRDS-RETAINED` |

## Limitation registry

All limitations below are `active` through the named baseline. There are no verified `resolved` limitations in the initial registry. When one is resolved, preserve its row, change the status, and replace `Applies through` with the last affected release plus `Resolved in`.

| ID | Status | Applies through | Statement | Affected capabilities |
|---|---|---|---|---|
| `LIM-OPENAPI-2-UNSUPPORTED` | active | reShapr 0.2.3 | Swagger and OpenAPI 2.x documents are not recognized; import requires OpenAPI 3.x. | `CAP-OPENAPI-3-IMPORT`, `CAP-OPENAPI-2-IMPORT` |
| `LIM-GRAPHQL-METADATA-REQUIRED` | active | reShapr 0.2.3 | GraphQL imports require explicit Service name and version when the schema does not carry them. | `CAP-GRAPHQL-IMPORT` |
| `LIM-PROTOBUF-DEPENDENCY-RESOLUTION` | active | reShapr 0.2.3 | A Protobuf import fails when compilation dependencies cannot be resolved. | `CAP-PROTOBUF-GRPC` |
| `LIM-LOCAL-IMPORT-EXTERNAL-REFS` | active | reShapr 0.2.3 | Local file import cannot always resolve external references available to URL import. | `CAP-IMPORT-FILE-OR-URL` |
| `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` | active | reShapr 0.2.3 | Operation selection changes the exposed Tool surface; it does not authorize calls at the backend. | `CAP-OPERATION-SELECTION` |
| `LIM-SCRIPT-RUNTIME-BOUNDS` | active | reShapr 0.2.3 | Script execution time, call depth, arguments, and callable Tools are bounded; scripts are programmable rather than no-code. | `CAP-SCRIPTED-CUSTOM-TOOLS` |
| `LIM-OUTPUT-FILTER-FAILS-OPEN` | active | reShapr 0.2.3 | A filter transformation failure returns the original response, so filtering is not a sensitive-data security boundary. | `CAP-TOOLS-OUTPUT-FILTERING` |
| `LIM-TOON-OUTPUT-ONLY` | active | reShapr 0.2.3 | TOON is an output encoding, not an import format or MCP transport. | `CAP-TOON-OUTPUT` |
| `LIM-MCP-NO-WEBSOCKET` | active | reShapr 0.2.3 | The product does not provide a WebSocket MCP transport. | `CAP-MCP-STREAMABLE-HTTP` |
| `LIM-MCP-METHODS-UNSUPPORTED` | active | reShapr 0.2.3 | Logging, subscriptions, roots, and sampling are not dispatched as server methods. | `CAP-MCP-ADDITIONAL-SERVER-METHODS` |
| `LIM-ELICITATION-IDENTITY-BOUND` | active | reShapr 0.2.3 | Elicited credentials bind to a legacy MCP session or, in stateless mode, an authenticated OAuth user. | `CAP-MCP-URL-ELICITATION` |
| `LIM-CACHE-HINTS-MODERN-ONLY` | active | reShapr 0.2.3 | Cache hints are emitted only in the MCP `2026-07-28` response dialect. | `CAP-MCP-CACHE-HINTS` |
| `LIM-SERVICE-NO-IMMUTABLE-ROLLBACK` | active | reShapr 0.2.3 | Coexisting Service versions do not provide an immutable rollback mechanism. | `CAP-SERVICE-VERSION-ADMINISTRATION` |
| `LIM-LIVE-CONFIG-NO-ZERO-DOWNTIME` | active | reShapr 0.2.3 | Live proxy configuration avoids a configuration restart but is not a platform-wide zero-downtime or rollback guarantee. | `CAP-LIVE-CONFIGURATION-PROPAGATION` |
| `LIM-TENANCY-APPLICATION-LEVEL` | active | reShapr 0.2.3 | Organization isolation is application-level discriminator tenancy, not a physical database per tenant. | `CAP-ORGANIZATION-TENANCY` |
| `LIM-OIDC-EXTERNAL-PROVIDER` | active | reShapr 0.2.3 | OIDC authentication depends on an externally configured identity provider. | `CAP-USER-AUTHENTICATION` |
| `LIM-KUBERNETES-SA-AUDIENCE-FIXED` | active | controllers 0.0.1 | Kubernetes service-account exchange expects the `https://app.reshapr.io` token audience. | `CAP-KUBERNETES-SERVICE-ACCOUNT-AUTH` |
| `LIM-QUOTAS-NOT-RATE-LIMITS` | active | reShapr 0.2.3 | Organization quotas govern resource counts, not MCP request rate or volume. | `CAP-ORGANIZATION-RESOURCE-QUOTAS`, `CAP-MCP-RATE-LIMITING` |
| `LIM-BACKEND-AUTH-PROTOCOL-DEPENDENT` | active | reShapr 0.2.3 | Available credential forms depend on the backend protocol and Secret configuration. | `CAP-BACKEND-AUTHENTICATION-SECRETS` |
| `LIM-LOCAL-SECRETS-ENV-ONLY` | active | reShapr 0.2.3 | `env` is the only provided local secret resolver. | `CAP-LOCAL-SECRET-REFERENCES` |
| `LIM-SECRET-ENCRYPTION-AES-ECB` | active | reShapr 0.2.3 | `AES/ECB/PKCS5Padding` provides confidentiality without authenticated integrity and reveals repeated block patterns. | `CAP-CONTROL-PLANE-SECRET-ENCRYPTION` |
| `LIM-SECRET-ROTATION-MANUAL` | active | reShapr 0.2.3 / charts 0.0.11 | General secret and encryption-key rotation is not automated. | `CAP-CONTROL-PLANE-SECRET-ENCRYPTION`, `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-OAUTH-AUDIENCE-NOT-VERIFIED` | active | reShapr 0.2.3 | The OAuth endpoint path does not verify the standard JWT `aud` claim. | `CAP-MCP-OAUTH-BEARER-AUTH` |
| `LIM-OAUTH-AS-METADATA-NOT-HOSTED` | active | reShapr 0.2.3 | reShapr consumes authorization-server configuration but does not host RFC 8414 authorization-server metadata. | `CAP-OAUTH-AUTHORIZATION-SERVER-CONFIG` |
| `LIM-OAUTH-RESOURCE-CLAIM-ONLY` | active | reShapr 0.2.3 | RFC 8707 support is limited to checking a present JWT `resource` claim, not performing a token-request flow. | `CAP-OAUTH-RESOURCE-INDICATOR` |
| `LIM-OAUTH-DCR-UNSUPPORTED` | active | reShapr 0.2.3 | Dynamic Client Registration under RFC 7591 is not implemented. | `CAP-OAUTH-DYNAMIC-CLIENT-REGISTRATION` |
| `LIM-SPIFFE-UNSUPPORTED` | active | reShapr 0.2.3 | SPIFFE workload identities are not implemented. | `CAP-SPIFFE-IDENTITIES` |
| `LIM-OAUTH-PER-TOOL-UNSUPPORTED` | active | reShapr 0.2.3 | OAuth scopes apply to an entire Exposition, not individual Tools, Prompts, or Resources. | `CAP-MCP-OAUTH-BEARER-AUTH`, `CAP-OAUTH-PER-TOOL-AUTHORIZATION` |
| `LIM-MCP-RATE-LIMITING-UNSUPPORTED` | active | reShapr 0.2.3 | The product does not rate-limit MCP calls. | `CAP-MCP-RATE-LIMITING` |
| `LIM-AUDIT-CONFIG-REQUIRED` | active | reShapr 0.2.3 | Audit events require the Plan audit flag and an operational telemetry destination. | `CAP-MCP-AUDIT-EVENTS` |
| `LIM-OBSERVABILITY-PROXY-ONLY` | active | reShapr 0.2.3 | Equivalent traces, metrics, and logs are not provided across every component. | `CAP-PROXY-OPENTELEMETRY`, `CAP-CONTROLLERS-OBSERVABILITY` |
| `LIM-CLI-ADMIN-KEY-REQUIRED` | active | reShapr 0.2.3 | Administrative CLI operations require a distinct admin API key context. | `CAP-CLI-ADMINISTRATION` |
| `LIM-QUICK-START-DEFAULT-GATEWAY-GROUP` | active | reShapr 0.2.3 | The Web UI Quick Start depends on the Default Gateway Group. | `CAP-WEB-UI-QUICK-START` |
| `LIM-CRD-PROMPTS-FILTERS-ABSENT` | active | controllers 0.0.1 | There are no dedicated Prompts or ToolsOutputFilters CRDs. | `CAP-MCP-PROMPTS`, `CAP-KUBERNETES-SEVEN-CRDS` |
| `LIM-CRD-ARTIFACT-CLEANUP-INCOMPLETE` | active | controllers 0.0.1 | Deleting CustomTools or Resource CRs does not delete the corresponding remote artifact. | `CAP-KUBERNETES-REMOTE-CLEANUP` |
| `LIM-SECRET-SOURCE-RBAC` | active | controllers 0.0.1 | SecretSource reconciliation requires explicit permission to read referenced Kubernetes Secrets. | `CAP-KUBERNETES-SECRET-SYNC` |
| `LIM-ADMISSION-FAIL-OPEN` | active | controllers 0.0.1 / charts 0.0.11 | The admission webhook defaults to `failurePolicy: Ignore`; unavailable admission can produce Pods without sidecars. | `CAP-KUBERNETES-SIDECAR-INJECTION` |
| `LIM-SIDECAR-DEPLOYMENT-ONLY` | active | controllers 0.0.1 | Automatic sidecar Service management is limited to Deployment-owned workloads. | `CAP-KUBERNETES-SIDECAR-SERVICES` |
| `LIM-CONTROLLERS-OBSERVABILITY-UNSUPPORTED` | active | controllers 0.0.1 | Dedicated operator and admission metrics and traces are not provided; component logs remain available. | `CAP-CONTROLLERS-OBSERVABILITY` |
| `LIM-BUNDLED-POSTGRESQL-NOT-HA` | active | charts 0.0.11 | Bundled PostgreSQL is a development topology, not a high-availability database. | `CAP-HELM-POSTGRESQL-CHOICE` |
| `LIM-INGRESS-CERTIFICATE-MANUAL` | active | charts 0.0.11 | Runtime Ingress is optional and does not uniformly provision its own certificate. | `CAP-HELM-INGRESS-TLS` |
| `LIM-HELM-PROBES-INCOMPLETE` | active | charts 0.0.11 | Runtime charts lack startup probes and controller charts lack explicit probes. | `CAP-HELM-PROBES-AND-RESOURCES` |
| `LIM-HELM-SECURITY-CONTEXT-PARTIAL` | active | charts 0.0.11 | `runAsNonRoot` is not uniformly enforced and controller security contexts are empty by default. | `CAP-HELM-SECURITY-CONTEXT` |
| `LIM-HA-INFRASTRUCTURE-DEPENDENT` | active | charts 0.0.11 | Replicas and PDBs do not make the full system highly available without HA PostgreSQL and suitable infrastructure. | `CAP-HELM-REPLICATION-AND-PDB` |
| `LIM-HPA-PROXY-ONLY` | active | charts 0.0.11 | HPA is provided for the proxy only and scales from CPU and memory metrics. | `CAP-HELM-PROXY-HPA` |
| `LIM-HELM-NETWORK-POLICY-PARTIAL` | active | charts 0.0.11 | The optional policy covers proxy clustering ingress only; it adds no complete egress or cross-chart policy. | `CAP-HELM-NETWORK-POLICY` |
| `LIM-SERVICEMONITOR-PROXY-ONLY` | active | charts 0.0.11 | ServiceMonitor support is optional and limited to proxy metrics. | `CAP-HELM-PROMETHEUS-SCRAPING` |
| `LIM-PRODUCTION-PROFILES-NOT-CERTIFICATION` | active | charts 0.0.11 | Production values are starting profiles, not environment-specific sizing or security certification. | `CAP-HELM-ENVIRONMENT-PROFILES` |
| `LIM-UPGRADE-ROLLBACK-MANUAL` | active | reShapr 0.2.3 / charts 0.0.11 | Generic migration hooks, automated rollback, and general credential rotation are not provided. | `CAP-HELM-UPGRADE-FOUNDATIONS` |
| `LIM-HELM-CRDS-RETAINED` | active | charts 0.0.11 | Helm retains CRDs on uninstall; manually deleting a CRD also deletes its custom resources. | `CAP-HELM-UPGRADE-FOUNDATIONS` |

## Change log

| Date | Baseline | Change |
|---|---|---|
| 2026-09-07 | reShapr 0.2.3 / controllers 0.0.1 / charts 0.0.11 | Initialized from the verified product audit and the current documentation corpus. |