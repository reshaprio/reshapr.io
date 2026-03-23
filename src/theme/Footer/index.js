import React from 'react';
import {BrandSocialIcon} from '@site/src/components/BrandSocialIcons';
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
  {label: 'LinkedIn', href: 'https://www.linkedin.com/company/reshapr', icon: 'linkedin'},
  {label: 'X', href: 'https://x.com/reshaprio', icon: 'x'},
  {label: 'Bluesky', href: 'https://bsky.app/profile/reshapr.io', icon: 'bluesky'},
  {label: 'YouTube', href: 'https://www.youtube.com/@reShaprio', icon: 'youtube'},
  {label: 'Discord', href: 'https://discord.gg/KyDUdam34h', icon: 'discord'},
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

      <div className={styles.bottomSection}>
        <div className="container">
          <p className={styles.copy}>Turn your APIs AI-native - Copyright © 2026 reShapr.</p>
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
