# Security options & Secrets

Security of MCP endpoints is a hot topic and let’s face it: a fast moving one! For that, reShapr has been designed to be flexible and allow many different security options. It has been implemented to allow evolution following the emerging best practices. 

In a nutshell, the security options we’ll expose just after will encompass two different concerns:

- The access of the MCP Endpoint exposed by a reShapr gateway itself,
- The access of the backend API used by the reShapr gateway once MCP endpoint access is safe.

![Capture d'écran 2025-09-11 à 13.29.20.png](security-model/Capture_decran_2025-09-11_a_13.29.20.png)

### MCP Endpoint access

Three different options are available to secure the MCP Server or Endpoint exposed by a reShapr gateway:

- **None** - which is the *default* and probably not a good idea! This means that the gateway endpoint is unsecured. In this situation, all headers are propagated to the backend API. So this is a scenario that you would use just for a quick test OR if you decide - with great generosity - to provide a free MCP Server to the world!
- **API Key** - means that the gateway will validate the value of the specific `x-reshapr-key` header in the incoming MCP requests. The API Key is generated  and transmitted just once at configuration time. It represents a token that you must store securely and must only share with trusted users. reShapr allows renewing an API Key and propagates the change to the gateways exposing the corresponding service.
- **OAuth2 Bearer** - means that the gateway will validate the OAuth2 token provided as a `Bearer` in the `Authorization` header in the incoming requests. During the configuration time, you choose your OAuth2 Authorization Servers and the list of required scopes to access the MCP Server. This information is propagated to the gateways that will be in charge of trusting the incoming tokens. reShapr gateways implements the different specifications mentioned in the [Model Context Protocol Version 2025-06-18 Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) recommendations such as:
    - OAuth 2.0 Protected Resource Metadata ([**RFC9728**](https://datatracker.ietf.org/doc/html/rfc9728))
    - OAuth 2.0 Authorization Server Metadata ([**RFC8414**](https://datatracker.ietf.org/doc/html/rfc8414))
    - OAuth 2.0 Resource Indicators ([**RFC 8707**](https://www.rfc-editor.org/rfc/rfc8707.html))
    

> 💡 *In case you don’t have an OAuth 2 Authorization Server at hand, reShapr provides its own* **Internal OAuth2 IDP** *that can be used to host OAuth clients using the OAuth 2.0 Dynamic Client Registration Protocol ([**RFC7591**](https://datatracker.ietf.org/doc/html/rfc7591)). The reShapr IDP is delegates authentication to social identity providers so that you can secure their access to your MCP Server.*
> 

### Backend Secrets

In addition to protecting the MCP Endpoint or Server, access to the backend API must also be protected. This backend must have a means to validate authentication and authorization proofs coming from the reShapr gateway. 

For this purpose, reShapr supports the concept of `Secret`, which enables the secure storage of information on how to authenticate the backend API call. In reShapr, a Secret can contain different information:

- **A username/password pair** - in case the backend API only supports HTTP Basic authentication mechanisms. An `Authorization:  Basic <base64(username:password)>` header will be automatically issued and transmitted to the backend API.
- **A token (with an optional associated header)** -  in case the backend support API Key or token-based authentication mechanisms. If no token header is provided then the default `Authorization: Bearer <token>`  is assumed and transmitted to the backend API but token header can hold any value.
- **A X509 certificate** - that will be used to secure the transport, in case the backend API is enforcing TLS communication with client-side certificate.

reShapr also supports **Elicitation-based backend secret**. [Elicitations](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation) are a recent addition to the MCP Protocol, coming in version `2025-11-25` of the protocol. Unlike a standard backend Secret, an Elicitation-based one does not require proactive provisioning: when needed, the reShapr MCP Server will return to the user to request backend credentials or initiate an OAuth authorization flow. Two different flows are supported:

- The [**URL Mode Elicitation for Sensitive Data**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-sensitive-data) - in case your User has its own token/API key/authorization code to access the backend API.
- The [**URL Mode Elicitation for OAuth Flows**](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation#url-mode-elicitation-for-oauth-flows) - in case your User has to complete an OAuth / OIDC authorization flow to enable the MCP Server to get an authorization code to access the backend API.

### All together!

MCP Endpoint security options and backend secret are not exclusive, and they’d rather be combined to secure the transmission chain from end to end. To achieve fully secure and authorized usage of your MCP Endpoint provided by reShapr, we recommend considering OAuth2 + Elicitation-based backend Secret when you configure your [S](services-and-artifacts.md)ervice for exposure on a reShapr gateway.

[Back to Home](../index.mdx)