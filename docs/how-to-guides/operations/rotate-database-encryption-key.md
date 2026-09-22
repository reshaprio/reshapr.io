---
description: Rotate the control-plane database encryption key across multiple replicas, re-encrypt stored values, and retain a recoverable old-key path.
verification:
  product: reShapr control plane
  version: 1.0.0 / charts 0.0.14
  date: 2026-09-22
---

# Rotate the Database Encryption Key

Use this runbook to introduce a new AES-256-GCM key, activate it safely across multiple control-plane replicas, and re-encrypt stored Secret and Configuration Plan values. Key generation, distribution, activation, invocation, retirement, and scheduling are operator-managed in reShapr `1.0.0`.

The procedure uses two workload rollouts. The first gives every replica the new key while the old key remains active. The second changes the active key only after every replica can decrypt values written with either key.

## Prerequisites

You need:

- reShapr control plane `1.0.0` deployed with Helm chart `0.0.14`;
- an externally managed PostgreSQL backup with a tested restore procedure;
- an external Kubernetes Secret referenced by `encryptionKey.existingSecret`;
- the current active key and every older key still needed by live data or retained backups;
- the reShapr `1.0.0` CLI configured with `RESHAPR_ADMIN_API_KEY`;
- permission to update the Secret and roll out every control-plane replica;
- one Exposition that uses an encrypted API key or backend Secret for the final check;
- Helm, `kubectl`, `jq`, and `openssl`.

Set the deployment inputs:

```bash
export PLATFORM_NAMESPACE='reshapr-system'
export CONTROL_PLANE_RELEASE='reshapr-control-plane'
export ENCRYPTION_SECRET='reshapr-encryption-key-secret'
export CURRENT_KEY_ID='v1'
export NEW_KEY_ID='v2'
```

Key identifiers must start with a lowercase letter and contain only lowercase letters and digits.

## Establish a recovery point

Run the database owner's backup procedure and restore that backup into an isolated database. Record the tested backup identifier:

```bash
export DATABASE_BACKUP_ID='<tested-backup-id>'
test -n "${DATABASE_BACKUP_ID}"
```

Record the current Helm values, revision, and active key without reading any key value:

```bash
mkdir -p encryption-rotation-evidence

helm get values "${CONTROL_PLANE_RELEASE}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  --output yaml \
  > encryption-rotation-evidence/control-plane-values-before.yaml

helm history "${CONTROL_PLANE_RELEASE}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  > encryption-rotation-evidence/helm-history-before.txt

export REPORTED_ACTIVE_KEY_ID="$(
  reshapr admin encryption status --output json \
    | jq -er '.activeKid'
)"
test "${REPORTED_ACTIVE_KEY_ID}" = "${CURRENT_KEY_ID}"
```

Stop if the reported key differs from the reviewed Helm value. Resolve the configuration mismatch before generating or activating another key.

## Generate and store the new key

Generate 32 random bytes and store the Base64 value in a protected temporary variable:

```bash
set +x
NEW_ENCRYPTION_KEY="$(openssl rand -base64 32)"
KEY_DATA_NAME="encryption-key-${NEW_KEY_ID}"
export NEW_ENCRYPTION_KEY KEY_DATA_NAME
```

Update the externally managed Kubernetes Secret without removing existing entries:

```bash
kubectl get secret "${ENCRYPTION_SECRET}" \
  --namespace "${PLATFORM_NAMESPACE}" \
  --output json \
  | jq '.data[env.KEY_DATA_NAME] = (env.NEW_ENCRYPTION_KEY | @base64)' \
  | kubectl apply --filename -

unset NEW_ENCRYPTION_KEY KEY_DATA_NAME
```

Use the secret manager's normal synchronization workflow instead when it owns this Secret. Never commit key material or pass it through Helm values.

## Phase 1: distribute the complete key set

Add the new key to the reviewed control-plane values, but keep the current key active:

```yaml
encryptionKey:
  existingSecret: reshapr-encryption-key-secret
  activeKeyId: v1
  keys:
    v1:
      key: encryption-key-v1
    v2:
      key: encryption-key-v2
```

If you are migrating legacy AES/ECB values, also retain the existing `encryptionKey.key` mapping until every unprefixed value has been migrated.

Apply the values and wait for every replica:

```bash
helm upgrade "${CONTROL_PLANE_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version 0.0.14 \
  --namespace "${PLATFORM_NAMESPACE}" \
  --values values/control-plane.yaml

kubectl rollout status deployment/reshapr-control-plane-ctrl \
  --namespace "${PLATFORM_NAMESPACE}" \
  --timeout 5m
```

Confirm that all replicas are ready and that `reshapr admin encryption status` still reports `v1`. Do not activate `v2` while any replica is still running without it.

## Phase 2: activate the new key

Change only the active key in the reviewed values:

```yaml
encryptionKey:
  existingSecret: reshapr-encryption-key-secret
  activeKeyId: v2
  keys:
    v1:
      key: encryption-key-v1
    v2:
      key: encryption-key-v2
```

Apply a second rollout:

```bash
helm upgrade "${CONTROL_PLANE_RELEASE}" \
  oci://quay.io/reshapr/reshapr-helm-charts/reshapr-control-plane \
  --version 0.0.14 \
  --namespace "${PLATFORM_NAMESPACE}" \
  --values values/control-plane.yaml

kubectl rollout status deployment/reshapr-control-plane-ctrl \
  --namespace "${PLATFORM_NAMESPACE}" \
  --timeout 5m
```

Verify the active key:

```bash
test "$(
  reshapr admin encryption status --output json \
    | jq -er '.activeKid'
)" = "${NEW_KEY_ID}"
```

New writes now use `v2`; existing values remain readable through the retained key set.

## Re-encrypt existing values

Run the administrator-triggered rotation and save its report:

```bash
reshapr admin encryption rotate --yes --output json \
  | tee encryption-rotation-evidence/rotation-report.json \
  | jq -e '
      .secretsRotated >= 0
      and .configurationPlansRotated >= 0'
```

The control plane processes up to 200 values per transaction. It rotates Secret `password` and `token` fields, OAuth client secrets nested in `oauth2_client_configuration`, and Configuration Plan API keys. Rows already prefixed with the active key identifier are skipped.

Run the command again to verify idempotency:

```bash
reshapr admin encryption rotate --yes --output json \
  | jq -e '
      .secretsRotated == 0
      and .configurationPlansRotated == 0'
```

Both counts must be zero. Exercise the known Exposition and its non-destructive Tool call before considering the old key for retirement.

## Retain and retire old keys

Keep `v1` available while any of these conditions is true:

- rotation has not completed with a zero-count second run;
- an application check still depends on data that has not been verified;
- a running replica or rollback revision may write with `v1`;
- a retained database backup can contain `v1` ciphertext;
- the recovery policy requires that backup to be readable without restoring old key material separately.

When all retention and recovery requirements permit retirement, remove the old key entry from the reviewed values and external Secret, then roll out every control-plane replica again. Preserve old key material in the approved backup-key escrow when retained backups still require it.

## Recover from an interruption

If re-encryption stops after some batches, keep both keys configured, restore control-plane health, and run `reshapr admin encryption rotate --yes` again. The operation skips values already using the active key and resumes the remaining work.

If activation causes failures before re-encryption, keep both keys available. You can set `activeKeyId` back to `v1` through another controlled rollout; values already written with `v2` remain readable because `v2` stays in the key set.

If a required key was removed, restore it from the secret manager or key escrow before restarting replicas. When database contents are damaged or the required key cannot be recovered, stop writes and use the tested `${DATABASE_BACKUP_ID}` restore procedure with its matching complete key set. Helm rollback alone does not restore database values or key material.

## Result

Every control-plane replica knows the complete transition key set, new writes use `v2`, existing supported encrypted fields have been re-encrypted idempotently, and the previous key remains available for the documented recovery window.

## Limits

- Rotation is manual; reShapr `1.0.0` does not generate, distribute, schedule, activate, or retire encryption keys.
- Rotation covers the sensitive database fields owned by `KeyRotationService`; it is not a general PostgreSQL encryption facility.
- The command reports re-encrypted values but does not test database backup restoration.
- Removing an old key is irreversible unless that key remains available through an approved recovery system.
- Helm rollback does not reverse Flyway migrations, database writes, or external Secret changes.

## Next step

Use **[Upgrade reShapr and Rotate Runtime Secrets](./upgrade-and-rotate.md)** for the surrounding release upgrade and other credential rotations. Review **[Security Capabilities and Limits](../../explanations/security-model.md)** for the at-rest encryption boundary.

The release-tagged [rotation service](https://github.com/reshaprio/reshapr/blob/1.0.0/control-plane/src/main/java/io/reshapr/ctrl/security/KeyRotationService.java), [cipher service](https://github.com/reshaprio/reshapr/blob/1.0.0/control-plane/src/main/java/io/reshapr/ctrl/security/CipherService.java), [admin CLI](https://github.com/reshaprio/reshapr/blob/1.0.0/cli/src/commands/admin/encryption.ts), and [Helm chart documentation](https://github.com/reshaprio/reshapr-helm-charts/blob/0.0.14/control-plane/README.md) own the behavior described here.