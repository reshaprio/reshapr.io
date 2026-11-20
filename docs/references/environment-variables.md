---
description: Runtime configuration variables for the reShapr control plane and proxy, including Code Mode, script, backend payload, identity, and deployment limits.
release_review:
  runtime: 1.1.0
  controllers: 0.0.4
  charts: 0.0.15
  date: 2026-10-19
  scope: release-tagged source review; not a live command replay
---

# Runtime environment variables

This reference inventories deployment-facing **reShapr-specific settings in 1.1.0**, plus the Quarkus and JVM settings most relevant to operating the control plane and proxy. Defaults are from the release's configuration and injection points, not Helm overrides. Unset means no deployment-independent value is supplied. Development credentials are intentionally not reproduced: replace them in production.

Quarkus exposes additional framework settings; this is not a copy of its entire configuration catalog. See the [Quarkus configuration reference](https://quarkus.io/guides/config-reference) for precedence, profiles, and framework extensions. Build-time settings cannot generally be changed by adding an environment variable to an already built image.

## Names and injection

For fixed property names, uppercase and replace punctuation with `_`: `reshapr.gateway.code-mode.timeout` becomes `RESHAPR_GATEWAY_CODE_MODE_TIMEOUT`. Quoted segments use doubled underscores, for example `QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL`. Dynamic map keys can be ambiguous after this conversion; declare their dotted names in a mounted configuration file rather than inventing environment names.

Use the proxy chart's `extraEnv`, the control-plane chart's `ctrl.extraEnv`, Compose service `environment`, or container `--env` / `--env-file`. Helm lists replace default lists: preserve any existing telemetry and deployment entries. Use Secret references for credentials, not literal values committed to Git. Changes require process restart or workload rollout, unlike Configuration Plan updates.

## Proxy registration and backend calls

| Variable | Default | Meaning |
|---|---|---|
| `RESHAPR_GATEWAY_ID` | `reshapr-gateway-00` | Gateway registration ID; unique per running instance. |
| `RESHAPR_GATEWAY_LABELS` | `env=dev;team=reshapr` | Semicolon-separated `key=value` labels used by Gateway Groups. |
| `RESHAPR_GATEWAY_FQDNS` | `localhost:7777` | Advertised addresses; configure addresses clients can actually reach. |
| `RESHAPR_GATEWAY_API_KEY` | Development placeholder | Gateway Admin API credential, not an Exposition's MCP API key. |
| `RESHAPR_CTRL_HOST` | `localhost` | Control-plane host used by discovery and health gRPC clients. |
| `RESHAPR_CTRL_PORT` | `5555` | Control-plane port. |
| `RESHAPR_CTRL_TOKEN` | Development placeholder | Gateway API token, including the required organization prefix. |
| `RESHAPR_CTRL_TLS_PLAINTEXT` | `true` | Explicit alias for `reshapr.ctrl.tls.plain-text`; `false` enables TLS for the control-plane connection. |
| `RESHAPR_GATEWAY_MCP_CACHE_SIZE` | `1000` | Maximum local parsed-artifact WorkCache entries; not an MCP response cache. |
| `RESHAPR_GATEWAY_BACKEND_HTTP_DEFAULT_TIMEOUT` | `3000` ms | Default HTTP backend timeout; a Plan can supply its own timeout. |
| `RESHAPR_GATEWAY_BACKEND_GRPC_DEFAULT_TIMEOUT` | `3000` ms | Default gRPC backend deadline; a Plan can supply its own timeout. |
| `RESHAPR_GATEWAY_BACKEND_HTTP_MAX_PAYLOAD_SIZE` | `10485760` bytes | Maximum buffered HTTP backend response (10 MiB), enforced against declared length and streamed bytes. Not an incoming MCP request limit or a gRPC backend response limit. |

Oversized HTTP backend responses are rejected rather than returned in full. Do not raise this ceiling without accounting for concurrent calls, parsing, output filters, and script intermediates in JVM/container memory. Reducing the final answer does not remove the memory cost of fetching the backend payload.

## Code Mode and script guardrails

All variables below apply to the **proxy**, globally rather than per Plan. Code Mode is enabled by the Plan's `toolExposureMode`, not by an environment switch.

| Variable | Default | Scope and unit |
|---|---|---|
| `RESHAPR_GATEWAY_CODE_MODE_TIMEOUT` | `10000` | Code Mode wall-clock execution time, milliseconds. |
| `RESHAPR_GATEWAY_CODE_MODE_MAX_TOOL_CALLS` | `10` | Tool calls allowed per Code Mode execution. |
| `RESHAPR_GATEWAY_CODE_MODE_MAX_CODE_SIZE` | `4000` | Submitted JavaScript characters, excluding the generated API prelude. |
| `RESHAPR_GATEWAY_CODE_MODE_MAX_RESULT_SIZE` | `100000` | Serialized result characters; checked after execution, not a streaming memory bound. |
| `RESHAPR_GATEWAY_SCRIPTING_TIMEOUT` | `10000` | Scripted Custom Tool wall-clock execution time, milliseconds. |
| `RESHAPR_GATEWAY_SCRIPTING_MAX_TOOL_CALLS` | `10` | Tool calls allowed in a Scripted Custom Tool's execution context. |
| `RESHAPR_GATEWAY_SCRIPTING_MAX_DEPTH` | `5` | Script nesting depth; used by both Scripted Custom Tools and Code Mode. |
| `RESHAPR_GATEWAY_SCRIPTING_MAX_MEMORY_PAGES` | `256` | WebAssembly linear-memory pages per sandbox, each 64 KiB; used by both execution paths. Default is 16 MiB. |

Keep positive finite bounds. Nonpositive execution timeouts disable that timeout, and nonpositive memory-page settings leave the engine's default in place; neither is a production hardening choice. These are per-execution controls, not rate limits, concurrency limits, total process-memory limits, or transactional guarantees. A script failure does not roll back completed backend calls.

See [Use Code Mode](../how-to-guides/use-code-mode.md) and [Build a Scripted Custom Tool](../how-to-guides/build-scripted-custom-tool.md).

## Control-plane identity and initialization

| Variable | Default | Meaning |
|---|---|---|
| `RESHAPR_MODE` | `on-premises` | Application mode (`on-premises` or `saas`); not a license or an automatic deployment topology. |
| `RESHAPR_CTRL_PUBLIC_URL` | `http://localhost:5555` | Browser-reachable control-plane URL, used for authentication callbacks. |
| `RESHAPR_CTRL_API_KEY` | Development placeholder | Control-plane Admin API credential. Distinct from user JWTs and proxy registration tokens. |
| `RESHAPR_ADMIN_NAME` | Unset | Initial administrator name, used during startup initialization. |
| `RESHAPR_ADMIN_EMAIL` | Unset | Initial administrator email. |
| `RESHAPR_ADMIN_PASSWORD` | Unset | Initial administrator password; not a password rotation mechanism. |
| `RESHAPR_DEFAULT_GATEWAY_TOKENS` | Unset | Initial default-organization Gateway tokens. |
| `RESHAPR_DEFAULT_GATEWAY_LABELS` | Unset | Initial Default Gateway Group labels. |
| `RESHAPR_AUTHENTICATION_IDP_ENABLED` | `false` | Enable external OIDC identity provider. |
| `RESHAPR_AUTHENTICATION_IDP_URL` | Local development provider URL | Provider authorization endpoint. |
| `RESHAPR_AUTHENTICATION_IDP_TOKEN_URL` | Local development provider URL | Provider token endpoint. |
| `RESHAPR_AUTHENTICATION_IDP_CLIENT_ID` | `reshapr-ctrl` | Provider client identifier. |
| `RESHAPR_AUTHENTICATION_IDP_CLIENT_SECRET` | Development placeholder | Provider client secret. |
| `RESHAPR_AUTHENTICATION_IDP_SCOPES` | Unset | Additional scopes; built-in scopes are `openid profile email`. |
| `RESHAPR_AUTHENTICATION_IDP_ALLOWED_REDIRECT_URIS` | Unset | Exact allowed final browser callback URLs. |
| `RESHAPR_AUTHENTICATION_IDP_ALLOW_CLI_LOOPBACK_REDIRECT` | `true` | Allow CLI callbacks on loopback ports 5556 through 5599. |
| `RESHAPR_AUTHENTICATION_IDP_GUARD_ACCESS_GROUP` | Unset | Required provider `groups` membership. |
| `RESHAPR_AUTHENTICATION_IDP_GUARD_ACCESS_CLAIM` | Unset | Required `name=value` claim. |
| `RESHAPR_AUTHENTICATION_IDP_DEFAULT_ORGANIZATION_CLAIM` | Unset | Claim identifying the default organization. |
| `RESHAPR_AUTHENTICATION_IDP_DEFAULT_ORGANIZATION_GROUP_PREFIX` | Unset | Provider group prefix identifying the organization. |
| `RESHAPR_AUTHENTICATION_IDP_DEFAULT_ORGANIZATION_VALUE` | Unset | Fixed fallback organization; resolution order is claim, group prefix, then value. |

For startup collection/map syntax and existing-data behavior, use the [initialization implementation](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/java/io/reshapr/ctrl/ReshaprCtrlApp.java). Onboarding quota properties have the historical spelling `resharp.ctrl.onboarding-quotas`, not `reshapr`: configure dotted keys such as `resharp.ctrl.onboarding-quotas."exposition.count"` in a properties file. Defaults are 0 Gateways, 0 Gateway Groups, and 10 Expositions. These are resource counts, not request quotas.

See [Configure control-plane OIDC](../how-to-guides/configure-control-plane-oidc.md) for deployment requirements and remaining login-validation limitations. This page does not broaden its security guarantees.

## Control-plane encryption

| Variable | Default | Meaning |
|---|---|---|
| `RESHAPR_ENCRYPTION_KEYS_V1` | Public development key | Base64-encoded 32-byte AES key for key ID `v1`. Replace before production use. |
| `RESHAPR_ENCRYPTION_ACTIVE_KEY_ID` | `v1` | Explicit alias for the active encryption key ID (`reshapr.encryption.active-kid`). |
| `RESHAPR_ENCRYPTION_LEGACY_KEY` | Legacy development placeholder | Legacy AES/ECB decryption key during migration. |
| `RESHAPR_ENCRYPTION_KEY` | Legacy fallback | Older alias used only as fallback for the legacy key. Not the active AES-GCM key. |

Additional key IDs use the dynamic map `reshapr.encryption.keys.<kid>`. Preserve old keys until stored values have been re-encrypted and backups considered; changing the active ID alone does not re-encrypt existing rows. See [Rotate database encryption keys](../how-to-guides/operations/rotate-database-encryption-key.md).

## HTTP, discovery, database, and tokens

| Variable | Component | Release default / purpose |
|---|---|---|
| `QUARKUS_HTTP_HOST` | Both | Control plane explicitly uses `0.0.0.0`; proxy uses the framework's profile-dependent default. |
| `QUARKUS_HTTP_PORT` | Both | Control plane `5555`, proxy `7777`. Changing the port does not update Services, probes, or advertised addresses. |
| `QUARKUS_HTTP_LIMITS_MAX_BODY_SIZE` | Both | `10M`; incoming HTTP request limit, separate from backend responses. |
| `QUARKUS_HTTP_ENABLE_COMPRESSION` | Both | `true`; configured compressible type is `application/json`. |
| `QUARKUS_HTTP_CORS_ENABLED` / `QUARKUS_HTTP_CORS_ORIGINS` | Proxy | `true` / `*`; restrict origins to your client requirements. |
| `QUARKUS_GRPC_CLIENTS__EXPOSITION_DISCOVERY__MAX_INBOUND_MESSAGE_SIZE` | Proxy | `10485760` bytes; maximum incoming discovery message containing configuration/artifacts, not a backend payload. |
| `QUARKUS_GRPC_CLIENTS__EXPOSITION_DISCOVERY__FLOW_CONTROL_WINDOW` | Proxy | Framework default; HTTP/2 flow-control window in bytes. Does not replace the message-size limit. |
| `QUARKUS_DATASOURCE_JDBC_URL` | Control plane | Deployment-supplied PostgreSQL JDBC URL. |
| `QUARKUS_DATASOURCE_USERNAME` / `QUARKUS_DATASOURCE_PASSWORD` | Control plane | Deployment-supplied database credentials. |
| `QUARKUS_DATASOURCE_JDBC_MIN_SIZE` / `QUARKUS_DATASOURCE_JDBC_MAX_SIZE` | Control plane | Framework pool defaults; size together with PostgreSQL limits and replica count. |
| `QUARKUS_FLYWAY_MIGRATE_AT_START` | Control plane | `true`; startup migrations are required for the release schema. Disabling is not an upgrade strategy. |
| `SMALLRYE_JWT_SIGN_KEY_LOCATION` | Control plane | Production default `keys/jwt-rs256.pem`; private signing key location. |
| `MP_JWT_VERIFY_PUBLICKEY_LOCATION` | Control plane | Production default `keys/jwt-rs256.pub.pem`; matching verification key. |
| `SMALLRYE_JWT_NEW_TOKEN_ISSUER` / `MP_JWT_VERIFY_ISSUER` | Control plane | `https://app.reshapr.io`; keep issuing and verifying configuration aligned. |
| `SMALLRYE_JWT_TIME_TO_LIVE` / `MP_JWT_VERIFY_TOKEN_AGE` | Control plane | `7200` seconds; issued token lifetime and accepted token age. |
| `GRAPHQL_PARSER_MAX_CHARACTERS` / `GRAPHQL_PARSER_MAX_TOKENS` | Both | `100000000` / `100000`; parser limits, not HTTP payload limits. |

For application/framework configuration not listed here, start with the two release files below rather than treating all Quarkus properties as supported deployment overrides. Release metadata (`reshapr.version`, `reshapr.buildTimestamp`) is build information, not an operator tuning interface.

## Logging, telemetry, and clustering

[Logging](./logging.md) lists category and handler settings and their sensitivity. Proxy OTLP variables include `QUARKUS_OTEL_SDK_DISABLED`, `QUARKUS_OTEL_EXPORTER_OTLP_ENDPOINT`, `QUARKUS_OTEL_EXPORTER_OTLP_PROTOCOL`, and `QUARKUS_OTEL_EXPORTER_OTLP_HEADERS`. See [Observe and audit](../how-to-guides/operations/observe-and-audit.md) for the supported export workflow; a runtime environment variable cannot restore a telemetry extension omitted at build time.

Infinispan XML reads **JVM system properties**, including `reshapr.infinispan.stack`. Do not assume `RESHAPR_INFINISPAN_STACK` is equivalent. The proxy chart sets the appropriate `-D` options through its JVM configuration; retain those options when adding your own. See [Helm charts](./helm-charts.md) and the [released Infinispan configuration](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/resources/infinispan.xml). The container launcher also accepts JVM options such as `JAVA_OPTS_APPEND`; heap sizing must leave room for native memory, buffers, and concurrent sandboxes.

## Canonical sources

- [Control-plane application properties](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/resources/application.properties)
- [Proxy application properties](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/resources/application.properties)
- [Script and Code Mode injection defaults](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/java/io/reshapr/proxy/mcp/ToolCallExecutor.java)
- [Identity provider mapping](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/java/io/reshapr/ctrl/config/AuthenticationIdentityProviderConfig.java)
- [Encryption mapping](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/java/io/reshapr/ctrl/config/EncryptionConfig.java)

These owner contracts remain authoritative; this page provides the bounded deployment lookup rather than copying their full contents.