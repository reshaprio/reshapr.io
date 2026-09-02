#!/usr/bin/env node

const fs = require('fs');

const {
  BUILD_DIR,
  MACHINE_DIRECTIVE,
  walkMarkdown,
} = require('./machine-content');

function injectDirective(content) {
  if (content.includes(MACHINE_DIRECTIVE)) {
    return content;
  }

  const heading = content.match(/^# [^\r\n]+\r?\n/);
  if (!heading) {
    return `${MACHINE_DIRECTIVE}\n\n${content}`;
  }

  const body = content.slice(heading[0].length).replace(/^(?:\r?\n)+/, '');
  return `${heading[0]}\n${MACHINE_DIRECTIVE}\n\n${body}`;
}

const markdownFiles = walkMarkdown(BUILD_DIR);
let injectedCount = 0;

for (const markdownPath of markdownFiles) {
  const content = fs.readFileSync(markdownPath, 'utf8');
  const updatedContent = injectDirective(content);

  if (updatedContent !== content) {
    fs.writeFileSync(markdownPath, updatedContent);
    injectedCount += 1;
  }
}

console.log(
  `Added the Agent View directive to ${injectedCount} of ${markdownFiles.length} Markdown pages.`,
);
