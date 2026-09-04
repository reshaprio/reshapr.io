---
description: Attach Prompts, Resources, Custom Tools, and output filters to a Service, then expose different Artifact selections through separate Plans.
---

# Attach and Select reShapr Artifacts

**Last verified with reShapr 0.2.3 on September 4, 2026.**

Attach reusable agent-oriented capabilities to one Service, then use `includedArtifacts` to decide which capabilities each Configuration Plan exposes.

## Prerequisites

- The Open-Meteo Service from **[Your First MCP Endpoint](../tutorials/getting-started.md)**
- reShapr CLI `0.2.3`, authenticated against the target environment
- `curl` and `jq`
- A running Gateway in Gateway Group `1`

Locate the Service:

```bash
RESHAPR_SERVICE_ID="$(
  reshapr service list --output json \
    | jq -er 'map(select(.name == "Open-Meteo Weather Forecast API" and .version == "1.0")) | first | .id'
)"
export RESHAPR_SERVICE_ID
```

## Attach the four Artifact types

Attach a Prompt, Resource, declarative Custom Tool, and Tool output filter. Structured output provides the exact Artifact names used by Plan selection.

```bash
PROMPT_ARTIFACT_JSON="$(reshapr attach \
  --url 'https://reshapr.io/examples/context-control/open-meteo-weather-prompt.yaml' \
  --output json)"

PROMPT_ARTIFACT_NAME="$(jq -er '.name' <<<"$PROMPT_ARTIFACT_JSON")"
PROMPT_ARTIFACT_ID="$(jq -er '.id' <<<"$PROMPT_ARTIFACT_JSON")"
RESOURCE_ARTIFACT_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-weather-resource.yaml' \
    --output json \
    | jq -er '.name'
)"
CUSTOM_ARTIFACT_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-current-weather.yaml' \
    --output json \
    | jq -er '.name'
)"
FILTER_ARTIFACT_NAME="$(
  reshapr attach \
    --url 'https://reshapr.io/examples/context-control/open-meteo-current-weather-filter.yaml' \
    --output json \
    | jq -er '.name'
)"

export PROMPT_ARTIFACT_NAME PROMPT_ARTIFACT_ID RESOURCE_ARTIFACT_NAME
export CUSTOM_ARTIFACT_NAME FILTER_ARTIFACT_NAME
unset PROMPT_ARTIFACT_JSON
```

Attaching a file again with the same source updates it instead of creating another copy.

## Inspect derived capabilities

```bash
reshapr artifact list --serviceId "$RESHAPR_SERVICE_ID"
```

The `CAPS` column reports how many capabilities each Artifact declares. Get one Artifact by ID to see its names:

```bash
reshapr artifact get '<artifact-id>'
```

For these samples, the derived capabilities are:

| Artifact kind | Capability |
|---|---|
| `Prompts` | `weather_brief` |
| `Resources` | `reshapr://open-meteo/weather-code-note` |
| `CustomTools` | `current_weather` |
| `ToolsOutputFilters` | `current_weather` |

Capabilities are read-only composition metadata extracted when an Artifact is attached or updated. They identify declarations but do not replace MCP discovery or authorization.

## Create two Artifact selections

Create an **action Plan** containing the Custom Tool and Prompt, and a **context Plan** containing the same Tool plus the Resource and output filter.

```bash
ACTION_ARTIFACTS="$(
  jq -cn \
    --arg custom "$CUSTOM_ARTIFACT_NAME" \
    --arg prompt "$PROMPT_ARTIFACT_NAME" \
    '[$custom, $prompt]'
)"

CONTEXT_ARTIFACTS="$(
  jq -cn \
    --arg custom "$CUSTOM_ARTIFACT_NAME" \
    --arg resource "$RESOURCE_ARTIFACT_NAME" \
    --arg filter "$FILTER_ARTIFACT_NAME" \
    '[$custom, $resource, $filter]'
)"

ACTION_PLAN_ID="$(
  reshapr config create 'weather-action-with-prompt' \
    --serviceId "$RESHAPR_SERVICE_ID" \
    --backendEndpoint 'https://api.open-meteo.com' \
    --includedOperations '["current_weather"]' \
    --includedArtifacts "$ACTION_ARTIFACTS" \
    --output json \
    | jq -er '.id'
)"

CONTEXT_PLAN_ID="$(
  reshapr config create 'weather-action-with-context' \
    --serviceId "$RESHAPR_SERVICE_ID" \
    --backendEndpoint 'https://api.open-meteo.com' \
    --includedOperations '["current_weather"]' \
    --includedArtifacts "$CONTEXT_ARTIFACTS" \
    --output json \
    | jq -er '.id'
)"
export ACTION_PLAN_ID CONTEXT_PLAN_ID
unset ACTION_ARTIFACTS CONTEXT_ARTIFACTS
```

`includedArtifacts` contains Artifact **names**, not IDs. If it is absent or empty, all attached Artifacts apply.

## Expose the selections

Use `https` for reShapr Online or `http` for the local Compose Gateway:

```bash
export MCP_SCHEME='https'

ACTION_MCP_URL="${MCP_SCHEME}://$(
  reshapr expo create \
    --configuration "$ACTION_PLAN_ID" \
    --gateway-group 1 \
    --name 'weather-action-with-prompt' \
    --output json \
    | jq -er '.endpoints[0]'
)"

CONTEXT_MCP_URL="${MCP_SCHEME}://$(
  reshapr expo create \
    --configuration "$CONTEXT_PLAN_ID" \
    --gateway-group 1 \
    --name 'weather-action-with-context' \
    --output json \
    | jq -er '.endpoints[0]'
)"
export ACTION_MCP_URL CONTEXT_MCP_URL
```

## Compare the exposed capabilities

Use one helper for `tools/list`, `prompts/list`, and `resources/list`:

```bash
list_capabilities() {
  local endpoint="$1"
  local method="$2"
  local result_key="$3"
  local request
  request="$(jq -cn --arg method "$method" '{
    jsonrpc: "2.0",
    id: 1,
    method: $method,
    params: {
      _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientInfo": {name: "reshapr-docs", version: "0.2.3"},
        "io.modelcontextprotocol/clientCapabilities": {}
      }
    }
  }')"

  curl --silent --show-error \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/event-stream' \
    --header 'MCP-Protocol-Version: 2026-07-28' \
    --header "Mcp-Method: $method" \
    --data "$request" \
    "$endpoint" | jq -r --arg key "$result_key" '.result[$key][] | .name // .uri'
}
```

Compare the two Expositions:

```bash
list_capabilities "$ACTION_MCP_URL" tools/list tools
list_capabilities "$ACTION_MCP_URL" prompts/list prompts
list_capabilities "$ACTION_MCP_URL" resources/list resources

list_capabilities "$CONTEXT_MCP_URL" tools/list tools
list_capabilities "$CONTEXT_MCP_URL" prompts/list prompts
list_capabilities "$CONTEXT_MCP_URL" resources/list resources
```

Both list `current_weather`. Only the action Exposition lists `weather_brief`; only the context Exposition lists `weather-code-note`. The context Plan also filters `current_weather` results, as demonstrated in **[Context Control in Practice](../tutorials/context-control-in-practice.md)**.

## Preview deletion impact

Ask the CLI to delete the Prompt Artifact:

```bash
reshapr artifact delete "$PROMPT_ARTIFACT_ID"
```

Before deleting, the CLI lists the Configuration Plans that reference the Artifact and asks for confirmation. The action Plan appears in the impact preview; the context Plan does not. Answer `n` to retain the Artifact and the two capability surfaces built by this guide.

Confirming deletion would remove the Artifact name from affected Plans and propagate their updates to the corresponding Expositions.

If the removed name was a Plan's only selection, the resulting empty list means **all remaining attached Artifacts apply**. Adjust or delete that Plan first when this fallback would broaden its MCP surface.

## Result

One Service now has four reusable attached Artifact types and two Configuration Plans that expose observably different Prompt, Resource, and response-treatment capabilities.

## Limits

- Artifact capabilities describe declared names; use MCP list methods to verify what an Exposition serves.
- Artifact selection is Plan-wide, not conditional per user or per Tool call.
- Output filters are not an authorization boundary and fail open in reShapr `0.2.3`.
- The deletion step previews impact and is deliberately cancelled; confirming it changes the action Plan.
- Re-running the commands with the same Plan or Exposition names requires deleting or renaming the previous resources.

## Next step

- **[Context Control in Practice](../tutorials/context-control-in-practice.md)** measures a filtered Tool result.
- **[Services and Artifacts](../explanations/services-and-artifacts.md)** explains main, attached, and derived capabilities.
- **[Context Control](../explanations/context-control.md)** compares the available mechanisms and trade-offs.