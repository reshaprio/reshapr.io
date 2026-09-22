#!/usr/bin/env bash
set -euo pipefail

RUNTIME_VERSION="${RUNTIME_VERSION:-1.0.0}"
CHART_VERSION="${CHART_VERSION:-0.0.14}"
PROXY_RELEASE="${PROXY_RELEASE:-docs-proxy}"
PROXY_NAMESPACE="${PROXY_NAMESPACE:-docs-reshapr-system}"
KUBE_CONTEXT="${KUBE_CONTEXT:-reshapr-docs-rc1}"
OTEL_ENDPOINT="${OTEL_ENDPOINT:-http://otel-collector.observability.svc.cluster.local:4318}"
APPLY="${APPLY:-false}"

temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT
rendered="$temporary_directory/proxy-observability.yaml"

require() {
  command -v "$1" >/dev/null || { printf 'Required command not found: %s\n' "$1" >&2; exit 1; }
}

require helm
require kubectl
require curl
require yq

helm template "$PROXY_RELEASE" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version "$CHART_VERSION" \
  --namespace "$PROXY_NAMESPACE" \
  --api-versions monitoring.coreos.com/v1 \
  --set "image.tag=$RUNTIME_VERSION" \
  --set serviceMonitor.enabled=true \
  --set-string 'extraEnv[0].name=QUARKUS_OTEL_SDK_DISABLED' \
  --set-string 'extraEnv[0].value=false' \
  --set-string 'extraEnv[1].name=QUARKUS_OTEL_EXPORTER_OTLP_ENDPOINT' \
  --set-string "extraEnv[1].value=$OTEL_ENDPOINT" \
  --set-string 'extraEnv[2].name=QUARKUS_OTEL_EXPORTER_OTLP_PROTOCOL' \
  --set-string 'extraEnv[2].value=http/protobuf' \
  > "$rendered"

yq -e 'select(.kind == "Deployment") | .spec.template.spec.containers[0].env[] | select(.name == "QUARKUS_OTEL_SDK_DISABLED" and .value == "false")' "$rendered" >/dev/null
yq -e 'select(.kind == "ServiceMonitor") | .spec.endpoints[] | select(.port == "http" and .path == "/q/metrics")' "$rendered" >/dev/null

printf 'Rendered proxy chart %s with OTLP and ServiceMonitor settings\n' "$CHART_VERSION"

if [[ "$APPLY" != true ]]; then
  printf 'Render checks passed. Set APPLY=true and PROXY_METRICS_URL for live checks.\n'
  exit 0
fi

[[ "$(kubectl config current-context)" == "$KUBE_CONTEXT" ]] || {
  printf 'Refusing to use context %s; expected %s\n' "$(kubectl config current-context)" "$KUBE_CONTEXT" >&2
  exit 1
}
[[ -n "${PROXY_METRICS_URL:-}" ]] || { printf 'PROXY_METRICS_URL is required when APPLY=true\n' >&2; exit 1; }

kubectl rollout status deployment/reshapr-proxy \
  --namespace "$PROXY_NAMESPACE" --timeout=5m >/dev/null
kubectl get deployment/reshapr-proxy --namespace "$PROXY_NAMESPACE" --output json \
  | jq -e '[.spec.template.spec.containers[0].env[]? | select(.name | startswith("QUARKUS_OTEL_"))] | length >= 3' >/dev/null
curl --fail --silent --show-error "$PROXY_METRICS_URL" \
  | grep -q '^# HELP '

printf 'Live proxy observability checks passed in %s\n' "$KUBE_CONTEXT"
