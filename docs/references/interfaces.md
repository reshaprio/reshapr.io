---
description: Find the canonical reShapr API, CLI, Kubernetes, and Helm interfaces without duplicating their owner documentation.
---

# Product Interfaces

Use this hub to find the canonical contract or implementation for each reShapr interface. The linked owner repositories carry exhaustive and frequently changing details; this site provides orientation and bounded examples.

## Stability conventions

- **Current contract** links point to the owner's default branch and evolve with the product.
- **Release-specific usage** should point to a Git tag or release matching the version used by an executable guide.
- **Generated contracts** remain owned by their source repository and should not be copied into this site.

## Control plane APIs

The [`reshapr`](https://github.com/reshaprio/reshapr) repository owns the control plane contracts.

| Interface | Purpose | Current contract |
|---|---|---|
| Public API | Manage Services, artifacts, Configuration Plans, Expositions, Secrets, Gateway Groups, and API tokens | [Public OpenAPI](https://github.com/reshaprio/reshapr/blob/main/reshapr-public-openapi-v0.1.yaml) |
| Administration API | Manage users, organizations, memberships, quotas, and service accounts | [Admin OpenAPI](https://github.com/reshaprio/reshapr/blob/main/reshapr-admin-ctrl-openapi-v0.1.yaml) |
| Authentication API | Authenticate users and establish CLI or browser sessions | [Authentication OpenAPI](https://github.com/reshaprio/reshapr/blob/main/reshapr-authentication-openapi-v0.1.yaml) |

## Command-line interfaces

- **[CLI reference](./cli-commands.md)** provides the user-facing command index and bounded examples on this site.
- **[CLI source](https://github.com/reshaprio/reshapr/tree/main/cli)** is the current owner for registered commands and embedded help.
- **[Admin CLI guide](https://github.com/reshaprio/reshapr/blob/main/cli/ADMIN_CLI.md)** owns exhaustive administration workflows.

Use `reshapr --help` or `reshapr <command> --help` for the command set installed on your machine.

## Kubernetes APIs

- **[Kubernetes APIs and Controllers](./kubernetes-apis.md)** orients readers across the operator, admission webhook, and seven custom resources.
- **[Controllers documentation](https://github.com/reshaprio/reshapr-controllers/tree/main/documentation)** owns installation and per-resource references.
- **[Generated CRD schemas](https://github.com/reshaprio/reshapr-controllers/tree/main/deploy/crd)** are the current Kubernetes contracts.

## Helm interfaces

- **[Helm Charts Overview](./helm-charts.md)** helps readers choose among the four reShapr charts.
- **[Helm charts repository](https://github.com/reshaprio/reshapr-helm-charts)** owns chart documentation, commands, and values.
- **[Helm releases](https://github.com/reshaprio/reshapr-helm-charts/releases)** provide immutable versions for executable deployment procedures.

Consult each chart's `README.md`, `COMMANDS.md`, and `values.yaml` in the owner repository rather than relying on copied option tables.