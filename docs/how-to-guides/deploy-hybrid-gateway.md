---
description: Run a reShapr Gateway in another trust domain and connect it to an existing control plane.
verification:
  product: reShapr
  version: 0.2.3
  date: 2026-09-04
---

# Deploy a Hybrid Gateway

Use this procedure to run a reShapr Gateway close to MCP clients or backend APIs while its configuration remains managed by an existing control plane.

The Gateway initiates the control-plane connection. MCP requests and backend API calls use the routes you configure; they are not relayed through the control plane as part of Gateway synchronization.

## Prerequisites

You need:

- a reShapr `0.2.3` control plane reachable from the Gateway over gRPC;
- the reShapr `0.2.3` CLI, authenticated with `reshapr login`;
- Docker or Podman on the Gateway host;
- `curl` and `jq` for verification;
- a Service and Configuration Plan for a non-destructive backend operation;
- local access to port `7777` for this verification, or a separately configured TLS proxy for remote MCP clients.

The examples use Docker. Set `CONTAINER_ENGINE=podman` to use the same commands with Podman.

```bash
export RESHAPR_IMAGE=registry.reshapr.io/reshapr/reshapr-proxy:0.2.3
```

## 1. Select a Gateway Group

List the Gateway Groups available to your organization:

```bash
reshapr gateway-group list
```

Record the ID and labels of an existing group, or create a dedicated group:

```bash
reshapr gateway-group create "Hybrid production" \
  --labels '{"environment":"production","location":"customer-network"}'
```

The command returns a generated ID. Store that value for later commands:

```bash
export GATEWAY_GROUP_ID='<gateway-group-id>'
```

The Gateway labels in step 3 must match this group's labels. Labels select configuration; they do not establish network or security boundaries.

## 2. Create a dedicated Gateway token

Create an API token with the shortest validity that fits your operating procedure:

```bash
reshapr api-token create hybrid-gateway-01 --validity-days 30
```

The CLI displays the token once. Store it in your secret manager. To avoid placing it in shell history for this session, read it into an environment variable:

```bash
read -r -s -p 'Gateway API token: ' RESHAPR_CTRL_TOKEN
export RESHAPR_CTRL_TOKEN
printf '\n'
```

Use a dedicated token per operational boundary so that it can be rotated or revoked without affecting unrelated Gateways.

## 3. Start the Gateway

Set the control-plane address. This procedure advertises `localhost:7777` and verifies the MCP endpoint from the Gateway host over HTTP. Do not include a URL scheme in either hostname value.

```bash
export RESHAPR_CTRL_HOST='<control-plane-host>'
export RESHAPR_CTRL_PORT='443'
export RESHAPR_GATEWAY_FQDNS='localhost:7777'
```

The following command expects TLS on the control-plane connection. For a trusted development network that deliberately uses plaintext gRPC, set `RESHAPR_CTRL_TLS_PLAINTEXT=true` and use its plaintext port instead.

```bash
docker run --detach \
  --name reshapr-hybrid-gateway \
  --restart unless-stopped \
  --publish 7777:7777 \
  --env RESHAPR_CTRL_HOST="${RESHAPR_CTRL_HOST}" \
  --env RESHAPR_CTRL_PORT="${RESHAPR_CTRL_PORT}" \
  --env RESHAPR_CTRL_TLS_PLAINTEXT=false \
  --env RESHAPR_CTRL_TOKEN="${RESHAPR_CTRL_TOKEN}" \
  --env RESHAPR_GATEWAY_ID=hybrid-gateway-01 \
  --env RESHAPR_GATEWAY_FQDNS="${RESHAPR_GATEWAY_FQDNS}" \
  --env 'RESHAPR_GATEWAY_LABELS=environment=production;location=customer-network' \
  "${RESHAPR_IMAGE}"
```

Use a unique `RESHAPR_GATEWAY_ID` for each running Gateway. If the host cannot reach the control plane, check DNS, egress firewall rules, the configured port, and the TLS mode before changing the registration settings.

## 4. Check readiness

Query the Gateway locally:

```bash
curl --fail --silent http://localhost:7777/q/health/ready | jq '.status'
```

The expected status is `"UP"`. If readiness fails, inspect the startup and registration messages:

```bash
docker logs --tail 100 reshapr-hybrid-gateway
```

Readiness confirms that the Gateway completed its initial connection. It does not confirm that a particular Exposition targets this Gateway.

## 5. Target the Gateway Group

Create an Exposition from an existing Configuration Plan and target the group selected in step 1:

```bash
export CONFIGURATION_PLAN_ID='<configuration-plan-id>'

reshapr expo create \
  --configuration "${CONFIGURATION_PLAN_ID}" \
  --gateway-group "${GATEWAY_GROUP_ID}" \
  --name hybrid-endpoint
```

Record the generated Exposition ID:

```bash
export EXPOSITION_ID='<exposition-id>'
```

Confirm that the Exposition is active and that `ENDPOINTS` contains the hostname advertised by this Gateway:

```bash
reshapr expo list
reshapr expo get "${EXPOSITION_ID}"
```

If the Exposition remains inactive, compare the Gateway's `RESHAPR_GATEWAY_LABELS` with the labels shown by `reshapr gateway-group list`, then inspect the Gateway logs.

## 6. Verify the MCP endpoint

Set `MCP_URL` to the exact endpoint returned by `reshapr expo get`, including its scheme and path. With the direct local configuration in this guide, it uses HTTP:

```bash
export MCP_URL='http://localhost:7777/mcp/<organization>/hybrid-endpoint'
```

Discover the stateless MCP server:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "${MCP_URL}" | jq '.result | {supportedVersions, capabilities}'
```

The response must include `2026-07-28` in `supportedVersions`. List the exposed Tools:

```bash
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/list' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"reshapr-docs","version":"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' \
  "${MCP_URL}" | jq '.result.tools[] | {name, description}'
```

Choose a read-only Tool whose backend effect you understand, then call it with valid arguments:

```bash
export TOOL_NAME='<read-only-tool-name>'
export TOOL_ARGUMENTS='{}'

jq -n \
  --arg name "${TOOL_NAME}" \
  --argjson arguments "${TOOL_ARGUMENTS}" \
  '{jsonrpc:"2.0",id:3,method:"tools/call",params:{name:$name,arguments:$arguments,_meta:{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{name:"reshapr-docs",version:"0.2.3"},"io.modelcontextprotocol/clientCapabilities":{}}}}' | \
curl --silent --show-error \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --header 'MCP-Protocol-Version: 2026-07-28' \
  --header 'Mcp-Method: tools/call' \
  --header "Mcp-Name: ${TOOL_NAME}" \
  --data @- \
  "${MCP_URL}" | jq '.result'
```

A successful, expected backend response verifies the client-to-Gateway and Gateway-to-backend paths. It does not prove that other Tools or network routes are correctly configured.

## Roll back

Delete the Exposition created by this procedure before removing its dedicated Gateway Group:

```bash
reshapr expo delete "${EXPOSITION_ID}"
${CONTAINER_ENGINE} rm --force reshapr-hybrid-gateway
```

List API tokens, then delete the dedicated token by its generated ID:

```bash
reshapr api-token list
reshapr api-token delete '<api-token-id>' --force
```

If you created the Gateway Group only for this procedure and no other Exposition uses it, remove it:

```bash
reshapr gateway-group delete "${GATEWAY_GROUP_ID}"
```

Deleting the token prevents later registration with that credential. A Gateway that is already running can retain its last synchronized configuration during a control-plane connectivity loss, so stop the container as well when access must end immediately.

## Result

You now have a reShapr `0.2.3` Gateway running in another trust domain, registered with a dedicated credential, selected through Gateway Group labels, and verified through its MCP endpoint.

## Limits

- The topology does not by itself prove data residency or compliance. Validate DNS, routing, proxies, identity providers, observability exporters, and backend dependencies.
- Gateway-to-control-plane TLS depends on `RESHAPR_CTRL_TLS_PLAINTEXT=false` and a correctly configured control-plane TLS endpoint. MCP client ingress and backend TLS are separate boundaries.
- Remote MCP clients need a TLS ingress, load balancer, or reverse proxy. Configure it first, then advertise its host and optional port through `RESHAPR_GATEWAY_FQDNS` instead of `localhost:7777`.
- Live configuration propagation is not a zero-downtime upgrade or rollback guarantee.
- A production deployment also needs durable secret injection, ingress TLS, resource limits, health supervision, logging, and an image update policy.

## Next step

Read **[Deployment Models and Trust Boundaries](../explanations/deployment-models-trust-boundaries.md)** for the complete traffic map and **[Control Plane to Gateway Synchronization](../explanations/control-plane-gateway-synchronization.md)** for registration and recovery behavior.

For production Kubernetes controls, continue with **[Deploy reShapr on Kubernetes for Production](./deploy-kubernetes-production.md)**.