#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  BUILD_DIR,
  ROOT,
  SITE_URL,
  publishedSources,
  sourceOutputPath,
} = require('./machine-content');

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').slice(0, 10);
}

function escapeLinkLabel(value) {
  return String(value).replace(/([\[\]])/g, '\\$1');
}

const posts = publishedSources(path.join(ROOT, 'blog'))
  .map(source => ({
    ...source,
    outputPath: sourceOutputPath(source.sourcePath, source.frontMatter),
  }))
  .sort((left, right) => formatDate(right.frontMatter.date).localeCompare(formatDate(left.frontMatter.date)));

const entries = posts.map(({frontMatter, outputPath}) => {
  const title = escapeLinkLabel(frontMatter.title ?? path.basename(outputPath, '.md'));
  const markdownUrl = `${SITE_URL}/${outputPath}`;
  const humanUrl = markdownUrl.replace(/\.md$/, '');
  const tags = Array.isArray(frontMatter.tags) && frontMatter.tags.length > 0
    ? `\n\nTags: ${frontMatter.tags.join(', ')}`
    : '';

  return `## [${title}](${markdownUrl})\n\nPublished: ${formatDate(frontMatter.date)}\n\n${frontMatter.description ?? ''}${tags}\n\nHuman-readable post: ${humanUrl}`;
});

const content = `# reShapr Blog\n\n> Perspectives on AI infrastructure, the Model Context Protocol, and enterprise API enablement from the team building reShapr.\n\nHuman-readable blog: ${SITE_URL}/blog\n\nThe post titles below link directly to their machine-readable Markdown versions.\n\n${entries.join('\n\n---\n\n')}\n\n---\n\nFor the complete documentation index, see ${SITE_URL}/llms.txt.\n`;

fs.mkdirSync(BUILD_DIR, {recursive: true});
fs.writeFileSync(path.join(BUILD_DIR, 'blog.md'), content);
console.log(`[machine-content] Generated blog.md with ${posts.length} posts.`);
