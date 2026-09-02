export function getAgentHref(pathname) {
  const normalizedPath = pathname.length > 1
    ? pathname.replace(/\/+$/, '')
    : pathname;

  if (normalizedPath.startsWith('/agent')) return null;
  if (normalizedPath === '/' || normalizedPath === '') return '/index.md';
  if (normalizedPath === '/docs') return '/docs/index.md';
  if (normalizedPath.startsWith('/docs/')) return `${normalizedPath}.md`;
  if (normalizedPath === '/blog') return '/blog.md';
  if (/^\/blog\/(archive|authors|page|tags)(\/|$)/.test(normalizedPath)) return '/blog.md';
  if (normalizedPath.startsWith('/blog/')) return `${normalizedPath}.md`;
  if (normalizedPath === '/about') return '/about.md';
  if (normalizedPath === '/community') return '/community.md';

  return '/agent/';
}
