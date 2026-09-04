#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  BUILD_DIR,
  MACHINE_DIRECTIVE,
  ROOT,
  publishedSources,
  sourceOutputPath,
  verificationDirective,
  walkMarkdown,
} = require('./machine-content');

function injectDirectives(content, verification) {
  let updatedContent = content;

  if (!updatedContent.includes(MACHINE_DIRECTIVE)) {
    const heading = updatedContent.match(/^# [^\r\n]+\r?\n/);
    if (!heading) {
      updatedContent = `${MACHINE_DIRECTIVE}\n\n${updatedContent}`;
    } else {
      const body = updatedContent.slice(heading[0].length).replace(/^(?:\r?\n)+/, '');
      updatedContent = `${heading[0]}\n${MACHINE_DIRECTIVE}\n\n${body}`;
    }
  }

  if (verification && !updatedContent.includes(verification)) {
    updatedContent = updatedContent.replace(
      `${MACHINE_DIRECTIVE}\n`,
      `${MACHINE_DIRECTIVE}\n\n${verification}\n`,
    );
  }

  return updatedContent;
}

const verificationByOutput = new Map(
  publishedSources(path.join(ROOT, 'docs'))
    .map(source => [
      sourceOutputPath(source.sourcePath, source.frontMatter),
      verificationDirective(source.frontMatter.verification),
    ]),
);
const markdownFiles = walkMarkdown(BUILD_DIR);
let injectedCount = 0;

for (const markdownPath of markdownFiles) {
  const content = fs.readFileSync(markdownPath, 'utf8');
  const relativePath = path.relative(BUILD_DIR, markdownPath).split(path.sep).join('/');
  const updatedContent = injectDirectives(content, verificationByOutput.get(relativePath));

  if (updatedContent !== content) {
    fs.writeFileSync(markdownPath, updatedContent);
    injectedCount += 1;
  }
}

console.log(
  `Added the Agent View directive to ${injectedCount} of ${markdownFiles.length} Markdown pages.`,
);
