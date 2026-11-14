import React from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, SkipToContentFallbackId, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';

// Swizzled from @docusaurus/theme-classic: the announcement bar is rendered on the home page only.
export default function Layout(props) {
  const {children, noFooter, wrapperClassName, title, description} = props;
  const {pathname} = useLocation();
  const homePath = useBaseUrl('/');
  const isHome = pathname === homePath || pathname === `${homePath}index.html`;

  useKeyboardNavigation();

  return (
    <LayoutProvider>
      <PageMetadata title={title} description={description} />

      <SkipToContent />

      {isHome && <AnnouncementBar />}

      <Navbar />

      <div
        id={SkipToContentFallbackId}
        className={clsx(
          ThemeClassNames.layout.main.container,
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>{children}</ErrorBoundary>
      </div>

      {!noFooter && <Footer />}
    </LayoutProvider>
  );
}
