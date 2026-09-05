---
description: Assign, adjust, disable, and verify reShapr organization quotas through the Web UI, CLI, or administration API.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-05
---

# Assign and Monitor Organization Quotas

Use this guide to limit how many Expositions, Gateway Groups, and Gateway registrations an organization can create. You can manage the same quota records interactively in the Web UI, from an administrative script with the CLI, or through the administration API.

Quotas restrict resource counts. They do not rate-limit MCP requests or reserve CPU, memory, network, or database capacity. See **[Multi-tenancy and Administrative Governance](../../explanations/multi-tenancy-administrative-governance.md#quotas-govern-resource-counts)** for the tenancy and enforcement model.

## Prerequisites

You need:

- a reShapr `0.2.3` control plane and the name of an existing organization;
- the deployment-wide administration API key;
- reShapr CLI `0.2.3` for the CLI path;
- a deployed Web UI configured with its server-side administration API key for the Web UI path;
- `curl` and `jq` for the API path;
- a normal user session with membership in the target organization to perform the tenant-side verification.

Use **[Manage Organizations, Owners, and Memberships](./organizations-and-memberships.md)** first when the target organization or its user access does not exist yet.

Set the non-sensitive values used in the examples:

```bash
export RESHAPR_SERVER='https://app.reshapr.example.com'
export RESHAPR_ORGANIZATION='production'
```

The supported metrics are:

| Metric | Limited resource |
|---|---|
| `exposition.count` | Expositions |
| `gateway-group.count` | Gateway Groups |
| `gateway.count` | Active Gateway registrations |

An enabled quota with a limit of `0` prevents new consumption of that metric. A disabled quota remains visible but is not enforced.

## Choose an administration path

| Path | Use it when |
|---|---|
| Web UI | An administrator needs to inspect current usage and adjust limits interactively |
| CLI | A controlled script or one-off terminal operation needs to assign enabled flags and limits |
| Administration API | An administration service needs to read quotas or control how remaining capacity changes |

All three paths require platform-level administration authority. Organization ownership or membership alone does not grant access to these operations.

## Assign quotas with the Web UI

The Web UI keeps the administration API key on its server side. The browser session must belong to the built-in `reshapr` organization for the **Admin** navigation to be available.

1. Sign in to the Web UI with a platform administrator account.
2. Open **Admin**, then **Quotas**.
3. Search for and select the target organization.
4. Enable each metric that should be enforced.
5. Enter a non-negative integer limit for each enabled metric.
6. Review the usage gauge and the projected remaining capacity.
7. Select **Save Changes**.

The Web UI preserves the represented consumption when a limit changes. For example, if a quota has a limit of `10` and `3` remaining, increasing the limit to `15` produces `8` remaining.

## Assign quotas with the CLI

Retrieve the administration API key from your secret manager and expose it only to the administrative process:

```bash
set +x
export RESHAPR_ADMIN_API_KEY='<admin-api-key-from-your-secret-manager>'
```

Assign all three metrics and request structured output:

```bash
ASSIGNED_QUOTAS="$(
  reshapr admin --server "${RESHAPR_SERVER}" \
    quota assign "${RESHAPR_ORGANIZATION}" \
    --quotas '[
      {"metric":"exposition.count","enabled":true,"limit":10},
      {"metric":"gateway-group.count","enabled":true,"limit":3},
      {"metric":"gateway.count","enabled":true,"limit":3}
    ]' \
    --output json
  )"
```

Confirm that the response contains the requested limits:

```bash
jq -e --arg organization "${RESHAPR_ORGANIZATION}" '
  def quota($metric; $limit):
    any(.[];
      .organizationId == $organization
      and .metric == $metric
      and .enabled == true
      and .limit == $limit
    );
  quota("exposition.count"; 10)
  and quota("gateway-group.count"; 3)
  and quota("gateway.count"; 3)
' <<<"${ASSIGNED_QUOTAS}" >/dev/null
```

Unset the key when the administration step is complete:

```bash
unset RESHAPR_ADMIN_API_KEY
```

The CLI command uses the standard assignment API. New quota records start with `remaining` equal to `limit`. Updating an existing record changes `enabled` and `limit`, but increasing its limit does not increase its existing `remaining` value. Use the Web UI or the controlled API procedure below when increasing a limit must make the additional capacity immediately available.

## Manage quotas with the administration API

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

Read the organization's current quota state:

```bash
CURRENT_QUOTAS="$(
  curl --fail --silent --show-error \
    --config "${RESHAPR_CURL_CONFIG}" \
    "${RESHAPR_SERVER}/api/admin/quotas/organization/${RESHAPR_ORGANIZATION}"
)"

jq . <<<"${CURRENT_QUOTAS}"
```

The response is an array containing `organizationId`, `metric`, `enabled`, `limit`, and `remaining` for each assigned metric.

### Apply a standard assignment

The standard API has the same update behavior as `reshapr admin quota assign`. Omitted metrics remain unchanged:

```bash
QUOTA_REQUEST='[
  {"metric":"exposition.count","enabled":true,"limit":10},
  {"metric":"gateway-group.count","enabled":true,"limit":3},
  {"metric":"gateway.count","enabled":true,"limit":3}
]'

curl --fail --silent --show-error \
  --config "${RESHAPR_CURL_CONFIG}" \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "${QUOTA_REQUEST}" \
  "${RESHAPR_SERVER}/api/admin/quotas/organization/${RESHAPR_ORGANIZATION}" \
  | jq .
```

Set `enabled` to `false` for an assigned metric to stop enforcing it. Disabling a quota does not delete resources or reset its stored counters.

### Increase a limit while preserving consumption

The `/force` operation accepts an explicit `remaining` value. Calculate it from the current quota rather than guessing or resetting it to the new limit. This example increases `exposition.count` to `20` while preserving represented consumption:

```bash
export QUOTA_METRIC='exposition.count'
export NEW_LIMIT='20'

FORCED_REQUEST="$(
  jq -ce \
    --arg metric "${QUOTA_METRIC}" \
    --argjson newLimit "${NEW_LIMIT}" '
      [.[] | select(.metric == $metric)] as $matches
      | if ($matches | length) != 1 then
          error("assigned quota not found")
        else
          $matches[0]
          | (.limit - .remaining) as $used
          | [{
              metric,
              enabled: true,
              limit: $newLimit,
              remaining: ([$newLimit - $used, 0] | max)
            }]
        end
    ' <<<"${CURRENT_QUOTAS}"
  )"

curl --fail --silent --show-error \
  --config "${RESHAPR_CURL_CONFIG}" \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "${FORCED_REQUEST}" \
  "${RESHAPR_SERVER}/api/admin/quotas/organization/${RESHAPR_ORGANIZATION}/force" \
  | jq .
```

The force endpoint directly sets `remaining`. Restrict its use to administration code that first reads the current state and preserves the intended consumption. The Web UI performs this calculation when saving changes.

## Verify from the organization context

Authenticate a normal user who is a member of the target organization, then select that organization:

```bash
reshapr switch-org "${RESHAPR_ORGANIZATION}"
ORGANIZATION_QUOTAS="$(reshapr quotas --output json)"
```

Check that every supported metric is enabled and has non-negative remaining capacity no greater than its limit:

```bash
jq -e '
  length == 3
  and all(.[];
    .metric == "exposition.count"
    or .metric == "gateway-group.count"
    or .metric == "gateway.count"
  )
  and all(.[];
    .enabled == true
    and .remaining >= 0
    and .remaining <= .limit
  )
' <<<"${ORGANIZATION_QUOTAS}" >/dev/null
```

## Result

The target organization has explicit limits for Expositions, Gateway Groups, and Gateway registrations. Administrators can read and change them, while organization members can inspect their current limits and remaining capacity with `reshapr quotas` or the Web UI dashboard.

When an enabled quota reaches zero remaining, the corresponding create or first-registration operation is rejected. Deleting an Exposition or Gateway Group releases its unit; Gateway shutdown or stale-registration cleanup releases a Gateway unit.

## Limits

- The administration API key is global to the deployment, not scoped to the target organization.
- Quotas count resources; they do not provide request throttling, infrastructure reservations, or availability guarantees.
- Assigning or lowering a quota does not delete existing resources.
- The standard CLI and API update does not add to `remaining` when an existing limit is raised.
- The force API trusts the supplied `remaining` value and can make accounting inconsistent when callers do not preserve current consumption.
- Omitting a metric from an assignment leaves its existing quota unchanged.

## Next step

Use **[Automate reShapr with the CLI in CI/CD](../automate-with-cli-in-cicd.md)** to place quota checks around resource automation. Review **[Product Interfaces](../../references/interfaces.md)** to choose the canonical API or CLI reference for a deeper integration.

The release-tagged [administration API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-admin-ctrl-openapi-v0.1.yaml), [administrative CLI guide](https://github.com/reshaprio/reshapr/blob/0.2.3/cli/ADMIN_CLI.md), and [Web UI implementation](https://github.com/reshaprio/reshapr/tree/0.2.3/web-ui) remain the canonical interface references.