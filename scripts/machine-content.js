const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SITE_URL = 'https://reshapr.io';

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
  ROOT,
  SITE_URL,
  publishedSources,
  sourceOutputPath,
  walkMarkdown,
};
