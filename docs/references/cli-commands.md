---
description: Full reference for reShapr CLI commands — login, import, attach, config, expo, secrets, gateway management, and more.
---

# reShapr CLI Reference

## Authentication commands

### `reshapr login` command

The login command authenticates you against a reShapr control plane. Depending on the server configuration (SaaS, on-premises with OIDC, or on-premises with local credentials), the CLI will automatically select the appropriate authentication flow.

```bash
reshapr login [options]
```

Available options:

- `-u, --username <username>` : Your reShapr username (for password-based login)
- `-p, --password <password>` : Your reShapr password (for password-based login)
- `-o, --org <org>` : Your reShapr organization name
- `-s, --server <server>` : Your reShapr Control Plane URL (defaults to `https://try.reshapr.io`)
- `-k, --insecure` : Skip SSL certificate validation
- `--password-stdin` : Read password from stdin (mutually exclusive with `-p`)

:::info
For SaaS or OIDC-enabled on-premises servers, the CLI will automatically open your browser for the authorization flow. A temporary local server is started to receive the authentication callback.
:::

Here's an example of logging in to a local on-premises server:

```bash
reshapr login --server http://localhost:5555
```

For non-interactive environments (CI/CD), you can pipe the password from stdin:

```bash
echo "$RESHAPR_PASSWORD" | reshapr login -u admin --password-stdin --server http://localhost:5555
```

### `reshapr logout` command

The logout command clears your local authentication session.

```bash
reshapr logout
```

### `reshapr info` command

The info command displays information about your current authentication context and the connected reShapr server.

```bash
reshapr info
```

```bash
ℹ️  User Information
  User        : admin
  Organization: my-org
  Server      : https://try.reshapr.io
ℹ️  Server Information
  Version     : 0.0.11
  Build time  : 2025-05-10T08:30:00Z
  Mode        : saas
  Internal IDP: https://idp.reshapr.io
```

## Artifact commands

### `reshapr import` command

The import command allows to push (or have reShapr pull) a new artifact into reShapr. This will allow it to discover a new Service as explained in **[Services & Artifacts](../explanations/services-and-artifacts.md)**.

First, you have to tell reShapr how to proceed for retrieving this artifact. You can use:

- `-f, --file <path>` to reference a local file you want to upload,
- `-u, --url <url>` to ask the reShapr control plane to download a remote file.

:::info
When specifying a remote URL with the `-u` option, it can also be useful to specify a Secret with the `-s, --secret <artifactSecret>` to authorize the access to the remote endpoint. Check the **[Secret commands](cli-commands.md)** just below to learn how to create them.
:::

The discovery of the artifact Service is automatic for **[OpenAPI 3.x](https://www.openapis.org/)** specs and **[gRPC/Protobuf](https://grpc.io/)** definitions. By default, reShapr will use the identification elements (`name` and `version`) found in the artifact. You can, however, decide to override these information by using the additional `--sn, --serviceName <name>` and  `--sv, --serviceVersion <version>` options.

:::warning
The discovery of Service from **[GraphQL](https://graphql.org/)**  schemas need some more help. Here, the additional `--sn, --serviceName <name>` and  `--sv, --serviceVersion <version>` options are mandatory. If not specified, the import will fail.
:::

When importing an artifact Service, you may also choose not to consider all the different operations that will be discovered. Perhaps you want to restrict it to read-only access, or maybe your existing API is too coarse-grained, and you want to filter on a single domain. Whatever the reason, you can configure this with the following options:

- `--io, --includedOperations [<operation1>, <operation2>]` : Allow specifying a list of operations to consider. Example: `--io '["createLabel", "createIssue"]'` ,
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

Here's an example of an artifact attachment:

```bash
reshapr attach -f ../dev/github-api-prompts.yaml
```

```bash
✅ Attachment successful!
ℹ️  Discovered Artifact file with ID: 0NKVYHWSR9VPT
```

### `reshapr artifact list` command

Available since version `0.0.11` of the CLI, the artifact list command lets you list all artifacts associated with a given Service.

```bash
reshapr artifact list -s <serviceId>
```

Available options:

- `-s, --serviceId <id>` (required) : Filter artifacts by service ID
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr artifact list -s 0N2G4YZFDD3ZF
```

```bash
ID             NAME                  TYPE                        MAIN
0NKVYHWSR9VPT  github-api.graphql    GRAPHQL_SCHEMA              Yes
0NKVZAB12X3YZ  github-api-prompts    RESHAPR_PROMPTS              No
```

### `reshapr artifact get` command

Available since version `0.0.11` of the CLI, this command retrieves details of a specific artifact by its ID.

```bash
reshapr artifact get <id> [options]
```

Available options:

- `-d, --display` : Display the artifact content (syntax-highlighted)
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr artifact get 0NKVYHWSR9VPT
```

```bash
ℹ️  Artifact details
ID           : 0NKVYHWSR9VPT
Name         : github-api.graphql
Organization : my-org
Service ID   : 0N2G4YZFDD3ZF
Type         : GRAPHQL_SCHEMA
Main Artifact: Yes
Source       : github-api.graphql
Path         : N/A
```

## Service commands

### `reshapr service list` command

Lists all services registered in your organization.

```bash
reshapr service list [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr service list
```

```bash
ID             NAME               VERSION  TYPE     AGE
0N0802V07SZEH  Open-Meteo APIs    1.0      REST     3d
0N2G4YZFDD3ZF  GitHub GraphQL     20250917 GRAPHQL  1d
```

### `reshapr service get` command

Retrieves detailed information about a specific service, including all discovered operations.

```bash
reshapr service get <id> [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr service get 0N0802V07SZEH
```

```bash
ℹ️  Service details
ID          : 0N0802V07SZEH
Name        : Open-Meteo APIs
Version     : 1.0
Organization: my-org
Type        : REST
Created     : 2025-09-19T14:35:58.591+00:00
Operations :
  - Name: GET /v1/forecast
  - Name: GET /v1/historical
```

### `reshapr service delete` command

Deletes a service by its ID. This will also remove all associated artifacts, configuration plans, and expositions.

```bash
reshapr service delete <id> [options]
```

Available options:

- `-f, --force` : Skip confirmation prompt

:::warning
Deleting a service is a destructive operation. All associated artifacts, configuration plans, and expositions will also be removed.
:::

```bash
reshapr service delete 0N0802V07SZEH
```

```bash
? Deleting this service will also remove associated artifacts, config plans & expositions. Are you sure you want to proceed? Yes
✅ Service 0N0802V07SZEH deleted successfully.
```

## Secret commands

### `reshapr secret create` command

Creating a **[Secret](../explanations/security-model.md)** just requires an argument that will be its `<name>` . You will also be able to provide a description using the `--description <description>` option. Moreover, the command proposes several options for providing the different elements of your **[Secrets](../explanations/security-model.md)**.

First, you can tag your Secret so that you'll later know the target usage:

- `-A, --artifact` : Tags the Secret as being used for artifact retrieval on secured remote repositories,
- `-B, --backend` : Tags the Secret as being used for accessing a secure Backend Endpoint.

Then, depending on your Secret's nature, you will have to use one or more of the following options:

- `-u, --username <username>` : When your remote endpoint is secured using HTTP Basic mechanism, you have to provide a username,
- `-p, --password <password>` : The password is the companion of the username when using HTTP Basic for authenticating to the resource.
- `-t, --token <token>` : When using token or API key-based authentication, you'd usually provide a token. If no additional `tokenHeader` is provided, it will be used as the value in an `Authorization: Bearer <token>` HTTP header.
- `-h, --tokenHeader <tokenHeader>` : When using token or API key based authentication, the token header will allow you to customize the HTTP header used to send the token value.
- `-c, --certificate <path>` : When accessing a TLS-secured endpoint, you may want to provide your specific X509 certificate using the PEM format.

Here's below an example of a secret creation:

```bash
reshapr secret create my-secret --description 'A secret to access a super secured endpoint' -B \ 
-t acme_wXl53oz5gFeSmBt8awTUJI72yQSrtbMP -h x-acme-api-key --certificate ../certs/my-secret.pem
```

```bash
✅ Secret my-secret created successfully with ID: 0N084D4H90937
```

### `reshapr secret create-elicitation` command

This command is actually an alias of the `secret create` command, which allows the creation of an **[Elicitation](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation)**-based backend secret. Unlike a standard backend Secret, an Elicitation-based one does not require proactive provisioning: when needed, the reShapr MCP Server will return to the user to request backend credentials or initiate an OAuth authorization flow.

Like the `secret create` command, you have to assign your secret a `name` and an optional `description`. Two URL Elicitation flows are available: the [**URL Mode Elicitation for Sensitive Data**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data) and the [**URL Mode Elicitation for OAuth Flows**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows). Depending on the one you want to configure, you'll have to use different options flags.

- For [**URL Mode Elicitation for Sensitive Data**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data), use the `-t, --token <token>` option flag to provide the name of the token collected from the user and set as a header to the backend remote endpoint,
- For [**URL Mode Elicitation for OAuth Flows**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows), you have to provide **three mandatory options** (plus one optional):
  - `--oc, --oauth2ClientID <oauth2ClientID>` : Allow to configure the client ID used for the third-party authorization server,
  - `--ocs, --oauth2ClientSecret <oauth2ClientSecret>` : Allow to specify the client secret for the backend authorization service (if required by the authorization server),
  - `--oae, --oauth2AuthorizationEndpoint <authorizationEndpoint>` : Allow the specification of the Authorization endpoint for the backend authentication (including query parameters but without `clientID` and `redirect_uri` that will be added dynamically),
  - `--ote, --oauth2TokenEndpoint <tokenEndpoint>` : Allow the configuration of the token exchange endpoint for the backend authentication.

Below is an example of how to create such an Elicitation-based Secret:

```bash
reshapr secret create-elicitation 3rd-party-oauth --oc reshapr-saas \
--oae https://idp.example.com/realms/3rdparty/protocol/openid-connect/auth\?scope\=openid\%20profile\&response_type\=code\&prompt\=login \
--ote https://idp.example.com/realms/3rdparty/protocol/openid-connect/token
```

```bash
✅ Elicitation secret 3rd-party-oauth created successfully with ID: 0NWN2WHGEA2JP
```

You will then be able to use and reference this Secret when creating your Configuration Plan to enable Elicitation-based security.

### `reshapr secret list` command

Lists all secrets in your organization.

```bash
reshapr secret list [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr secret list
```

```bash
ID             NAME              TYPE      DESCRIPTION
0N084D4H90937  my-secret         ENDPOINT  A secret to access a super secured endpoint
0NWN2WHGEA2JP  3rd-party-oauth   ENDPOINT  
```

### `reshapr secret get` command

Retrieves details of a specific secret by its ID.

```bash
reshapr secret get <id> [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr secret get 0N084D4H90937
```

```bash
ℹ️  Secret details
ID          : 0N084D4H90937
Name        : my-secret
Organization: my-org
Type        : ENDPOINT
Token       : acme_wXl53oz5gFeSmBt8awTUJI72yQSrtbMP
Token Header: x-acme-api-key
Description : A secret to access a super secured endpoint
```

### `reshapr secret update` command

Opens an interactive editor to update a secret's properties. Immutable fields (ID, organization) are preserved automatically.

```bash
reshapr secret update <id>
```

### `reshapr secret delete` command

Deletes a secret by its ID.

```bash
reshapr secret delete <id>
```

```bash
✅ Secret deleted successfully: 0N084D4H90937
```

## Configuration Plan commands

### `reshapr config list` command

Lists all configuration plans in your organization.

```bash
reshapr config list [options]
```

Available options:

- `-s, --serviceId <id>` : Filter by service ID
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr config list
```

```bash
ID             NAME                            SERVICE        BACKEND                          API_KEY  OAUTH2_CONFIG
0N4B3WS9Z6KBV github-issues-config            0N2G4YZFDD3ZF https://api.github.com/graphql   Yes      No
```

### `reshapr config get` command

Retrieves detailed information about a specific configuration plan.

```bash
reshapr config get <id> [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr config get 0N4B3WS9Z6KBV
```

```bash
ℹ️  Configuration plan details
ID              : 0N4B3WS9Z6KBV
Name            : github-issues-config
Organization    : my-org
Description     : GH issue-related operations config plan
Service ID      : 0N2G4YZFDD3ZF
Backend Endpoint: https://api.github.com/graphql
Backend Timeout : 30000 ms
Included Ops.   : ["pinIssue","createIssue"]
Excluded Ops.   : []
Backend Secret  : No
API Key         : Yes
OAuth2          : No
```

### `reshapr config create` command

This command proposes advanced options for configuring how your Service to be consumed and enabling different **[Security options](../explanations/security-model.md)**. A Configuration Plan has a mandatory `name` , so this is the first argument of the command: `reshapr config create <name>` . You can provide a more detailed description of your configuration plan goal using the `-d, --description` option in your command.

The primary goal of a Configuration Plan is to integrate a Service with a backend endpoint URL, where this existing Service or API will be utilized. For that, this command has **two mandatory options**:

- `-s, --serviceId <serviceId>` : Allow the specification of the Service using its unique identifier
- `--be, --backendEndpoint <backendEndpointURL>` : Allow the specification of this Service implementation endpoint URL

You can also configure a timeout for requests to the backend endpoint:

- `--bt, --backendTimeout <backendTimeout>` : Timeout in milliseconds for requests to the backend endpoint. Must be a positive number.

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

- `--io, --includedOperations [<operation1>, <operation2>]` : Allow the configuration of included operations, only the ones listed here will be actually exposed on the MCP Server endpoint. The operations must be specified within an array like this: `--io '["operation1", "operation2"]'`
- `--eo, --excludedOperations [<operation1>, <operation2>]` : Allow the specification of excluded operations, none of the ones listed here will be actually exposed on the MCP Server endpoint

Finally, you can use the Configuration plan to enable security options. Below are explanations of the options you may find:

- `--bs, --backendSecret <backendSecretId>` : Allow the specification of a Backend Secret to use when exposing an MCP Endpoint on gateways
- `--apiKey` : Allow the generation of an API key to secure access to an MCP endpoint exposed by gateways. The MCP client should then provide this API key to the server using an `x-reshapr-key` HTTP header. The API key will be provided just once during the creation of the Configuration Plan. You must store it in a safe place. You can later use the `renew-api-key` command to revoke existing API key and generate a new one
- `--internalOAuth2` : Allow to secure access to an MCP endpoint using OAuth 2 authorization backed by the *reShapr Internal OAuth Identity Provider*. This command registers an OAuth 2 Client ID dedicated to accessing future MCP endpoints for this Service. The Client ID will be provided just once during the creation of the Configuration Plan. You must store it in a safe place. You can later authenticate yourself with social providers using the `oauth2 auth-client <clientID>` command

### `reshapr config create-oauth` command

This command is actually an alias of the `config create` command, but with options focused on securing access to an MCP endpoint using third-party OAuth 2 authorization servers. As such, `create-oauth` provides the same set of options for referring a Service, the implementation backend endpoint as well as the filtering options. It provides additional **mandatory flags** to configure the trust of access:

- `--oas, --oauth2AuthorizationServers [<authorizationServer1>, <authorizationServer2>]` : Allow the specification of one or many authorization servers URLs that represent valid issuer for Bearer tokens,
- `--oju, --oauth2jwksUri <jwksUri>` : Allow the configuration of the URI used for retrieving JSON Web Key Set for verifying the Bearer tokens signatures,
- `--osc, --oauth2Scopes [<scope1>, <scope2>]` : Allow the configuration of scopes that should be present into the Bearer token to allow access to the MCP endpoint.

Like `config create`, it also supports the `--bt, --backendTimeout <backendTimeout>` option to configure the backend endpoint timeout in milliseconds.

Below is an example on how to create a Configuration Plan with these security options:

```bash
reshapr config create-oauth 'oauth2-plan for Open-Meteo APIs' -s 0NTK2N8P7GMQR --be https://api.open-meteo.com \
--oas '["https://idp.example.com/realms/3rdparty"]' --oju https://idp.example.com/realms/3rdparty/protocol/openid-connect/certs \
--osc '["openid", "custom"]'
```

### `reshapr config update` command

Opens an interactive editor to update an existing configuration plan. Immutable fields (ID, organization) are preserved automatically.

```bash
reshapr config update <id>
```

### `reshapr config renew-api-key` command

Given a Configuration Plan that was previously created with the `--apiKey` option, this command allows you to revoke the existing API key and have reShapr generate a new one. The new API key is immediately propagated to the gateway, exposing the associated MCP Endpoint configuration.

`reshapr config renew-api-key <configurationId>` will remove the existing API key and output a fresh API key that replaces it. The new API key is provided only once; you must store it in a secure location and share it only with trusted individuals.

### `reshapr config delete` command

Deletes a configuration plan by its ID. This may also remove associated expositions.

```bash
reshapr config delete <id> [options]
```

Available options:

- `-f, --force` : Skip confirmation prompt

:::warning
Deleting a configuration plan may also remove associated expositions.
:::

```bash
reshapr config delete 0N4B3WS9Z6KBV
```

```bash
? Deleting this config plan may also remove associated expositions. Are you sure you want to proceed? Yes
✅ Configuration plan 0N4B3WS9Z6KBV deleted successfully.
```

## Exposition commands

### `reshapr expo list` command

Lists all expositions in your organization. By default, only active expositions are shown.

```bash
reshapr expo list [options]
```

Available options:

- `-a, --all` : Display also inactive expositions
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr expo list
```

```bash
ID             SERVICE                    BACKEND                          ENDPOINTS                                                  AGE
0N2G4Z0ASD034  GitHub GraphQL:20250917    https://api.github.com/graphql   mcp.beta.reshapr.io                                       1d
```

### `reshapr expo get` command

Retrieves detailed information about a specific exposition, including its active gateway endpoints.

```bash
reshapr expo get <id> [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr expo get 0N2G4Z0ASD034
```

```bash
ℹ️  Exposition details
ID          : 0N2G4Z0ASD034
Created on  : 2025-09-26T14:43:37.686+00:00
Organization: my-org
Service:
  ID     : 0N2G4YZFDD3ZF
  Name   : GitHub GraphQL
  Version: 20250917
  Type   : GRAPHQL
Configuration Plan
  ID             : 0N4B3WS9Z6KBV
  Name           : default-plan for GitHub GraphQL
  BackendEndpoint: https://api.github.com/graphql
  Included Ops.  : []
  Excluded Ops.  : []
Gateway Group
  ID    : 1
  Name  : default
  Labels: {}
Gateway Endpoints
  - ID       : gw-001
    Name     : mcp-gateway
    Endpoints: mcp.beta.reshapr.io/mcp/my-org/GitHub+GraphQL/20250917
```

### `reshapr expo create` command

Creates a new exposition by associating a Configuration Plan with a Gateway Group.

```bash
reshapr expo create [options]
```

Available options:

- `-c, --configuration <id>` (required) : Configuration Plan ID to use
- `-g, --gateway-group <id>` (required) : Gateway Group ID to use
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr expo create -c 0N4B3WS9Z6KBV -g 1
```

```bash
✅ Exposition created successfully with ID: 0N2G4Z0ASD034
```

### `reshapr expo delete` command

Deletes an exposition by its ID.

```bash
reshapr expo delete <id>
```

```bash
✅ Exposition 0N2G4Z0ASD034 deleted successfully.
```

## Gateway Group commands

### `reshapr gateway-group list` command

Lists all gateway groups in your organization.

```bash
reshapr gateway-group list [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr gateway-group list
```

```bash
ID             ORG       NAME       LABELS
1              my-org    default    {}
0N5X2AB9CD3EF  my-org    staging    {"env":"staging"}
```

### `reshapr gateway-group create` command

Creates a new gateway group with an optional set of labels for gateway matching.

```bash
reshapr gateway-group create <name> [options]
```

Available options:

- `-l, --labels <labels>` : JSON map of key-value labels for the gateway group
- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr gateway-group create production -l '{"env":"production","region":"eu-west-1"}'
```

```bash
✅ Gateway group 'production' created successfully with ID: 0N7Y3CD8EF4GH
```

### `reshapr gateway-group delete` command

Deletes a gateway group by its ID.

```bash
reshapr gateway-group delete <id>
```

```bash
✅ Gateway group with ID '0N7Y3CD8EF4GH' deleted successfully.
```

## API Token commands

### `reshapr api-token list` command

Lists all API tokens in your organization. API tokens are used by gateways to register and authenticate with the control plane.

```bash
reshapr api-token list
```

```bash
ID             NAME              VALID UNTIL
0N9A4EF0GH5IJ  gateway-token-1   Mon, 15 Dec 2025 00:00:00 GMT
```

### `reshapr api-token create` command

Creates a new API token for gateway registration.

```bash
reshapr api-token create <name> [options]
```

Available options:

- `-v, --validity-days <days>` : Number of days the token is valid for (choices: `1`, `7`, `30`, `90`; defaults to `30`)

```bash
reshapr api-token create my-gateway-token -v 90
```

```bash
⚠️  The API Token to register Gateway is: my-org-a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
⚠️  Make sure to store it securely, as it will not be shown again.
```

### `reshapr api-token delete` command

Deletes an API token by its ID.

```bash
reshapr api-token delete <tokenId> [options]
```

Available options:

- `-f, --force` : Skip confirmation prompt

:::warning
Deleting an API token will prevent gateways that use it from connecting to reShapr.
:::

```bash
reshapr api-token delete 0N9A4EF0GH5IJ
```

```bash
? Deleting this API token will prevent Gateways that use it to connect to Reshapr. Are you sure you want to proceed? Yes
ℹ️  API token with ID 0N9A4EF0GH5IJ deleted successfully.
```

## Quota commands

### `reshapr quotas` command

Lists and checks your reShapr quotas, showing limits and remaining capacity for each metered resource.

```bash
reshapr quotas [options]
```

Available options:

- `-o, --output <format>` : Output format (`json`, `yaml`)

```bash
reshapr quotas
```

```bash
ORG       METRIC                   ENABLED  LIMIT  REMAINING
my-org    services                 Y        5      3
my-org    expositions              Y        10     8
my-org    gateway-groups           Y        3      2
```

## Local execution commands

### `reshapr run` command

Starts reShapr locally using Docker Compose (or Podman Compose). The CLI downloads the appropriate compose file from the GitHub repository for the specified release, caches it locally, and starts the containers.

```bash
reshapr run [options]
```

Available options:

- `-r, --release <release>` : Release of the containers to run (defaults to `latest`; use `nightly` for the latest development build)
- `-e, --engine <engine>` : Container engine to use (`docker` or `podman`)

```bash
reshapr run
```

```bash
ℹ️  Resolved 'latest' to release '0.0.11'.
ℹ️  Downloading compose file from https://raw.githubusercontent.com/reshaprio/reshapr/refs/tags/0.0.11/install/docker-compose-all-in-one.yml...
✅ Compose file saved to ~/.reshapr/docker-compose-0.0.11.yml
ℹ️  Starting Reshapr containers (release: 0.0.11, engine: docker)...
✅ Reshapr containers started successfully.
```

To use a specific release with Podman:

```bash
reshapr run -r 0.0.10 -e podman
```

### `reshapr status` command

Shows the status of locally running reShapr containers.

```bash
reshapr status
```

```bash
ℹ️  Reshapr containers (release: 0.0.11, engine: docker, started at: 2025-05-18T10:30:00.000Z)
NAME                    IMAGE                                           STATUS
reshapr-control-plane   registry.reshapr.io/reshapr/control-plane:0.0.11   Up 2 hours
reshapr-proxy           registry.reshapr.io/reshapr/proxy:0.0.11           Up 2 hours
```

### `reshapr stop` command

Stops locally running reShapr containers and removes the run state.

```bash
reshapr stop
```

```bash
ℹ️  Stopping Reshapr containers (release: 0.0.11, engine: docker)...
✅ Reshapr containers stopped successfully.
```

## Structured output

Most of the CLI commands allow a `--output <format>`  option (or just `-o` for the short alternative) that allows you to format the output in either `json` or `yaml`. Using this flag option is extremely convenient, combined with utilities such as `jq` or `yq` , for automating publication or configuration changes on reShapr.

Here's below an example:

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
