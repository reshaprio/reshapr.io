---
description: Enable Code Mode to let an MCP client discover API operations progressively and execute bounded JavaScript in the proxy.
release_review:
  runtime: 1.2.0
  controllers: 0.0.5
  date: 2026-11-20
  scope: release-tagged Code Mode Tool definitions and ConfigurationPlan schema; no complete procedure replay
---

# Use Code Mode

Use Code Mode in reShapr **1.2.0** when an agent needs to search a large API, chain calls, or reduce results before returning them to the model. Instead of loading every Tool definition, the client discovers just the operations it needs and submits JavaScript to the proxy.

This follows the code-execution-with-MCP pattern described by [Cloudflare](https://blog.cloudflare.com/code-mode/) and [Anthropic](https://www.anthropic.com/engineering/code-execution-with-mcp): present Tools as a code API, compose calls in code, and process intermediate results before returning an answer to the model. In reShapr, execution is **server-side in the proxy**; the client uses the Exposition's MCP Tools rather than installing an agent-side execution SDK or enabling a provider-specific code execution API.

Unlike a [Scripted Custom Tool](./build-scripted-custom-tool.md), whose script is supplied by the Service author, Code Mode accepts code supplied by the MCP client at request time. It is programmable execution, not a no-code workflow.

For the discovery and execution flows, sandbox security model, and guardrail boundaries, see [Code Mode: Flows and Security Boundaries](../explanations/code-mode.md).

## Prerequisites

- A control plane and proxy running reShapr `1.2.0`.
- An existing Service, Configuration Plan, and Exposition, with a working read-only Tool call.
- Permission to edit the Plan and an MCP client that can call Tools and generate JavaScript.
- For GitOps configuration, controllers `0.0.5` and the matching ConfigurationPlan CRD installed explicitly. Helm does not upgrade existing CRDs.

## Choose the Tool exposure mode

Open the Configuration Plan in the Web UI and set its **Tool exposure mode**, then save. The same field is `toolExposureMode` in the public API and ConfigurationPlan CR, and `--toolExposureMode` in CLI Plan creation.

| Mode | What `tools/list` advertises | Use |
|---|---|---|
| `TOOLS` | One Tool per selected operation. | Default, traditional function calling. |
| `CODE` | Only `search_tools`, `get_api_types`, and `execute_code`. | Progressive discovery and gateway-side orchestration. |
| `HYBRID` | Native Tools and all three Code Mode Tools. | Transition or clients that need both interfaces. |

Keep the existing operation and artifact selection rules. Code Mode uses the selected surface, not every operation imported into the Service. Its three Tool names are reserved in `CODE` and `HYBRID`; they shadow native Tools with the same names.

After propagation, refresh your client's Tool list. In `CODE`, verify that it contains the three meta-tools rather than the complete native catalog. To revert, save `TOOLS` and refresh discovery again.

## Discover only the operations you need

The following are **example `tools/call` parameters**, not shell commands. Send them using your existing authenticated MCP connection and its negotiated protocol headers, as in [Test an MCP endpoint](./test-mcp-endpoint.md).

First search by name or description:

```json
{"name":"search_tools","arguments":{"query":"forecast","detail":"summary","limit":5}}
```

`detail` accepts `name`, `summary` (default), or `schema`. The default result limit is 10 and the maximum is 100. The response reports `returned`, `matched`, and `exposed`; refine the query when not all matches are returned. Search is not semantic retrieval or pagination.

Then request the exact signatures of the returned Tool names. This example assumes the exposed surface contains `get_v1_forecast`:

```json
{"name":"get_api_types","arguments":{"tools":["get_v1_forecast"]}}
```

Use the returned TypeScript declarations to construct inputs. Omitting `tools` returns declarations for the entire selected surface and can defeat the context savings. The declarations describe the API; `execute_code` still accepts **JavaScript**, not TypeScript syntax.

## Execute and reduce results

Submit the body of a function ending in `return`. Replace the example Tool name and arguments with those returned for your own API:

```json
{
  "name": "execute_code",
  "arguments": {
    "code": "const result = api.get_v1_forecast({latitude: 45.76, longitude: 4.84, current: 'temperature_2m'}); if (!result.ok) rs.fail('Forecast failed', result.error); return {temperature: result.content.current.temperature_2m};"
  }
}
```

This example assumes the backend returns JSON with `current.temperature_2m`. Adapt that expression to the actual Tool result before use. Only the returned temperature is sent back as the script result, but intermediate payloads still consume gateway memory.

Inside a snippet:

- `api.<tool>(input)` calls a selected Tool synchronously. Use `api["tool-name"](input)` for names that are not JavaScript identifiers.
- `rs.callTool(name, input)` invokes a Tool by name.
- `rs.callToolAsync(name, input)` and `rs.awaitPromises([promise1, promise2])` support concurrent calls.
- Calls return an envelope with `ok`, `content`, and `error`. Check `ok` before consuming content.
- `rs.fail(message, data)` stops execution with a structured error.

Discovery does not need backend credentials. Execution performs a credential-elicitation preflight where required; complete that flow and retry rather than placing credentials in code.

## Bound execution and inspect failures

The proxy defaults are 10 seconds, 10 Tool calls, 4,000 submitted code characters, and 100,000 result characters per Code Mode execution. Script nesting is limited to 5 and WebAssembly linear memory to 256 pages of 64 KiB (16 MiB), shared configuration with Scripted Custom Tools. This memory limit is not a limit on total JVM memory or concurrent executions.

See [Runtime environment variables](../references/environment-variables.md#code-mode-and-script-guardrails) for exact variable names, units, and separate script limits. There is no direct filesystem, arbitrary network, `require`, or `import` access in the sandbox. Backend access goes through Tools and their configured credentials.

Execution is not transactional: calls already completed are not rolled back when a later call fails, a limit is reached, or the script times out. Do not blindly retry scripts that mutate backend state. Operation selection controls visibility, not backend authorization; a selected Scripted Custom Tool can still invoke its declared lower-level operations.

When Plan auditing is enabled, Code Mode records execution identity and outcomes, and logs submitted source at INFO. Do not embed secrets or personal data in snippets. See [Observe the reShapr Proxy](./operations/observe-and-audit.md) and [Logging](../references/logging.md).

If discovery is missing, check the saved Plan mode and proxy synchronization. For unknown Tools, repeat `search_tools` and `get_api_types`. For limit failures, reduce work or returned content before increasing limits. For backend errors, use [Troubleshooting](./operations/troubleshoot.md).

## Further reading

- [Cloudflare: Code Mode: the better way to use MCP](https://blog.cloudflare.com/code-mode/) introduces exposing MCP Tools as a typed programming API and composing calls inside an isolated execution environment.
- [Cloudflare Agents: Code Mode documentation](https://github.com/cloudflare/agents/blob/main/docs/codemode/index.md) describes Cloudflare's implementation. Its SDK and runtime configuration are not prerequisites for reShapr.
- [Anthropic: Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp) explains progressive Tool discovery, filtering intermediate results, and the operational tradeoffs of running generated code. Its filesystem-based examples are not available in reShapr's sandbox.
- [Anthropic: Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) documents a related provider-managed approach, where Claude executes code in a container and invokes Tools programmatically. It is a different integration from reShapr's server-side MCP Tools.

These references explain the design pattern, not the reShapr contract. Their examples, sandbox capabilities, and reported performance results do not establish reShapr behavior or guarantee token or latency savings for your workload. Use the release sources below for reShapr-specific names, limits, and execution semantics.

## Source contracts

- [Code Mode Tool definitions, reShapr 1.2.0](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/java/io/reshapr/proxy/mcp/code/CodeModeTools.java)
- [Execution and selected surface](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/java/io/reshapr/proxy/mcp/code/CodeModeExecutor.java)
- [ConfigurationPlan reference, controllers 0.0.5](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/configurationplan-cr.md)