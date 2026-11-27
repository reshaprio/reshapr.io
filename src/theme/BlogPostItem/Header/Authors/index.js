import React from 'react';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import styles from './styles.module.css';

/**
 * Compact inline byline — replaces the default dual-avatar column layout.
 * Shows small avatars + "Name & Name" on one line; date/reading-time come
 * from the Info component above so we don't duplicate them here.
 */
export default function BlogPostItemHeaderAuthors() {
  const {
    metadata: {authors},
    assets,
  } = useBlogPost();

  if (!authors.length) return null;

  return (
    <div className={styles.byline}>
      {authors.map((author, idx) => {
        const imageUrl = assets.authorsImageUrls[idx] ?? author.imageURL;
        const name = author.name;
        // Link to the author page when the author has one (authors.yml `page: true`),
        // like Docusaurus' default byline; otherwise fall back to the author's `url`.
        const url = author.page?.permalink ?? author.url;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className={styles.separator}>&amp;</span>}
            <span className={styles.author}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  className={styles.avatar}
                  loading="lazy"
                />
              )}
              {url ? (
                <Link to={url} className={styles.authorName}>
                  {name}
                </Link>
              ) : (
                <span className={styles.authorName}>{name}</span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
