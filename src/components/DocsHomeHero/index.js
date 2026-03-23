import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * Optional hero band for docs home: lead copy + decorative media (Gram-style balance).
 * Omit `mediaSrc` for text-only hero.
 */
export default function DocsHomeHero({children, mediaSrc, mediaAlt = ''}) {
  const defaultSrc = useBaseUrl('/design/reShapr-palette-sticker-sheet.svg');
  const resolvedSrc = mediaSrc === null ? null : (mediaSrc ?? defaultSrc);
  const showMedia = Boolean(resolvedSrc);

  return (
    <div
      className={clsx(
        styles.hero,
        !showMedia && styles.heroTextOnly,
        'docs-home-hero',
      )}>
      <div className={styles.heroBody}>{children}</div>
      {showMedia ? (
        <div
          className={styles.heroAside}
          aria-hidden={mediaAlt ? undefined : 'true'}>
          <img
            className={styles.heroImg}
            src={resolvedSrc}
            alt={mediaAlt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
    </div>
  );
}
