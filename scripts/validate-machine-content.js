#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  BUILD_DIR,
  MACHINE_DIRECTIVE,
  ROOT,
  publishedSources,
  routeMarkdownOutputPath,
  sitemapLocations,
  sourceOutputPath,
  walkMarkdown,
} = require('./machine-content');

const errors = [];

for (const markdownPath of walkMarkdown(BUILD_DIR)) {
  const content = fs.readFileSync(markdownPath, 'utf8');
  const opening = content.slice(0, 1000);

  if (!opening.includes(MACHINE_DIRECTIVE)) {
    errors.push(
      `${path.relative(BUILD_DIR, markdownPath)} does not contain the Agent View directive near the top of the page.`,
    );
  }
}

const requiredOutputs = [
  'index.md',
  'about.md',
  'community.md',
  'blog.md',
  'docs/index.md',
  'llms.txt',
  'llms-full.txt',
];

const sitemapPages = sitemapLocations();
for (const location of sitemapPages) {
  const pageUrl = new URL(location);
  if (pageUrl.origin !== 'https://reshapr.io') continue;

  if (pageUrl.pathname === '/agent/' || pageUrl.pathname.startsWith('/agent/')) {
    errors.push(`Legacy Agent View route should not be in the sitemap: ${pageUrl.pathname}`);
  }

  const markdownOutput = routeMarkdownOutputPath(pageUrl.pathname);
  if (!outputExists(markdownOutput)) {
    errors.push(`No negotiable Markdown for ${pageUrl.pathname}: /${markdownOutput}`);
  }
}

function outputExists(relativePath) {
  return fs.existsSync(path.join(BUILD_DIR, relativePath));
}

function walkFiles(directory, filename) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath, filename);
    return entry.name === filename ? [absolutePath] : [];
  });
}

for (const relativePath of requiredOutputs) {
  if (!outputExists(relativePath)) errors.push(`Missing required output: /${relativePath}`);
}

const generatedSources = [
  ...publishedSources(path.join(ROOT, 'docs')),
  ...publishedSources(path.join(ROOT, 'blog')),
];
const expectedGenerated = generatedSources.map(source => ({
  source: path.relative(ROOT, source.sourcePath),
  output: sourceOutputPath(source.sourcePath, source.frontMatter),
}));

for (const item of expectedGenerated) {
  if (!outputExists(item.output)) {
    errors.push(`No generated Markdown for ${item.source}: /${item.output}`);
  }
}

for (const htmlPath of walkFiles(BUILD_DIR, 'index.html')) {
  const route = `/${path.relative(BUILD_DIR, path.dirname(htmlPath)).split(path.sep).join('/')}`
    .replace(/\/\.$/, '/')
    .replace(/\/$/, '') || '/';
  const isContentRoute = route === '/docs'
    || route.startsWith('/docs/')
    || route === '/blog'
    || route.startsWith('/blog/');
  if (!isContentRoute) continue;

  const html = fs.readFileSync(htmlPath, 'utf8');
  const toggle = html.match(/<a href="([^"]+)" class="agent-view-toggle"/);
  if (!toggle) {
    errors.push(`Missing Agent View toggle on ${route}`);
    continue;
  }
  const target = toggle[1].replace(/^\//, '');
  if (!target.endsWith('.md') || !outputExists(target)) {
    errors.push(`Agent View target for ${route} does not exist: /${target}`);
  }
}

const staticMarkdown = new Set(
  walkMarkdown(path.join(ROOT, 'static'))
    .map(sourcePath => path.relative(path.join(ROOT, 'static'), sourcePath).split(path.sep).join('/')),
);
for (const coreRouteOutput of ['index.md', 'about.md', 'community.md']) {
  if (staticMarkdown.has(coreRouteOutput)) {
    errors.push(`Core route Markdown must be generated from HTML, not maintained in static/: /${coreRouteOutput}`);
  }
}
for (const item of expectedGenerated) {
  if (staticMarkdown.has(item.output)) {
    errors.push(`Static/generated collision at /${item.output} (source: ${item.source})`);
  }
}

const llmsPath = path.join(BUILD_DIR, 'llms.txt');
if (fs.existsSync(llmsPath)) {
  const llmsContent = fs.readFileSync(llmsPath, 'utf8');
  const canonicalOrigin = 'https://reshapr.io';
  for (const corePage of ['index.md', 'about.md', 'community.md', 'blog.md']) {
    if (!llmsContent.includes(`](${canonicalOrigin}/${corePage})`)) {
      errors.push(`llms.txt does not include canonical core page: ${canonicalOrigin}/${corePage}`);
    }
  }
  for (const item of expectedGenerated) {
    if (!llmsContent.includes(`](${canonicalOrigin}/${item.output})`)) {
      errors.push(`llms.txt does not include canonical generated page: ${canonicalOrigin}/${item.output}`);
    }
  }
  const linkedTargets = [...llmsContent.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
  for (const linkedTarget of linkedTargets) {
    if (linkedTarget.startsWith('/')) {
      errors.push(`llms.txt internal link must use the canonical origin: ${linkedTarget}`);
      continue;
    }

    let linkedUrl;
    try {
      linkedUrl = new URL(linkedTarget);
    } catch {
      errors.push(`Invalid llms.txt link: ${linkedTarget}`);
      continue;
    }

    if (linkedUrl.origin !== canonicalOrigin) continue;
    if (linkedUrl.pathname.startsWith('//')) {
      errors.push(`Malformed canonical llms.txt link: ${linkedTarget}`);
      continue;
    }
    const linkedOutput = linkedUrl.pathname.replace(/^\/+/, '');
    if (!outputExists(linkedOutput)) errors.push(`Broken llms.txt link: ${linkedTarget}`);
  }
}

const blogIndexPath = path.join(BUILD_DIR, 'blog.md');
if (fs.existsSync(blogIndexPath)) {
  const blogIndex = fs.readFileSync(blogIndexPath, 'utf8');
  for (const item of expectedGenerated.filter(item => item.source.startsWith('blog/'))) {
    if (!blogIndex.includes(`/${item.output}`)) {
      errors.push(`Blog index does not include /${item.output}`);
    }
  }
}

const demosPath = path.join(BUILD_DIR, 'docs/demos.md');
if (fs.existsSync(demosPath)) {
  const demos = fs.readFileSync(demosPath, 'utf8');
  for (const url of [
    'https://www.youtube.com/@reShaprio',
    'https://youtu.be/bmSPkisbqJo',
    'https://youtu.be/ECZAiXbSwDc',
    'https://youtu.be/EmBNZfUceTI',
  ]) {
    if (!demos.includes(url)) errors.push(`Generated demos Markdown lost link: ${url}`);
  }
}

if (errors.length > 0) {
  console.error('[machine-content] Validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`[machine-content] Validated ${expectedGenerated.length} generated pages, ${sitemapPages.length} negotiable routes, and ${requiredOutputs.length} core resources.`);
}
