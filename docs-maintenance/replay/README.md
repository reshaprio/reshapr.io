# Documentation replay helpers

These private scripts retain the repeatable parts of release verification. They are maintenance tools, not product installation scripts, and are excluded from Docusaurus and generated LLM content.

## Replay records

- [2026-11-20 Web UI Quick Start on 1.2.1](../product-baseline.md#web-ui-quick-start-follow-up-2026-11-20): browser replay of the local HTTP import fix through a live MCP forecast call.
- [2026-10-21 Kubernetes / charts 0.0.16](2026-10-21-kubernetes-0.0.16.md): published-artifact installation, clustered sessions, MCP backend dispatch, TLS/UI/admission, HPA and remaining full-page checks.
- [2026-10-20 runtime 1.1.0](2026-10-20-runtime-1.1.0.md): scoped live Docker/CLI/API/browser replay, corrected procedure errors, discovery-stream interruption, and outstanding external-infrastructure checks.

## Scripts

| Script | Default check | Optional live check |
|---|---|---|
| `reshapr-kubernetes-replay.sh` | Pull all four Helm charts, validate the tagged CRDs, and render the charts with pinned images | With `APPLY=true`, inspect an existing isolated deployment and call MCP `resources/list` |
| `reshapr-hybrid-replay.sh` | Verify the released proxy image exists | With `APPLY=true`, start a temporary proxy, verify readiness, discovery, and `tools/list`, then remove it |
| `reshapr-observability-replay.sh` | Render the proxy chart with OTLP and ServiceMonitor settings and validate the resulting resources | With `APPLY=true`, inspect a deployed proxy and query a caller-supplied metrics URL |

Run the non-mutating checks from the repository root:

```sh
docs-maintenance/replay/reshapr-kubernetes-replay.sh
docs-maintenance/replay/reshapr-hybrid-replay.sh
docs-maintenance/replay/reshapr-observability-replay.sh
```

Override `RUNTIME_VERSION`, `CONTROLLERS_VERSION`, and `CHART_VERSION` to evaluate a new baseline. Review each script's variables before setting `APPLY=true`.

`reshapr-production-replay.mjs` retains the dated Minikube fixture, not a portable installation workflow. It extracts the production guide's four YAML examples, applies fixture names/hosts/database addresses, and uses previously pulled published charts. Its `infrastructure`, `controllers`, `proxy`, `endpoint`, `proxy-token`, and `verify` phases mutate test resources; `verify` recreates only the two backup-fixture databases. `cluster-check` initializes sessions and briefly forwards each proxy Pod; `platform-check` forwards both admission Pods and submits AdmissionReviews. Do not run these phases against an unrelated environment. The dated report records the approved namespaces, temporary root, and prerequisite setup; the helper does not bootstrap every prerequisite or install the control plane and UI itself.

## Safety and evidence

- Use only a disposable or explicitly approved Kubernetes context. The Kubernetes scripts refuse a context different from `KUBE_CONTEXT`.
- For local Compose replays, inspect the resolved host mounts before starting. A unique Compose project name does not isolate a bind-mounted PostgreSQL data directory.
- Supply credentials to the shell helpers through environment variables; those helpers neither persist nor print them.
- The dated production helper instead generates private test credentials, JWT keys and TLS material under `KUBE_REPLAY_ROOT`. The replay root is mode `0700`, credential/key files are mode `0600`, and CLI state uses an isolated HOME. Never publish these files or log their values; remove them only as part of an explicit fixture cleanup.
- Live hybrid replay refuses to replace an existing container and removes the temporary container on exit.
- Keep command output with the release review notes. A successful preflight proves artifact availability and rendering, not live behavior.
- Replay the relevant public procedure manually when it contains environment-specific operations that the helper intentionally cannot own, such as DNS, TLS, external PostgreSQL, Prometheus ingestion, or secret rotation.
