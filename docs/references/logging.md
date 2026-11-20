---
description: Logging categories, environment variables, diagnostic levels, and sensitive-data boundaries for reShapr components.
release_review:
  runtime: 1.1.0
  controllers: 0.0.4
  charts: 0.0.15
  date: 2026-10-19
  scope: release-tagged source review; not a live command replay
---

# Logging

This reference applies to reShapr `1.1.0`, controllers `0.0.4`, and Helm charts `0.0.15`. For commands, see [Enable debug logs temporarily](../how-to-guides/operations/troubleshoot.md#enable-debug-logs-temporarily). For other deployment controls, see [Runtime environment variables](./environment-variables.md).

## Component categories

| Component | Category | Environment setting for DEBUG | Helm injection point |
|---|---|---|---|
| Proxy | `io.reshapr.proxy` | `QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL=DEBUG` | `extraEnv` |
| Control plane | `io.reshapr.ctrl` | `QUARKUS_LOG_CATEGORY__IO_RESHAPR_CTRL__LEVEL=DEBUG` | `ctrl.extraEnv` |
| Operator | `io.reshapr.kubernetes` | `QUARKUS_LOG_CATEGORY__IO_RESHAPR_KUBERNETES__LEVEL=DEBUG` | `operator.extraEnv` |
| Admission controller | `io.reshapr.kubernetes` | `QUARKUS_LOG_CATEGORY__IO_RESHAPR_KUBERNETES__LEVEL=DEBUG` | `admissionController.extraEnv` (available in `0.0.15`) |
| Web UI | Not Quarkus | No application log-level environment setting | Read existing Node/SvelteKit console output. |

The controllers use different child packages beneath the shared category. The double underscores preserve the quoted category segment in the Quarkus property `quarkus.log.category."io.reshapr.proxy".level`.

Read Web UI console output with `kubectl logs deployment/<web-ui-deployment> --namespace <namespace>`, `docker logs <web-ui-container>`, or `podman logs <web-ui-container>`. These commands do not turn on additional diagnostic statements.

## Levels and handlers

Quarkus supports `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, and `OFF`, in increasing order of restriction. The runtime's root level defaults to `INFO`; set the relevant category to `DEBUG` to enable its diagnostics without enabling every dependency's logs.

`QUARKUS_LOG_CONSOLE_LEVEL` is a handler filter, not a substitute for the category setting. It usually does not need changing, but must also allow DEBUG if your deployment explicitly restricts it. `QUARKUS_LOG_LEVEL=DEBUG` changes the root logger and is broader than needed. An OTLP logging threshold is independent of the console: the proxy config sets `quarkus.otel.logs.level=INFO`.

`QUARKUS_LOG_MIN_LEVEL` and category minimum levels are build-time controls. No lower minimum is declared by these runtime modules; do not promise TRACE diagnostics from a published image simply by setting its runtime level to TRACE. A custom build with an appropriate minimum may be necessary.

## What the proxy logs

| Level | Diagnostic data and boundary |
|---|---|
| INFO | Normal lifecycle/errors as emitted by each path. When Plan audit is enabled, Code Mode logs submitted JavaScript source and its digest at INFO. |
| DEBUG | Backend URL, outgoing headers after backend credential injection, response status and headers. Incoming MCP request headers and request objects can also contain client credentials and Tool arguments. |
| TRACE | Additional statements include backend request bodies and sensitive credential/token details in some paths. Backend response bodies are not a guaranteed diagnostic output. |

DEBUG does **not** provide a general backend request/response body dump. Do not confuse an incoming MCP request object logged at DEBUG with a backend response body.

:::warning Logs are sensitive
DEBUG can expose bearer tokens, API keys, cookies, Tool arguments, and personal data. TRACE can expose still more credentials. Audit-enabled Code Mode can expose literals embedded in submitted code even at INFO. Limit duration and access, respect retention policy, redact before sharing, and remove temporary DEBUG settings after diagnosis. Output filters do not sanitize these diagnostic logs.
:::

For exported audit events and OTLP collection, see [Observe the reShapr Proxy](../how-to-guides/operations/observe-and-audit.md). Console diagnostics, structured audit events, and distributed traces are separate mechanisms.

## Release sources

- [Proxy logging configuration](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/resources/application.properties) and [HTTP backend logging](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/java/io/reshapr/proxy/proxy/ProxyService.java)
- [Control-plane configuration](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/resources/application.properties)
- [Controllers chart admission environment injection](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.18/controllers/templates/admission-deployment.yaml)