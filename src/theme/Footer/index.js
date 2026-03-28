import React from 'react';
import Link from '@docusaurus/Link';
import {BrandSocialIcon} from '@site/src/components/BrandSocialIcons';
import styles from './styles.module.css';

const columns = [
  {
    title: 'Project',
    items: [
      {label: 'Why reShapr',     to:   '/docs/overview/why-reshapr'},
      {label: 'How It Works',    to:   '/docs/overview/how-it-works'},
      {label: 'Getting Started', to:   '/docs/tutorials/getting-started'},
      {label: 'Try Online',      href: 'https://try.reshapr.io/'},
      {label: 'Blog',            to:   '/blog'},
    ],
  },
  {
    title: 'Resources',
    items: [
      {label: 'Docs',         to:   '/docs/overview/why-reshapr'},
      {label: 'Demos',        to:   '/docs/demos'},
      {label: 'CLI',          to:   '/docs/reference/cli-commands'},
      {label: 'GitHub',       href: 'https://github.com/reshaprio'},
      {label: 'Community',    to:   '/community'},
    ],
  },
  {
    title: 'Legal',
    items: [
      {label: 'Privacy Policy',   href: 'https://www.linuxfoundation.org/legal/privacy-policy'},
      {label: 'Terms & Conditions', href: 'https://www.linuxfoundation.org/legal/terms'},
    ],
  },
];

const socials = [
  {label: 'LinkedIn', href: 'https://www.linkedin.com/company/reshapr',    icon: 'linkedin'},
  {label: 'X',        href: 'https://x.com/reshaprio',                    icon: 'x'},
  {label: 'Bluesky',  href: 'https://bsky.app/profile/reshapr.io',        icon: 'bluesky'},
  {label: 'YouTube',  href: 'https://www.youtube.com/@reShaprio',         icon: 'youtube'},
  {label: 'Discord',  href: 'https://discord.gg/KyDUdam34h',              icon: 'discord'},
];

function FooterLink({label, to, href}) {
  if (to) {
    return <Link className={styles.link} to={to}>{label}</Link>;
  }
  return (
    <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className="container">

          {/* Column grid */}
          <div className={styles.grid}>
            {columns.map((col) => (
              <div key={col.title} className={styles.col}>
                <p className={styles.colTitle}>{col.title}</p>
                <ul className={styles.colList}>
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className={styles.bottom}>
            <p className={styles.copy}>© {new Date().getFullYear()} reShapr - Open source under Apache-2.0 license.</p>
            <div className={styles.socials}>
              {socials.map(({label, href, icon}) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}>
                  <BrandSocialIcon name={icon} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      <img
        referrerPolicy="no-referrer-when-downgrade"
        src="https://static.scarf.sh/a.png?x-pxid=273f1769-ba93-418d-b4fc-6b683cd7c6c2"
        alt=""
        width={1}
        height={1}
        style={{position: 'absolute', left: '-9999px'}}
      />
    </footer>
  );
}
