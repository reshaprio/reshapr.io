import React, {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {m} from 'motion/react';
import {Copy, Filter, Globe, Layers, Scale, ShieldCheck, SquareTerminal} from 'lucide-react';

import Heading from '@theme/Heading';
import ThemedImage from '@theme/ThemedImage';
import {ICON_SIZE_INLINE_PX, ICON_SIZE_LP_FEATURE_PX} from '@site/src/constants/iconSizes';
import VideoWithPlaceholder from '@site/src/components/VideoWithPlaceholder';
import PageMotionRoot, {scrollEase, usePageRevealMotion} from '@site/src/components/PageMotion';
import landingShell from '@site/src/components/LandingShell/styles.module.css';
import styles from './index.module.css';

const CLI_INSTALL_CMD = 'npm install -g @reshapr/reshapr-cli --allow-scripts=@scarf/scarf';

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
    title: 'Context Control',
    description: (
      <>
        <strong>Custom Tools</strong> reshape generated tools into the exact
        action an agent needs, and <strong>Tools Output Filtering</strong>{' '}
        trims payloads before they reach the model.
      </>
    ),
    icon: <Filter {...featureIconProps} />,
  },
  {
    title: 'Code Mode',
    description: (
      <>
        Let agents <strong>search tools</strong>,{' '}
        <strong>discover API types</strong>, and{' '}
        <strong>run code in a hardened sandbox</strong> instead of loading
        every tool definition into context.
      </>
    ),
    icon: <SquareTerminal {...featureIconProps} />,
  },
  {
    title: 'Governance & security',
    description: (
      <>
        <strong>API key or OAuth</strong> protection, backend secrets,
        operation filters, quotas, and audit, applied{' '}
        <strong>before any agent can call a tool</strong>.
      </>
    ),
    icon: <ShieldCheck {...featureIconProps} />,
  },
  {
    title: 'Zero rewrite',
    description: (
      <>
        Your <strong>backends stay untouched</strong>. Import an OpenAPI,
        GraphQL, or Protobuf contract and get working MCP tools for{' '}
        <strong>any MCP client</strong>.
      </>
    ),
    icon: <Layers {...featureIconProps} />,
  },
  {
    title: 'Run anywhere',
    description: (
      <>
        Use the CLI on your laptop, <strong>Docker Compose</strong>, or{' '}
        <strong>Kubernetes</strong> with Helm charts and controllers, all
        inside <strong>your own trust domain</strong>.
      </>
    ),
    icon: <Globe {...featureIconProps} />,
  },
  {
    title: 'Open and neutral',
    description: (
      <>
        <strong>Apache-2.0</strong> licensed, with{' '}
        <strong>organization-balanced governance</strong>, built by the
        co-founders of{' '}
        <a href="https://microcks.io/">
          <strong>Microcks</strong>
        </a>
        .
      </>
    ),
    icon: <Scale {...featureIconProps} />,
  },
];

const BENCHMARK_PROMPT = `Using the available GitHub MCP tools, analyze recent pull request velocity for the public repository microsoft/vscode.

Use the 10 most recently updated pull requests. For each pull request, collect the pull request details, up to 5 review touchpoints, and up to 10 changed file paths.

Return a compact summary with pull request id, title, creator, state, creation and merge timestamps, review touchpoints, and changed paths.`;

const problems = [
  {
    title: 'Context overload',
    description: (
      <>
        Raw API responses <strong>waste tokens</strong> and{' '}
        <strong>degrade tool selection</strong>. reShapr filters outputs and
        composes calls so the model <strong>only sees what matters</strong>.
      </>
    ),
  },
  {
    title: 'MCP server sprawl',
    description: (
      <>
        One hand-built MCP server per API and per team means one{' '}
        <strong>security review</strong> and one <strong>cost footprint</strong>{' '}
        each. reShapr gives you a{' '}
        <strong>single governed control plane</strong>.
      </>
    ),
  },
  {
    title: 'Agents replanning workflows',
    description: (
      <>
        Multi-step workflows get <strong>re-derived on every run</strong>.
        Custom Tools turn them into{' '}
        <strong>one compact, governed action</strong>.
      </>
    ),
  },
];

const testimonials = [
  {
    quote:
      'The first results from our reShapr evaluation at AXA are very promising. It addresses complex enterprise challenges with rare clarity and a true open source heart. As a maintainer in the CNCF space, I’m excited to support this community effort and see how it transforms how we expose services to agents.',
    name: 'Sebastien Degodez',
    link: 'https://www.linkedin.com/in/sebastien-degodez/',
    role: 'Software Engineer | TechLead',
  },
  {
    quote:
      'When organizations have hundreds or even thousands of APIs to maintain, speed and security become non-negotiable. reShapr transforms how existing services are exposed to agents, delivering an unmatched FinOps ratio and the fastest path to production. It’s a definitive solution for scaling agentic context within highly regulated environments.',
    name: 'Ludovic Pourrat',
    link: 'https://www.linkedin.com/in/ludovic-pourrat/',
    role: 'API Architect | Platform Architect',
  },
  {
    quote:
      'I’m excited by reShapr’s clear purpose and the co-founders’ vision, which directly address the real-world challenges I see across the organizations I work with. Open-sourcing such a critical component to advance MCP democratization is a meaningful step forward for the ecosystem, and I’m genuinely looking forward to being part of this journey and helping build a strong, open community around reShapr.',
    name: 'Sébastien Blanc',
    link: 'https://www.linkedin.com/in/s%C3%A9bastien-blanc-08a73b1/',
    role: 'Java Champion | Technical Director',
  },
  {
    quote: (
      <>
        I use reShapr to let AI assistants work with business systems:
        PayCaptain’s payroll API and, for a client in fashion retail, a PLM
        product catalog they can query in plain language and sync to multiple
        Shopify stores (products and prices), served from{' '}
        <Link to="/blog/building-sync-check-with-reshapr">
          one consolidated MCP server built with cross-service scripted Custom
          Tools
        </Link>
        .
      </>
    ),
    name: 'Guillaume Goisset',
    link: 'https://low-code-consultant.com',
    role: (
      <>
        Head of Automation at{' '}
        <a
          className={styles.adopterLink}
          href="https://github.com/reshaprio/.github/blob/main/ADOPTERS.md">
          PayCaptain and independent consultant
        </a>
      </>
    ),
  },
];

const steps = [
  {
    title: '1. Import',
    description: (
      <>
        Point reShapr at an <strong>OpenAPI</strong>, <strong>GraphQL</strong>,
        or <strong>Protobuf/gRPC</strong> contract. Working MCP tools are{' '}
        <strong>generated immediately</strong>.
      </>
    ),
  },
  {
    title: '2. Reshape',
    description: (
      <>
        <strong>Rename and pin arguments</strong>,{' '}
        <strong>orchestrate several services into one tool</strong>, filter
        responses, and choose <strong>tools, code, or hybrid</strong> exposure.
      </>
    ),
  },
  {
    title: '3. Govern and expose',
    description: (
      <>
        Protect endpoints with <strong>API key or OAuth</strong>, set quotas,
        and version everything in <strong>Configuration Plans</strong>. Then
        run it on <strong>your own infrastructure</strong>.
      </>
    ),
  },
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
              Turn your APIs{' '}
              <span className={styles.heroTitleBreak} />
              <span style={{color: '#16BA96'}}>AI-Native</span>, without rebuilding them.
            </Heading>
          </m.div>

          <m.p variants={itemVariants} className={styles.heroSubtitle}>
            reShapr is the <strong>open source runtime</strong> that turns the
            REST, GraphQL, and gRPC APIs you already have into{' '}
            <strong>governed, LLM-optimized MCP tools</strong>. No bespoke MCP
            server to build and maintain for every API.
          </m.p>
          <m.p variants={itemVariants} className={styles.heroBadges}>
            <Link href="https://github.com/reshaprio/reshapr/blob/main/LICENSE">Apache-2.0</Link>
            {' · '}
            <Link to="/docs/explanations/mcp-compatibility">Model Context Protocol</Link>
            {' · '}
            <Link to="/blog/reshapr-1.0.0-release">Stable 1.x (semver)</Link>
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
      <section className={styles.sectionAlt}>
        <div className="container">
          <m.div
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">Your APIs weren't designed for agents. reShapr reshapes them.</Heading>
            <p>
              Agents need <strong>small, precise, governed actions</strong>.
              Your APIs return <strong>large, general-purpose responses</strong>.
              reShapr <strong>closes that gap</strong>.
            </p>
          </m.div>
          <div className={styles.featureGrid}>
            {problems.map((item, index) => (
              <m.article
                key={item.title}
                className={clsx(styles.featureCard, styles.textCard)}
                initial={inViewHidden}
                whileInView={inViewBase}
                viewport={{once: true, margin: '0px 0px -10% 0px', amount: 0.15}}
                transition={cardTransition(index)}>
                <div className={styles.featureBody}>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.description}</p>
                </div>
              </m.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <m.div
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">The feedback we received</Heading>
          </m.div>
          <div className={styles.testimonialGrid}>
            {testimonials.map((item, index) => (
              <m.div
                key={item.name}
                className="testimonial-card"
                initial={inViewHidden}
                whileInView={inViewBase}
                viewport={{once: true, margin: '0px 0px -10% 0px', amount: 0.15}}
                transition={cardTransition(index)}>
                <blockquote>{item.quote}</blockquote>
                <div className="testimonial-author">
                  <a href={item.link}>{item.name}</a>
                  <span className="testimonial-role">{item.role}</span>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className="container">
          <m.div
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">From API contract to agent-ready tools in three steps</Heading>
          </m.div>
          <div className={styles.featureGrid}>
            {steps.map((item, index) => (
              <m.article
                key={item.title}
                className={clsx(styles.featureCard, styles.textCard)}
                initial={inViewHidden}
                whileInView={inViewBase}
                viewport={{once: true, margin: '0px 0px -10% 0px', amount: 0.15}}
                transition={cardTransition(index)}>
                <div className={styles.featureBody}>
                  <Heading as="h3">{item.title}</Heading>
                  <p>{item.description}</p>
                </div>
              </m.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <m.div
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">What you get</Heading>
            <p>
              A runtime that makes your existing APIs{' '}
              <strong>efficient, governed</strong>, and ready for{' '}
              <strong>any MCP client</strong>.
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
            className={styles.sectionHeader}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '-72px 0px', amount: 0.25}}
            transition={headerTransition}>
            <Heading as="h2">
              Measured on a pull-request-velocity task against the official GitHub MCP server.
            </Heading>
            <p>
              <strong>Same task, same data</strong>: the{' '}
              <Link to="https://github.com/github/github-mcp-server">
                official GitHub MCP server
              </Link>{' '}
              needs <strong>31 tool calls</strong>, reShapr needs{' '}
              <strong>one</strong> 👉{' '}
              <Link to="/blog/reshapr-vs-official-github-mcp">Read the benchmark</Link>.
            </p>
          </m.div>
          <m.div
            className={styles.benchmark}
            initial={inViewHidden}
            whileInView={inViewBase}
            viewport={{once: true, margin: '0px 0px -10% 0px', amount: 0.15}}
            transition={cardTransition(0)}>
            <div className={styles.promptCard}>
              <span className={styles.promptLabel}>What the user asks</span>
              <pre className={styles.promptText}>{BENCHMARK_PROMPT}</pre>
              <span className={styles.promptLabel}>
                What reShapr exposes: one task-shaped tool,{' '}
                <code>get_repo_velocity_metrics</code>
              </span>
            </div>
            <ThemedImage
              className={styles.benchmarkChart}
              alt="Comparison of the official GitHub MCP and reShapr on the same task: 31 versus 1 agent tool calls, 34 versus 4 MCP HTTP roundtrips, 28,081 ms versus 2,082 ms tool-call latency, 267,824 versus 7,401 response bytes, and 66,956 versus 1,851 estimated tokens."
              sources={{
                light: '/img/blog/reshapr-github-mcp-reduction-chart-light.png',
                dark: '/img/blog/reshapr-github-mcp-reduction-chart-dark.png',
              }}
            />
            <p className={styles.seeAlso}>
              <strong>See also:</strong> a fashion brand runs its product
              catalog and Shopify syncs through{' '}
              <strong>one consolidated MCP server</strong>, built with
              cross-service <strong>Custom Tools</strong> 👉{' '}
              <Link to="/blog/building-sync-check-with-reshapr">Read the story</Link>.
            </p>
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
                Follow the quickstart, import your first API contract, and give your agents governed MCP tools in minutes.
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
      description="reShapr is the open source runtime that turns your existing REST, GraphQL, and gRPC APIs into governed, LLM-optimized MCP tools, without rebuilding them.">
      <PageMotionRoot>
        <div className={landingShell.landingFrame}>
          <HomepageHeader />
          <HomepageMain />
        </div>
      </PageMotionRoot>
    </Layout>
  );
}
