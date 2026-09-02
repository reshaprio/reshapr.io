import React, {useEffect} from 'react';
import Layout from '@theme/Layout';

export default function AgentRedirect({target, title}) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <Layout title={title} description="Redirecting to a machine-readable reShapr resource.">
      <main className="container margin-vert--lg">
        <h1>{title}</h1>
        <p>
          This Agent View route has moved to the raw resource at{' '}
          <a href={target}>{target}</a>.
        </p>
      </main>
    </Layout>
  );
}
