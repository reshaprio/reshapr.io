---
description: Turn the Open-Meteo endpoint into one agent-oriented action, filter its result, and measure the change using two Configuration Plans.
---

# Context Control in Practice

> **Last verified with reShapr 0.2.3 on September 4, 2026.**

Start from the Open-Meteo Service created in the first endpoint tutorial. You will attach a declarative Custom Tool and an output filter, expose two Plans, and compare the same live weather call before and after filtering.

## Prerequisites

- The **[first MCP endpoint tutorial](./getting-started.md)** completed against reShapr `0.2.3`
- reShapr CLI `0.2.3`, authenticated against that environment
- `curl` and `jq`
- A running Gateway in Gateway Group `1`

The example endpoint is intentionally unauthenticated. Add the authentication header required by your Exposition if you apply the procedure elsewhere.

## Locate the Open-Meteo Service

Use structured CLI output to select the Service imported by the first tutorial:

```bash
RESHAPR_SERVICE_ID="$(
  reshapr service list --output json \
    | jq -er 'map(select(.name == "Open-Meteo Weather Forecast API" and .version == "1.0")) | first | .id'
)"
export RESHAPR_SERVICE_ID
```

## Attach an agent-oriented Tool

The sample **[Custom Tool definition](/examples/context-control/open-meteo-current-weather.yaml)** maps the broad generated `get_v1_forecast` Tool to one action named `current_weather`. Its three inputs fix the requested weather fields while keeping the location explicit.

Attach it and retain the Artifact name returned by reShapr:

```bash
CUSTOM_ARTIFACT_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-current-weather.yaml' \
    --output json \
    | jq -er '.name'
)"
export CUSTOM_ARTIFACT_NAME
```

Inspect the capabilities derived during attachment:

```bash
reshapr artifact list --serviceId "$RESHAPR_SERVICE_ID"
```

The `CAPS` count for this Artifact is `1`. Its capability is the `current_weather` Tool name; use `reshapr artifact get <artifact-id>` to display it.

## Attach an output filter

The sample **[output filter](/examples/context-control/open-meteo-current-weather-filter.yaml)** retains the location, timezone, units, and current conditions while removing forecast metadata that this action does not need.

```bash
FILTER_ARTIFACT_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-current-weather-filter.yaml' \
    --output json \
    | jq -er '.name'
)"
export FILTER_ARTIFACT_NAME
```

## Create two bounded Plans

Both Plans allow only the agent-oriented `current_weather` Tool. The baseline Plan selects the Custom Tool; the filtered Plan selects the same Tool and its output filter.

```bash
BASELINE_ARTIFACTS="$(jq -cn --arg custom "$CUSTOM_ARTIFACT_NAME" '[$custom]')"
FILTERED_ARTIFACTS="$(
  jq -cn \
    --arg custom "$CUSTOM_ARTIFACT_NAME" \
    --arg filter "$FILTER_ARTIFACT_NAME" \
    '[$custom, $filter]'
)"

BASELINE_PLAN_ID="$(
  reshapr config create 'weather-action-baseline' \
    --serviceId "$RESHAPR_SERVICE_ID" \
    --backendEndpoint 'https://api.open-meteo.com' \
    --includedOperations '["current_weather"]' \
    --includedArtifacts "$BASELINE_ARTIFACTS" \
    --output json \
    | jq -er '.id'
)"

FILTERED_PLAN_ID="$(
  reshapr config create 'weather-action-filtered' \
    --serviceId "$RESHAPR_SERVICE_ID" \
    --backendEndpoint 'https://api.open-meteo.com' \
    --includedOperations '["current_weather"]' \
    --includedArtifacts "$FILTERED_ARTIFACTS" \
    --output json \
    | jq -er '.id'
)"

export BASELINE_PLAN_ID FILTERED_PLAN_ID
unset BASELINE_ARTIFACTS FILTERED_ARTIFACTS
```

Verify that the selections differ:

```bash
reshapr config get "$BASELINE_PLAN_ID"
reshapr config get "$FILTERED_PLAN_ID"
```

## Expose both Plans

Choose the scheme used by your Gateway, then create two named Expositions. Online uses `https`; the local Compose Gateway uses `http`.

```bash
export MCP_SCHEME='https'

BASELINE_MCP_URL="${MCP_SCHEME}://$(
  reshapr expo create \
    --configuration "$BASELINE_PLAN_ID" \
    --gateway-group 1 \
    --name 'weather-action-baseline' \
    --output json \
    | jq -er '.endpoints[0]'
)"

FILTERED_MCP_URL="${MCP_SCHEME}://$(
  reshapr expo create \
    --configuration "$FILTERED_PLAN_ID" \
    --gateway-group 1 \
    --name 'weather-action-filtered' \
    --output json \
    | jq -er '.endpoints[0]'
)"

export BASELINE_MCP_URL FILTERED_MCP_URL
```

## Verify the Tool surface

Use the same stateless MCP request for both endpoints:

```bash
list_tools() {
  curl --silent --show-error \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/event-stream' \
    --header 'MCP-Protocol-Version: 2026-07-28' \
    --header 'Mcp-Method: tools/list' \
    --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
    "$1" | jq -r '.result.tools[].name'
}

list_tools "$BASELINE_MCP_URL"
list_tools "$FILTERED_MCP_URL"
```

Each endpoint must list only `current_weather`. The generated `get_v1_forecast` operation is hidden behind the selected action.

## Call and measure both results

Capture only the Tool content, outside the JSON-RPC envelope:

```bash
call_weather() {
  curl --silent --show-error \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/event-stream' \
    --header 'MCP-Protocol-Version: 2026-07-28' \
    --header 'Mcp-Method: tools/call' \
    --header 'Mcp-Name: current_weather' \
    --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"current_weather","arguments":{"latitude":"48.8566","longitude":"2.3522","timezone":"Europe/Paris"},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
    "$1" | jq -er '.result.content[0].text'
}

BASELINE_RESULT="$(call_weather "$BASELINE_MCP_URL")"
FILTERED_RESULT="$(call_weather "$FILTERED_MCP_URL")"

printf 'Baseline content: %s bytes\n' "$(printf '%s' "$BASELINE_RESULT" | wc -c | tr -d ' ')"
printf 'Filtered content: %s bytes\n' "$(printf '%s' "$FILTERED_RESULT" | wc -c | tr -d ' ')"
```

Inspect the fields that remain:

```bash
jq 'keys' <<<"$BASELINE_RESULT"
jq 'keys' <<<"$FILTERED_RESULT"
jq '.current' <<<"$FILTERED_RESULT"
```

The filtered result must contain only `latitude`, `longitude`, `timezone`, `current_units`, and `current`. Its byte count should be lower than the baseline for this request.

The measurement uses UTF-8 bytes from the decoded Tool text, excludes the JSON-RPC envelope, and omits the trailing newline. Weather values and exact byte counts vary over time, so record the observed values rather than treating them as a product-wide reduction ratio.

## Enable TOON encoding

Keep the JSON comparison above reproducible, then create a third Plan with a separate **[TOON output filter](/examples/context-control/open-meteo-current-weather-toon.yaml)**. It retains the same fields and applies `convertToToon` last.

```bash
TOON_FILTER_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-current-weather-toon.yaml' \
    --output json \
    | jq -er '.name'
)"

TOON_ARTIFACTS="$(
  jq -cn \
    --arg custom "$CUSTOM_ARTIFACT_NAME" \
    --arg filter "$TOON_FILTER_NAME" \
    '[$custom, $filter]'
)"

TOON_PLAN_ID="$(
  reshapr config create 'weather-action-toon' \
    --serviceId "$RESHAPR_SERVICE_ID" \
    --backendEndpoint 'https://api.open-meteo.com' \
    --includedOperations '["current_weather"]' \
    --includedArtifacts "$TOON_ARTIFACTS" \
    --output json \
    | jq -er '.id'
)"

TOON_MCP_URL="${MCP_SCHEME}://$(
  reshapr expo create \
    --configuration "$TOON_PLAN_ID" \
    --gateway-group 1 \
    --name 'weather-action-toon' \
    --output json \
    | jq -er '.endpoints[0]'
)"

export TOON_MCP_URL
unset TOON_ARTIFACTS
```

Call the TOON Exposition with the same arguments and inspect the encoded Tool content:

```bash
TOON_RESULT="$(call_weather "$TOON_MCP_URL")"

printf 'TOON content: %s bytes\n' "$(printf '%s' "$TOON_RESULT" | wc -c | tr -d ' ')"
printf '%s\n' "$TOON_RESULT"
```

The output is TOON text rather than JSON. This confirms the encoding stage is active; its byte count is one observation for this response, not a universal compression or token-saving claim.

## Result

You replaced a broad generated operation with one agent-oriented Tool, selected different Artifact sets for the same Service, measured the effect of response filtering, and activated TOON encoding on a separate Exposition.

## Limits

- This comparison covers one Open-Meteo request and does not predict token usage or model quality for other data.
- Output filtering is not a security boundary. In reShapr `0.2.3`, a filter failure returns the original Tool response.
- The before/after field comparison uses JSON before TOON is enabled so the retained keys remain directly inspectable.
- Re-running the tutorial with the same Plan or Exposition names requires deleting or renaming the previous resources, including the TOON variants.

## Next step

- **[Attach and Select reShapr Artifacts](../how-to-guides/select-reshapr-artifacts.md)** for Prompts, Resources, Custom Tools, and filters.
- **[Context Control: Mechanisms and Trade-offs](../explanations/context-control.md)** for choosing the appropriate control at each stage.
- **[Tools Output Filtering](../references/spec-outtools-filtering.md)** for JSON Patch and TOON syntax.