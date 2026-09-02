#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const {gfm} = require('turndown-plugin-gfm');

const {
  BUILD_DIR,
  SITE_URL,
  routeHtmlOutputPath,
  routeMarkdownOutputPath,
  sitemapLocations,
} = require('./machine-content');

const turndown = new TurndownService({
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  headingStyle: 'atx',
});
turndown.use(gfm);

function pageMarkdown(html, pageUrl) {
  const $ = cheerio.load(html);
  const main = $('main').first();

  if (main.length === 0) {
    throw new Error(`No main content found in ${pageUrl}`);
  }

  main.find([
    'button',
    'script',
    'style',
    'svg',
    '.pagination-nav',
    '.table-of-contents',
    '.theme-doc-breadcrumbs',
    '.theme-edit-this-page',
  ].join(',')).remove();

  return turndown.turndown(main.html() || '')
    .replace(/\u200b/g, '')
    .replace(/\[\]\([^\n)]*(?:\([^\n)]*\)[^\n)]*)*\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

let generatedCount = 0;
let existingCount = 0;

for (const location of sitemapLocations()) {
  const pageUrl = new URL(location);
  if (pageUrl.origin !== SITE_URL) continue;

  const markdownPath = path.join(BUILD_DIR, routeMarkdownOutputPath(pageUrl.pathname));
  if (fs.existsSync(markdownPath)) {
    existingCount += 1;
    continue;
  }

  const htmlPath = path.join(BUILD_DIR, routeHtmlOutputPath(pageUrl.pathname));
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`No built HTML found for ${pageUrl.pathname}`);
  }

  const markdown = pageMarkdown(fs.readFileSync(htmlPath, 'utf8'), pageUrl.href);
  if (!markdown) {
    throw new Error(`No Markdown content extracted from ${pageUrl.pathname}`);
  }

  fs.mkdirSync(path.dirname(markdownPath), {recursive: true});
  fs.writeFileSync(markdownPath, `${markdown}\n`);
  generatedCount += 1;
}

console.log(
  `[machine-content] Generated ${generatedCount} route Markdown pages; preserved ${existingCount} existing pages.`,
);
