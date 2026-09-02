import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(
  new URL('../netlify/edge-functions/content-negotiation.js', import.meta.url),
  'utf8',
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {
  default: contentNegotiation,
  markdownPathname,
} = await import(moduleUrl);

test('maps sitemap routes to their Markdown counterparts', () => {
  assert.equal(markdownPathname('/'), '/index.md');
  assert.equal(markdownPathname('/docs'), '/docs/index.md');
  assert.equal(markdownPathname('/docs/'), '/docs/index.md');
  assert.equal(markdownPathname('/blog'), '/blog.md');
  assert.equal(markdownPathname('/blog/tags/mcp/'), '/blog/tags/mcp.md');
  assert.equal(markdownPathname('/agent/'), '/agent.md');
});

test('does not negotiate requests that already target files', () => {
  assert.equal(markdownPathname('/llms.txt'), null);
  assert.equal(markdownPathname('/docs/tutorial.md'), null);
  assert.equal(markdownPathname('/img/logo.png'), null);
});

test('serves Markdown and marks the response as varying by Accept', async () => {
  let downstreamRequest;
  const context = {
    async next(request) {
      downstreamRequest = request;
      return new Response('# Markdown', {
        headers: {
          'content-type': 'text/markdown; charset=UTF-8',
          vary: 'Accept-Encoding',
        },
      });
    },
  };
  const request = new Request('https://reshapr.io/blog/tags/mcp', {
    headers: {accept: 'text/markdown, text/html;q=0.9'},
  });

  const response = await contentNegotiation(request, context);

  assert.equal(new URL(downstreamRequest.url).pathname, '/blog/tags/mcp.md');
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=UTF-8');
  assert.equal(response.headers.get('content-location'), '/blog/tags/mcp.md');
  assert.equal(response.headers.get('vary'), 'Accept-Encoding, Accept');
  assert.equal(await response.text(), '# Markdown');
});

test('leaves ordinary browser requests unchanged', async () => {
  let called = false;
  const response = await contentNegotiation(
    new Request('https://reshapr.io/docs/', {headers: {accept: 'text/html'}}),
    {next: async () => { called = true; }},
  );

  assert.equal(response, undefined);
  assert.equal(called, false);
});

test('leaves unsupported request methods unchanged', async () => {
  let called = false;
  const response = await contentNegotiation(
    new Request('https://reshapr.io/docs/', {
      method: 'POST',
      headers: {accept: 'text/markdown'},
    }),
    {next: async () => { called = true; }},
  );

  assert.equal(response, undefined);
  assert.equal(called, false);
});
