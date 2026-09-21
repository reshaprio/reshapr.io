# Documentation replay helpers

These private scripts retain the repeatable parts of release verification. They are maintenance tools, not product installation scripts, and are excluded from Docusaurus and generated LLM content.

## Scripts

| Script | Default check | Optional live check |
|---|---|---|
| `reshapr-kubernetes-replay.sh` | Pull all three Helm charts, validate the seven tagged CRDs, and render the controllers chart with a pinned image | With `APPLY=true`, inspect an existing isolated deployment and call MCP `resources/list` |
| `reshapr-hybrid-replay.sh` | Verify the released proxy image exists | With `APPLY=true`, start a temporary proxy, verify readiness, discovery, and `tools/list`, then remove it |
| `reshapr-observability-replay.sh` | Render the proxy chart with OTLP and ServiceMonitor settings and validate the resulting resources | With `APPLY=true`, inspect a deployed proxy and query a caller-supplied metrics URL |

Run the non-mutating checks from the repository root:

```sh
docs-maintenance/replay/reshapr-kubernetes-replay.sh
docs-maintenance/replay/reshapr-hybrid-replay.sh
docs-maintenance/replay/reshapr-observability-replay.sh
```

Override `RUNTIME_VERSION`, `CONTROLLERS_VERSION`, and `CHART_VERSION` to evaluate a new baseline. Review each script's variables before setting `APPLY=true`.

## Safety and evidence

- Use only a disposable or explicitly approved Kubernetes context. The Kubernetes scripts refuse a context different from `KUBE_CONTEXT`.
- Supply credentials through environment variables; the scripts neither persist nor print them.
- Live hybrid replay refuses to replace an existing container and removes the temporary container on exit.
- Keep command output with the release review notes. A successful preflight proves artifact availability and rendering, not live behavior.
- Replay the relevant public procedure manually when it contains environment-specific operations that the helper intentionally cannot own, such as DNS, TLS, external PostgreSQL, Prometheus ingestion, or secret rotation.
