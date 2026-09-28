#!/usr/bin/env node

// docusaurus-plugin-llms copies doc source content into standalone Markdown
// files almost verbatim, so links written as `./foo.md` or `../bar/baz.md`
// (valid in the site's React Router) survive untouched. An agent fetching a
// single generated page has no base URL to resolve those against, so this
// rewrites every internal link and image to an absolute https://reshapr.io/...
// URL, resolved against each file's own location in the build output.

const fs = require('fs');
const path = require('path');
const {BUILD_DIR, SITE_URL, walkMarkdown} = require('./machine-content');

const LINK_PATTERN = /(!?\[[^\]\n]*\])\(([^)]*)\)/g;
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

function splitLinkInner(inner) {
  const spaceIndex = inner.search(/\s/);
  if (spaceIndex === -1) return {url: inner, rest: ''};
  return {url: inner.slice(0, spaceIndex), rest: inner.slice(spaceIndex)};
}

function resolveUrl(url, fileDir, selfPath) {
  if (!url || HAS_SCHEME.test(url) || url.startsWith('//')) return url;

  const hashIndex = url.indexOf('#');
  const pathPart = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : url.slice(hashIndex);

  let routePath;
  if (pathPart === '') {
    routePath = `/${selfPath}`;
  } else if (pathPart.startsWith('/')) {
    routePath = pathPart;
  } else {
    routePath = `/${path.posix.normalize(path.posix.join(fileDir, pathPart))}`;
  }

  return `${SITE_URL}${routePath}${fragment}`;
}

function rewriteLinks(content, fileDir, selfPath) {
  let linksRewritten = 0;
  let inFence = false;

  const updatedLines = content.split('\n').map(line => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    return line.replace(LINK_PATTERN, (match, label, inner) => {
      const {url, rest} = splitLinkInner(inner);
      const resolved = resolveUrl(url, fileDir, selfPath);
      if (resolved === url) return match;
      linksRewritten += 1;
      return `${label}(${resolved}${rest})`;
    });
  });

  return {content: updatedLines.join('\n'), linksRewritten};
}

let rewrittenFiles = 0;
let rewrittenLinks = 0;

for (const markdownPath of walkMarkdown(BUILD_DIR)) {
  const relativePath = path.relative(BUILD_DIR, markdownPath).split(path.sep).join('/');
  const fileDir = path.posix.dirname(relativePath);
  const content = fs.readFileSync(markdownPath, 'utf8');

  const {content: updatedContent, linksRewritten} = rewriteLinks(
    content,
    fileDir === '.' ? '' : fileDir,
    relativePath,
  );

  if (linksRewritten > 0) {
    fs.writeFileSync(markdownPath, updatedContent);
    rewrittenFiles += 1;
    rewrittenLinks += linksRewritten;
  }
}

console.log(
  `[machine-content] Rewrote ${rewrittenLinks} relative link(s) to absolute URLs across ${rewrittenFiles} Markdown page(s).`,
);
