---
description: Understand Gateway Groups and Gateways — the deployment units that route MCP traffic across tenants and environments.
---

import ThemedImage from '@theme/ThemedImage';

# Gateway Group & Gateway

Gateway Groups connect desired MCP configuration to the Gateway processes that expose it. They let an organization target a changing set of Gateways without naming each process in every Exposition.

## Gateway Groups are configuration targets

A Gateway Group is a named, organization-owned resource with a set of labels. An Exposition targets one or more Gateway Groups instead of addressing individual Gateway processes.

Labels can express deployment criteria such as `environment=production`, `region=eu-west`, or `organization=acme`. Their meaning is an operator convention: a label does not by itself enforce network isolation, data residency, capacity, or a service level.

<ThemedImage
  alt="Gateway Groups and Gateways"
  sources={{
    light: '/img/docs/gateway-groups-and-gateways-light.svg',
    dark: '/img/docs/gateway-groups-and-gateways-dark.svg',
  }}
/>

## Gateways register dynamically

A Gateway is a runtime process that exposes MCP endpoints and dispatches Tool calls to backend APIs. It advertises its identity, labels, FQDNs, and version to the control plane when it starts. The control plane uses those labels to find matching Gateway Groups and returns the Expositions the Gateway must serve.

This registration is ephemeral. Starting another Gateway with matching labels makes it eligible for the same configuration; stopping a Gateway does not delete the Gateway Groups or Expositions it matched.

The synchronization unit delivered to the Gateway is the Exposition. Its referenced **[Service](services-and-artifacts.md)** and **[Configuration Plan](configuration-and-exposition.md)** determine the resulting MCP surface.

## Matching is many-to-many

A Gateway can match several Gateway Groups, and a Gateway Group can match several Gateways. For example, a Gateway with the labels `organization=acme`, `environment=production`, and `region=eu-west` can match groups that select any compatible combination of those labels.

This many-to-many relationship supports several runtime layouts without changing an Exposition whenever an individual Gateway starts, stops, or is replaced. Duplicate or conflicting exposure behavior still depends on the routes, FQDNs, and Expositions configured by the operator.

## Related concepts

- **[Deployment Models and Trust Boundaries](./deployment-models-trust-boundaries.md)** explains where control planes and Gateways can run and which traffic crosses each boundary.
- **[Control Plane to Gateway Synchronization](./control-plane-gateway-synchronization.md)** describes registration, initial discovery, change events, health, and recovery.
- **[Deploy a Hybrid Gateway](../how-to-guides/deploy-hybrid-gateway.md)** applies this model to a Gateway running in another trust domain.
