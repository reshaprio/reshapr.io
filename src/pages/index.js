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
  },
  {
    title: 'Security-first exposure',
    description:
      'Apply API key or OAuth protections, backend secrets, and operation filters before agents can call tools.',
  },
  {
    title: 'Deploy Anywhere',
    description:
      'Expose endpoints on managed gateways or run gateways in your own trust domain for stricter data boundaries.',
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
              <Link className="button button--primary button--lg" to="/docs/reshapr/why-reshapr">
                Get Started
              </Link>
              <Link
                className="button button--secondary button--lg"
                href="https://github.com/reshaprio/reshapr.io"
                target="_blank"
                rel="noopener noreferrer">
                Explore on GitHub
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
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className="container">
          <div className={styles.panel}>
            <div>
              <Heading as="h2">Built for secure AI-native operations</Heading>
              <p>
                Keep control of exposure, credentials, and runtime behavior while
                giving AI clients reliable access to the right tools.
              </p>
            </div>
            <ul className={styles.checkList}>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <Heading as="h2">Start building with reShapr</Heading>
            <p>
              Follow the quickstart, import your first API artifact, and expose secure MCP endpoints instantly.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/reshapr/why-reshapr">
                CLI Quickstart
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/reshapr/why-reshapr">
                Learn Architecture
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
