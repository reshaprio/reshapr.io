---
description: Define MCP Resources to share contextual data — files, schemas, or application-specific information — with LLMs.
---

# Resources

As explained in **[Why reShapr?](../overview/why-reshapr.md)**, reShapr can create secure MCP servers in seconds without coding, just by importing your API’s existing artifacts - like **[OpenAPI 3.x](https://www.openapis.org/)** specs, **[GraphQL](https://graphql.org/)** schemas and **[gRPC/Protobuf](https://grpc.io/)** definitions. These artifacts are directly used to produce **[MCP Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)** that are at the core of the Model Context Protocol. Another interesting aspect of MCP is that it may be composed of **[Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)**. Resources allow servers to share data that provides context to LLM, such as files, database schemas, or application-specific information.

The key difference with tools is intent and usage pattern:

- **Resources** are for when **you want to give the model access to existing data to read and reference**. Resources are designed to be **application-driven**, with host applications determining how to incorporate context based on their needs.
- **Tools** are for when **you want the model to perform actions** or computations. Tools are designed to be **model-controlled**, meaning that the LLM can discover and invoke tools automatically based on it’s understanding and user’s prompts.

reShapr provides **an easy way to design and specify your Resources using a simple YAML description,** called the `Resources` specification. If you want to provide such resources to your reShapr-powered MCP endpoint, you’ll need to write this simple file and `attach` it to your existing Service. Let’s see a simple example of such a file:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: Resources
service:
  name: Open-Meteo APIs
  version: '1.0'
resources:
  'file:///project/readme.md':
    name: README.MD
    title: Open-Meteo APIs readme
    description: Documentation on how to use the Open-Meteo APIs
    mimeType: text/plain
    icons:
      - src: file:///assets/icons/md-file-icon.png
        mimeType: image/png
        sizes:
          - "48x48"
    text: |
      ## Hello World
      Welcome to Open-Meteo API!
      Bla, bla, bla
    annotations:
      audience:
        - user
      priority: 0.8
```

A `Resources` artifact follows some simple rules:

- It always contains an identification section made of `apiVersion` and `kind` properties that **must** have the **`reshapr.io/v1alpha1`** and `Resources` values respectively,
- It **must** be bound to a specific reShapr **[Service](../explanations/services-and-artifacts.md)** using the **`service.name`** and `service.version` properties whose values **must** match an already discovered Service,
- The `resources` section then defines the resources:
  - We have a single resource here: **`file:///project/readme.md`**. Resource identifiers **must** always start with some protocol-specific notation like `file://.`
  - A resource **must** always have a `name` that defines it’s short name,
  - A resource **may** provide optional `title` , `description`, `mimeType` and `icons` to provide more context to the Agent when choosing an appropriate resource,
  - A resource **may** also specify its content by using either a `text` or a `blob` property. `text` specifies its content as plain text, `blob` value must be encoded using Base64
  - A resource  **may** also specify `annotations` that provide hints to clients about how to use or display the resource. More on this in the **[official MCP documentation](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#annotations)**.

You can specify as many resources as you want in the same `Resources` artifact file.

## Resource templates

As the above form represents the simplest way of doing things, reShapr also supports a more elaborate way of doing things via the concept of `resourceTemplates`. Resource templates represent parametrized resources using URI templates.

Imagine you have a list of resources at a specific location (a URL), instead of describing each of them, you can use a template to parametrized the access. Resource Templates can be added to your `Resources` artifact using a `resourceTemplates` element like illustrated below:

```yaml
resourceTemplates:
  'file:///project/src/{path}?mode=raw':
    name: Project Source File
    title: 📁 Project Files
    description: Access files in the project directory
    mimeType: application/octet-stream
    icons:
      - src: file:///assets/icons/folder-icon.png
        mimeType: image/png
        sizes:
          - "48x48"
```

A `resourceTemplate` follows these rules:

- The template identifier **must** contain a parameter delimited with curly braces, here `{path}`
- It has the same basic properties as a `resource` except for the `mimeType` property that doesn’t make sense here, as we represent many resources
- A template **must not** have `text` or `blob` to define its content. Because it represents a collection of resources, the discovery and fetching of content will be dynamic!

To fetch its resource content, a `resourceTemplate` **will reuse [the backend endpoint URL](../explanations/configuration-and-exposition.md) coming from the MCP Server Configuration Plan!**

As an example, imagine that you have configured your backend endpoint URL to be **`https://api.acme.com`**. When asking for a resource with `path=resources/doc.md` , then your reShapr MCP Server will actually try to fetch the **`https://api.acme.com/project/src/resources/doc.md?mode=raw`)** URL to get its content. Depending on the received content (text or binary), the reShapr endpoint will use the correct encoding to allow your agent or host application to correctly interpret this content.
