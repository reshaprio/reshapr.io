import React, { useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

function getAgentHref(pathname) {
  if (pathname.startsWith('/agent/') || pathname === '/agent') return null;

  if (pathname === '/' || pathname === '') return '/agent/';
  if (pathname.startsWith('/blog')) return '/agent/blog';

  if (pathname.startsWith('/docs/overview')) return '/agent/docs?s=overview';
  if (
    pathname.includes('docker-compose') ||
    pathname.includes('kubernetes') ||
    pathname.includes('hybrid-gateway')
  ) return '/agent/docs?s=how-to-guides';
  if (pathname.startsWith('/docs/tutorials')) return '/agent/docs?s=tutorials';
  if (pathname.startsWith('/docs/how-to-guides')) return '/agent/docs?s=how-to-guides';
  if (pathname.startsWith('/docs/explanation')) return '/agent/docs?s=explanation';
  if (pathname.startsWith('/docs/reference')) return '/agent/docs?s=reference';
  if (pathname.startsWith('/docs/demos')) return '/agent/docs?s=demos';
  if (pathname.startsWith('/docs')) return '/agent/docs?s=overview';

  if (pathname.startsWith('/about')) return '/agent/about';
  if (pathname.startsWith('/community')) return '/agent/community';

  // No page-specific equivalent — fall back to the agent homepage
  return '/agent/';
}

export default function Root({ children }) {
  const location = useLocation();
  const { pathname } = location;
  const agentHref = getAgentHref(pathname);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-GQMWM4NR59', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return (
    <>
      {children}
      {agentHref && (
        <Link to={agentHref} className="agent-view-toggle" aria-label="Switch to agent view">
          {/* SVG unchanged */}
          Agent View
        </Link>
      )}
    </>
  );
}