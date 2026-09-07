# Documentation coverage matrix

**Assessed:** 2026-09-07  
**Product baseline:** reShapr `0.2.3`, controllers `0.0.1`, charts `0.0.11`  
**Corpus:** 48 authored docs pages, 7 blog files, and 2 content tests

This matrix maps the semantic IDs in [`product-baseline.md`](product-baseline.md) to the current authored corpus. A blank Diataxis column is not automatically a gap: a capability needs only the page types that serve a real reader task.

Coverage statuses:

- `covered`: the current pages adequately support the relevant reader decisions or tasks.
- `partial`: useful coverage exists, but a named documentation gap remains.
- `missing`: a released behavior has no meaningful current coverage.
- `not-documentable`: the behavior is unsupported and must not be presented as a capability; a boundary mention can still prevent overclaiming.
- `historical-only`: a dated blog snapshot that cannot establish current behavior.

## Capability coverage

### API transformation and Context Control

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-OPENAPI-3-IMPORT` | covered | `docs/tutorials/getting-started.md`<br>`docs/tutorials/web-ui-quickstart.md` | `docs/how-to-guides/import-api-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/features.md` |
| `CAP-OPENAPI-2-IMPORT` | not-documentable | `docs/tutorials/web-ui-quickstart.md` (boundary) | `docs/how-to-guides/import-api-artifacts.md` (boundary) | - | `docs/references/features.md` (boundary) |
| `CAP-GRAPHQL-IMPORT` | covered | - | `docs/how-to-guides/import-api-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/features.md` |
| `CAP-PROTOBUF-GRPC` | covered | - | `docs/how-to-guides/import-api-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/features.md` |
| `CAP-IMPORT-FILE-OR-URL` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/import-api-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/cli-commands.md` |
| `CAP-OPERATION-SELECTION` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/context-control.md` | `docs/references/features.md` |
| `CAP-ARTIFACT-ATTACHMENT` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/features.md` |
| `CAP-ARTIFACT-SELECTION` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/configuration-and-exposition.md` | `docs/references/features.md` |
| `CAP-DECLARATIVE-CUSTOM-TOOLS` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/context-control.md` | `docs/references/custom-tools-specification.md` |
| `CAP-SCRIPTED-CUSTOM-TOOLS` | covered | - | `docs/how-to-guides/build-scripted-custom-tool.md` | `docs/explanations/api-to-agent.md` | `docs/references/custom-tools-specification.md` |
| `CAP-TOOLS-OUTPUT-FILTERING` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/context-control.md` | `docs/references/spec-outtools-filtering.md` |
| `CAP-TOON-OUTPUT` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/context-control.md` | `docs/references/spec-outtools-filtering.md` |
| `CAP-ARTIFACT-LIFECYCLE` | covered | - | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/cli-commands.md` |

### MCP protocol

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-MCP-STREAMABLE-HTTP` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/mcp-compatibility.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-VERSION-NEGOTIATION` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/mcp-compatibility.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-SESSION-MODE` | covered | - | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/mcp-compatibility.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-STATELESS-MODE` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/mcp-compatibility.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-TOOLS` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/api-to-agent.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-PROMPTS` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/prompts-specification.md` |
| `CAP-MCP-RESOURCES` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/services-and-artifacts.md` | `docs/references/resources-specification.md` |
| `CAP-MCP-URL-ELICITATION` | covered | - | `docs/how-to-guides/security/backend-auth-and-elicitation.md` | `docs/explanations/security-model.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-CACHE-HINTS` | covered | - | - | `docs/explanations/configuration-and-exposition.md` | `docs/references/mcp-support.md` |
| `CAP-MCP-ADDITIONAL-SERVER-METHODS` | not-documentable | - | - | `docs/explanations/mcp-compatibility.md` (boundary) | `docs/references/mcp-support.md` (boundary) |

### Control plane and governance

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-SERVICE-VERSION-ADMINISTRATION` | covered | `docs/tutorials/web-ui-quickstart.md` | `docs/how-to-guides/import-api-artifacts.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/cli-commands.md` |
| `CAP-CONFIGURATION-PLANS` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/select-reshapr-artifacts.md` | `docs/explanations/configuration-and-exposition.md` | `docs/references/cli-commands.md` |
| `CAP-EXPOSITIONS` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/test-mcp-endpoint.md` | `docs/explanations/configuration-and-exposition.md` | `docs/references/features.md` |
| `CAP-GATEWAY-GROUPS` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/deploy-hybrid-gateway.md` | `docs/explanations/gateway-groups-and-gateways.md` | `docs/references/interfaces.md` |
| `CAP-LIVE-CONFIGURATION-PROPAGATION` | covered | - | `docs/how-to-guides/operations/troubleshoot.md` | `docs/explanations/control-plane-gateway-synchronization.md` | `docs/references/features.md` |
| `CAP-ORGANIZATION-TENANCY` | covered | - | `docs/how-to-guides/administration/organizations-and-memberships.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/features.md` |
| `CAP-USER-ORGANIZATION-MEMBERSHIP-ADMIN` | covered | - | `docs/how-to-guides/administration/organizations-and-memberships.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/interfaces.md` |
| `CAP-USER-AUTHENTICATION` | covered | `docs/tutorials/try-reshapr-online.md` | `docs/how-to-guides/administration/organizations-and-memberships.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/cli-commands.md` |
| `CAP-KUBERNETES-SERVICE-ACCOUNT-AUTH` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/manage-resources-with-gitops.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/kubernetes-apis.md` |
| `CAP-API-TOKENS` | covered | - | `docs/how-to-guides/deploy-hybrid-gateway.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/cli-commands.md` |
| `CAP-ORGANIZATION-RESOURCE-QUOTAS` | covered | - | `docs/how-to-guides/administration/organization-quotas.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/features.md` |
| `CAP-BACKEND-AUTHENTICATION-SECRETS` | covered | - | `docs/how-to-guides/security/backend-auth-and-elicitation.md` | `docs/explanations/security-model.md` | `docs/references/features.md` |
| `CAP-LOCAL-SECRET-REFERENCES` | covered | - | `docs/how-to-guides/security/backend-auth-and-elicitation.md`<br>`docs/how-to-guides/deploy-hybrid-gateway.md` | `docs/explanations/security-model.md` | `docs/references/features.md` |
| `CAP-CONTROL-PLANE-SECRET-ENCRYPTION` | covered | - | `docs/how-to-guides/operations/upgrade-and-rotate.md` | `docs/explanations/security-model.md` | - |

### Security and observability

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-MCP-API-KEY-AUTH` | covered | - | `docs/how-to-guides/security/api-key.md` | `docs/explanations/security-model.md` | `docs/references/features.md` |
| `CAP-MCP-OAUTH-BEARER-AUTH` | covered | - | `docs/how-to-guides/security/oauth.md` | `docs/explanations/security-model.md` | `docs/references/features.md` |
| `CAP-OAUTH-PROTECTED-RESOURCE-METADATA` | covered | - | `docs/how-to-guides/security/oauth.md` | `docs/explanations/security-model.md` | - |
| `CAP-OAUTH-AUTHORIZATION-SERVER-CONFIG` | covered | - | `docs/how-to-guides/security/oauth.md` | `docs/explanations/security-model.md` | - |
| `CAP-OAUTH-RESOURCE-INDICATOR` | covered | - | `docs/how-to-guides/security/oauth.md` | `docs/explanations/security-model.md` | - |
| `CAP-OAUTH-DYNAMIC-CLIENT-REGISTRATION` | not-documentable | - | `docs/how-to-guides/security/oauth.md` (boundary) | - | - |
| `CAP-SPIFFE-IDENTITIES` | not-documentable | - | - | - | - |
| `CAP-OAUTH-PER-TOOL-AUTHORIZATION` | not-documentable | - | `docs/how-to-guides/security/oauth.md` (boundary) | `docs/explanations/security-model.md` (boundary) | - |
| `CAP-MCP-RATE-LIMITING` | not-documentable | - | `docs/how-to-guides/administration/organization-quotas.md` (boundary) | `docs/explanations/multi-tenancy-administrative-governance.md` (boundary) | - |
| `CAP-MCP-AUDIT-EVENTS` | covered | - | `docs/how-to-guides/audit-mcp-endpoint.md`<br>`docs/how-to-guides/operations/observe-and-audit.md` | `docs/explanations/security-model.md` | `docs/references/features.md` |
| `CAP-PROXY-OPENTELEMETRY` | covered | - | `docs/how-to-guides/operations/observe-and-audit.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/features.md` |

### User experience

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-CLI-PRODUCT-LIFECYCLE` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/automate-with-cli-in-cicd.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/cli-commands.md` |
| `CAP-CLI-ADMINISTRATION` | covered | - | `docs/how-to-guides/administration/organizations-and-memberships.md`<br>`docs/how-to-guides/administration/organization-quotas.md` | `docs/explanations/multi-tenancy-administrative-governance.md` | `docs/references/cli-commands.md` |
| `CAP-CLI-PLAN-EVOLUTION` | covered | `docs/tutorials/context-control-in-practice.md` | `docs/how-to-guides/automate-with-cli-in-cicd.md` | `docs/explanations/configuration-and-exposition.md` | `docs/references/cli-commands.md` |
| `CAP-WEB-UI-ADMINISTRATION` | covered | `docs/tutorials/web-ui-quickstart.md` | `docs/how-to-guides/administration/organizations-and-memberships.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/features.md` |
| `CAP-WEB-UI-QUICK-START` | covered | `docs/tutorials/web-ui-quickstart.md` | - | `docs/explanations/api-to-agent.md` | - |
| `CAP-LOCAL-DOCKER-RUNTIME` | covered | `docs/tutorials/getting-started.md` | `docs/how-to-guides/docker-compose.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/features.md` |

### Kubernetes and GitOps

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-KUBERNETES-SEVEN-CRDS` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/manage-resources-with-gitops.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-RECONCILIATION` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/manage-resources-with-gitops.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-STATUS-REPORTING` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/operations/troubleshoot.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-REMOTE-CLEANUP` | covered | - | `docs/how-to-guides/manage-resources-with-gitops.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-SECRET-SYNC` | covered | - | `docs/how-to-guides/manage-resources-with-gitops.md` | `docs/explanations/security-model.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-SIDECAR-INJECTION` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-SIDECAR-SERVICES` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/gateway-groups-and-gateways.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-SIDECAR-CONFIG` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-WEBHOOK-TLS` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/security-model.md` | `docs/references/kubernetes-apis.md` |
| `CAP-KUBERNETES-SEPARATE-RBAC` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/security-model.md` | `docs/references/kubernetes-apis.md` |
| `CAP-CONTROLLERS-OBSERVABILITY` | not-documentable | - | `docs/how-to-guides/operations/observe-and-audit.md` (boundary) | `docs/explanations/security-model.md` (boundary) | `docs/references/features.md` (boundary) |
| `CAP-KUBERNETES-CRD-REFERENCES` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/manage-resources-with-gitops.md` | - | `docs/references/kubernetes-apis.md` |

### Deployment and operations

| Capability | Coverage | Tutorial | How-to | Explanation | Reference |
|---|---|---|---|---|---|
| `CAP-HELM-FOUR-OCI-CHARTS` | covered | `docs/tutorials/first-gitops-mcp-endpoint.md` | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-POSTGRESQL-CHOICE` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-WEB-UI-TOPOLOGY` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-EXISTING-SECRETS` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/how-to-guides/operations/upgrade-and-rotate.md` | `docs/explanations/security-model.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-INGRESS-TLS` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-PROBES-AND-RESOURCES` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | - | `docs/references/helm-charts.md` |
| `CAP-HELM-SECURITY-CONTEXT` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/security-model.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-REPLICATION-AND-PDB` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-PROXY-HPA` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | - | `docs/references/helm-charts.md` |
| `CAP-HELM-PROXY-CLUSTERING` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/control-plane-gateway-synchronization.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-NETWORK-POLICY` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/security-model.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-PROMETHEUS-SCRAPING` | covered | - | `docs/how-to-guides/operations/observe-and-audit.md` | - | `docs/references/helm-charts.md` |
| `CAP-HELM-CONTROLLER-TOGGLES` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-WEBHOOK-CERTIFICATE-PROVIDERS` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/security-model.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-ENVIRONMENT-PROFILES` | covered | - | `docs/how-to-guides/deploy-kubernetes-production.md` | `docs/explanations/deployment-models-trust-boundaries.md` | `docs/references/helm-charts.md` |
| `CAP-HELM-COSIGN-SIGNATURES` | covered | - | - | - | `docs/references/helm-charts.md` |
| `CAP-HELM-UPGRADE-FOUNDATIONS` | covered | - | `docs/how-to-guides/operations/upgrade-and-rotate.md` | `docs/explanations/resource-lifecycle.md` | `docs/references/helm-charts.md` |

There are no `missing` released or partial capabilities at initialization. Unsupported capabilities are intentionally `not-documentable`; their boundary mentions exist only where a reader could otherwise infer support. SPIFFE has no current public mention and needs one only if a nearby identity claim would imply SPIFFE support.

## Limitation coverage

`Required public surface` names the minimum place where the limit must remain visible. `Current mentions` lists the present normative coverage; blogs are excluded.

| Limitation | Required public surface | Current mentions | Coverage |
|---|---|---|---|
| `LIM-OPENAPI-2-UNSUPPORTED` | Import procedures and capability reference | `docs/how-to-guides/import-api-artifacts.md`<br>`docs/references/features.md` | covered |
| `LIM-GRAPHQL-METADATA-REQUIRED` | Import procedure | `docs/how-to-guides/import-api-artifacts.md` | covered |
| `LIM-PROTOBUF-DEPENDENCY-RESOLUTION` | Import procedure | `docs/how-to-guides/import-api-artifacts.md` | covered |
| `LIM-LOCAL-IMPORT-EXTERNAL-REFS` | Import procedure | `docs/how-to-guides/import-api-artifacts.md` | covered |
| `LIM-OPERATION-SELECTION-NOT-AUTHORIZATION` | Context Control explanation | `docs/explanations/context-control.md` | covered |
| `LIM-SCRIPT-RUNTIME-BOUNDS` | Script reference and procedure | `docs/references/custom-tools-specification.md`<br>`docs/how-to-guides/build-scripted-custom-tool.md` | covered |
| `LIM-OUTPUT-FILTER-FAILS-OPEN` | Filter reference and any security-sensitive example | `docs/references/spec-outtools-filtering.md`<br>`docs/tutorials/context-control-in-practice.md` | covered |
| `LIM-TOON-OUTPUT-ONLY` | Filter reference | `docs/references/spec-outtools-filtering.md`<br>`docs/references/features.md` | covered |
| `LIM-MCP-NO-WEBSOCKET` | MCP reference and endpoint test | `docs/references/mcp-support.md`<br>`docs/how-to-guides/test-mcp-endpoint.md` | covered |
| `LIM-MCP-METHODS-UNSUPPORTED` | MCP method matrix | `docs/references/mcp-support.md`<br>`docs/explanations/mcp-compatibility.md` | covered |
| `LIM-ELICITATION-IDENTITY-BOUND` | Elicitation procedure and security model | `docs/how-to-guides/security/backend-auth-and-elicitation.md`<br>`docs/explanations/security-model.md` | covered |
| `LIM-CACHE-HINTS-MODERN-ONLY` | MCP reference | `docs/references/mcp-support.md`<br>`docs/explanations/configuration-and-exposition.md` | covered |
| `LIM-SERVICE-NO-IMMUTABLE-ROLLBACK` | Lifecycle or upgrade content when rollback is discussed | `docs/explanations/resource-lifecycle.md`<br>`docs/how-to-guides/operations/upgrade-and-rotate.md` | covered |
| `LIM-LIVE-CONFIG-NO-ZERO-DOWNTIME` | Synchronization explanation and hybrid operations | `docs/explanations/control-plane-gateway-synchronization.md`<br>`docs/how-to-guides/deploy-hybrid-gateway.md` | covered |
| `LIM-TENANCY-APPLICATION-LEVEL` | Governance explanation | `docs/explanations/multi-tenancy-administrative-governance.md` | covered |
| `LIM-OIDC-EXTERNAL-PROVIDER` | Authentication reference or trust-boundary explanation | `docs/references/cli-commands.md`<br>`docs/explanations/deployment-models-trust-boundaries.md` | covered |
| `LIM-KUBERNETES-SA-AUDIENCE-FIXED` | Workload-identity explanation | `docs/explanations/multi-tenancy-administrative-governance.md` | covered |
| `LIM-QUOTAS-NOT-RATE-LIMITS` | Quota procedure and governance explanation | `docs/how-to-guides/administration/organization-quotas.md`<br>`docs/explanations/multi-tenancy-administrative-governance.md` | covered |
| `LIM-BACKEND-AUTH-PROTOCOL-DEPENDENT` | Backend-auth procedure | `docs/how-to-guides/security/backend-auth-and-elicitation.md`<br>`docs/explanations/security-model.md` | covered |
| `LIM-LOCAL-SECRETS-ENV-ONLY` | Local-secret procedure | `docs/how-to-guides/security/backend-auth-and-elicitation.md` | covered |
| `LIM-SECRET-ENCRYPTION-AES-ECB` | Security model | `docs/explanations/security-model.md` | covered |
| `LIM-SECRET-ROTATION-MANUAL` | Security model and rotation procedure | `docs/explanations/security-model.md`<br>`docs/how-to-guides/operations/upgrade-and-rotate.md` | covered |
| `LIM-OAUTH-AUDIENCE-NOT-VERIFIED` | OAuth procedure and security model | `docs/how-to-guides/security/oauth.md`<br>`docs/explanations/security-model.md` | covered |
| `LIM-OAUTH-AS-METADATA-NOT-HOSTED` | OAuth procedure and security model | `docs/how-to-guides/security/oauth.md`<br>`docs/explanations/security-model.md` | covered |
| `LIM-OAUTH-RESOURCE-CLAIM-ONLY` | OAuth procedure and security model | `docs/how-to-guides/security/oauth.md`<br>`docs/explanations/security-model.md` | covered |
| `LIM-OAUTH-DCR-UNSUPPORTED` | OAuth procedure when client registration is discussed | `docs/how-to-guides/security/oauth.md` | covered |
| `LIM-SPIFFE-UNSUPPORTED` | Only when a workload-identity claim could imply SPIFFE | none | not-documentable |
| `LIM-OAUTH-PER-TOOL-UNSUPPORTED` | OAuth procedure and Configuration Plan explanation | `docs/how-to-guides/security/oauth.md`<br>`docs/explanations/configuration-and-exposition.md` | covered |
| `LIM-MCP-RATE-LIMITING-UNSUPPORTED` | Quota content and any production-readiness claim | `docs/how-to-guides/administration/organization-quotas.md`<br>`docs/explanations/multi-tenancy-administrative-governance.md` | covered |
| `LIM-AUDIT-CONFIG-REQUIRED` | Audit procedure | `docs/how-to-guides/audit-mcp-endpoint.md`<br>`docs/how-to-guides/operations/observe-and-audit.md` | covered |
| `LIM-OBSERVABILITY-PROXY-ONLY` | Observability procedure and feature reference | `docs/how-to-guides/operations/observe-and-audit.md`<br>`docs/references/features.md` | covered |
| `LIM-CLI-ADMIN-KEY-REQUIRED` | CLI reference and governance explanation | `docs/references/cli-commands.md`<br>`docs/explanations/multi-tenancy-administrative-governance.md` | covered |
| `LIM-QUICK-START-DEFAULT-GATEWAY-GROUP` | Web UI tutorial | `docs/tutorials/web-ui-quickstart.md` | covered |
| `LIM-CRD-PROMPTS-FILTERS-ABSENT` | Kubernetes API reference | `docs/references/kubernetes-apis.md` | covered |
| `LIM-CRD-ARTIFACT-CLEANUP-INCOMPLETE` | GitOps cleanup procedure and Kubernetes reference | `docs/how-to-guides/manage-resources-with-gitops.md`<br>`docs/references/kubernetes-apis.md` | covered |
| `LIM-SECRET-SOURCE-RBAC` | GitOps procedure or Kubernetes reference | `docs/how-to-guides/manage-resources-with-gitops.md`<br>`docs/references/kubernetes-apis.md` | covered |
| `LIM-ADMISSION-FAIL-OPEN` | Kubernetes reference and production procedure | `docs/references/kubernetes-apis.md`<br>`docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-SIDECAR-DEPLOYMENT-ONLY` | Kubernetes reference | `docs/references/kubernetes-apis.md` | covered |
| `LIM-CONTROLLERS-OBSERVABILITY-UNSUPPORTED` | Observability procedure or feature reference | `docs/how-to-guides/operations/observe-and-audit.md`<br>`docs/references/features.md` | covered |
| `LIM-BUNDLED-POSTGRESQL-NOT-HA` | Production deployment procedure | `docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/references/features.md` | covered |
| `LIM-INGRESS-CERTIFICATE-MANUAL` | Production deployment procedure | `docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-HELM-PROBES-INCOMPLETE` | Production deployment procedure | `docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-HELM-SECURITY-CONTEXT-PARTIAL` | Production deployment procedure | `docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-HA-INFRASTRUCTURE-DEPENDENT` | Production deployment procedure and deployment-model explanation | `docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/explanations/deployment-models-trust-boundaries.md` | covered |
| `LIM-HPA-PROXY-ONLY` | Production deployment procedure | `docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-HELM-NETWORK-POLICY-PARTIAL` | Production deployment procedure and chart reference | `docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/references/helm-charts.md` | covered |
| `LIM-SERVICEMONITOR-PROXY-ONLY` | Observability and production procedures | `docs/how-to-guides/operations/observe-and-audit.md`<br>`docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-PRODUCTION-PROFILES-NOT-CERTIFICATION` | Chart reference or production procedure | `docs/references/helm-charts.md`<br>`docs/how-to-guides/deploy-kubernetes-production.md` | covered |
| `LIM-UPGRADE-ROLLBACK-MANUAL` | Upgrade procedure | `docs/how-to-guides/operations/upgrade-and-rotate.md` | covered |
| `LIM-HELM-CRDS-RETAINED` | Upgrade and GitOps cleanup procedures | `docs/how-to-guides/operations/upgrade-and-rotate.md`<br>`docs/how-to-guides/manage-resources-with-gitops.md` | covered |

## Persona journeys

| Persona | Entry points | Progression | Coverage |
|---|---|---|---|
| `PER-AGENT-BUILDER` | `docs/tutorials/try-reshapr-online.md`<br>`docs/tutorials/getting-started.md`<br>`docs/tutorials/web-ui-quickstart.md` | Import APIs, test endpoints, then reduce context or build a scripted Tool. | covered |
| `PER-PLATFORM-ENGINEER` | `docs/how-to-guides/import-api-artifacts.md`<br>`docs/how-to-guides/select-reshapr-artifacts.md`<br>`docs/how-to-guides/automate-with-cli-in-cicd.md` | Move from resource lifecycle and interfaces to administration and repeatable automation. | covered |
| `PER-KUBERNETES-OPERATOR` | `docs/tutorials/first-gitops-mcp-endpoint.md`<br>`docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/how-to-guides/operations/troubleshoot.md` | Add GitOps lifecycle, observability, upgrades, and hybrid deployment as needed. | covered |
| `PER-SECURITY-ARCHITECT` | `docs/explanations/security-model.md`<br>`docs/explanations/deployment-models-trust-boundaries.md` | Continue with API key, OAuth, backend authentication, audit, and governance procedures. | covered |
| `PER-TECHNOLOGY-DECISION-MAKER` | `docs/overview/why-reshapr.md`<br>`docs/overview/how-it-works.md`<br>`docs/references/features.md` | Compare interfaces, deployment models, trust boundaries, demos, and explicit limits. | covered |

## Authored corpus inventory

This inventory makes orphaned or accidentally removed pages visible. Paths are grouped by their current editorial role, not by product ownership.

| Role | Current pages |
|---|---|
| Orientation and navigation (4) | `docs/index.mdx`<br>`docs/overview/why-reshapr.md`<br>`docs/overview/how-it-works.md`<br>`docs/demos.md` |
| Tutorials (5) | `docs/tutorials/try-reshapr-online.md`<br>`docs/tutorials/getting-started.md`<br>`docs/tutorials/web-ui-quickstart.md`<br>`docs/tutorials/context-control-in-practice.md`<br>`docs/tutorials/first-gitops-mcp-endpoint.md` |
| How-to guides (18) | `docs/how-to-guides/import-api-artifacts.md`<br>`docs/how-to-guides/select-reshapr-artifacts.md`<br>`docs/how-to-guides/build-scripted-custom-tool.md`<br>`docs/how-to-guides/test-mcp-endpoint.md`<br>`docs/how-to-guides/audit-mcp-endpoint.md`<br>`docs/how-to-guides/security/api-key.md`<br>`docs/how-to-guides/security/oauth.md`<br>`docs/how-to-guides/security/backend-auth-and-elicitation.md`<br>`docs/how-to-guides/docker-compose.md`<br>`docs/how-to-guides/automate-with-cli-in-cicd.md`<br>`docs/how-to-guides/administration/organizations-and-memberships.md`<br>`docs/how-to-guides/administration/organization-quotas.md`<br>`docs/how-to-guides/operations/observe-and-audit.md`<br>`docs/how-to-guides/operations/troubleshoot.md`<br>`docs/how-to-guides/operations/upgrade-and-rotate.md`<br>`docs/how-to-guides/manage-resources-with-gitops.md`<br>`docs/how-to-guides/deploy-kubernetes-production.md`<br>`docs/how-to-guides/deploy-hybrid-gateway.md` |
| Explanations (11) | `docs/explanations/api-to-agent.md`<br>`docs/explanations/services-and-artifacts.md`<br>`docs/explanations/context-control.md`<br>`docs/explanations/configuration-and-exposition.md`<br>`docs/explanations/resource-lifecycle.md`<br>`docs/explanations/gateway-groups-and-gateways.md`<br>`docs/explanations/control-plane-gateway-synchronization.md`<br>`docs/explanations/mcp-compatibility.md`<br>`docs/explanations/security-model.md`<br>`docs/explanations/multi-tenancy-administrative-governance.md`<br>`docs/explanations/deployment-models-trust-boundaries.md` |
| References (10) | `docs/references/features.md`<br>`docs/references/interfaces.md`<br>`docs/references/cli-commands.md`<br>`docs/references/mcp-support.md`<br>`docs/references/custom-tools-specification.md`<br>`docs/references/prompts-specification.md`<br>`docs/references/resources-specification.md`<br>`docs/references/spec-outtools-filtering.md`<br>`docs/references/kubernetes-apis.md`<br>`docs/references/helm-charts.md` |

## Blog classification

Every blog file is `historical-only`, including posts that remain factually accurate. Correct evident factual errors in place, but do not update old posts into evergreen references and do not count them as capability or limitation coverage.

| Blog file | Publication state | Coverage status |
|---|---|---|
| `blog/welcome-to-reshapr.mdx` | published snapshot | historical-only |
| `blog/why-reshapr.mdx` | published snapshot | historical-only |
| `blog/from-context-overload-to-context-control.mdx` | published snapshot | historical-only |
| `blog/six-use-cases-for-accelerating-ai-with-reshapr.mdx` | published snapshot | historical-only |
| `blog/from-api-sprawl-to-agent-actions.mdx` | published snapshot | historical-only |
| `blog/reshapr-vs-official-github-mcp.mdx` | published snapshot | historical-only |
| `blog/_draft-secure-mcp-deployment-with-reshapr.md` | draft snapshot | historical-only |

## Automated coverage

| Test | Current contract |
|---|---|
| `tests/content-negotiation.test.mjs` | HTTP content negotiation and generated Markdown behavior. |
| `tests/mcp-support.test.mjs` | MCP support claims remain aligned across the reference, explanation, and endpoint guide. |

`npm run docs:audit` validates registry parity, allowed statuses, referenced local paths, complete corpus inventory, and the maintenance publication boundary. It does not verify product behavior; repeat the evidence workflow in [`update-playbook.md`](update-playbook.md) for that.