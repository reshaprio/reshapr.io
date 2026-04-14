import React, { useEffect } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { getAgentHref } from '@site/src/utils/agentRoutes';

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
      <blockquote className="llms-txt-directive">
        For the complete documentation index, see <a href="/llms.txt">llms.txt</a>.
      </blockquote>
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