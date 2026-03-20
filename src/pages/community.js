import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {SiBluesky, SiDiscord} from 'react-icons/si';
import styles from './community.module.css';

const channels = [
  {
    title: 'GitHub',
    description:
      'Track releases, discuss implementation details, open issues, and submit pull requests to improve reShapr.',
    href: 'https://github.com/reshaprio/reshapr.io',
    cta: 'Join on GitHub',
    icon: 'github',
  },
  {
    title: 'LinkedIn',
    description:
      'Follow product updates, launch announcements, and ecosystem highlights from the reShapr community.',
    href: 'https://www.linkedin.com/company/reshapr',
    cta: 'Follow on LinkedIn',
    icon: 'linkedin',
  },
  {
    title: 'Bluesky',
    description:
      'Stay tuned to technical updates, releases, and open-source milestones with short-form community news.',
    href: 'https://bsky.app/profile/reshapr.io',
    cta: 'Follow on Bluesky',
    icon: 'bluesky',
  },
  {
    title: 'Discord',
    description:
      'Join real-time discussions with maintainers and users to share ideas, ask questions, and get support.',
    href: 'https://discord.gg/KyDUdam34h',
    cta: 'Join us on Discord',
    icon: 'discord',
  },
];

const contributionWays = [
  'Report bugs and suggest enhancements on GitHub issues',
  'Contribute code, docs, and examples to strengthen the MCP ecosystem',
  'Share feedback from production usage to improve real-world reliability',
  'Help new users onboard by sharing tutorials and implementation patterns',
];

export default function CommunityPage() {
  const renderChannelIcon = (icon) => {
    if (icon === 'bluesky') {
      return <SiBluesky className={styles.channelIconSvg} aria-hidden="true" />;
    }

    if (icon === 'discord') {
      return <SiDiscord className={styles.channelIconSvg} aria-hidden="true" />;
    }

    return (
      <span
        className={styles.channelIcon}
        data-icon={icon}
        aria-hidden="true"
      />
    );
  };

  return (
    <Layout
      title="Community"
      description="Community space for reShapr users, contributors, and open-source collaborators.">
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className="container">
            <div className={styles.heroCard}>
              <Heading as="h1" className={styles.title}>
                For The Community, By The Community
              </Heading>
              <p className={styles.lead}>
                reShapr grows through <strong>open collaboration</strong>,
                practical feedback, and shared experience around secure
                API-to-MCP adoption.
              </p>
              <p className={styles.body}>
                Our objective is simple: build an <strong>open, reliable, and
                interoperable</strong> MCP platform for enterprises. Whether you
                are exploring, deploying, or contributing, there is a place for
                you in the reShapr community.
              </p>
            </div>

            <div className={styles.sectionBlock}>
              <Heading as="h2" className={styles.sectionTitle}>
                Connect With The Community
              </Heading>
              <div className={styles.channelGrid}>
                {channels.map((channel) => (
                  <article key={channel.title} className={styles.channelCard}>
                    <div className={styles.channelHeader}>
                      {renderChannelIcon(channel.icon)}
                      <Heading as="h3" className={styles.channelTitle}>
                        {channel.title}
                      </Heading>
                    </div>
                    <p className={styles.channelText}>{channel.description}</p>
                    <a
                      className={styles.channelLink}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer">
                      {channel.cta}
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <Heading as="h2" className={styles.sectionTitle}>
                We ❤️ Open Source
              </Heading>
              <div className={styles.panel}>
                <ul className={styles.checkList}>
                  {contributionWays.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <br></br>
                <div className={styles.actions}>
                  <Link
                    className="button button--primary button--lg"
                    href="https://discord.gg/KyDUdam34h"
                    target="_blank"
                    rel="noopener noreferrer">
                    Join us on Discord
                  </Link>
                  <Link
                    className="button button--secondary button--lg"
                    href="https://github.com/reshaprio/reshapr.io/issues"
                    target="_blank"
                    rel="noopener noreferrer">
                    Open Issues
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/overview/why-reshapr">
                    Read The Docs
                  </Link>
                  <Link className="button button--secondary button--lg" to="/blog">
                    Explore Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
