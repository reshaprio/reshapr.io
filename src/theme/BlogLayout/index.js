import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import PageMotionRoot, {LoadReveal} from '@site/src/components/PageMotion';

export default function BlogLayout(props) {
  const {sidebar, toc, children, ...layoutProps} = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;
  return (
    <Layout {...layoutProps}>
      <PageMotionRoot>
        <div className="container margin-vert--lg">
          <div className="row">
            <BlogSidebar sidebar={sidebar} />
            <main
              className={clsx('col', {
                'col--7': hasSidebar,
                'col--9 col--offset-1': !hasSidebar,
              })}>
              <LoadReveal>{children}</LoadReveal>
            </main>
            {toc && <div className="col col--2">{toc}</div>}
          </div>
        </div>
      </PageMotionRoot>
    </Layout>
  );
}
