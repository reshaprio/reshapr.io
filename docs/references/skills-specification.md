---
description: Understand how reShapr publishes remotely hosted Agent Skills to MCP clients.
release_review:
  runtime: 1.2.0
  controllers: 0.0.5
  charts: 0.0.18
  date: 2026-11-20
  scope: release-tagged runtime, schema and controller review
---

# Skills artifact

A `Skills` artifact attaches Agent Skills to a [Service](../explanations/services-and-artifacts.md). A Configuration Plan selects the artifact like other attached artifacts. The Gateway fetches the skill files and serves them to MCP clients; it does not execute the skill's instructions or scripts.

Attach the YAML through the Service in the Web UI or the [public API's `attachArtifact` operation](https://github.com/reshaprio/reshapr/blob/1.2.0/reshapr-public-openapi.yaml). Use the attachment operation, not `reshapr import`, which imports primary Service contracts.

## Artifact fields

| Field | Meaning |
|---|---|
| `service.name`, `service.version` | Identify the existing Service. |
| `skills` | Map keyed by skill name. The key must match `name` in the `SKILL.md` frontmatter, which must also supply a description. |
| `remoteContent` | HTTP(S) URL of the directory containing `SKILL.md`, reachable from the Gateway. |
| `files` | Optional supporting files, listed relative to that directory. `SKILL.md` is implicit; the Gateway does not crawl for more files. |
| `path` | Optional prefix in the published `skill://` URI, without a leading or trailing slash. |
| `remoteSecret` | Optional name of an existing reShapr Secret for the remote HTTP fetch, not the credential itself and not a Kubernetes Secret name. |
| `_meta` | Optional metadata attached to the `SKILL.md` resource. |

This example assumes the named Service and an HTTP server hosting both files already exist:

```yaml
apiVersion: reshapr.io/v1alpha1
kind: Skills
service:
  name: Open-Meteo Weather Forecast API
  version: '1.0'
skills:
  weather-forecast:
    remoteContent: https://content.example.com/skills/weather-forecast
    files:
      - references/VARIABLES.md
```

## MCP access

Skills are advertised to clients that support the `io.modelcontextprotocol/skills` extension. The Gateway serves `skills/list`, `skills/get`, and `resources/directory/read` for the exposed skills, with SHA-256 digests in skill listings and manifests. The Gateway also serves skill files through `resources/read` using their `skill://` URIs.

If a skill is missing, check the selected artifact, Gateway connectivity to the content server, the configured Secret, and the `SKILL.md` frontmatter. Skill loading can fail even when the artifact itself imports successfully. A skill is limited to 512 files including `SKILL.md` and 16 MiB total, subject to the Gateway's individual backend response limit. When `remoteSecret` is absent or unresolved, the fetch proceeds without that credential.

## Kubernetes

The [Skills custom resource](https://github.com/reshaprio/reshapr-controllers/blob/0.0.5/documentation/skills-cr.md) uses `spec.service` and `spec.skills`, not the top-level artifact fields shown above. The controllers chart installs the CRD on fresh installations starting with `0.0.18`. See [Kubernetes APIs and Controllers](./kubernetes-apis.md).

## Canonical sources

- [Runtime schema](https://github.com/reshaprio/reshapr/blob/1.2.0/control-plane/src/main/resources/schemas/Skills-v1alpha1-schema.json)
- [Gateway implementation](https://github.com/reshaprio/reshapr/blob/1.2.0/proxy/src/main/java/io/reshapr/proxy/mcp/ReshaprSkillsMcpSkillBuilder.java)
