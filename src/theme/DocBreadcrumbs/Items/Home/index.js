import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {translate} from '@docusaurus/Translate';

export default function HomeBreadcrumbItem() {
  const homeHref = useBaseUrl('/');

  return (
    <li className="breadcrumbs__item">
      <Link
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.platform',
          message: 'Platform',
          description: 'Top-level breadcrumb linking to the marketing site',
        })}
        className="breadcrumbs__link"
        href={homeHref}>
        Platform
      </Link>
    </li>
  );
}
