#!/usr/bin/env bash
set -euo pipefail

RUNTIME_VERSION="${RUNTIME_VERSION:-1.0.0-rc1}"
CONTROLLERS_VERSION="${CONTROLLERS_VERSION:-0.0.3}"
CHART_VERSION="${CHART_VERSION:-0.0.13}"
KUBE_CONTEXT="${KUBE_CONTEXT:-reshapr-docs-rc1}"
PLATFORM_NAMESPACE="${PLATFORM_NAMESPACE:-docs-reshapr-system}"
WORKLOAD_NAMESPACE="${WORKLOAD_NAMESPACE:-docs-replay}"
CONTROL_PLANE_RELEASE="${CONTROL_PLANE_RELEASE:-docs-control-plane}"
PROXY_RELEASE="${PROXY_RELEASE:-docs-proxy}"
CONTROLLERS_RELEASE="${CONTROLLERS_RELEASE:-docs-controllers}"
APPLY="${APPLY:-false}"

require() {
  command -v "$1" >/dev/null || { printf 'Required command not found: %s\n' "$1" >&2; exit 1; }
}

require helm
require kubectl
require curl
require jq

[[ "$(kubectl config current-context)" == "$KUBE_CONTEXT" ]] || {
  printf 'Refusing to use context %s; expected %s\n' "$(kubectl config current-context)" "$KUBE_CONTEXT" >&2
  exit 1
}

printf 'Replay baseline: reShapr %s, controllers %s, charts %s\n' \
  "$RUNTIME_VERSION" "$CONTROLLERS_VERSION" "$CHART_VERSION"

for chart in reshapr-control-plane reshapr-proxy reshapr-web-ui reshapr-controllers; do
  helm show chart "oci://quay.io/reshapr/reshapr-helm-charts/$chart" \
    --version "$CHART_VERSION" >/dev/null
done

for crd in configurationplans customtools expositions gatewaygroups resources secretsources services; do
  curl --fail --silent --show-error \
    "https://raw.githubusercontent.com/reshaprio/reshapr-controllers/${CONTROLLERS_VERSION}/deploy/crd/${crd}.reshapr.io-v1.yml" \
    | kubectl create --dry-run=client --validate=false --filename - --output name >/dev/null
done

helm template "$CONTROLLERS_RELEASE" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-controllers \
  --version "$CHART_VERSION" \
  --namespace "$PLATFORM_NAMESPACE" \
  --set "operator.image.tag=$CONTROLLERS_VERSION" \
  --set admissionController.enabled=false >/dev/null

helm template docs-control-plane \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version "$CHART_VERSION" \
  --namespace "$PLATFORM_NAMESPACE" \
  --set "ctrl.image.tag=$RUNTIME_VERSION" >/dev/null
helm template docs-proxy \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-proxy \
  --version "$CHART_VERSION" \
  --namespace "$PLATFORM_NAMESPACE" \
  --set "image.tag=$RUNTIME_VERSION" >/dev/null
helm template docs-web-ui \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-web-ui \
  --version "$CHART_VERSION" \
  --namespace "$PLATFORM_NAMESPACE" \
  --set "image.tag=$RUNTIME_VERSION" >/dev/null

if [[ "$APPLY" != true ]]; then
  printf 'Artifact and manifest checks passed. Set APPLY=true to verify an existing isolated deployment.\n'
  exit 0
fi

[[ -n "${PROXY_URL:-}" ]] || { printf 'PROXY_URL is required when APPLY=true\n' >&2; exit 1; }

for release in "$CONTROL_PLANE_RELEASE" "$PROXY_RELEASE" "$CONTROLLERS_RELEASE"; do
  helm status "$release" --namespace "$PLATFORM_NAMESPACE" >/dev/null
done

[[ "$(kubectl get deployment -n "$PLATFORM_NAMESPACE" \
  -l "app.kubernetes.io/instance=$CONTROLLERS_RELEASE" \
  -o jsonpath='{.items[0].spec.template.spec.containers[0].image}')" == *":$CONTROLLERS_VERSION" ]]
[[ "$(kubectl get crd resources.reshapr.io -o jsonpath='{.spec.names.kind}')" == Resources ]]
[[ "$(kubectl get crd -o json | jq '[.items[] | select(.spec.group == "reshapr.io")] | length')" == 7 ]]

kubectl wait --for=jsonpath='{.status.state}'=READY resources --all \
  --namespace "$WORKLOAD_NAMESPACE" --timeout=3m
kubectl wait --for=jsonpath='{.status.status}'=READY configurationplan --all \
  --namespace "$WORKLOAD_NAMESPACE" --timeout=3m
kubectl wait --for=jsonpath='{.status.status}'=READY exposition --all \
  --namespace "$WORKLOAD_NAMESPACE" --timeout=3m

exposition_id="$(kubectl get exposition --namespace "$WORKLOAD_NAMESPACE" \
  -o jsonpath='{.items[0].status.expositionId}')"
response="$(curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: resources/list' \
  --data '{"jsonrpc":"2.0","id":1,"method":"resources/list","params":{}}' \
  "${PROXY_URL%/}/mcp/$exposition_id")"
jq -e '.result.resources | type == "array"' <<<"$response" >/dev/null

printf 'Kubernetes/GitOps replay passed for %s\n' "$KUBE_CONTEXT"
