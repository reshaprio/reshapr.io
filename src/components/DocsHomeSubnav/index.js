import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.css';

function stripTrailingSlash(p) {
  if (p.length <= 1) {
    return p;
  }
  return p.replace(/\/$/, '');
}

export default function DocsHomeSubnav() {
  const {pathname} = useLocation();
  const docsRoot = stripTrailingSlash(useBaseUrl('/docs/'));
  const tutorialsPrefix = stripTrailingSlash(useBaseUrl('/docs/tutorials'));
  const howToPrefix = stripTrailingSlash(useBaseUrl('/docs/how-to-guides'));
  const explanationPrefix = stripTrailingSlash(useBaseUrl('/docs/explanation'));
  const referencePrefix = stripTrailingSlash(useBaseUrl('/docs/reference'));
  const demosHref = useBaseUrl('/docs/demos');
  const demosPath = stripTrailingSlash(demosHref);

  const normalizedPath = stripTrailingSlash(pathname);

  const onDocsHome =
    normalizedPath === docsRoot || pathname === `${docsRoot}/`;

  const onGuides =
    pathname.startsWith(`${tutorialsPrefix}/`) ||
    pathname === tutorialsPrefix ||
    pathname.startsWith(`${howToPrefix}/`) ||
    pathname === howToPrefix;

  const onExplanation =
    pathname.startsWith(`${explanationPrefix}/`) ||
    pathname === explanationPrefix;

  const onReference =
    pathname.startsWith(`${referencePrefix}/`) ||
    pathname === referencePrefix;

  const onDemos = normalizedPath === demosPath || pathname === demosHref;

  const tabs = [
    {label: 'Platform', to: '/docs/', active: onDocsHome},
    {
      label: 'Guides',
      to: '/docs/tutorials/getting-started',
      active: onGuides,
    },
    {
      label: 'Explanation',
      to: '/docs/overview/why-reshapr',
      active: onExplanation,
    },
    {
      label: 'Reference',
      to: '/docs/reference/features',
      active: onReference,
    },
    {label: 'Demos', to: '/docs/demos', active: onDemos},
  ];

  return (
    <div className={styles.topBar}>
      <nav className={styles.subnav} aria-label="Documentation areas">
        <div className={styles.tabRow}>
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              className={clsx(styles.tab, tab.active && styles.tabActive)}
              to={tab.to}>
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
