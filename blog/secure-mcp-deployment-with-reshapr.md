---
title: "Secure MCP Deployment with reShapr"
date: 2025-09-26
authors:
  - yacine
  - laurent
description: "How reShapr enables secure, multi-tenant MCP deployment with authentication, authorization, and enterprise-grade access controls."
image: /img/blog/secure-deployment-1.png
tags: [Security, MCP, Enterprise, OAuth, Authentication, Authorization, Multi-Tenant, Hybrid, On-Prem, API, Deployment, Zero Trust]
---

<!-- markdownlint-disable MD001 MD026 MD030 MD045 -->

The [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) (MCP) experimentation is growing rapidly in the Enterprise for individual users, primarily using single-tenant MCP servers.

**Moving towards remote HTTP and multi-tenant MCP Servers seems ineluctable**, as it offers control to run only trusted MCP servers and resource rationalization to avoid waste and data dissemination.

However, envisioning a generalization of the tools and protocols at scale raises a lot of questions for enterprise-readiness and adoption:

- How do we **authenticate the communication** between the MCP client and the MCP server?
- How do we **authorize or deny access** to specific tools/resources/prompts for a user on the MCP server?
- How do we **call upstream APIs on behalf of a user** from our MCP server?
- How to **proceed flexibly**, encompassing different deployment topologies and trust boundaries?

reShapr « No-Code MCP Server » has been designed with all these concerns and constraints at the core to offer a flexible approach to security in MCP server execution.

In this blog post, we’ll examine the different options proposed by the reShapr MCP solution.

<!-- truncate -->

### Not all topologies are equal: reShapr deployment flexibility to the rescue!

Enterprise infrastructure and deployment topologies may vary. Not all situations are equivalent in terms of security boundaries, and therefore, the constraints and applicable solutions for securing an MCP server deployment infrastructure may vary. reShapr has been designed from the ground up to be fully flexible, allowing you to bring the right solution to the right place.

At the time of writing, reShapr can be used as a **fully Cloud-based solution**: it is deployed in its own trust domain, and your MCP client can sit in your organization’s trust domain, too. Depending on the upstream backend API you’re using, you may also need to access a third-party upstream trust domain. That’s a lot of security boundaries to manage.

![reShapr cloud-based deployment topology showing MCP client in the organization trust domain, reShapr in its own trust domain, and upstream backend API in a third-party trust domain](/img/blog/secure-deployment-1.png)

Within these security domains, you’ll find the essential pieces to secure the access and invocations of this chain of exchanges: the organization’s internal Identity Provider, the upstream service Identity Provider, and the **reShapr Authz** component, which will play a pivotal role in the options we’ll discuss in the rest of this article.

But that’s not the only way to use reShapr! The next iteration will introduce **the Hybrid mode**! In this mode, reShapr Gateway will be able to enter your organization’s trust domain to interact closely with your identity provider.

![reShapr hybrid deployment topology with the gateway inside the organization trust domain, closer to the internal identity provider](/img/blog/secure-deployment-2.png)

This move will be even more significant during the third iteration, when we’ll release the **full On-Premises mode,** allowing you to have finer control over your security boundaries. Given the fact that a massive part of the MCP Server use-cases is made by the re-use/re-encapsulation of internal APIs, this leads us to an even more controlled environment, as represented below:

![reShapr full on-premises deployment topology with all components inside the organization trust domain for maximum security control](/img/blog/secure-deployment-3.png)

> You can see it easily now: the diversity of situations and **use cases opens the way to a palette of security mechanisms** that can make sense in some situations or feel totally over-engineered in others. And that’s where our flexibility shines!

### Options for MCP Server authorization

reShapr offers a range of options for authorization of MCP Server endpoints. Three options are available today:

#### Option 1: None

This is the _default_ and probably “not a good idea”! It means that the reShapr endpoint is unsecured on its own. We assign the client the responsibility of acquiring the backend API credentials and transmitting them, typically using HTTP headers. This option is very convenient for testing purposes when you want to get quick feedback on how MCP acts as a translation layer on top of the existing backend API.

However, the MCP server spec’s [“Security Best Practices” doc](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices#token-passthrough) explicitly calls this « token passthrough » an anti-pattern, as it leads to some downsides: unclear security boundaries, potential transfer of tokens to other MCP servers or other tenants if the server is tricked, and difficult auditing and attribution of server calls.

> ⚠️ This is a scenario that you would use just for a quick test, OR if you decide, with generosity, to provide a free MCP Server to the world (See our [Open-Meteo demo](https://youtu.be/W1xfiBpGzI0?si=bsd77MU65eGeEOzZ))!

#### Option 2: Using an API Key

reShapr can provide/revoke/renew API keys to secure its MCP server endpoint. The API Key is generated and transmitted just once at configuration time. It represents a token that must be stored securely and shared only with trusted users. This option is lightweight and offers the user some control over their keys, and protects your MCP endpoints from external attacks.

However, it’s still the users’ responsibility to store and distribute them as they want. Moreover, a shared API key between MCP clients doesn’t track information on the authenticated user and whether it has authorization to access specific tools/resources/prompts on the MCP server. This makes the implementation of audit and attribution concerns difficult.

#### Option 3: OAuth Bearer

Using this option, the reShapr MCP server will apply recommendations from the [MCP Authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization) to utilize OAuth2 standards for securing access to endpoints. reShapr can integrate with your own OAuth 2.0 Authorization Server. More precisely, it implements all the following specs:

- OAuth 2.1 / PKCE support (public OAuth clients)
- OAuth 2.0 Protected Resource Metadata ([RFC9728](https://datatracker.ietf.org/doc/html/rfc9728))
- OAuth 2.0 Authorization Server Metadata ([RFC8414](https://datatracker.ietf.org/doc/html/rfc8414))
- OAuth 2.0 Resource Indicators ([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html))

> 💡 In case you don’t have an OAuth 2 Authorization Server at hand, reShapr provides its own **reShapr Authz** that can be used to host OAuth clients using the OAuth 2.0 Dynamic Client Registration Protocol ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)). The reShapr IDP delegates authentication to social identity providers, allowing you to secure access to your MCP Server.

This option provides the most control over the authorization levels you want to set up: it controls the token’s validity, the issuer’s correctness, the targeted resource’s correctness, and the presence of required scopes or attributes. Hence, that’s typically the option to choose when restricting and controlling access to specific tools/resources/prompts.

### Options for Backend API authentication

Until now, we have only addressed the authentication/authorization between the MCP client and MCP server, and the MCP Authorization spec does not specify much in the way of MCP server-to-backend API calls. To address that part, reShapr proposes a solution named **Backend Secrets**. Backend secrets are provided during configuration time, securely stored, and synchronized on the reShapr runtime, which exposes endpoints that require them. At the time of writing, backend secrets can take three different forms; however, we envision additional options in the future.

#### Option 1: HTTP Basic

As the name suggests, this is the most basic form of backend authentication: a secret that wraps a `username` and a `password` is exchanged with the upstream trust domain, but is never seen by the MCP client. It’s far from ideal, but it’s designed to support even older or legacy APIs.

#### Option 2: Service account Token

This option allows wrapping a token or API key acquired by a service account, or a robot account (or an admin one), into a reShapr secret. It can take any form, and you can configure the HTTP header used to propagate it to the MCP Server. This option is widely spread with cloud-based services. It’s not ideal as it erases privileges and prevents RBAC depending on users.

#### Option 3: X509 certificate for transport

This is not a completely different option, but rather an addition to previous forms of secrecy: you can provide a certificate that will be used to secure the transport in case the backend API enforces TLS communication with a client-side certificate.

### Future options

Among the options we’re thinking about, the following two options are at the top of our list:

- The declaration, translation and transmission of backend credentials that the MCP client would have provided. It would need to provide two credentials: one for the MCP endpoint and another for the backend. reShapr would be in charge of validating both to avoid “confused deputy” effects and ease auditability.
- The use of [URL elicitations](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1036) for interacting with the MCP client and dynamically retrieving a backend access token (credit to [Christian Posta](https://www.linkedin.com/in/ceposta/) for [the brilliant explanation here](https://blog.christianposta.com/mcp-authorization-patterns-upstream-api-calls/#pattern-4-protocol-support-for-url-elicitation)).

### Wrap-up

We’re convinced that MCP adoption at scale in the enterprise will span various deployment and security boundaries. That’s why we designed **reShapr with flexibility in mind**, allowing you to choose the solution (or, more precisely, a combination of options) that best fits your needs and security concerns, while integrating with a wide range of credential forms.

**The reShapr MCP endpoint security options and backend secret are designed to be combined to secure the entire transmission chain.**
