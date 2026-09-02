import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';

const SECTION_TARGETS = {
  overview: '/docs/overview/why-reshapr.md',
  tutorials: '/docs/tutorials/getting-started.md',
  'how-to-guides': '/docs/how-to-guides/docker-compose.md',
  explanation: '/docs/explanations/services-and-artifacts.md',
  explanations: '/docs/explanations/services-and-artifacts.md',
  reference: '/docs/references/features.md',
  references: '/docs/references/features.md',
  demos: '/docs/demos.md',
};

export default function LegacyAgentDocsView() {
  const [target, setTarget] = useState('/docs/index.md');

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('s');
    const nextTarget = SECTION_TARGETS[section] ?? '/docs/index.md';
    setTarget(nextTarget);
    window.location.replace(nextTarget);
  }, []);

  return (
    <Layout title="Documentation Agent View moved" description="Redirecting to raw reShapr documentation.">
      <main className="container margin-vert--lg">
        <h1>Documentation Agent View moved</h1>
        <p>
          Documentation is now exposed as page-level Markdown. Continue to{' '}
          <a href={target}>{target}</a> or use the <a href="/llms.txt">complete documentation index</a>.
        </p>
      </main>
    </Layout>
  );
}
