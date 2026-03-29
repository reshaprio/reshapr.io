import React, {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {m} from 'motion/react';
import {Code, Copy, Globe, ShieldCheck} from 'lucide-react';

import Heading from '@theme/Heading';
import {ICON_SIZE_INLINE_PX, ICON_SIZE_LP_FEATURE_PX} from '@site/src/constants/iconSizes';
import VideoWithPlaceholder from '@site/src/components/VideoWithPlaceholder';
import PageMotionRoot, {scrollEase, usePageRevealMotion} from '@site/src/components/PageMotion';
import landingShell from '@site/src/components/LandingShell/styles.module.css';
import styles from './index.module.css';

const CLI_INSTALL_CMD = 'npm install -g @reshapr/reshapr-cli';

function CliInstallSnippet() {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(/** @type {number | undefined} */ (undefined));

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== undefined) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const copyCommand = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }
    void navigator.clipboard.writeText(CLI_INSTALL_CMD).then(() => {
      if (copiedTimerRef.current !== undefined) {
        window.clearTimeout(copiedTimerRef.current);
      }
      setCopied(true);
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = undefined;
      }, 2000);
    });
  }, []);

  return (
    <div className={styles.cliQuickstart}>
      <div className={styles.cliBar}>
        <code className={styles.cliCode}>
          <span className={styles.cliPrompt} aria-hidden>
            $
          </span>
          <span className={styles.cliCommand}>{CLI_INSTALL_CMD}</span>
        </code>
        <button
          type="button"
          className={styles.cliCopyBtn}
          onClick={copyCommand}
          aria-label={copied ? 'Copied to clipboard' : 'Copy install command'}
          title={copied ? 'Copied' : 'Copy'}>
          <Copy size={ICON_SIZE_INLINE_PX} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}

const featureIconProps = {
  size: ICON_SIZE_LP_FEATURE_PX,
  strokeWidth: 1.5,
  'aria-hidden': true,
};

const featureCards = [
  {
    title: 'No-code API translation',
    description:
      'Turn existing REST, GraphQL, and gRPC services into MCP endpoints without rewriting your backend.',
    icon: <Code {...featureIconProps} />,
  },
  {
    title: 'Security-first exposure',
    description:
      'Apply API key or OAuth protections, backend secrets, and operation filters before agents can call tools.',
    icon: <ShieldCheck {...featureIconProps} />,
  },
  {
    title: 'Deploy Anywhere',
    description:
      'Expose endpoints on managed gateways or run gateways in your own trust domain for stricter data boundaries.',
    icon: <Globe {...featureIconProps} />,
  },
];

const highlights = [
  'OpenAPI, GraphQL, gRPC to MCP conversion',
  'Security and policy controls before exposure',
  'Cloud native and flexible deployment patterns',
];

function HomepageHeader() {
  const {
    reduceMotion,
    containerVariants,
    itemVariants,
  } = usePageRevealMotion();

  return (
    <header className={clsx(styles.heroBanner)}>
      {/* Copy column — has its own padding to match the site container */}
      <div className={styles.heroContentWrap}>
        <m.div
          className={styles.heroMotionStack}
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <m.div variants={itemVariants}>
            <Heading as="h1" className={styles.heroTitle}>
              The open source, no-code MCP Server for
              <br />
              AI-Native API Access
            </Heading>
          </m.div>

          <m.p variants={itemVariants} className={styles.heroSubtitle}>
            Build a uniform API value chain for AI agents with secure, no-code
            endpoint translation across your existing API services.
          </m.p>

          <m.div variants={itemVariants} className={styles.buttons}>
            <m.div
              className={clsx(styles.heroButtonLift, styles.heroButtonLiftPrimary)}
              whileHover={reduceMotion ? undefined : {y: -0.5}}
              whileTap={reduceMotion ? undefined : {scale: 0.997}}>
              <Link className="button button--primary button--lg" to="/docs/tutorials/try-reshapr-online">
                Try Online
              </Link>
            </m.div>
            <m.div
              className={styles.heroButtonLift}
              whileHover={reduceMotion ? undefined : {y: -0.5}}
              whileTap={reduceMotion ? undefined : {scale: 0.997}}>
              <Link
                className="button button--secondary button--lg"
                to="/docs/overview/why-reshapr">
                Read The Docs
              </Link>
            </m.div>
          </m.div>
        </m.div>
      </div>

      {/* Video column — direct child of heroBanner, extends to the right viewport edge */}
      <m.div
        className={styles.heroImageWrap}
        initial={reduceMotion ? false : {opacity: 0, y: 12}}
        animate={reduceMotion ? false : {opacity: 1, y: 0}}
        transition={{
          duration: 0.85,
          delay: 0.22,
          ease: [0.25, 0.1, 0.25, 1],
        }}>
        <VideoWithPlaceholder
          srcLight="/img/banner-hero-video-light.mp4"
          srcDark="/img/banner-hero-video-dark.mp4"
          className={styles.heroVideoRoot}
          videoClassName={styles.heroImage}
          reduceMotion={reduceMotion}
          autoPlay={!reduceMotion}
          loop={!reduceMotion}
          muted
          playsInline
          preload="metadata"
          aria-label="reShapr hero demo video"
        />
      </m.div>
    </header>
  );
}

function HomepageMain() {
  const {
    reduceMotion,
    inViewBase,
    inViewHidden,
    headerTransition,
    cardTransition,
  } = usePageRevealMotion();

  return (
    <main>
      <section className={styles.section}>
        <div className="container">
          <m.div
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">Everything you need to ship MCP endpoints</Heading>
            <p>
              Build an AI-ready access layer on top of your existing APIs with
              governance, security controls, and flexible deployment.
            </p>
          </m.div>
          <div className={styles.featureGrid}>
            {featureCards.map((feature, index) => (
              <m.article
                key={feature.title}
                className={styles.featureCard}
                initial={inViewHidden}
                whileInView={inViewBase}
                viewport={{once: true, margin: '0px 0px -10% 0px', amount: 0.15}}
                transition={cardTransition(index)}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <div className={styles.featureBody}>
                  <Heading as="h3">{feature.title}</Heading>
                  <p>{feature.description}</p>
                </div>
              </m.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className="container">
          <m.div
            className={styles.panel}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-64px 0px', amount: 0.2}}
            transition={
              reduceMotion
                ? {duration: 0}
                : {duration: 0.52, ease: scrollEase}
            }>
            <div className={styles.panelCopy}>
              <Heading as="h2">Built for secure AI-native operations</Heading>
              <p>
                Keep control of how APIs are exposed to AI clients: credentials,
                policies, and runtime behavior stay in your trust domain, not
                bolted on after the fact.
              </p>
            </div>
            <ul className={clsx(styles.checkList, styles.panelCheckList)}>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </m.div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <m.div
            className={styles.ctaCard}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-48px 0px', amount: 0.3}}
            transition={
              reduceMotion
                ? {duration: 0}
                : {duration: 0.48, ease: scrollEase}
            }>
            <div className={styles.ctaLead}>
              <Heading as="h2">Start building with reShapr</Heading>
              <p>
                Follow the quickstart, import your first API artifact, and expose secure MCP endpoints instantly.
              </p>
            </div>
            <div className={styles.ctaCliRow}>
              <CliInstallSnippet />
              <m.div
                className={clsx(styles.heroButtonLift, styles.heroButtonLiftPrimary)}
                whileHover={reduceMotion ? undefined : {y: -0.5}}
                whileTap={reduceMotion ? undefined : {scale: 0.997}}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/tutorials/getting-started">
                  CLI Quickstart
                </Link>
              </m.div>
            </div>
          </m.div>
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
      description="reShapr instantly turns your existing REST, gRPC, and GraphQL APIs into production-grade MCP servers — no code, no lock-in, no compromises.">
      <PageMotionRoot>
        <div className={landingShell.landingFrame}>
          <HomepageHeader />
          <HomepageMain />
        </div>
      </PageMotionRoot>
    </Layout>
  );
}
