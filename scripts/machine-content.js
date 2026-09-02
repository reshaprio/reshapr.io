const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SITE_URL = 'https://reshapr.io';
const MACHINE_DIRECTIVE =
  '> For AI agents: the complete documentation index is available at https://reshapr.io/llms.txt and the full documentation bundle at https://reshapr.io/llms-full.txt.';

function walkMarkdown(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, {withFileTypes: true})
    .flatMap(entry => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdown(absolutePath);
      if (entry.name.startsWith('_') || !/\.mdx?$/.test(entry.name)) return [];
      return [absolutePath];
    });
}

function sitemapLocations() {
  const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return [];

  return [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1]);
}

function normalizedRoutePath(pathname) {
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function routeMarkdownOutputPath(pathname) {
  const routePath = normalizedRoutePath(pathname);
  if (routePath === '/') return 'index.md';
  if (routePath === '/docs') return 'docs/index.md';
  return `${routePath.replace(/^\/+/, '')}.md`;
}

function routeHtmlOutputPath(pathname) {
  const routePath = normalizedRoutePath(pathname);
  if (routePath === '/') return 'index.html';
  return path.join(routePath.replace(/^\/+/, ''), 'index.html');
}

function readSource(sourcePath) {
  const parsed = matter(fs.readFileSync(sourcePath, 'utf8'));
  return {sourcePath, frontMatter: parsed.data};
}

function sourceOutputPath(sourcePath, frontMatter = {}) {
  let relativePath = path.relative(ROOT, sourcePath)
    .split(path.sep)
    .join('/')
    .replace(/\.mdx?$/, '.md');

  for (const key of ['slug', 'id']) {
    if (typeof frontMatter[key] !== 'string') continue;
    const value = frontMatter[key].trim().replace(/^\/+|\/+$/g, '');
    if (!value) break;
    if (value.includes('/')) return `${value}.md`;
    const parts = relativePath.replace(/\.md$/, '').split('/');
    parts[parts.length - 1] = value;
    return `${parts.join('/')}.md`;
  }

  return relativePath;
}

function publishedSources(directory) {
  return walkMarkdown(directory)
    .map(readSource)
    .filter(source => !source.frontMatter.draft && !source.frontMatter.unlisted);
}

module.exports = {
  BUILD_DIR,
  MACHINE_DIRECTIVE,
  ROOT,
  SITE_URL,
  publishedSources,
  routeHtmlOutputPath,
  routeMarkdownOutputPath,
  sitemapLocations,
  sourceOutputPath,
  walkMarkdown,
};
