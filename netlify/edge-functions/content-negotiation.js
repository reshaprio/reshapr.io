function acceptsMarkdown(request) {
  return (request.headers.get('accept') || '')
    .split(',')
    .some(value => value.trim().split(';', 1)[0].toLowerCase() === 'text/markdown');
}

export function markdownPathname(pathname) {
  const routePath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const legacyAgentRoutes = {
    '/agent': '/index.md',
    '/agent/about': '/about.md',
    '/agent/blog': '/blog.md',
    '/agent/community': '/community.md',
    '/agent/docs': '/docs/index.md',
  };

  if (legacyAgentRoutes[routePath]) return legacyAgentRoutes[routePath];
  if (/\.[^/]+$/.test(routePath)) return null;
  if (routePath === '/') return '/index.md';
  if (routePath === '/docs') return '/docs/index.md';
  return `${routePath}.md`;
}

function addVaryAccept(headers) {
  const vary = headers.get('vary');
  if (!vary) {
    headers.set('vary', 'Accept');
    return;
  }

  if (!vary.split(',').some(value => value.trim().toLowerCase() === 'accept')) {
    headers.set('vary', `${vary}, Accept`);
  }
}

export default async function contentNegotiation(request, context) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return;
  if (!acceptsMarkdown(request)) return;

  const requestUrl = new URL(request.url);
  const markdownPath = markdownPathname(requestUrl.pathname);
  if (!markdownPath) return;

  const markdownUrl = new URL(markdownPath, requestUrl);
  const markdownRequest = new Request(markdownUrl, {
    headers: request.headers,
    method: request.method,
  });
  const response = await context.next(markdownRequest);
  const headers = new Headers(response.headers);
  addVaryAccept(headers);
  headers.set('content-location', markdownPath);

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export const config = {
  path: '/*',
  header: {
    accept: 'text/markdown',
  },
  onError: 'bypass',
};
