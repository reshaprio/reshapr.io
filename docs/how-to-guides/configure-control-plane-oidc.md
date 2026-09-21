---
description: Connect the reShapr control plane to an external OpenID Connect provider for federated Web UI and CLI user authentication.
verification:
  product: reShapr
  version: 1.0.0-rc1 / Helm charts 0.0.13
  date: 2026-09-21
---

# Connect the Control Plane to an OIDC Provider

Use an external OpenID Connect (OIDC) provider when users must authenticate to the reShapr control plane through your organization's identity system. The same configuration enables browser login for the Web UI and `reshapr login`.

This is control-plane user authentication. It is separate from **[OAuth protection for an MCP endpoint](./security/oauth.md)** and from OAuth credentials used to call a backend.

:::warning Security limitation in 1.0.0-rc1
The control-plane callback accepts the client-supplied final `redirect_uri`, carries it in an unsigned `state` value, and returns the generated reShapr token to that URI. It does not bind or compare the random value included in `state`. The control plane also reads identity claims by decoding the returned access token without independently verifying its JWT signature, issuer, audience, or expiration.

Do not treat this release as suitable for an untrusted, publicly reachable production login flow. Limit it to a controlled environment and trusted clients until these checks are added. Registering an exact callback URI at the identity provider remains necessary, but does not constrain the separate final redirect performed by reShapr.
:::

## Prerequisites

You need:

- reShapr `1.0.0-rc1` deployed with the control-plane Helm chart `0.0.13`;
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
- an access token encoded as a JWT;
- `preferred_username` in the access token;
- `email` in the access token when a new user can enter onboarding.

reShapr consumes the `access_token` returned by the token endpoint, not the `id_token`. Configure claim mappers accordingly. Optional access and organization rules can also require `groups` or custom claims.

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
```

Apply the values through the same Helm release workflow that owns the control plane, then wait for its Deployment to complete its rollout. OIDC configuration is read at startup; it is not changed through the administration API.

Confirm that the public callback resolves to the control-plane ingress and that the bootstrap endpoint advertises OIDC:

```bash
curl --fail --silent --show-error \
  "${RESHAPR_CTRL_PUBLIC_URL}/api/config" \
  | jq -e '.oidcEnabled == true'
```

## Configure the Web UI

When the Web UI is deployed with `1.0.0-rc1`, set its control-plane URL to the public URL that a user's browser can resolve:

```yaml
controlPlane:
  url: https://ctrl.reshapr.example.com

publicUrl: https://app.reshapr.example.com
```

The Web UI also has a `controlPlane.publicUrl` chart value, but `1.0.0-rc1` does not read the corresponding `RESHAPR_CTRL_PUBLIC_URL` environment variable when it builds the OIDC login redirect. Using the public URL as `controlPlane.url` is the release-compatible workaround; the Web UI pod must therefore be able to reach that address for its server-side API calls too.

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

- The `1.0.0-rc1` redirect and token-validation limitations in the warning above apply to both Web UI and CLI login.
- The `1.0.0-rc1` Web UI ignores `controlPlane.publicUrl` for OIDC login; use the public address as `controlPlane.url` until the wiring is corrected.
- reShapr expects identity claims in a JWT `access_token`; an opaque access token or claims available only in an `id_token` will not work.
- The control plane requests `openid profile email` and appends any comma-separated `authentication.idp.scopes` values.
- A configured default organization must already exist; the resolver does not create it.
- OIDC configuration requires a control-plane restart through the deployment rollout.
- The provider-specific client, consent, claims, group, and session configuration remains owned by your identity provider.

## Next step

Review **[Multi-tenancy and Administrative Governance](../explanations/multi-tenancy-administrative-governance.md)** to decide how federated identities should receive organization access. Use **[Protect an MCP Endpoint with OAuth 2.0](./security/oauth.md)** when the next task is authenticating MCP clients rather than control-plane users.

The release-tagged [OIDC controller flow](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/control-plane/src/main/java/io/reshapr/ctrl/security/AuthenticationController.java), [identity-provider configuration](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/control-plane/src/main/java/io/reshapr/ctrl/config/AuthenticationIdentityProviderConfig.java), [token exchange helper](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/commons/src/main/java/io/reshapr/security/OidcUtils.java), [CLI login flow](https://github.com/reshaprio/reshapr/blob/1.0.0-rc1/cli/src/commands/login.ts), [control-plane chart values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.13/control-plane/values.yaml), and [Web UI chart values](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.13/web-ui/values.yaml) own the behavior described here.