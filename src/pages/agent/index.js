import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import AgentSidebar from './Sidebar';
import styles from './styles.module.css';

/* ─── Copy menu ───────────────────────────────────────────────────────────── */
function CopyMenu({content, mdUrl}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function copy(text, tag) {
    navigator.clipboard.writeText(text);
    setLabel(tag);
    setOpen(false);
    setTimeout(() => setLabel(null), 2000);
  }

  return (
    <div className={styles.copyWrap} ref={ref}>
      <button className={styles.copyBtn} onClick={() => setOpen(o => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {label ?? 'Copy'}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className={styles.dropdown} role="menu">
          <button role="menuitem" onClick={() => copy(mdUrl, '.md URL copied')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Copy .md URL
          </button>
          <button role="menuitem" onClick={() => copy(content, 'Copied!')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            Copy full content
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function AgentHomeView() {
  const {siteConfig} = useDocusaurusContext();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const mdUrl = `${siteConfig.url}/index.md`;

  useEffect(() => {
    document.body.dataset.agentView = 'true';
    return () => { delete document.body.dataset.agentView; };
  }, []);

  useEffect(() => {
    fetch('/index.md')
      .then(r => r.text())
      .then(text => {setContent(text); setLoading(false);})
      .catch(() => {setContent('Failed to load content.'); setLoading(false);});
  }, []);

  return (
    <Layout title="Home — Agent View" description="Machine-readable reShapr home page for AI agents and LLMs.">
      <div className={styles.root}>
        <AgentSidebar activeHref="/agent/" />
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <span className={styles.path}>→ /index.md</span>
            <CopyMenu content={content} mdUrl={mdUrl} />
          </div>
          <pre className={styles.content}>
            {loading ? 'Loading…' : content}
          </pre>
        </div>
      </div>
      <Link to="/" className={styles.viewToggle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Human View
      </Link>
    </Layout>
  );
}
