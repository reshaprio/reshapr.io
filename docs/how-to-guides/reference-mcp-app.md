---
description: Reference a remotely hosted MCP App from a Resources artifact and associate its UI with an exposed Tool.
release_review:
  runtime: 1.2.0
  date: 2026-11-20
  scope: release-tagged MCP App sample review; no compatible host replay
---

# Reference an MCP App

Use a **Resources artifact** to associate an exposed Tool with an MCP App, such as a GitHub user widget. reShapr references the UI and serves its Resource content through MCP; an Apps-capable host renders it. It does not turn an arbitrary web page into an MCP App or provide application hosting.

This guide targets reShapr **1.2.0**. The [released GitHub MCP App sample](https://github.com/reshaprio/reshapr/tree/1.2.0/dev/github-user-mcp-app) contains the frontend and its build configuration. The associated [Custom Tools](https://github.com/reshaprio/reshapr/blob/1.2.0/dev/github-api-custom-tools.yaml) and [Resources](https://github.com/reshaprio/reshapr/blob/1.2.0/dev/github-api-resources.yaml) artifacts are separate files.

## Prerequisites

- An existing Service and Exposition with the Tool to associate, tested independently.
- An MCP Apps-capable host. A client that only supports ordinary Tools and Resources will not necessarily render an App.
- An MCP App HTML bundle hosted at a URL reachable **from the proxy**, with network access allowed by your deployment policy.

For the GitHub sample, use the Service name, version, and Tool names from the released artifacts. The sample's `localhost:3030` is a developer example, not a deployment default: inside a proxy container, `localhost` refers to that container.

## Define the UI Resource

Create a Resources artifact bound to your Service. The values below are examples; replace them to match the imported Service, exposed Tool, UI host, and actual required asset origins:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: Resources
service:
  name: GitHub GraphQL
  version: '20250917'
resources:
  'ui://user/mcp-app.html':
    name: GitHub user widget
    description: Display GitHub user information
    mimeType: text/html;profile=mcp-app
    remoteContent: https://apps.example.com/github/mcp-app.html
    _meta:
      ui:
        csp:
          resourceDomains:
            - https://avatars.githubusercontent.com
    tools:
      - get_user_with_latest_followers:
          visibility:
            - app
            - model
```

`ui://user/mcp-app.html` identifies the MCP Resource; `remoteContent` is the URL from which the proxy obtains its HTML. The `tools` association adds UI metadata to the named Tool. `visibility` and CSP metadata are hints consumed by the host, not backend authorization or an egress policy enforced by reShapr.

Only reference UI content and origins you trust. The proxy fetches remote content and the host runs the UI under its own sandbox and permission policy. Do not embed backend credentials in HTML or Resource metadata.

## Attach and select the artifact

Attach the file to the Service using the [artifact workflow](./select-reshapr-artifacts.md). If the Plan restricts `includedArtifacts`, include both the Resources artifact and any Custom Tools artifact defining the associated Tool. Ensure operation selection leaves that Tool available.

Use `TOOLS` or `HYBRID` exposure when the host needs to discover the native Tool's UI metadata. In `CODE`, `tools/list` advertises the three Code Mode meta-tools instead of native Tool definitions; do not assume an App host can discover the association through them.

## Verify the association

Using the Exposition's existing authenticated MCP connection:

1. Call `resources/list` and find the `ui://` Resource with MIME type `text/html;profile=mcp-app`.
2. Call `resources/read` with that URI. Confirm HTML content is returned and that proxy-to-UI-host connectivity works.
3. Call `tools/list` and inspect the associated Tool's `_meta.ui` Resource association.
4. In an Apps-capable host, call the Tool and confirm that its UI renders and can consume the result.

See [Test an MCP endpoint](./test-mcp-endpoint.md) for transport headers and authentication. If Resource reads fail, check the remote URL from the proxy network. If HTML is returned but no UI renders, check host support, the Tool association, selected artifacts, CSP origins, and the host's browser console.

For the declarative fields, see [Resources](../references/resources-specification.md). Resource discovery alone does not prove that a particular client supports MCP Apps.