---
description: Create reShapr organizations and manage their owners and user memberships through the Web UI, CLI, or administration API.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-05
---

# Manage Organizations, Owners, and Memberships

Use this guide to create an organization, assign its owner, and grant existing users access. The Web UI supports the common interactive workflow, while the CLI and administration API cover repeatable operations and membership changes for existing users.

An owner and a member serve different purposes. Ownership is administrative metadata for one user. Membership controls whether a user can select the organization for normal product API calls. Assigning an owner also adds that user as a member, but replacing memberships later can remove that access without changing the recorded owner.

## Prerequisites

You need:

- a reShapr `0.2.3` control plane;
- the deployment-wide administration API key;
- at least one existing user to assign as owner or member;
- reShapr CLI `0.2.3` for the CLI path;
- a deployed Web UI configured with its server-side administration API key for the Web UI path;
- `curl` and `jq` for the API path;
- access to a target user's normal login flow for the final membership check.

Set the non-sensitive values used in the examples:

```bash
export RESHAPR_SERVER='https://app.reshapr.example.com'
export RESHAPR_ORGANIZATION='production'
export OWNER_USERNAME='platform-owner'
export MEMBER_USERNAME='release-engineer'
```

Organization names in `0.2.3` contain only letters, digits, and underscores, with a maximum length of 100 characters.

## Choose an administration path

| Path | Supported workflow in `0.2.3` |
|---|---|
| Web UI | Create organizations, assign or replace owners, create local users, and assign memberships during local-user creation |
| CLI | Create organizations with or without an owner and replace all memberships of an existing user |
| Administration API | Create organizations, assign or replace owners, and replace all memberships of an existing user |

The Web UI does not provide a membership editor for an existing user in `0.2.3`. Use the CLI or API for that operation.

## Create and delegate with the Web UI

The Web UI keeps the administration API key on its server side. The browser session must belong to the built-in `reshapr` organization for the **Admin** navigation to be available.

1. Sign in to the Web UI with a platform administrator account.
2. Open **Admin**, then **Organizations**.
3. Select **New Organization**.
4. Enter the name and optional description and icon URL, then select **Create Organization**.
5. Open the new organization's actions menu and select **Assign owner**.
6. Select an existing user and confirm the assignment.

Assigning the owner also adds that organization to the user's memberships. If the user had no default organization, it becomes their default.

To create a local user and assign memberships in the same workflow:

1. Open the **Users** tab and select **New User**.
2. Enter the username, email, optional profile fields, and a password when the control plane handles authentication directly.
3. In the second step, select every organization the new user should join.
4. Select **Assign Memberships**.

The local-user creation action is not displayed when the Web UI uses another authentication mode. Memberships for an already existing local or federated user must be changed with the CLI or API.

## Create an organization with the CLI

Retrieve the administration API key from your secret manager and expose it only to the administrative process:

```bash
set +x
export RESHAPR_ADMIN_API_KEY='<admin-api-key-from-your-secret-manager>'
```

Create an organization and assign an existing owner in one operation:

```bash
ORGANIZATION="$(
  reshapr admin --server "${RESHAPR_SERVER}" \
    organization create "${RESHAPR_ORGANIZATION}" \
    --description 'Production services' \
    --owner "${OWNER_USERNAME}" \
    --output json
)"
```

Confirm the returned organization:

```bash
jq -e --arg name "${RESHAPR_ORGANIZATION}" \
  '.name == $name' <<<"${ORGANIZATION}" >/dev/null
```

Omit `--owner` to create an unowned organization. The CLI does not expose a command for assigning or replacing the owner of an existing organization in `0.2.3`; use the Web UI or administration API for that operation.

## Replace memberships with the CLI

`membership set` replaces the user's complete membership list. Build the desired final state from your authoritative identity or access configuration; do not pass only the organization being added.

For example, to preserve an existing `development` membership and add `production`:

```bash
export DESIRED_MEMBERSHIPS='["development","production"]'

ASSIGNED_MEMBERSHIPS="$(
  reshapr admin --server "${RESHAPR_SERVER}" \
    membership set "${MEMBER_USERNAME}" \
    --organizations "${DESIRED_MEMBERSHIPS}" \
    --output json
)"

jq -e \
  --arg organization "${RESHAPR_ORGANIZATION}" \
  'index($organization) != null' \
  <<<"${ASSIGNED_MEMBERSHIPS}" >/dev/null
```

The response echoes the requested organization names. It does not prove that every submitted name existed and was persisted. Complete the effective-access check below before considering the change successful.

Unset the administration key when the operation is complete:

```bash
unset RESHAPR_ADMIN_API_KEY
```

## Manage organizations with the administration API

Avoid placing the administration key directly in a `curl` command argument. Store the header in a mode-`0600` temporary configuration file:

```bash
set +x
export RESHAPR_ADMIN_API_KEY='<admin-api-key-from-your-secret-manager>'
export RESHAPR_CURL_CONFIG="$(mktemp)"
chmod 600 "${RESHAPR_CURL_CONFIG}"
printf 'header = "x-reshapr-api-key: %s"\n' "${RESHAPR_ADMIN_API_KEY}" \
  >"${RESHAPR_CURL_CONFIG}"
unset RESHAPR_ADMIN_API_KEY
trap 'rm -f "${RESHAPR_CURL_CONFIG}"' EXIT
```

### Create an unowned organization

```bash
ORGANIZATION_REQUEST="$(
  jq -n \
    --arg name "${RESHAPR_ORGANIZATION}" \
    --arg description 'Production services' \
    '{name: $name, description: $description}'
)"

curl --fail --silent --show-error \
  --config "${RESHAPR_CURL_CONFIG}" \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "${ORGANIZATION_REQUEST}" \
  "${RESHAPR_SERVER}/api/admin/organizations" \
  | jq .
```

The operation returns `409 Conflict` when the organization name already exists.

### Assign or replace the owner

The owner API expects the username as a JSON string:

```bash
OWNER_REQUEST="$(jq -Rn --arg username "${OWNER_USERNAME}" '$username')"

curl --fail --silent --show-error \
  --config "${RESHAPR_CURL_CONFIG}" \
  --request PUT \
  --header 'Content-Type: application/json' \
  --data "${OWNER_REQUEST}" \
  "${RESHAPR_SERVER}/api/admin/organizations/${RESHAPR_ORGANIZATION}/owner" \
  | jq -e \
      --arg organization "${RESHAPR_ORGANIZATION}" \
      --arg owner "${OWNER_USERNAME}" \
      '.name == $organization and .ownerUsername == $owner'
```

This operation also adds the organization to the new owner's memberships. It does not remove the previous owner's membership.

### Replace an existing user's memberships

Send the complete desired list, not an incremental addition:

```bash
export DESIRED_MEMBERSHIPS='["development","production"]'

curl --fail --silent --show-error \
  --config "${RESHAPR_CURL_CONFIG}" \
  --request PUT \
  --header 'Content-Type: application/json' \
  --data "${DESIRED_MEMBERSHIPS}" \
  "${RESHAPR_SERVER}/api/admin/users/${MEMBER_USERNAME}/memberships" \
  | jq -e \
      --arg organization "${RESHAPR_ORGANIZATION}" \
      'index($organization) != null'
```

An empty array removes all memberships from that user. In `0.2.3`, this operation does not reconcile organization ownership, update the user's default organization, or expose a dedicated read endpoint for the user's complete membership list. Preserve the intended list in an authoritative source outside this write-only workflow.

## Verify effective membership

The final check must run as the target user, not with the administration API key. Authenticate through that user's normal flow, then select the organization:

```bash
reshapr switch-org "${RESHAPR_ORGANIZATION}"
reshapr info
```

`switch-org` exits non-zero with `403` when the authenticated user is not a member. A successful switch produces a new user token scoped to the target organization; `reshapr info` confirms the active context.

Repeat this check for the owner and every member whose access is required. It catches unknown organization names that the `0.2.3` membership replacement endpoint can otherwise omit from persistence while echoing the submitted list.

## Result

The organization exists with an explicit owner, and each intended user can select it for normal product operations. The complete membership state remains controlled outside reShapr so future replacement operations preserve required access.

## Limits

- The administration API key is global to the deployment, not scoped to one organization.
- Ownership does not provide physical infrastructure isolation or replace membership checks.
- `membership set` and its API endpoint replace all memberships; they are not additive operations.
- The Web UI `0.2.3` assigns memberships only during local-user creation and cannot edit an existing user's memberships.
- The `0.2.3` administration API does not expose a dedicated operation for reading a user's complete memberships.
- Membership replacement does not update the user's default organization.
- Membership replacement can remove an owner's access without clearing the organization's owner field.
- Creating or assigning an organization does not provision compute, storage, network policy, or a dedicated database schema.
- Organization deletion is destructive and cascades across owned resources; follow the offboarding guidance before using it.

## Next step

Use **[Assign and Monitor Organization Quotas](./organization-quotas.md)** to bound the resources the new organization can create. Review **[Multi-tenancy and Administrative Governance](../../explanations/multi-tenancy-administrative-governance.md)** for isolation, identity, and offboarding boundaries.

The release-tagged [administration API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-admin-ctrl-openapi-v0.1.yaml), [administrative CLI guide](https://github.com/reshaprio/reshapr/blob/0.2.3/cli/ADMIN_CLI.md), and [Web UI implementation](https://github.com/reshaprio/reshapr/tree/0.2.3/web-ui) remain the canonical interface references.