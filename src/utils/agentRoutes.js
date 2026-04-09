const DOCS_SECTION_MAP = {
  '/docs/overview':       'overview',
  '/docs/tutorials':      'tutorials',
  '/docs/how-to-guides':  'how-to-guides',
  '/docs/explanation':    'explanation',
  '/docs/reference':      'reference',
  '/docs/demos':          'demos',
};

const DOCS_KEYWORD_MAP = {
  'docker-compose':   'how-to-guides',
  'kubernetes':       'how-to-guides',
  'hybrid-gateway':   'how-to-guides',
};

const SIMPLE_PREFIXES = ['/blog', '/about', '/community'];

export function getAgentHref(pathname) {
  if (pathname.startsWith('/agent/') || pathname === '/agent') return null;
  if (pathname === '/' || pathname === '') return '/agent/';

  // Docs: explicit section mapping (many-to-one)
  if (pathname.startsWith('/docs')) {
    for (const [prefix, section] of Object.entries(DOCS_SECTION_MAP)) {
      if (pathname.startsWith(prefix)) return `/agent/docs?s=${section}`;
    }
    for (const [keyword, section] of Object.entries(DOCS_KEYWORD_MAP)) {
      if (pathname.includes(keyword)) return `/agent/docs?s=${section}`;
    }
    return '/agent/docs?s=overview';
  }

  // Convention: /blog/* -> /agent/blog, /about/* -> /agent/about, etc.
  for (const prefix of SIMPLE_PREFIXES) {
    if (pathname.startsWith(prefix)) return `/agent${prefix}`;
  }

  return '/agent/';
}
