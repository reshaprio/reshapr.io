import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

function parseCatalog(content) {
  return content.split('\n').flatMap(line => {
    const match = line.match(/^- \[(.+)\]\((\/(?:docs|blog)\/[^)]+\.md)\)(?::\s*(.*))?$/);
    if (!match) return [];
    return [{title: match[1], href: match[2], description: match[3] ?? ''}];
  });
}

function CatalogSection({title, entries}) {
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {entries.map(entry => (
          <li key={entry.href}>
            <a href={entry.href}>{entry.title}</a>
            {entry.description && <> — {entry.description}</>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AgentHomeView() {
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/llms.txt')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(content => {
        if (!cancelled) setCatalog(parseCatalog(content));
      })
      .catch(fetchError => {
        if (!cancelled) setError(`Unable to load the catalog: ${fetchError.message}`);
      });
    return () => { cancelled = true; };
  }, []);

  const docs = catalog.filter(entry => entry.href.startsWith('/docs/'));
  const posts = catalog.filter(entry => entry.href.startsWith('/blog/'));

  return (
    <Layout title="Agent resources" description="Machine-readable reShapr resources for AI agents and LLMs.">
      <main className="container margin-vert--lg">
        <h1>Machine-readable reShapr resources</h1>
        <p>
          Agents should consume the raw resources below directly. Documentation
          and blog pages expose a matching Markdown file at the same path with
          <code>.md</code> appended.
        </p>
        <ul>
          <li><a href="/llms.txt">Documentation index (llms.txt)</a></li>
          <li><a href="/llms-full.txt">Complete documentation (llms-full.txt)</a></li>
          <li><a href="/index.md">Website summary (index.md)</a></li>
          <li><a href="/docs/index.md">Documentation home (Markdown)</a></li>
          <li><a href="/blog.md">Blog index (Markdown)</a></li>
          <li><a href="/about.md">About reShapr (Markdown)</a></li>
          <li><a href="/community.md">Community resources (Markdown)</a></li>
        </ul>
        <h2>Complete catalog</h2>
        {error && <p role="alert">{error} Use <a href="/llms.txt">llms.txt</a> directly.</p>}
        {!error && catalog.length === 0 && <p aria-live="polite">Loading the catalog…</p>}
        {docs.length > 0 && <CatalogSection title={`Documentation (${docs.length})`} entries={docs} />}
        {posts.length > 0 && <CatalogSection title={`Blog posts (${posts.length})`} entries={posts} />}
        <p><Link to="/">Return to the human-readable website</Link></p>
      </main>
    </Layout>
  );
}
