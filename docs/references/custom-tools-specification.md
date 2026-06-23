---
description: Define Custom Tools to rename, condense, and translate default API operations into LLM-friendly MCP tools.
---

# Custom Tools

The use of MCP Server raises important concerns regarding the control of the context - see our dedicated blog post **[From Context Overload to Context Control!](/blog/from-context-overload-to-context-control)** on this topic. There are different facets of this need of control: the search for efficiency (economical & technical performance), the reduction of security threats, and the adaptation to a business context or process.

Even official MCP Servers can be questioned regarding these concerns:

- The official GitHub MCP server exposes over 90 tools consuming 46k+ tokens, including high-risk operations like `delete_file` and `delete_workflow_run_logs` alongside benign tools like `get_pull_requests` .
- The Snowflake official MCP server, for example, exposes an `execute_sql` tool accepting arbitrary SQL queries. Agents have to generate different SQL queries each time
for the same request, making results non-deterministic and potentially wrong. Instead, organizations need tools that map to specific use cases. For example, `get_revenue_for_month(month, year)` that map to approved, parameterized queries reviewed by data teams.

As a consequence, MCP Servers - whether provided by an official third-party or built on your own existing API - **should be used very rarely as is without polishing the context usage.** They should be designed to provide LLM and Agents with clearly designed and parameterized actions that fit a specific use case. 

reShapr provides **an easy way to design and specify your Custom Tools using a simple YAML description,** called the `CustomTools` specification. If you want to provide such custom tools to your reShapr-powered MCP endpoint, you’ll need to write this simple file and `attach` it to your existing Service.

Let’s explain this concept via a simple example: we want to provide an MCP Tool that fetches details on a GitHub user. The official MCP Server is a no-brainer as it provides too many high-risk operations, so we decided to produce our own reShapr-powered one, reusing the GitHub GraphQL API and reducing the surface to only the existing `user` operation. You can do this in reshapr using this command:

```bash
reshapr import -f ../dev/github-api.graphql --sn 'GitHub GraphQL' --sv '20250917' --be https://api.github.com/graphql --io '["user"]'
```

That allows us to have an MCP endpoint with just the `user` operation, but here we’re facing the complexity of the GraphQL API with too many parameters and relation navigation options! This tool will consume 2.5k tokens, and we’re not certain it will fetch all the required user information.

Let’s say we want default information on the user, but also its avatar and details on its latest followers… We can define a new `get_user_with_latest_followers(login)` tool for a specific use case, and we just have to create and attach this simple YAML file:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: CustomTools
service:
  name: GitHub GraphQL
  version: '20250917'
customTools:
  get_user_with_latest_followers:
    tool: user
    description: Get a user details with the latest followers details
    input:
      type: object
      properties:
        user:
          type: string
          description: The GitHub login of the user to fetch
      required:
        - user
    arguments:
      login: ${user}
      __relation_avatarUrl:
        size: 32
      __relation_followers:
        last: 10
```

A `CustomTools` artifact follows some simple rules:

- It always contains an identification section made of `apiVersion` and `kind` properties that **must** have the **`reshapr.io/v1alpha1`** and `CustomTools` values respectively,
- It **must** be bound to a specific reShapr **[Service](../explanations/services-and-artifacts.md)** using the **`service.name`** and `service.version` properties whose values **must** match an already discovered Service,
- The `customTools` section then defines the tools:
- We have a single tool here: `get_user_with_latest_followers`
- A declarative custom tool **must** have a `tool` that defines the original tool it overrides and replaces: here we’re using the GitHub `user` tool,
- A custom tool **may** provide optional `title` and `description` to provide more context to the LLM or Agent when choosing an appropriate tool,
- A custom tool **must** also provide and `input` schema description that described its parameters. Input schema reuses the same structure as the regular MCP Tools Input Schema.
- A declarative custom tool **may** also specify `arguments` that represents the arguments that will be used with the original tool that is overridden. Here we’re fixing the arguments as well as the relation navigation options for fetching exactly what we need.

In the case of custom tools using `arguments`, the value **can** be expressed using `${}` expressions that will be replaced by input values. Typically in our example, the MCP client will send a `user` value as input and this value will be used in the place of the `${user}` placeholder when invoking the original tool.

## Scripted Custom Tools

Available since reShapr `0.0.14`, a Custom Tool can also define its behavior with a JavaScript `script`. This is useful when a single business action needs to orchestrate several existing tools, possibly from different Services of the same organization, and return a compact result that is easier for an Agent to use.

A custom tool item is now **either** declarative **or** scripted:

| Form | Main fields | Purpose |
| --- | --- | --- |
| Declarative | `tool`, `arguments` | Map the custom tool to one backend tool, with templated arguments. |
| Scripted | `script`, `tools` | Run JavaScript logic that may call several tools and reshape their results. |

Both forms still require `description` and `input`. The `input` JSON Schema defines the parameters exposed to the MCP client and becomes available inside the script as the `input` constant.

A scripted custom tool never talks directly to backend endpoints. It calls other reShapr tools through the `rs` host API. This means the usual reShapr behavior still applies to every underlying call: security, backend secrets, elicitation handling, output filtering, audit, and distributed tracing.

### Scripted tool fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | yes | Human-readable description of the custom tool. |
| `input` | object | yes | JSON Schema object describing the tool parameters. |
| `script` | string | yes | JavaScript body to execute. It must `return` a JSON-serializable value. |
| `tools` | array | yes | Allow-list of tools the script may call. |

The `tools` array is both a security allow-list and the input used by reShapr to prepare elicitation flows before the script runs. Each item contains a `tool` name and, when calling another Service, an optional `service` value using the readable `<service_name:service_version>` form.

```yaml
tools:
  - tool: user
  - service: "Issues API:1.0.0"
    tool: listIssues
```

When `service` is omitted, the script calls a tool from the same Service as the Custom Tool. Cross-Service calls are restricted to Services belonging to the same organization.

### The `rs` host API

Inside the script, reShapr exposes a global `rs` object:

| Function | Description |
| --- | --- |
| `rs.callTool(tool, params)` | Synchronously call a tool on the same Service. |
| `rs.callTool(service, tool, params)` | Synchronously call a tool on another Service. |
| `rs.callToolAsync(tool, params)` | Start a same-Service call without blocking. |
| `rs.callToolAsync(service, tool, params)` | Start a cross-Service call without blocking. |
| `rs.awaitPromises([p1, p2])` | Wait for async calls and return the results in the same order. |
| `rs.fail(message, data)` | Fail the whole Custom Tool with a structured MCP error. |

Every call returns a result object:

```js
{
  ok: true,
  content: {},
  error: null
}
```

If a call fails, `ok` is `false`, `content` is `null`, and `error` contains the failure details. A script should check `result.ok` before reading `result.content`.

### Returning results and failures

A script can return any JSON-serializable value:

```js
const result = rs.callTool('user', { login: input.user });
if (!result.ok) {
  throw new Error('Could not fetch user ' + input.user);
}
return { login: result.content.login };
```

Returning a value makes the Custom Tool call succeed. Throwing an error makes the Custom Tool call fail with an MCP tool error. For machine-readable failures, use `rs.fail(message, data)`:

```js
rs.fail('GitHub rate limit exceeded', { retryAfter: 60, scope: 'graphql' });
```

This returns an MCP error whose content is a structured JSON object containing the `message` and `data` fields.

### Asynchronous orchestration

Use `rs.callToolAsync(...)` when several tool calls can run in parallel. The calls start immediately, and `rs.awaitPromises(...)` waits for them:

```js
const first = rs.callToolAsync('user', { login: input.firstUser });
const second = rs.callToolAsync('user', { login: input.secondUser });
const results = rs.awaitPromises([first, second]);

return {
  users: results.map(function (result) {
    return result.ok ? result.content : { error: result.error };
  })
};
```

Partial failures of asynchronous calls are not thrown automatically. They are returned as `ok: false` result objects, so the script can decide whether to ignore, recover, or fail the whole Custom Tool.

### Backend secrets and elicitation

Before a scripted Custom Tool runs, reShapr checks every tool declared in `tools`. If one of these target tools requires an elicitation-based backend secret that is not yet available for the current MCP session, the MCP Server returns the elicitation request instead of starting the script. Once all required secrets are resolved, the script runs normally.

This is why the `tools` list must be exhaustive: it lets reShapr know which backend credentials may be required before any JavaScript code is executed.

### Guard-rails

Script execution is bounded by gateway settings:

| Setting | Default | Description |
| --- | --- | --- |
| `reshapr.gateway.scripting.timeout` | `10000` ms | Maximum script execution time. `0` disables the timeout. |
| `reshapr.gateway.scripting.max-tool-calls` | `50` | Maximum number of tool calls per script execution. |
| `reshapr.gateway.scripting.max-depth` | `5` | Maximum nesting depth when a scripted tool calls another scripted tool. |

The timeout cancels interruptible work such as backend calls and waits. Keep scripts simple and avoid unbounded CPU loops.

### Example

Here is a scripted Custom Tool that fetches two GitHub users in parallel and returns a small side-by-side comparison:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: CustomTools
service:
  name: GitHub GraphQL
  version: '20250917'
customTools:
  compare_two_users:
    description: Fetch two GitHub users in parallel and compare their profiles.
    input:
      type: object
      properties:
        firstUser:
          type: string
        secondUser:
          type: string
      required:
        - firstUser
        - secondUser
    tools:
      - tool: user
    script: |
      function summarize(result, login) {
        if (!result.ok) {
          return { login: login, error: result.error };
        }
        const user = result.content.data && result.content.data.user
          ? result.content.data.user
          : result.content.user || result.content;
        return { login: user.login || login, name: user.name, company: user.company };
      }

      const first = rs.callToolAsync('user', { login: input.firstUser });
      const second = rs.callToolAsync('user', { login: input.secondUser });
      const results = rs.awaitPromises([first, second]);

      return {
        users: [
          summarize(results[0], input.firstUser),
          summarize(results[1], input.secondUser)
        ]
      };
```
