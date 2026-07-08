import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import ThemedImage from '@theme/ThemedImage';
import styles from './styles.module.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function AuthorMeta({authors, assets, date}) {
  const authorNames = authors
    ?.map((a, idx) => {
      const imageUrl = assets?.authorsImageUrls?.[idx] ?? a.imageURL;
      return {name: a.name, imageUrl};
    }) ?? [];

  return (
    <div className={styles.meta}>
      {authorNames.map(({name, imageUrl}, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className={styles.metaSep}>&amp;</span>}
          <span className={styles.metaAuthor}>
            {imageUrl && (
              <img src={imageUrl} alt={name} className={styles.metaAvatar} loading="lazy" />
            )}
            <span>{name}</span>
          </span>
        </React.Fragment>
      ))}
      {authorNames.length > 0 && (
        <span className={styles.metaDot} aria-hidden>·</span>
      )}
      <time dateTime={date}>{formatDate(date)}</time>
    </div>
  );
}

function BlogPostImage({image, imageDark, className, loading}) {
  if (imageDark) {
    return (
      <ThemedImage
        sources={{
          light: image,
          dark: imageDark,
        }}
        alt=""
        className={className}
        loading={loading}
      />
    );
  }

  return <img src={image} alt="" className={className} loading={loading} />;
}

/** First post — prominent editorial hero */
function FeaturedPost({item}) {
  const {metadata, assets} = item.content;
  const {title, permalink, date, authors, description, frontMatter} = metadata;
  const image = frontMatter?.image;
  const imageDark = frontMatter?.imageDark;

  return (
    <article className={styles.hero}>
      {image && (
        <Link to={permalink} className={styles.heroImageWrap} tabIndex={-1} aria-hidden>
          <BlogPostImage
            image={image}
            imageDark={imageDark}
            className={styles.heroImage}
            loading="eager"
          />
        </Link>
      )}
      <div className={styles.heroBody}>
        <h2 className={styles.heroTitle}>
          <Link to={permalink}>{title}</Link>
        </h2>
        {description && <p className={styles.heroDescription}>{description}</p>}
        <AuthorMeta authors={authors} assets={assets} date={date} />
        <Link className={styles.readMore} to={permalink}>
          Read post <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

/** Remaining posts — substantial rows with thumbnail */
function PostRow({item}) {
  const {metadata, assets} = item.content;
  const {title, permalink, date, authors, description, frontMatter} = metadata;
  const image = frontMatter?.image;
  const imageDark = frontMatter?.imageDark;

  return (
    <article className={styles.row}>
      {image && (
        <Link to={permalink} className={styles.rowImageWrap} tabIndex={-1} aria-hidden="true">
          <BlogPostImage
            image={image}
            imageDark={imageDark}
            className={styles.rowImage}
            loading="lazy"
          />
        </Link>
      )}
      <div className={styles.rowBody}>
        <h2 className={styles.rowTitle}>
          <Link to={permalink}>{title}</Link>
        </h2>
        {description && <p className={styles.rowDescription}>{description}</p>}
        <div className={styles.rowFooter}>
          <AuthorMeta authors={authors} assets={assets} date={date} />
          <Link className={styles.readMore} to={permalink}>
            Read post <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogListPageMetadata({metadata}) {
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const {blogDescription, blogTitle, permalink} = metadata;
  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent({metadata, items, sidebar}) {
  const [featured, ...rest] = items;

  return (
    <BlogLayout sidebar={sidebar}>
      <div className={styles.root}>
        {featured && <FeaturedPost item={featured} />}

        {rest.length > 0 && (
          <section className={styles.latestSection}>
            <h2 className={styles.latestHeading}>Latest posts</h2>
            <div className={styles.latestList}>
              {rest.map((item) => (
                <PostRow key={item.content.metadata.permalink} item={item} />
              ))}
            </div>
          </section>
        )}

        <BlogListPaginator metadata={metadata} />
      </div>
    </BlogLayout>
  );
}

export default function BlogListPage(props) {
  const {metadata, items, sidebar} = props;
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      <BlogListPageMetadata metadata={metadata} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent metadata={metadata} items={items} sidebar={sidebar} />
    </HtmlClassNameProvider>
  );
}
