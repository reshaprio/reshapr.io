import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import matter from 'gray-matter';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const supportPage = fs.readFileSync(
  path.join(repositoryRoot, 'docs/references/mcp-support.md'),
  'utf8',
);
const ownerRoot = path.resolve(repositoryRoot, '../reshapr');
const ownerTag = `refs/tags/${matter(supportPage).data.release_review.runtime}`;

const supportedVersions = [
  '2024-11-05',
  '2025-03-26',
  '2025-06-18',
  '2025-11-25',
  '2026-07-28',
];

const dispatchedMethods = [
  'initialize',
  'server/discover',
  'tools/list',
  'tools/call',
  'prompts/list',
  'prompts/get',
  'resources/list',
  'resources/templates/list',
  'resources/read',
  'resources/directory/read',
  'skills/list',
  'skills/get',
];

const removedModernMethods = [
  'initialize',
  'ping',
  'logging/setLevel',
  'resources/subscribe',
  'resources/unsubscribe',
];

function section(markdown, heading) {
  const start = markdown.indexOf(`## ${heading}`);
  assert.notEqual(start, -1, `Missing section: ${heading}`);
  const end = markdown.indexOf('\n## ', start + heading.length + 3);
  return markdown.slice(start, end === -1 ? undefined : end);
}

function columnValues(markdownSection, columnIndex) {
  return markdownSection
    .split('\n')
    .filter((line) => line.startsWith('|') && !line.includes('|---'))
    .slice(1)
    .map((line) => line.split('|')[columnIndex + 1].trim().replaceAll('`', ''));
}

function readOwnerSource(relativePath) {
  const configuredRoot = process.env.RESHAPR_SOURCE_DIR;
  if (configuredRoot) {
    return fs.readFileSync(path.resolve(configuredRoot, relativePath), 'utf8');
  }
  if (!fs.existsSync(ownerRoot) ||
      spawnSync('git', ['-C', ownerRoot, 'rev-parse', '--verify', `${ownerTag}^{commit}`]).status !== 0) {
    return null;
  }
  return execFileSync('git', ['-C', ownerRoot, 'show', `${ownerTag}:${relativePath}`], {encoding: 'utf8'});
}

test('keeps partial replay scope out of public verification metadata and banners', () => {
  for (const relativePath of fs.readdirSync(path.join(repositoryRoot, 'docs'), {recursive: true}).filter(name => /\.mdx?$/.test(name))) {
    const {data} = matter(fs.readFileSync(path.join(repositoryRoot, 'docs', relativePath), 'utf8'));
    assert.ok(!data.verification || !Object.hasOwn(data.verification, 'scope'), `Public verification scope in ${relativePath}`);
  }
  const banner = fs.readFileSync(path.join(repositoryRoot, 'src/theme/DocItem/Verification/index.js'), 'utf8');
  assert.match(banner, /<strong>Verified<\/strong>/);
  assert.doesNotMatch(banner, /releaseReview|verification\.scope|Targets|Replayed/);
});

test('keeps the Kubernetes production example on the replayed chart configuration', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/deploy-kubernetes-production.md'), 'utf8');
  const {data} = matter(guide);
  assert.equal(data.release_review.charts, '0.0.18');
  assert.deepEqual([...guide.matchAll(/--version (0\.0\.\d+)/g)].map(match => match[1]), Array(4).fill(data.release_review.charts));
  const values = [...guide.matchAll(/```yaml\n([\s\S]*?)\n```/g)].map(match => matter(`---\n${match[1]}\n---\n`).data);
  const ui = values.find(value => value.publicUrl);
  assert.equal(ui.ingress.annotations['nginx.ingress.kubernetes.io/proxy-buffer-size'], '16k');
  const proxy = values.find(value => value.clustering);
  assert.equal(proxy.clustering.enabled, true);
  assert.equal(proxy.autoscaling.enabled, true);
  assert.equal(proxy.clustering.networkPolicy.enabled, false);
});

test('keeps scripted sample contract versions separate from the runtime release', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/build-scripted-custom-tool.md'), 'utf8');
  const parseYaml = relativePath => matter(`---\n${fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8')}\n---\n`).data;
  const todos = parseYaml('static/examples/scripted-custom-tools/todos-openapi.yaml');
  const users = parseYaml('static/examples/scripted-custom-tools/users-openapi.yaml');
  const artifact = parseYaml('static/examples/scripted-custom-tools/todo-workflow.yaml');
  for (const contract of [todos, users]) {
    assert.ok(guide.includes(`.name == "${contract.info.title}" and .version == "${contract.info.version}"`));
  }
  assert.equal(artifact.service.version, todos.info.version);
  const documentedAllowList = matter(`---\n${guide.match(/```yaml\n([\s\S]*?)\n```/)[1]}\n---\n`).data;
  assert.deepEqual(documentedAllowList.tools, artifact.customTools.inspect_todo_and_owner.tools);
  assert.equal(documentedAllowList.tools[1].service, `${users.info.title}:${users.info.version}`);
  const selected = JSON.parse(guide.match(/SCRIPTED_TOOLS='([\s\S]*?)'/)[1]);
  assert.ok(selected.includes('inspect_todo_and_owner'));
  assert.ok(!selected.includes('GET /todos/{todoId}'));
  const composePaths = [...guide.matchAll(/docker-compose-([\d.]+)\.yml/g)];
  assert.equal(composePaths.length, 2);
  assert.ok(composePaths.every(match => match[1] === matter(guide).data.release_review.runtime));
});

test('retains corrections established by the 1.1.0 administration replay', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/administration/organizations-and-memberships.md'), 'utf8');
  const owner = guide.slice(guide.indexOf('### Assign or replace the owner'), guide.indexOf('### Replace an existing user'));
  assert.ok(owner.includes("--header 'Content-Type: text/plain'"));
  assert.ok(owner.includes('--data "${OWNER_USERNAME}"'));
  assert.ok(!owner.includes('OWNER_REQUEST'));
  const quotas = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/administration/organization-quotas.md'), 'utf8');
  assert.match(quotas, /preserves consumed units and recalculates `remaining`/);
  assert.doesNotMatch(quotas, /does not increase its existing `remaining`|does not add to `remaining`/);
});

test('documents Code Mode discovery and a locally executable reduced-result example', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/use-code-mode.md'), 'utf8');
  const modeSection = section(guide, 'Choose the Tool exposure mode');
  assert.deepEqual(columnValues(modeSection, 0), ['TOOLS', 'CODE', 'HYBRID']);
  const calls = [...guide.matchAll(/```json\n([\s\S]*?)\n```/g)].map(match => JSON.parse(match[1]));
  assert.deepEqual(calls.map(call => call.name), ['search_tools', 'get_api_types', 'execute_code']);
  const run = new Function('api', 'rs', calls[2].arguments.code);
  const response = run({get_v1_forecast: () => ({ok: true, content: {current: {temperature_2m: 18}, unused: 'omit'}})}, {});
  assert.deepEqual(response, {temperature: 18});
  assert.throws(() => run({get_v1_forecast: () => ({ok: false, error: 'backend'})}, {
    fail(message) { throw new Error(message); },
  }), /Forecast failed/);
  assert.match(guide, /not transactional/);
  assert.match(guide, /logs submitted source at INFO/);
});

test('explains Code Mode flows and security boundaries with release-scoped evidence', async () => {
  const explanation = fs.readFileSync(path.join(repositoryRoot, 'docs/explanations/code-mode.md'), 'utf8');
  const flows = section(explanation, 'Discovery and Execution Flows');
  assert.deepEqual(columnValues(flows, 0), ['TOOLS', 'CODE', 'HYBRID']);
  assert.match(flows, /Elicitation response \(sandbox has not started\)/);
  const diagram = flows.match(/```mermaid\n([\s\S]*?)\n```/);
  assert.ok(diagram, 'Missing Code Mode sequence diagram');
  const {default: mermaid} = await import('mermaid');
  mermaid.initialize({startOnLoad: false});
  await mermaid.parse(diagram[1]);
  const security = section(explanation, 'Security Model');
  assert.match(security, /first level of declared dependencies/);
  assert.match(security, /not recursively traverse/);
  assert.match(security, /output filtering can fail open/);
  const limits = section(explanation, 'Guardrails and Their Boundaries');
  assert.deepEqual(columnValues(limits, 1), ['10,000 ms', '10', '4,000 characters', '100,000 characters', '5', '256 pages of 64 KiB (16 MiB)']);
  assert.match(limits, /CPU-only infinite loop stops on timeout/);
  assert.match(limits, /does not bound total JVM memory/);
  assert.match(section(explanation, 'Failures and Side Effects'), /not transactional/);
  assert.match(section(explanation, 'Audit and Trace Visibility'), /logs submitted source at \*\*INFO\*\*/);
  const ownerLinks = [...explanation.matchAll(/https:\/\/github\.com\/reshaprio\/reshapr\/blob\/([^/]+)\//g)];
  assert.ok(ownerLinks.length >= 4);
  assert.ok(ownerLinks.every(match => match[1] === '1.2.0'));
  for (const page of ['docs/how-to-guides/use-code-mode.md', 'docs/references/features.md']) {
    assert.ok(fs.readFileSync(path.join(repositoryRoot, page), 'utf8').includes('../explanations/code-mode.md'), `Missing explanation link in ${page}`);
  }
  assert.ok(fs.readFileSync(path.join(repositoryRoot, 'sidebars.js'), 'utf8').includes("id: 'explanations/code-mode'"));
});

test('documents all injected script and Code Mode guardrails with their defaults', (context) => {
  const reference = fs.readFileSync(path.join(repositoryRoot, 'docs/references/environment-variables.md'), 'utf8');
  const source = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/ToolCallExecutor.java');
  if (!source) {
    context.skip('Set RESHAPR_SOURCE_DIR to compare injected guardrail defaults');
    return;
  }
  const settings = [...source.matchAll(/@ConfigProperty\(name = "(reshapr\.gateway\.(?:code-mode|scripting)\.[^"]+)", defaultValue = "([^"]+)"\)/g)];
  assert.equal(settings.length, 8);
  for (const [, property, defaultValue] of settings) {
    const variable = property.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const row = reference.split('\n').find(line => line.startsWith(`| \`${variable}\` |`));
    assert.ok(row, `Missing ${variable}`);
    assert.ok(row.includes(`| \`${defaultValue}\` |`), `Wrong default for ${variable}`);
  }
});

test('keeps MCP Apps hosting and client requirements visible', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/reference-mcp-app.md'), 'utf8');
  for (const field of ['ui://user/mcp-app.html', 'text/html;profile=mcp-app', 'remoteContent:', 'resourceDomains:', 'visibility:']) {
    assert.ok(guide.includes(field), `Missing MCP App field ${field}`);
  }
  assert.match(guide, /Apps-capable host/);
  assert.match(guide, /does not .*provide application hosting/);
  assert.match(guide, /blob\/1\.2\.0\/dev\/github-api-resources\.yaml/);
});

test('keeps DEBUG deployment instructions and sensitive-data warnings together', () => {
  const guide = fs.readFileSync(path.join(repositoryRoot, 'docs/how-to-guides/operations/troubleshoot.md'), 'utf8');
  const debugSection = section(guide, 'Enable debug logs temporarily');
  for (const setting of ['QUARKUS_LOG_CATEGORY__IO_RESHAPR_PROXY__LEVEL', 'QUARKUS_OTEL_SDK_DISABLED', 'admissionController.extraEnv']) {
    assert.ok(debugSection.includes(setting), `Missing debug setting ${setting}`);
  }
  assert.match(debugSection, /Sensitive diagnostic data/);
  assert.match(debugSection, /docker logs/);
  assert.match(debugSection, /podman logs/);
  assert.match(debugSection, /restore|Remove|remove/);
  assert.ok(debugSection.includes('../../references/logging.md'));
});

test('publishes the exact supported protocol versions and modes', () => {
  const versionSection = section(supportPage, 'Protocol versions and modes');
  assert.deepEqual(columnValues(versionSection, 0), supportedVersions);
  assert.match(versionSection, /\| `2026-07-28` \| Stateless \| `server\/discover` \|/);
  assert.doesNotMatch(supportPage, /experimental/i);
});

test('publishes exactly the methods handled by the MCP dispatcher', () => {
  const methodSection = section(supportPage, 'Implemented server methods');
  assert.deepEqual(columnValues(methodSection, 1).sort(), [...dispatchedMethods].sort());
});

test('separates modern removed methods from unimplemented protocol vocabulary', () => {
  const implementedSection = section(supportPage, 'Implemented server methods');
  const unavailableSection = section(supportPage, 'Declared but unavailable server methods');
  const removedInMatrix = [
    ...implementedSection.matchAll(/\| `([^`]+)` \|[^\n]*\| Removed \|/g),
    ...unavailableSection.matchAll(/\| `([^`]+)` \|[^\n]*\| Removed \|/g),
  ].map((match) => match[1]);

  assert.deepEqual(removedInMatrix.sort(), [...removedModernMethods].sort());
  for (const method of ['roots/list', 'sampling/createMessage']) {
    assert.ok(unavailableSection.includes(`| \`${method}\` |`));
  }
});

test('documents both response dialects and release-tagged evidence', () => {
  const dialectSection = section(supportPage, 'Result dialects');
  assert.match(dialectSection, /`resultType` discriminator/);
  assert.match(dialectSection, /`ttlMs` cache hint/);
  assert.match(dialectSection, /`cacheScope` hint/);

  const ownerLinks = [...supportPage.matchAll(/https:\/\/github\.com\/reshaprio\/reshapr\/blob\/([^/]+)\//g)];
  assert.ok(ownerLinks.length >= 5);
  assert.ok(ownerLinks.every((match) => match[1] === matter(supportPage).data.release_review.runtime));
});

test('matches McpSchema and McpController at the documented owner release', (context) => {
  const schema = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/McpSchema.java');
  const controller = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/McpController.java');
  const legacyDialect = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/LegacyProtocolDialect.java');
  const modernDialect = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/ModernProtocolDialect.java');

  if (!schema || !controller || !legacyDialect || !modernDialect) {
    context.skip('Fetch the owner release tag or set RESHAPR_SOURCE_DIR to a release snapshot');
    return;
  }

  const statelessVersion = schema.match(/PROTOCOL_VERSION_STATELESS\s*=\s*"([^"]+)"/)?.[1];
  const versionList = schema.match(/SUPPORTED_PROTOCOL_VERSIONS\s*=\s*List\.of\(([\s\S]*?)\);/)?.[1];
  assert.ok(statelessVersion);
  assert.ok(versionList);
  const sourceVersions = [...versionList.matchAll(/"([0-9]{4}-[0-9]{2}-[0-9]{2})"/g)].map((match) => match[1]);
  sourceVersions.push(statelessVersion);
  assert.deepEqual(sourceVersions, supportedVersions);

  const methodConstants = new Map(
    [...schema.matchAll(/public static final String (METHOD_[A-Z_]+)\s*=\s*"([^"]+)";/g)]
      .map((match) => [match[1], match[2]]),
  );
  const dispatcher = controller.match(/switch \(request\.method\(\)\) \{([\s\S]*?)\n\s*\}/)?.[1];
  assert.ok(dispatcher);
  const sourceMethods = [...dispatcher.matchAll(/case McpSchema\.(METHOD_[A-Z_]+)/g)]
    .map((match) => methodConstants.get(match[1]));
  assert.deepEqual(sourceMethods.sort(), [...dispatchedMethods].sort());

  const removedSet = controller.match(/REMOVED_MODERN_METHODS\s*=\s*Set\.of\(([\s\S]*?)\);/)?.[1];
  assert.ok(removedSet);
  const sourceRemovedMethods = [...removedSet.matchAll(/McpSchema\.(METHOD_[A-Z_]+)/g)]
    .map((match) => methodConstants.get(match[1]));
  assert.deepEqual(sourceRemovedMethods.sort(), [...removedModernMethods].sort());

  assert.match(legacyDialect, /ttlMs\(Long ttlMs\)[\s\S]*?intentionally ignored/);
  assert.match(modernDialect, /new McpSchema\.ListToolsResult\.Modern\(RESULT_TYPE_COMPLETE/);
  assert.match(modernDialect, /new McpSchema\.ReadResourceResult\.Modern\(RESULT_TYPE_COMPLETE/);
});