import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const supportPage = fs.readFileSync(
  path.join(repositoryRoot, 'docs/references/mcp-support.md'),
  'utf8',
);

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
  const defaultRoot = path.resolve(repositoryRoot, '../reshapr');
  const sourceRoot = configuredRoot ? path.resolve(configuredRoot) : defaultRoot;
  const sourcePath = path.join(sourceRoot, relativePath);
  return fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : null;
}

test('publishes the exact reShapr 0.2.3 protocol versions and modes', () => {
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
  assert.ok(ownerLinks.every((match) => match[1] === '0.2.3'));
});

test('matches McpSchema and McpController when the owner checkout is available', (context) => {
  const schema = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/McpSchema.java');
  const controller = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/McpController.java');
  const legacyDialect = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/LegacyProtocolDialect.java');
  const modernDialect = readOwnerSource('proxy/src/main/java/io/reshapr/proxy/mcp/ModernProtocolDialect.java');

  if (!schema || !controller || !legacyDialect || !modernDialect) {
    context.skip('Set RESHAPR_SOURCE_DIR to compare the matrix with an owner checkout');
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