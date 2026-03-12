import React from 'react';
import {FaDiscord, FaLinkedinIn, FaYoutube} from 'react-icons/fa';
import {FaXTwitter} from 'react-icons/fa6';
import {SiBluesky} from 'react-icons/si';
import styles from './styles.module.css';

const footerLinks = [
  {label: 'Quick Start', href: 'https://try.reshapr.io/'},
  {
    label: 'Privacy Policy',
    href: 'https://www.linuxfoundation.org/legal/privacy-policy',
  },
  {
    label: 'Terms & Conditions',
    href: 'https://www.linuxfoundation.org/legal/terms',
  },
];

const socials = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/reshapr',
    Icon: FaLinkedinIn,
  },
  {
    label: 'X',
    href: 'https://x.com/reshaprio',
    Icon: FaXTwitter,
  },
  {
    label: 'Bluesky',
    href: 'https://bsky.app/profile/reshapr.io',
    Icon: SiBluesky,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@reShaprio',
    Icon: FaYoutube,
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/KyDUdam34h',
    Icon: FaDiscord,
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        <div className="container">
          <div className={styles.topGrid}>
            <nav className={styles.nav} aria-label="Footer navigation">
              {footerLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.navLink}>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className={styles.socials}>
              {socials.map(({label, href, Icon}) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className="container">
          <p className={styles.copy}>Copyright © 2026 reShapr.</p>
          <p className={styles.copy}>
            Making enterprise APIs AI-ready safely, scalably, and instantly.
          </p>
        </div>
      </div>
    </footer>
  );
}
