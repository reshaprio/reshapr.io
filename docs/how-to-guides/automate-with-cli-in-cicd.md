---
description: Build a repeatable CI/CD workflow with the reShapr CLI, structured output, explicit checks, and controlled deletion.
verification:
  product: reShapr CLI
  version: 0.2.3
  date: 2026-09-04
---

# Automate reShapr with the CLI in CI/CD

Use this guide to import or update an API definition from a CI job without parsing human-readable output. The workflow authenticates through standard input, records existing state, runs the idempotent import path, and fails unless the resulting Service, Configuration Plan, and Exposition satisfy explicit postconditions.

reShapr provides scriptable CLI and API operations. It does not provide a native CI/CD pipeline, automatic drift detection, deployment approval, or rollback orchestration.

## Prerequisites

You need:

- Node.js 20 or later and reShapr CLI `0.2.3` installed in the job image;
- a reShapr `0.2.3` control plane and a running Gateway in the default Gateway Group;
- a dedicated automation identity restricted to the target organization;
- the identity password stored as a masked CI secret;
- an OpenAPI 3, GraphQL, or Protobuf source tracked by the build;
- a backend endpoint reachable from the selected Gateway;
- Bash and `jq`.

This example uses password authentication for an on-premises control plane. Adapt the authentication stage when your deployment uses another supported identity flow.

Set non-sensitive job inputs as CI variables:

```bash
export RESHAPR_SERVER='https://app.reshapr.example.com'
export RESHAPR_USERNAME='ci-release'
export RESHAPR_ORGANIZATION='production'
export SERVICE_NAME='Weather API'
export SERVICE_VERSION='1.0.0'
export API_DEFINITION='openapi/weather.yaml'
export BACKEND_ENDPOINT='https://weather-api.production.example.com'
```

Expose the password to the job as `RESHAPR_PASSWORD` through the CI platform's secret mechanism. Do not commit it or include it in a command argument.

## Prepare an isolated CLI home

The CLI stores its session under `$HOME/.reshapr/config`. Give each job an isolated home directory and restrict its permissions:

```bash
export HOME="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/reshapr-ci-${CI_JOB_ID:-$$}"
mkdir -p "${HOME}"
chmod 700 "${HOME}"
```

Do not cache or publish this directory as a job artifact. Remove it in the CI platform's unconditional cleanup stage.

## Authenticate without a password argument

Disable shell tracing before reading or forwarding a secret. Pipe the password to `--password-stdin`:

```bash
set +x
printf '%s\n' "${RESHAPR_PASSWORD}" \
  | reshapr login \
      --username "${RESHAPR_USERNAME}" \
      --password-stdin \
      --org "${RESHAPR_ORGANIZATION}" \
      --server "${RESHAPR_SERVER}"
unset RESHAPR_PASSWORD
reshapr switch-org "${RESHAPR_ORGANIZATION}"
```

The CLI writes its bearer token to a mode-`0600` configuration file. `switch-org` replaces it with a token for the target organization and fails if the user is not a member. Confirm that subsequent authenticated calls work:

```bash
reshapr info
```

An invalid credential, unreachable server, expired token, or malformed response causes the CLI to exit non-zero. Stop the job rather than treating those failures as an absent resource.

## Record existing state

Start the deployment stage in strict mode:

```bash
set -euo pipefail
```

Request structured output and normalize the empty-account case because `service list --output json` writes no document when the organization has no Services:

```bash
SERVICE_LIST="$(reshapr service list --output json)"
if [[ -z "${SERVICE_LIST}" ]]; then
  SERVICE_LIST='[]'
fi

EXISTING_SERVICE_ID="$(
  jq -er \
    --arg name "${SERVICE_NAME}" \
    --arg version "${SERVICE_VERSION}" \
    'first(.[] | select(.name == $name and .version == $version) | .id) // ""' \
    <<<"${SERVICE_LIST}"
)"

if [[ -n "${EXISTING_SERVICE_ID}" ]]; then
  printf 'Updating Service %s\n' "${EXISTING_SERVICE_ID}"
else
  printf 'Creating Service %s:%s\n' "${SERVICE_NAME}" "${SERVICE_VERSION}"
fi
```

An empty lookup is expected state. A failed `reshapr service list` is not: strict mode stops the job before any deployment command runs.

## Import or update the Service

Run the same command for creation and update:

```bash
IMPORT_RESULT="$(
  reshapr import \
    --file "${API_DEFINITION}" \
    --serviceName "${SERVICE_NAME}" \
    --serviceVersion "${SERVICE_VERSION}" \
    --backendEndpoint "${BACKEND_ENDPOINT}" \
    --output json
)"
```

For the same Service name and version, release `0.2.3` updates the imported Service instead of creating a duplicate. With `--backendEndpoint`, it creates the `default` Configuration Plan and Exposition when absent, then reuses them on later imports.

Validate the complete structured result before using any identifier:

```bash
jq -e \
  --arg name "${SERVICE_NAME}" \
  --arg version "${SERVICE_VERSION}" \
  --arg backend "${BACKEND_ENDPOINT}" \
  '.service.id != null
   and .service.name == $name
   and .service.version == $version
   and .configurationPlan.id != null
   and .configurationPlan.name == "default"
   and .configurationPlan.backendEndpoint == $backend
  and .exposition.id != null
  and (.endpoints | length > 0)' \
  <<<"${IMPORT_RESULT}" >/dev/null

export SERVICE_ID="$(jq -er '.service.id' <<<"${IMPORT_RESULT}")"
export CONFIGURATION_PLAN_ID="$(jq -er '.configurationPlan.id' <<<"${IMPORT_RESULT}")"
export EXPOSITION_ID="$(jq -er '.exposition.id' <<<"${IMPORT_RESULT}")"
unset IMPORT_RESULT SERVICE_LIST
```

If the existing `default` Plan targets another backend, `import --backendEndpoint` deliberately retains that value. The assertion then fails. Changing an existing Plan through `reshapr config update` opens an interactive editor in `0.2.3`; use a separately reviewed API operation or a controlled replacement workflow instead of automating the editor.

## Verify the postconditions

Confirm that a previous lookup, when present, resolved to the same Service:

```bash
if [[ -n "${EXISTING_SERVICE_ID}" && "${EXISTING_SERVICE_ID}" != "${SERVICE_ID}" ]]; then
  printf 'Service identity changed unexpectedly\n' >&2
  exit 1
fi
```

Fetch the Service and Exposition independently. `service get` emits the Service directly. `expo get` combines the Exposition with its active Gateways and computed endpoints:

```bash
reshapr service get "${SERVICE_ID}" --output json \
  | jq -e \
      --arg id "${SERVICE_ID}" \
      --arg name "${SERVICE_NAME}" \
      --arg version "${SERVICE_VERSION}" \
      '.id == $id and .name == $name and .version == $version' \
      >/dev/null

EXPOSITION="$(reshapr expo get "${EXPOSITION_ID}" --output json)"
jq -e \
  --arg id "${EXPOSITION_ID}" \
  --arg serviceId "${SERVICE_ID}" \
  --arg planId "${CONFIGURATION_PLAN_ID}" \
  '.exposition.id == $id
   and .exposition.service.id == $serviceId
   and .exposition.configurationPlan.id == $planId
   and (.gateways | length > 0)' \
  <<<"${EXPOSITION}" >/dev/null

export MCP_URL="$(jq -er '.endpoints[0]' <<<"${EXPOSITION}")"
unset EXPOSITION EXISTING_SERVICE_ID
printf 'Verified active MCP endpoint: %s\n' "${MCP_URL}"
```

Finish with **[Test an MCP Endpoint](./test-mcp-endpoint.md)**. A real read-only `tools/call` validates the Gateway route and backend behavior that control-plane resource checks cannot prove.

## Control destructive changes

Do not use `--force` as the impact-assessment mechanism. For an Artifact removal, query the public deletion-impact endpoint first and evaluate its structured response against your deployment policy.

The following helper sends the saved bearer token through curl configuration on standard input, keeping it out of the curl argument list:

```bash
export ARTIFACT_ID='<artifact-id-approved-for-removal>'
RESHAPR_TOKEN="$(jq -er '.token' "${HOME}/.reshapr/config")"

set +x
DELETION_IMPACT="$(
  {
    printf 'header = "Authorization: Bearer %s"\n' "${RESHAPR_TOKEN}"
    printf 'url = "%s/api/v1/artifacts/%s/deletion-impact"\n' \
      "${RESHAPR_SERVER}" "${ARTIFACT_ID}"
  } | curl --silent --show-error --fail-with-body --config -
)"
unset RESHAPR_TOKEN
```

This example permits deletion only when no Configuration Plan references the Artifact:

```bash
jq -e '(.impactedPlans // []) | length == 0' \
  <<<"${DELETION_IMPACT}" >/dev/null

reshapr artifact delete "${ARTIFACT_ID}" --force
unset DELETION_IMPACT
```

Replace the `jq` expression with a reviewed policy when selected Plans may be changed. Deleting the last selected Artifact from a Plan can make that Plan fall back to all attached Artifacts, widening its MCP surface. Verify affected Plans and `tools/list` after any approved deletion.

The CLI reports expected absence and other HTTP failures with the same non-zero exit status for many commands. When a pipeline must distinguish HTTP `404` from authentication, authorization, validation, quota, or server failures, call the release-tagged public API contract directly and branch on its status code. Do not infer absence from an arbitrary CLI failure message.

## Clean up job credentials

Remove the isolated CLI state from an unconditional cleanup stage, including after a failed deployment:

```bash
rm -rf "${HOME}/.reshapr"
```

Use the CI platform's protected workspace cleanup rather than relying only on this final command.

## Result

The job authenticates without a password argument, observes existing state, imports or updates one Service through structured CLI output, preserves the default Plan and Exposition identities, and fails when its explicit postconditions are not met.

## Limits

- This guide supplies a portable Bash workflow, not a ready-made pipeline for a specific CI product.
- `import --backendEndpoint` reuses an existing `default` Plan and does not update its backend endpoint.
- `reshapr config update` is interactive in `0.2.3` and is unsuitable for an unattended job.
- The default import-and-expose path targets the built-in default Gateway Group. Use explicit Plan and Exposition API operations when another group is required.
- The CLI does not provide a universal create-or-update command for every resource type.
- Structured output does not provide transactionality, locking, drift detection, approval, retry, or rollback semantics.
- Concurrent jobs targeting the same resource require serialization or conflict handling owned by the pipeline.

## Next step

Use **[Manage reShapr Resources with GitOps](./manage-resources-with-gitops.md)** when Kubernetes controllers should own desired state. Review **[Product Interfaces](../references/interfaces.md)** to choose between the CLI, public APIs, Web UI, and Kubernetes controllers.

The release-tagged [CLI implementation](https://github.com/reshaprio/reshapr/tree/0.2.3/cli) and [public API contract](https://github.com/reshaprio/reshapr/blob/0.2.3/reshapr-public-openapi-v0.1.yaml) remain the canonical interface references.