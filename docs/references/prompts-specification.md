# Prompts

As explained in **[Why reShapr?](../overview/why-reshapr.md)**, reShapr can create secure MCP servers in seconds without coding, just by importing your API’s existing artifacts - like **[OpenAPI 3.x](https://www.openapis.org/)** specs, **[GraphQL](https://graphql.org/)** schemas and **[gRPC/Protobuf](https://grpc.io/)** definitions. These artifacts are directly used to produce **[MCP Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)** that are at the core of the Model Context Protocol. Another interesting aspect of MCP is that it may be composed of **[MCP Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)** and **[MCP Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)**. While MCP Tools are often enough for practical use of MCP, all these capabilities are likely to be part of a complete and production ready MCP Server.

Contrary to tools, **prompts can’t - and shouldn’t - be directly inferred from an API contract**. They should be designed to provide users with accelerators on how to interact with the model, offer additional instructions and guardrails on how to use tools for a specific use case, or provide additional details on how to orchestrate tool calls.

reShapr provides **an easy way to design and specify your Prompts using a simple YAML description,** called the `Prompts` specification. If you want to provide such prompts to your reShapr-powered MCP endpoint, you’ll need to write this simple file and `attach` it to your existing Service. Let’s see a simple example of such a file:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: Prompts
service:
  name: Petstore
  version: 1.0.0
prompts:
  list_pets:
    title: List the pets
    description: Browse the catalog to get all the pets
    result: Get all the pets from the catalog
  get_pet:
    title: Get details of a pet with its name
    description: Get details for a specific pet from the catalog
    arguments:
      - name: name
        description: The name of the pet to retrieve
        required: true
    result: |-
      Get the detailed information on the pet named '${name}'.
      The MCP tool to call is 'get_pet_by_name', using '${name}' as the tool argument called 'name'.
```

A `Prompts` artifact follows some simple rules:

- It always contain an identification section made of `apiVersion` and `kind` properties that **must** have the **[`reshapr.io/v1alpha1`](http://reshapr.io/v1alpha1)** and `Prompts` values respectively,
- It **must** be bound to a specific reShapr **[Service](../explanations/services-and-artifacts.md)** using the **[`service.name`](http://service.name)** and `service.version` properties which values **must** match an already discovered Service,
- The `prompts` section then defines the prompts:
  - We have 2 prompts here: `list_pets` and `get_pet`
  - A prompt **must** always have a `result` which will be returned to the model when called,
  - A prompt **may** provide optional `title` and `description` to provide more context to the user when choosing an appropriate prompt,
  - A prompt **may** also provide `arguments` that allow the production of a customized result prompt message, where the user provides its contextuel values for each argument.

In the case of prompt using `arguments`, the `result` value **can** be expressed using `${}` expressions that will be replaced by user provided values. Typically in our example, if user is looking for a pet named **Rusty**, the prompt will be generated with `Rusty` in the place of the `${name}` placeholder.
