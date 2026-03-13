import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './about.module.css';

const founders = [
  {
    name: 'Laurent Broudoux',
    role: 'Co-founder of Microcks & reShapr | Postman team member',
    image: '/img/founders/laurent-broudoux.png',
    socials: [
      {name: 'LinkedIn', link: 'https://www.linkedin.com/in/laurentbroudoux/'},
      {name: 'Bluesky', link: 'https://bsky.app/profile/lbroudoux.bsky.social'},
      {name: 'GitHub', link: 'https://github.com/lbroudoux'},
    ],
  },
  {
    name: 'Yacine Kheddache',
    role: 'Co-founder of Microcks & reShapr | Postman team member',
    image: '/img/founders/yacine-kheddache.png',
    socials: [
      {name: 'LinkedIn', link: 'https://www.linkedin.com/in/yacinekheddache/'},
      {name: 'Bluesky', link: 'https://bsky.app/profile/yadayac.bsky.social'},
      {name: 'GitHub', link: 'https://github.com/yada'},
    ],
  },
];

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="About reShapr and the mission behind our open source MCP platform.">
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className="container">
            <div className={styles.heroCard}>
              <Heading as="h1" className={styles.title}>
                Making Enterprise APIs AI-Ready
              </Heading>
              <p className={styles.lead}>
                reShapr was born out of a hard truth: enterprises are under
                <strong> immense pressure to expose internal APIs to AI-native applications</strong>,
                but the path there is anything but smooth. Manual builds,
                fragile generators, and one-off integrations burn precious
                engineering time while introducing <strong>security risks</strong> and technical debt.
              </p>
              <p className={styles.lead}>
                We built reShapr to change that, with one objective:
                <strong> make enterprise API-to-MCP adoption fast, reliable, and secure</strong>.
              </p>
              <p className={styles.body}>
                Our platform instantly transforms your existing APIs (REST,
                gRPC, GraphQL) into <strong>production-grade MCP servers</strong>:
                no code, no vendor lock-in, no compromises. You stay in control,
                deploy anywhere, and <strong>accelerate AI initiatives</strong> without rewriting a thing.
              </p>
              <p className={styles.body}>
                Behind reShapr is a seasoned team of experts in APIs, network
                gateways, and security. We’ve built large-scale infrastructure,
                tackled edge cases, and felt the enterprise pain firsthand.
                Our commitment is <strong>open source first</strong>: build in the
                open, ship with transparency, and keep interoperability at the
                core so teams can <strong>adopt MCP without lock-in</strong>.
              </p>
            </div>

            <div className={styles.foundersGrid}>
              {founders.map((founder) => (
                <article key={founder.name} className={styles.founderCard}>
                  <img
                    className={styles.founderPhoto}
                    src={founder.image}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = '/img/reShapr-logo-dark@2x.png';
                    }}
                  />
                  <div className={styles.founderBody}>
                    <Heading as="h2" className={styles.founderName}>
                      {founder.name}
                    </Heading>
                    <p className={styles.founderRole}>{founder.role}</p>
                    <div className={styles.socialRow}>
                      {founder.socials.map((social) => (
                        <a
                          key={social.name}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.socialLink}>
                          {social.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
