---
description: How reShapr discovers Services from API artifacts (OpenAPI, GraphQL, gRPC) and the conventions used during import.
---

# Services & Artifacts

As explained in **[Why reShapr?](../overview/why-reshapr.md)**, reShapr ingest your API’s existing artifacts such as **[OpenAPI 3.x](https://www.openapis.org/)** specs, **[GraphQL](https://graphql.org/)**  schemas and **[gRPC/Protobuffer](https://grpc.io/)** definitions to discover Services and create MCP Servers. A Service in reShapr represents a functional service promise - for example a *User Management Service* with a specific version - for example `1.0` - made of several operations (`searchUsers`, `getUserById,` etc...). Service are versioned so you’ll be able to handle the different versions of the *User Management Service* which can be `1.0`, `1.1`, `2.0` and so on…

Your first steps with reShapr will certainly be to import new artifacts into the system so that reShapr can discover and propose Services to expose. As of today, this task is realized using the **[reShapr CLI](../tutorials/getting-started.md)** that holds the `reshapr import` tool. But before diving into the Getting Started guide, let’s review the information and conventions reShapr is using from these specifications.

- When importing an **[OpenAPI 3.x](https://www.openapis.org/)** artifact, reShapr will naturally use the `info.name` and `info.version` that are mandatory elements in the specification. The discovered Service will then naturally have this name and version,
- When importing a **[gRPC/Protobuffer](https://grpc.io/)** definition, reShapr will look for a Protocol Buffer `service` definition and will return the first it finds. reShapr will also look at the `package` directive. This package information will be used for two purposes: to provide a full name for the reShapr service that will be `<package>.<serviceName>` and to extract the version information. As it’s a best practice to put the version as the last element of a package name in gRPC, reShapr will use the last element as the version.
- When importing a **[GraphQL](https://graphql.org/)**  schema, things are a bit different because Graph Schema doesn’t have a way to provide information on the service name or version. So when importing a GraphQL schema in reShapr, you will have to explicitly provide the `serviceName` and the `serviceVersion` you want this service to be registered as.

As Services are versioned in reShapr, the direct consequence is that reShapr will be able to keep many different versions of the same Service in parallel. It will be then up to you to manage the expositions of version `1.0`, then version `2.0` etc. When a version of a service is no longer of importance for you, you can delete it - but it will automatically remove existing expositions.  

Updating a Service in reShapr is a trivial process ; it simply means re-importing its reference artifacts. If its service name and version are already present in reShapr, the definition will be updated. If not, a new Service entry will be created and attached to your account.

## Managing Artifacts

A Service in reShapr is backed by one or more artifacts. The first artifact you import (using `reshapr import`) becomes the **main artifact** — it defines the Service identity, operations, and type. You can then attach additional artifacts (using `reshapr attach`) to enrich the Service with **[Prompts](../references/prompts-specification.md)** or **[Custom Tools](../references/custom-tools-specification.md)** definitions.

### Listing artifacts

You can list all artifacts associated with a Service using the `reshapr artifact list` command. This is useful to see what has been imported or attached previously:

```bash
reshapr artifact list -s 0N2G4YZFDD3ZF
```

```bash
ID             NAME                  TYPE                 MAIN
0NKVYHWSR9VPT  github-api.graphql    GRAPHQL              Yes
0NKVZAB12X3YZ  github-api-prompts    PROMPTS              No
```

The `MAIN` column indicates which artifact is the primary definition for the Service. Only one artifact can be the main artifact per Service.

### Inspecting an artifact

To retrieve details of a specific artifact, use `reshapr artifact get`:

```bash
reshapr artifact get 0NKVYHWSR9VPT
```

```bash
ℹ️  Artifact details
ID           : 0NKVYHWSR9VPT
Name         : github-api.graphql
Organization : my-org
Service ID   : 0N2G4YZFDD3ZF
Type         : GRAPHQL
Main Artifact: Yes
Source       : github-api.graphql
Path         : N/A
```

You can also display the full artifact content (syntax-highlighted) by adding the `-d, --display` flag:

```bash
reshapr artifact get 0NKVYHWSR9VPT -d
```

Both commands support the `-o, --output <format>` option for structured output in `json` or `yaml` format, which is convenient for automation. See the **[CLI Commands Reference](../references/cli-commands.md)** for the full details on all available options.
