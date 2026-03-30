import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {m} from 'motion/react';
import PageMotionRoot, {usePageRevealMotion} from '@site/src/components/PageMotion';
import landingShell from '@site/src/components/LandingShell/styles.module.css';
import styles from './about.module.css';

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function BlueskyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 600 530" fill="currentColor" aria-hidden="true">
      <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  LinkedIn: LinkedInIcon,
  Bluesky: BlueskyIcon,
  GitHub: GitHubIcon,
};

const founders = [
  {
    name: 'Laurent Broudoux',
    role: (
      <>
        Co-founder of{' '}
        <a href="https://www.linkedin.com/company/microcks/" target="_blank" rel="noopener noreferrer">
          Microcks
        </a>{' '}
        &{' '}
        <a href="https://www.linkedin.com/company/reshapr/" target="_blank" rel="noopener noreferrer">
          reShapr
        </a>
      </>
    ),
    affiliation: 'Postman team member',
    image: '/img/founders/laurent-broudoux.png',
    socials: [
      {name: 'LinkedIn', link: 'https://www.linkedin.com/in/laurentbroudoux/'},
      {name: 'Bluesky', link: 'https://bsky.app/profile/lbroudoux.bsky.social'},
      {name: 'GitHub', link: 'https://github.com/lbroudoux'},
    ],
  },
  {
    name: 'Yacine Kheddache',
    role: (
      <>
        Co-founder of{' '}
        <a href="https://www.linkedin.com/company/microcks/" target="_blank" rel="noopener noreferrer">
          Microcks
        </a>{' '}
        &{' '}
        <a href="https://www.linkedin.com/company/reshapr/" target="_blank" rel="noopener noreferrer">
          reShapr
        </a>
      </>
    ),
    affiliation: 'Postman team member',
    image: '/img/founders/yacine-kheddache.png',
    socials: [
      {name: 'LinkedIn', link: 'https://www.linkedin.com/in/yacinekheddache/'},
      {name: 'Bluesky', link: 'https://bsky.app/profile/kheddache.me'},
      {name: 'GitHub', link: 'https://github.com/yada'},
    ],
  },
];

export default function AboutPage() {
  const motion = usePageRevealMotion();

  return (
    <Layout
      title="About"
      description="About reShapr and the mission behind our open source MCP platform.">
      <PageMotionRoot>
        <main className={clsx(landingShell.landingFrame, styles.main)}>
          <section className={styles.heroSection}>
            <div className="container">

              {/* ── Mission copy ─────────────────────────────────────────── */}
              <m.div
                className={styles.heroCard}
                variants={motion.containerVariants}
                initial="hidden"
                animate="visible">
                <m.div variants={motion.itemVariants}>
                  <Heading as="h1" className={styles.title}>
                    Turn your APIs <span style={{color: '#16BA96'}}>AI-native</span>
                  </Heading>
                </m.div>
                <m.p variants={motion.itemVariants} className={styles.lead}>
                  reShapr was born out of a hard truth: enterprises are under
                  <strong> immense pressure to expose internal APIs to AI-native applications</strong>,
                  but the path there is anything but smooth. Manual builds,
                  fragile generators, and one-off integrations burn precious
                  engineering time while introducing <strong>security risks</strong> and technical debt.
                </m.p>
                <m.p variants={motion.itemVariants} className={styles.leadAccent}>
                  We built <strong>reShapr</strong> to change that, with one objective:
                  <strong> make enterprise API-to-MCP adoption fast, reliable, and secure</strong>.
                </m.p>
                <m.p variants={motion.itemVariants} className={styles.body}>
                  Our platform instantly transforms your existing APIs (REST,
                  gRPC, GraphQL) into <strong>production-grade MCP servers</strong>:
                  no code, no vendor lock-in, no compromises. You stay in control,
                  deploy anywhere, and <strong>accelerate AI initiatives</strong> without rewriting a thing.
                </m.p>
                <m.p variants={motion.itemVariants} className={styles.body}>
                  Behind reShapr is a seasoned team of experts in APIs, network
                  gateways, and security. We've built large-scale infrastructure,
                  tackled edge cases, and felt the enterprise pain firsthand.
                  Our commitment is <strong>open source first</strong>: build in the
                  open, ship with transparency, and keep interoperability at the
                  core so teams can <strong>adopt MCP without lock-in</strong>.
                </m.p>
              </m.div>

              {/* ── Founders ─────────────────────────────────────────────── */}
              <div className={styles.foundersWrap}>
                <p className={styles.foundersEyebrow}>The founders</p>
                <div className={styles.foundersGrid}>
                  {founders.map((founder, index) => (
                    <m.article
                      key={founder.name}
                      className={styles.founderCard}
                      initial={motion.inViewHidden}
                      whileInView={motion.inViewBase}
                      viewport={{once: true, margin: '-48px 0px', amount: 0.2}}
                      transition={motion.cardTransition(index)}>
                      <img
                        className={styles.founderPhoto}
                        src={founder.image}
                        alt={founder.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = '/img/reShapr-logo-dark.png';
                        }}
                      />
                      <div className={styles.founderBody}>
                        <Heading as="h2" className={styles.founderName}>
                          {founder.name}
                        </Heading>
                        <p className={styles.founderRole}>{founder.role}</p>
                        <p className={styles.founderAffiliation}>{founder.affiliation}</p>
                        <div className={styles.socialRow}>
                          {founder.socials.map((social) => {
                            const Icon = SOCIAL_ICONS[social.name];
                            return (
                              <a
                                key={social.name}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label={`${founder.name} on ${social.name}`}
                                title={social.name}>
                                {Icon && <Icon />}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </m.article>
                  ))}
                </div>
              </div>

            </div>
          </section>
        </main>
      </PageMotionRoot>
    </Layout>
  );
}
