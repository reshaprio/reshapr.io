---
description: Connect the reShapr control plane to an external OpenID Connect provider for federated Web UI and CLI user authentication.
verification:
  product: reShapr
  version: 1.0.0 / Helm charts 0.0.14
  date: 2026-09-22
---

# Connect the Control Plane to an OIDC Provider

Use an external OpenID Connect (OIDC) provider when users must authenticate to the reShapr control plane through your organization's identity system. The same configuration enables browser login for the Web UI and `reshapr login`.

This is control-plane user authentication. It is separate from **[OAuth protection for an MCP endpoint](./security/oauth.md)** and from OAuth credentials used to call a backend.

:::warning Remaining security limitation
The control plane validates final redirect URIs, uses opaque single-use login and onboarding states stored in Hazelcast, verifies the ID-token `nonce`, and rejects expired ID and access tokens. However, it does not bind the login state to the initiating browser session. It also reads identity claims by decoding the returned access token without independently verifying its JWT signature, issuer, or audience.

Do not treat this flow as suitable for an untrusted, publicly reachable production login until those checks are added. Registering an exact callback URI at the identity provider and configuring the reShapr redirect allow-list are separate requirements.
:::

## Prerequisites

You need:

- reShapr control-plane and Web UI images `1.0.0`, with control-plane chart `0.0.14`;
- an OIDC provider reachable from user browsers and the control-plane pods;
- permission to register an [OAuth 2.0 Authorization Code](https://www.rfc-editor.org/rfc/rfc6749#section-4.1) client at that provider;
- public HTTPS URLs for the control plane and, when used, the Web UI;
- `helm`, `kubectl`, `curl`, and `jq`;
- an existing reShapr organization if first-time users should bypass onboarding.

Set the deployment inputs used below:

```bash
export RESHAPR_NAMESPACE='reshapr-system'
export RESHAPR_CTRL_PUBLIC_URL='https://ctrl.reshapr.example.com'
export RESHAPR_WEBUI_PUBLIC_URL='https://app.reshapr.example.com'
export OIDC_AUTHORIZATION_ENDPOINT='https://idp.example.com/realms/platform/protocol/openid-connect/auth'
export OIDC_TOKEN_ENDPOINT='https://idp.example.com/realms/platform/protocol/openid-connect/token'
```

The authorization endpoint is opened by the user's browser. The token endpoint is called by the control plane and can use a different network address when your identity provider supports that topology.

## Register the OIDC client

Create a confidential OIDC client at the identity provider with:

- Authorization Code as the allowed grant;
- this exact redirect URI:

  ```text
  https://ctrl.reshapr.example.com/auth/callback/oidc
  ```

- the standard `openid`, `profile`, and `email` scopes;
- ID and access tokens encoded as compact JWTs with an `exp` claim;
- `preferred_username` in the access token;
- `email` in the access token when a new user can enter onboarding.

reShapr requires both tokens returned by the token endpoint. It verifies the login `nonce` and expiration on the `id_token`, verifies expiration on the `access_token`, and reads identity and authorization claims from the `access_token`. Configure claim mappers accordingly. Optional access and organization rules can also require `groups` or custom claims.

Store the client credentials without placing the secret in the Helm values file:

```bash
read -r -p 'OIDC client ID: ' OIDC_CLIENT_ID
read -r -s -p 'OIDC client secret: ' OIDC_CLIENT_SECRET; printf '\n'

kubectl --namespace "${RESHAPR_NAMESPACE}" apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: reshapr-control-plane-oidc
type: Opaque
stringData:
  client-id: "${OIDC_CLIENT_ID}"
  client-secret: "${OIDC_CLIENT_SECRET}"
EOF

unset OIDC_CLIENT_ID OIDC_CLIENT_SECRET
```

## Configure the control plane

Add the following values to the control-plane release. `RESHAPR_CTRL_PUBLIC_URL` is the externally reachable base URL from which reShapr constructs the identity-provider callback:

```yaml
ctrl:
  extraEnv:
    - name: RESHAPR_CTRL_PUBLIC_URL
      value: https://ctrl.reshapr.example.com

authentication:
  idp:
    enabled: true
    url: https://idp.example.com/realms/platform/protocol/openid-connect/auth
    tokenUrl: https://idp.example.com/realms/platform/protocol/openid-connect/token
    existingSecret: reshapr-control-plane-oidc
    clientIdKey: client-id
    clientSecretKey: client-secret
    allowedRedirectUris:
      - https://app.reshapr.example.com/api/auth/callback/oidc
    allowCliLoopbackRedirect: true
```

`allowedRedirectUris` contains exact final browser callbacks, not the identity-provider callback. The control plane rejects other HTTPS destinations. CLI login uses a separate constrained rule for HTTP loopback callbacks on `localhost`, `127.0.0.1`, or `::1`, using ports `5556-5599`; set `allowCliLoopbackRedirect: false` when CLI browser login is not required.

When the Web UI is enabled through the control-plane chart and `reshapr-web-ui.publicUrl` is set, the chart automatically adds its `/api/auth/callback/oidc` URL. Explicit entries are preserved and duplicates are removed.

Apply the values through the same Helm release workflow that owns the control plane, then wait for its Deployment to complete its rollout. OIDC configuration is read at startup; it is not changed through the administration API.

Confirm that the public callback resolves to the control-plane ingress and that the bootstrap endpoint advertises OIDC:

```bash
curl --fail --silent --show-error \
  "${RESHAPR_CTRL_PUBLIC_URL}/api/config" \
  | jq -e '.oidcEnabled == true'
```

## Configure the Web UI

Keep the internal control-plane URL for server-side API calls and configure its separate browser-reachable URL for OIDC redirects:

```yaml
controlPlane:
  url: http://reshapr-control-plane-ctrl:5555
  publicUrl: https://ctrl.reshapr.example.com

publicUrl: https://app.reshapr.example.com
```

The chart maps these values to `RESHAPR_CTRL_URL`, `RESHAPR_CTRL_PUBLIC_URL`, and `RESHAPR_WEBUI_PUBLIC_URL`. The Web UI uses the internal URL for server-side calls and the public URL for the browser redirect. If `controlPlane.publicUrl` is empty, it falls back to `controlPlane.url`.

Apply the values to the Web UI Helm release and wait for its Deployment rollout. The Web UI sends users to the public control-plane login endpoint and requests this final callback:

```text
https://app.reshapr.example.com/api/auth/callback/oidc
```

Open `https://app.reshapr.example.com/login`, select the OIDC login action, and authenticate with a test account. A known user is redirected to the application. A first-time user follows the onboarding behavior described below.

## Restrict who can sign in

Use an access guard when only a subset of identity-provider users may access reShapr. A group rule expects an exact value in the access token's `groups` array; for Keycloak compatibility, reShapr also accepts the same value with a leading `/`:

```yaml
authentication:
  idp:
    guardAccess:
      group: reshapr-users
```

A claim rule uses a `name=value` expression:

```yaml
authentication:
  idp:
    guardAccess:
      claim: reshaprAllowed=true
```

When both rules are configured, the access token must satisfy both. A rejected Web UI or CLI login returns `access_denied` to the initiating client.

## Choose first-login behavior

Without a default organization rule, a first-time OIDC user receives an onboarding form that creates a new organization and initializes its onboarding quotas. The access token must contain `preferred_username` and `email` for this path.

To attach first-time users to an existing organization and skip that form, configure one or more resolvers:

```yaml
authentication:
  idp:
    defaultOrganization:
      claim: reshaprOrg
      groupPrefix: reshapr-org
      value: shared_platform
```

The control plane tries the claim first, then the first `groups` entry with the configured prefix, and finally the fixed value. The resolved organization must already exist. If it does not, reShapr falls back to onboarding.

Use **[Manage Organizations, Owners, and Memberships](./administration/organizations-and-memberships.md)** to create the organization and manage access after the user has signed in.

## Verify CLI login

Run login against the public control-plane URL:

```bash
reshapr login --server "${RESHAPR_CTRL_PUBLIC_URL}"
```

The CLI reads `/api/config`, starts a temporary callback listener on `localhost`, and opens the browser automatically. After identity-provider authentication, it stores the returned reShapr token and reports the selected organization.

Verify the resulting context without printing the token:

```bash
reshapr info
```

Repeat the Web UI and CLI checks with an account that should fail the configured access guard.

## Result

OIDC is enabled when `/api/config` returns `oidcEnabled: true`, a permitted test user can complete Web UI and CLI login, and a denied test user receives `access_denied`. For first-time users, also verify that the expected onboarding or existing-organization attachment occurred.

## Limits

- The browser-session binding and token-signature, issuer, and audience limitations in the warning above apply to both Web UI and CLI login.
- reShapr requires compact JWT ID and access tokens. Identity claims available only in the `id_token`, or an opaque access token, will not work.
- The control plane requests `openid profile email` and appends any comma-separated `authentication.idp.scopes` values.
- A configured default organization must already exist; the resolver does not create it.
- OIDC configuration requires a control-plane restart through the deployment rollout.
- The provider-specific client, consent, claims, group, and session configuration remains owned by your identity provider.

reShapr `1.0.0` and Helm charts `0.0.14` are the first tagged baseline documented here that includes the redirect allow-list and separate Web UI public control-plane URL.

## Next step

Review **[Multi-tenancy and Administrative Governance](../explanations/multi-tenancy-administrative-governance.md)** to decide how federated identities should receive organization access. Use **[Protect an MCP Endpoint with OAuth 2.0](./security/oauth.md)** when the next task is authenticating MCP clients rather than control-plane users.

The release-tagged [OIDC controller flow](https://github.com/reshaprio/reshapr/blob/1.0.0/control-plane/src/main/java/io/reshapr/ctrl/security/AuthenticationController.java), [token claim validation](https://github.com/reshaprio/reshapr/blob/1.0.0/commons/src/main/java/io/reshapr/security/OidcUtils.java), [login state store](https://github.com/reshaprio/reshapr/blob/1.0.0/control-plane/src/main/java/io/reshapr/ctrl/security/OidcLoginStateStore.java), [Web UI URL resolver](https://github.com/reshaprio/reshapr/blob/1.0.0/web-ui/src/lib/server/auth.ts), and [control-plane chart values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.14/control-plane/values.yaml) own the behavior described here.