import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

const featureCards = [
  {
    title: 'No-code API translation',
    description:
      'Turn existing REST, GraphQL, and gRPC services into MCP endpoints without rewriting your backend.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    title: 'Security-first exposure',
    description:
      'Apply API key or OAuth protections, backend secrets, and operation filters before agents can call tools.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Deploy Anywhere',
    description:
      'Expose endpoints on managed gateways or run gateways in your own trust domain for stricter data boundaries.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const highlights = [
  'OpenAPI, GraphQL, gRPC to MCP conversion',
  'Security and policy controls before exposure',
  'Cloud native and flexible deployment patterns',
  'Fast setup with docs-first onboarding',
];

function HomepageHeader() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <Heading as="h1" className={styles.heroTitle}>
              The open source, no-code MCP Server for AI-Native API Access
            </Heading>
            <p className={styles.heroSubtitle}>
              Build a uniform API value chain for AI agents with secure, no-code
              endpoint translation across your existing API services.
            </p>
            <div className={styles.buttons}>
              <Link className="button button--primary button--lg" to="https://try.reshapr.io/">
                Try it!
              </Link>
              <Link
                className="button button--secondary button--lg"
                href="/docs/overview/why-reshapr"
                target="_blank"
                rel="noopener noreferrer">
                Get Started
              </Link>
            </div>
          </div>
          <div className={styles.heroImageWrap}>
            <video
              className={styles.heroImage}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="reShapr hero demo video">
              <source src="/img/banner-hero-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageMain() {
  return (
    <main>
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <Heading as="h2">Everything you need to ship MCP endpoints</Heading>
            <p>
              Build an AI-ready access layer on top of your existing APIs with
              governance, security controls, and flexible deployment.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {featureCards.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureBody}>
                  <Heading as="h3">{feature.title}</Heading>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div>
              <Heading as="h2">Start building with reShapr</Heading>
              <p>
                Follow the quickstart, import your first API artifact, and expose secure MCP endpoints instantly.
              </p>
            </div>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/tutorials/getting-started">
                Quickstart
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/overview/how-it-works">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="reShapr documentation and guides for building secure MCP endpoints from existing APIs.">
      <HomepageHeader />
      <HomepageMain />
    </Layout>
  );
}
