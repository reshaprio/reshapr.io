#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAINTENANCE_DIR = path.join(ROOT, 'docs-maintenance');
const BASELINE_PATH = path.join(MAINTENANCE_DIR, 'product-baseline.md');
const MATRIX_PATH = path.join(MAINTENANCE_DIR, 'coverage-matrix.md');
const errors = [];

const capabilityStatuses = new Set([
  'released',
  'main-only',
  'partial',
  'deprecated',
  'removed',
  'unsupported',
]);
const coverageStatuses = new Set([
  'covered',
  'partial',
  'missing',
  'not-documentable',
  'historical-only',
]);

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function section(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(startHeading);
  if (start === -1) {
    errors.push(`Missing section: ${startHeading}`);
    return '';
  }
  const end = endHeading ? markdown.indexOf(endHeading, start + startHeading.length) : -1;
  if (endHeading && end === -1) errors.push(`Missing section: ${endHeading}`);
  return markdown.slice(start, end === -1 ? undefined : end);
}

function collectRows(markdown, pattern) {
  return [...markdown.matchAll(pattern)].map((match) => match.slice(1));
}

function uniqueById(rows, label) {
  const ids = rows.map(([id]) => id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    const duplicates = [...unique].filter(id => ids.filter(candidate => candidate === id).length > 1);
    errors.push(`Duplicate ${label}: ${duplicates.join(', ')}`);
  }
  return unique;
}

function compareSets(expected, actual, label) {
  const missing = [...expected].filter(value => !actual.has(value));
  const extra = [...actual].filter(value => !expected.has(value));
  if (missing.length > 0) errors.push(`${label} missing: ${missing.join(', ')}`);
  if (extra.length > 0) errors.push(`${label} unknown: ${extra.join(', ')}`);
}

function walk(directory, extensions) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolutePath, extensions);
    return extensions.has(path.extname(entry.name)) ? [absolutePath] : [];
  });
}

function relativeSet(directory, extensions) {
  return new Set(walk(path.join(ROOT, directory), extensions).map((filePath) => (
    path.relative(ROOT, filePath).split(path.sep).join('/')
  )));
}

function pathReferences(markdown) {
  return new Set(
    [...markdown.matchAll(/`((?:docs|blog|tests)\/[^`\s]+)`/g)]
      .map((match) => match[1].split('#')[0]),
  );
}

function validateRelativeLinks(relativePath) {
  const markdown = read(relativePath);
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(?:[a-z]+:|#)/i.test(target)) continue;
    const localTarget = target.split('#')[0];
    const resolved = path.resolve(ROOT, path.dirname(relativePath), localTarget);
    if (!fs.existsSync(resolved)) errors.push(`Broken link in ${relativePath}: ${target}`);
  }
}

const baseline = fs.readFileSync(BASELINE_PATH, 'utf8');
const matrix = fs.readFileSync(MATRIX_PATH, 'utf8');
const capabilityRegistry = section(baseline, '## Capability registry', '## Limitation registry');
const limitationRegistry = section(baseline, '## Limitation registry', '## Change log');
const capabilityCoverage = section(matrix, '## Capability coverage', '## Limitation coverage');
const limitationCoverage = section(matrix, '## Limitation coverage', '## Persona journeys');

const capabilityRows = collectRows(
  capabilityRegistry,
  /^\| `(CAP-[A-Z0-9-]+)` \| ([a-z-]+) \|/gm,
);
const limitationRows = collectRows(
  limitationRegistry,
  /^\| `(LIM-[A-Z0-9-]+)` \| (active|resolved) \|/gm,
);
const capabilityCoverageRows = collectRows(
  capabilityCoverage,
  /^\| `(CAP-[A-Z0-9-]+)` \| ([a-z-]+) \|/gm,
);
const limitationCoverageRows = collectRows(
  limitationCoverage,
  /^\| `(LIM-[A-Z0-9-]+)` \|[^\n]*\| ([a-z-]+) \|$/gm,
);

const capabilityIds = uniqueById(capabilityRows, 'capability IDs');
const limitationIds = uniqueById(limitationRows, 'limitation IDs');
const coveredCapabilityIds = uniqueById(capabilityCoverageRows, 'capability coverage IDs');
const coveredLimitationIds = uniqueById(limitationCoverageRows, 'limitation coverage IDs');

compareSets(capabilityIds, coveredCapabilityIds, 'Capability coverage');
compareSets(limitationIds, coveredLimitationIds, 'Limitation coverage');

for (const [id, status] of capabilityRows) {
  if (!capabilityStatuses.has(status)) errors.push(`${id} has invalid capability status: ${status}`);
}
for (const [id, status] of capabilityCoverageRows) {
  if (!coverageStatuses.has(status)) errors.push(`${id} has invalid coverage status: ${status}`);
}
for (const [id, status] of limitationCoverageRows) {
  if (!coverageStatuses.has(status)) errors.push(`${id} has invalid coverage status: ${status}`);
}

const capabilityLimitReferences = new Set(
  [...capabilityRegistry.matchAll(/`(LIM-[A-Z0-9-]+)`/g)].map(match => match[1]),
);
const limitationCapabilityReferences = new Set(
  [...limitationRegistry.matchAll(/`(CAP-[A-Z0-9-]+)`/g)].map(match => match[1]),
);
compareSets(capabilityLimitReferences, limitationIds, 'Defined capability limitations');
for (const id of limitationCapabilityReferences) {
  if (!capabilityIds.has(id)) errors.push(`Limitation references unknown capability: ${id}`);
}

const baselinePersonas = new Set(
  collectRows(section(baseline, '## Personas', '## Functional domains'), /^\| `(PER-[A-Z0-9-]+)` \|/gm)
    .map(([id]) => id),
);
const matrixPersonas = new Set(
  collectRows(section(matrix, '## Persona journeys', '## Authored corpus inventory'), /^\| `(PER-[A-Z0-9-]+)` \|/gm)
    .map(([id]) => id),
);
compareSets(baselinePersonas, matrixPersonas, 'Persona coverage');

for (const referencedPath of pathReferences(matrix)) {
  if (!fs.existsSync(path.join(ROOT, referencedPath))) {
    errors.push(`Coverage matrix references missing path: ${referencedPath}`);
  }
}

const inventory = section(matrix, '## Authored corpus inventory', '## Blog classification');
const blogInventory = section(matrix, '## Blog classification', '## Automated coverage');
const testInventory = section(matrix, '## Automated coverage');
compareSets(
  relativeSet('docs', new Set(['.md', '.mdx'])),
  pathReferences(inventory),
  'Authored docs inventory',
);
compareSets(
  relativeSet('blog', new Set(['.md', '.mdx'])),
  pathReferences(blogInventory),
  'Blog inventory',
);
compareSets(
  relativeSet('tests', new Set(['.mjs'])),
  pathReferences(testInventory),
  'Content test inventory',
);

for (const relativePath of [
  'docs-maintenance/README.md',
  'docs-maintenance/product-baseline.md',
  'docs-maintenance/coverage-matrix.md',
  'docs-maintenance/update-playbook.md',
]) {
  validateRelativeLinks(relativePath);
}

for (const configPath of ['docusaurus.config.js', 'sidebars.js']) {
  if (read(configPath).includes('docs-maintenance')) {
    errors.push(`${configPath} references the private docs-maintenance directory`);
  }
}

const publicationFiles = [
  'build/sitemap.xml',
  'build/llms.txt',
  'build/llms-full.txt',
  'llms.txt',
  'llms-full.txt',
].filter(relativePath => fs.existsSync(path.join(ROOT, relativePath)));
for (const relativePath of publicationFiles) {
  if (read(relativePath).includes('docs-maintenance')) {
    errors.push(`${relativePath} publishes a docs-maintenance reference`);
  }
}

for (const outputRoot of ['build', '.docusaurus']) {
  const absoluteRoot = path.join(ROOT, outputRoot);
  if (!fs.existsSync(absoluteRoot)) continue;
  const generatedFiles = walk(absoluteRoot, new Set(['.html', '.json', '.md', '.txt', '.xml', '.js']));
  const maintenanceOutputs = generatedFiles
    .filter((filePath) => path.relative(absoluteRoot, filePath).includes('docs-maintenance'));
  for (const filePath of maintenanceOutputs) {
    errors.push(`Maintenance content has a generated output: ${path.relative(ROOT, filePath)}`);
  }

  const publicationSurfaces = generatedFiles.filter((filePath) => (
    path.extname(filePath) === '.md'
    || /(?:^|[/\\])(?:routes?|routesChunkNames)\.(?:js|json)$/.test(filePath)
  ));
  for (const filePath of publicationSurfaces) {
    if (fs.readFileSync(filePath, 'utf8').includes('docs-maintenance')) {
      errors.push(`Generated publication surface references docs-maintenance: ${path.relative(ROOT, filePath)}`);
    }
  }
}

if (errors.length > 0) {
  console.error('[docs-maintenance] Validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `[docs-maintenance] Validated ${capabilityIds.size} capabilities, ${limitationIds.size} limitations, `
      + `${baselinePersonas.size} personas, ${relativeSet('docs', new Set(['.md', '.mdx'])).size} docs pages, `
      + `${relativeSet('blog', new Set(['.md', '.mdx'])).size} blog files, and the publication boundary.`,
  );
}