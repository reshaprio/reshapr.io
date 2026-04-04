# reShapr CLI advanced

## Artifact commands

### `reshapr import` command

The import command allows to push (or have reShapr pull) a new artifact into reShapr. This will allow it to discover a new Service as explained in **[Services & Artifacts](../explanations/services-and-artifacts.md)**.

First, you have to tell reShapr how to proceed for retrieving this artifact. You can use:

- `-f, --file <path>` to reference a local file you want to upload,
- `-u, --url <url>` to ask the reShapr control plane to download a remote file.

:::info
When specifying a remote URL with the `-u` option, it can also be useful to specify a Secret with the `-s, --secret <artifactSecret>` to authorize the access to the remote endpoint. Check the **[Secret commands](cli-commands.md)** just below to learn how to create them.
:::

The discovery of the artifact Service is automatic for **[OpenAPI 3.x](https://www.openapis.org/)** specs and **[gRPC/Protobuf](https://grpc.io/)** definitions. By default, reShapr will use the identification elements (`name` and `version`) found in the artifact. You can, however, decide to override these information by using the additional `--sn, --serviceName <name>` and  `--sv, --serviceVersion <version>` options.

:::warning
The discovery of Service from **[GraphQL](https://graphql.org/)**  schemas need some more help. Here, the additional `--sn, --serviceName <name>` and  `--sv, --serviceVersion <version>` options are mandatory. If not specified, the import will fail.
:::

When importing an artifact Service, you may also choose not to consider all the different operations that will be discovered. Perhaps you want to restrict it to read-only access, or maybe your existing API is too coarse-grained, and you want to filter on a single domain. Whatever the reason, you can configure this with the following options:

- `--io, --includedOperations [<operation1>, <operation2>]` : Allow specifying a list of operations to consider. Example: `--io '["createLabel", "createIssue]'` ,
- `--eo, --excludedOperations [<operation1>, <operation2>]` : Allow specifying a list of operations to ignore. Example: `--eo '["POST /order"]'` . This exclusion list will only be considered if no inclusion list is specified.

The import command also allows you to quickly configure and expose the discovered Service using additional flags! If you add the `--be, --backendEndpoint <backendEndpointURL>`  flag to your command, this will create a *default* **[Configuration Plan & Exposition](../explanations/configuration-and-exposition.md)** for you, using the *default* gateways.

This exposition can be further configured with the most common options:

- `--apiKey` : Allow the generation of an API key to secure access to an MCP endpoint exposed by gateways.  See the **[`reshapr config create` command details](cli-commands.md)** below
- `--internalOAuth2` : Allow to secure access to an MCP endpoint using OAuth 2 authorization backed by the reShapr Internal OAuth Identity Provider. See the **[`reshapr config create` command details](cli-commands.md)** below
- `--bs, --backendSecret <backendSecretId>` : Allow the specification of a Backend Secret to use when exposing an MCP Endpoint on gateways. See **[Backend Secrets](../explanations/security-model.md)**.

Below is an example of an all-in-one command that imports a local GraphQL schema, setting its name and version and exposing it with an API key so that it targets the GitHub GraphQL endpoint:

```bash
reshapr import -f ../dev/github-api.graphql --sn 'GitHub GraphQL' --sv '20250917' --be https://api.github.com/graphql --apiKey
```

```bash
✅ Import successful!
ℹ️  Discovered Service GitHub GraphQL with ID: 0N2G4YZFDD3ZF
⚠️  The API Key to access future expositions is: c8d90391-xxxx-xxxx-xxxx-xxxxb004dfdb
⚠️  Make sure to store it securely, as it will not be shown again.
✅ Exposition done!
✅ Exposition is now active!
Exposition ID  : 0N2G4Z0ASD034
Organization   : <organization>
Created on     : 2025-09-26T14:43:37.686+00:00
Service ID     : 0N2G4YZFDD3ZF
Service Name   : GitHub GraphQL
Service Version: 20250917
Service Type   : GRAPHQL -> https://api.github.com/graphql
Endpoints      : mcp.beta.reshapr.io/mcp/<organization>/GitHub+GraphQL/20250917
```

### `reshapr attach` command

Available since version `0.0.8` of the CLI, the attach command allows you to provide and attach complementary artifacts to an already discovered **[Service](../explanations/services-and-artifacts.md)**. This command will typically be used immediately after the `import` command to provide additional information about **[Prompts](prompts-specification.md)** or **[Custom Tools](custom-tools-specification.md)**.

Similar to the `import` command, you need to instruct reShapr on how to retrieve this artifact. You can use:

- `-f, --file <path>` to reference a local file you want to upload,
- `-u, --url <url>` to ask the reShapr control plane to download a remote file.

:::info
When specifying a remote URL with the `-u` option, it can also be useful to specify a Secret with the `-s, --secret <artifactSecret>` to authorize the access to the remote endpoint. Check the **[Secret commands](cli-commands.md)** just below to learn how to create them.
:::

Here’s an example of an artifact attachment:

```bash
reshapr attach -f ../dev/github-api-prompts.yaml
```

```bash
✅ Attachment successful!
ℹ️  Discovered Artifact file with ID: 0NKVYHWSR9VPT
```

## Secret commands

### `reshapr secret create` command

Creating a **[Secret](../explanations/security-model.md)** just requires an argument that will be its `<name>` . You will also be able to provide a description using the `--description <description>` option. Moreover, the command proposes several options for providing the different elements of your **[Secrets](../explanations/security-model.md)**.

First, you can tag your Secret so that you’ll later know the target usage:

- `-A, --artifact` : Tags the Secret as being used for artifact retrieval on secured remote repositories,
- `-B, --backend` : Tags the Secret as being used for accessing a secure Backend Endpoint.

Then, depending on your Secret’s nature, you will have to use one or more of the following options:

- `-u, --username <username>` : When your remote endpoint is secured using HTTP Basic mechanism, you have to provide a username,
- `-p, --password <password>` : The password is the companion of the username when using HTTP Basic for authenticating to the resource.
- `-t, --token <token>` : When using token or API key-based authentication, you’d usually provide a token. If no additional `tokenHeader` is provided, it will be used as the value in an `Authorization: Bearer <token>` HTTP header.
- `-h, --tokenHeader <tokenHeader>` : When using token or API key based authentication, the token header will allow you to customize the HTTP header used to send the token value.
- `-c, --certificate <path>` : When accessing a TLS-secured endpoint, you may want to provide your specific X509 certificate using the PEM format.

Here’s below an example of a secret creation:

```bash
reshapr secret create my-secret --description 'A secret to access a super secured endpoint' -B \ 
-t acme_wXl53oz5gFeSmBt8awTUJI72yQSrtbMP -h x-acme-api-key --certificate ../certs/my-secret.pem
```

```bash
✅ Secret my-secret created successfully with ID: 0N084D4H90937
```

### `reshapr secret create-elicitation` command

This command is actually an alias of the `secret create` command, which allows the creation of an **[Elicitation](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation)**-based backend secret. Unlike a standard backend Secret, an Elicitation-based one does not require proactive provisioning: when needed, the reShapr MCP Server will return to the user to request backend credentials or initiate an OAuth authorization flow.

Like the `secret create` command, you have to assign your secret a `name` and an optional `description`. Two URL Elicitation flows are available: the [**URL Mode Elicitation for Sensitive Data**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data) and the [**URL Mode Elicitation for OAuth Flows**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows). Depending on the one you want to configure, you’ll have to use different options flags.

- For [**URL Mode Elicitation for Sensitive Data**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data), use the `-t, --token <token>` option flag to provide the name of the token collected from the user and set as a header to the backedn remote endpoint,
- For [**URL Mode Elicitation for OAuth Flows**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows), you have to provide **three mandatory options**:
- `--oc, --oauth2ClientID <oauth2ClientID>` : Allow to configure the client ID used for the third-party authorization server,
- `--oae, --oauth2AuthorizationEndpoint <authorizationEndpoint>` : Allow the specification of the Authorization endpoint for the backend authentication (including query parameters but without `clientID` and `redirect_uri` that will be added dynamically),
- `--ote, --oauth2TokenEndpoint <tokenEndpoint>` : Allow the configuration of the token exchange endpoint for the backend authentication.

Below is an example of how to create such an Elicitation-based Secret:

```bash
reshapr secret create-elicitation 3rd-party-oauth --oc reshapr-saas \
--oae https://idp.example.com/realms/3rdparty/protocol/openid-connect/auth\?scope\=openid\%20profile\&response_type\=code\&prompt\=login \
--ote https://idp.eample.com/realms/3rdparty/protocol/openid-connect/token
```

```bash
✅ Elicitation secret 3rd-party-oauth created successfully with ID: 0NWN2WHGEA2JP
```

You will then be able to use and reference this Secret when creating your Configuration Plan to enable Elicitation-based security.

## Configuration Plan commands

### `reshapr config create` command

This command proposes advanced options for configuring how your Service to be consumed and enabling different **[Security options](../explanations/security-model.md)**. A Configuration Plan has a mandatory `name` , so this is the first argument of the command: `reshapr config create <name>` . You can provide a more detailed description of your configuration plan goal using the `-d, --description` option in your command.

The primary goal of a Configuration Plan is to integrate a Service with a backend endpoint URL, where this existing Service or API will be utilized. For that, this command has **two mandatory options**:

- `-s, --serviceId <serviceId>` : Allow the specification of the Service using its unique identifier
- `--be, --backendEndpoint <backendEndpointURL>` : Allow the specification of this Service implementation endpoint URL

A Configuration plan allows you to restrict the Service operations your consumer will be able to list and use. You can choose the operations you want to include or exclude in the MCP server endpoint by using the `--filter` option. Below is an illustration of the flow:

```bash
reshapr config create github-issues-config -d 'GH issue-related operations config plan' -s 0N4B3WS9Z6KBV --be https://api.github.com/graphql --filter
```

The CLI will ask you if you want to proceed by choosing the operations you want to include or the operations you want to exclude:

```bash
The service GitHub GraphQL has 283 operation(s) available. You can filter them to include or exclude specific operations.
? Do you want to include or exclude operations? (Use arrow keys)
  No
❯ Include operations
  Exclude operations
```

And then let you select the operations in a list:

```bash
? Select operations to include: (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
 ◯ updateProjectColumn
 ◯ createCheckSuite
 ◯ createDiscussion
❯◉ pinIssue
 ◯ deleteRef
❯◉ createIssue
 ◯ createEnvironment
 ◯ updateEnterpriseMembersCanMakePurchasesSetting
 ◯ deletePullRequestReviewComment
 ◯ closePullRequest
```

Instead of doing things in an interactive way using the `--filter` option, you can also use the exclusive `--includedOperations` and `--excludedOperations` like detailed below:

- `--io, --includedOperations [<operation1>, <operation2>]` : Allow the configuration of included operations, only the ones listed here will be actually exposed on the MCP Server endpoint. The operations must be specify within an array like this: `--io '["operation1", "operation2"]'`
- `--eo, --excludedOperations [<operation1>, <operation2]` : Allow the specification of excluded operations, none of the ones listed here will be actually exposed on the MCP Server endpoint

Finally, you can use the Configuration plan to enable security options. Below are explanations of the options you may find:

- `--bs, --backendSecret <backendSecretId>` : Allow the specification of a Backend Secret to use when exposing an MCP Endpoint on gateways
- `--apiKey` : Allow the generation of an API key to secure access to an MCP endpoint exposed by gateways. The MCP client should then provide this API key to the server using an `x-reshapr-key` HTTP header. The API key will be provided just once during the creation of the Configuration Plan. You must store it in a safe place. You can later use the `renew-api-key` command to revoke existing API key and generate a new one
- `--internalOAuth2` : Allow to secure access to an MCP endpoint using OAuth 2 authorization backed by the *reShapr Internal OAuth Identity Provider*. This command registers an OAuth 2 Client ID dedicated to accessing future MCP endpoints for this Service. The Client ID will be provided just once during the creation of the Configuration Plan. You must store it in a safe place. You can later authenticate yourself with social providers using the `oauth2 auth-client <clientID>` command

### `reshapr config create-oauth` command

This command is actually an alias of the `config create` command, but with options focused on securing access to and an MCP endpoint using third-party OAuth 2 authorization servers. As such, `create-oauth` provides the same set of options for referring a Service, the implementation backend endpoint as well as the filtering options. It provides additional **mandatory flags** to configure the trust of access:

- `--oas, --oauth2AuthorizationServers [<authorizationServer1>, <authorizationServer2>]` : Allow the specification of one or many authorization servers URLs that represent valid issuer for Bearer tokens,
- `--oju, --oauth2jwksUri <jwksUri>` : Allow the configuration of the URI used for retrieving JSON Web Key Set for verifying the Bearer tokens signatures,
- `--osc, --oauth2Scopes [<scope1>, <scope2>]` : Allow the configuration of scopes that shoud ne present into the Bearer token to allow access to the MCP endpoint.

Below is an example on how to create a Configuration Plan with these security options:

```bash
reshapr config create-oauth 'oauth2-plan for Open-Meteo APIs' -s 0NTK2N8P7GMQR --be https://api.open-meteo.com \
--oas '["https://idp.example.com/realms/3rdparty"]' --oju https://idp.example.com/realms/3rdparty/protocol/openid-connect/certs \
--osc '["openid", "custom"]'
```

### `reshapr config renew-api-key` command

Given a Configuration Plan that was previously created with the `--apiKey` option, this command allows you to revoke the existing API key and have reShapr generate a new one. The new API key is immediately propagated to the gateway, exposing the associated MCP Endpoint configuration.

`reshapr config renew-api-key <configurationId>` will remove the existing API key and output a fresh API key that replaces it. The new API key is provided only once; you must store it in a secure location and share it only with trusted individuals.

## Structured output

Most of the CLI commands allow a `--output <format>`  option (or just `-o` for the short alternative) that allows you to format the output in either `json` or `yaml`. Using this flag option is extremely convenient, combined with utilities such as `jq` or `yq` , for automating publication or configuration changes on reShapr.

Here’s below an example:

```bash
reshapr service list -o json
```

```bash
[
  {
    "id": "0N0802V07SZEH",
    "organizationId": "reshapr",
    "name": "Open-Meteo APIs",
    "version": "1.0",
    "createdOn": "2025-09-19T14:35:58.591+00:00",
    "type": "REST"
  }
]
```

```bash
reshapr service get 0N0802V07SZEH -o json | jq .name
```

```bash
"Open-Meteo APIs"
```
