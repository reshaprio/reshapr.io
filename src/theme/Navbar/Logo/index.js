/**
 * Navbar logo:
 * - **Desktop (`windowSize === 'desktop'`):** PNG wordmarks from `navbar.logo` only.
 * - **Mobile (`windowSize === 'mobile'`):** only `static/img/reShapr-mark.png` (icon-only mark) — no wordmark PNGs in the DOM.
 * - **SSR / first paint (`ssr`):** renders wordmark only; hydration swaps to compact mark on small screens.
 * - **Small-screen bar layout** (≤1024px): hamburger left, mark right — `custom.css` (`space-between` on the left `.navbar__items`).
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig, useWindowSize} from '@docusaurus/theme-common';
import ThemedImage from '@theme/ThemedImage';

/** Icon-only mark — `static/img/reShapr-mark.png` */
const COMPACT_LOGO_PATH = 'img/reShapr-mark.png';

function NavbarLogoThemedImage({logo, alt, imageClassName}) {
  const windowSize = useWindowSize();
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };
  const compactSrc = useBaseUrl(COMPACT_LOGO_PATH);

  const fullBlock = (
    <div
      className={clsx(imageClassName, 'navbar__logo-full')}
      suppressHydrationWarning>
      <ThemedImage
        className={logo.className}
        sources={sources}
        height={logo.height}
        width={logo.width}
        alt={alt}
        style={logo.style}
      />
    </div>
  );

  const compactBlock = (
    <img
      className={clsx(imageClassName, logo.className, 'navbar__logo-compact')}
      src={compactSrc}
      alt={alt}
      style={{...logo.style, display: 'none'}}
      suppressHydrationWarning
    />
  );

  if (windowSize === 'ssr') {
    return fullBlock;
  }
  if (windowSize === 'mobile') {
    return compactBlock;
  }
  return fullBlock;
}

export default function NavbarLogo() {
  const {
    siteConfig: {title},
  } = useDocusaurusContext();
  const {
    navbar: {title: navbarTitle, logo},
  } = useThemeConfig();
  const logoLink = useBaseUrl(logo?.href || '/');
  const fallbackAlt = navbarTitle ? '' : title;
  const alt = logo?.alt ?? fallbackAlt;

  return (
    <Link
      to={logoLink}
      className="navbar__brand"
      {...(logo?.target && {target: logo.target})}>
      {logo && (
        <NavbarLogoThemedImage logo={logo} alt={alt} imageClassName="navbar__logo" />
      )}
      {navbarTitle != null && (
        <b className="navbar__title text--truncate">{navbarTitle}</b>
      )}
    </Link>
  );
}
