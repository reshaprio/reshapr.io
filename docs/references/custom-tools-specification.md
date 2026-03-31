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
- A custom tool **must** always have a `tool` that defines the original tool it overrides and replaces: here we’re using the GitHub `user` tool,
- A custom tool **may** provide optional `title` and `description` to provide more context to the LLM or Agent when choosing an appropriate tool,
- A custom tool **must** also provide and `input` schema description that described its parameters. Input schema reuses the same structure as the regular MCP Tools Input Schema.
- A custom tool **may** also specify `arguments` that represents the arguments that will be used with the original tool that is overridden. Here we’re fixing the arguments as well as the relation navigation options for fetching exactly what we need.

In the case of custom tools using `arguments`, the value **can** be expressed using `${}` expressions that will be replaced by input values. Typically in our example, the MCP client will send a `user` value as input and this value will be used n the place of the `${user}` placeholder when invoking the original tool.
