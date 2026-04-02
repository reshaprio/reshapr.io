import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export const NAV = [
  {
    label: 'Site',
    items: [
      {label: 'Home', href: '/agent/'},
    ],
  },
  {
    label: 'Docs',
    items: [
      {label: 'Overview',       href: '/agent/docs?s=overview'},
      {label: 'Tutorials',      href: '/agent/docs?s=tutorials'},
      {label: 'How-to Guides',  href: '/agent/docs?s=how-to-guides'},
      {label: 'Explanations',  href: '/agent/docs?s=explanation'},
      {label: 'References',     href: '/agent/docs?s=reference'},
      {label: 'Demos',          href: '/agent/docs?s=demos'},
    ],
  },
  {
    label: 'Resources',
    items: [
      {label: 'Blog',      href: '/agent/blog'},
      {label: 'Community', href: '/agent/community'},
    ],
  },
  {
    label: 'Company',
    items: [
      {label: 'About', href: '/agent/about'},
    ],
  },
];

export default function AgentSidebar({activeHref}) {
  return (
    <nav className={styles.sidebar} aria-label="Site navigation">
      <Link to="/" className={styles.sidebarHome}>
        ~/reshapr
      </Link>
      {NAV.map(section => (
        <div key={section.label} className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>{section.label}</p>
          <ul className={styles.sidebarList}>
            {section.items.map(item => {
              const isActive = activeHref
                ? item.href === activeHref
                : false;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
                  >
                    {isActive && <span className={styles.sidebarActiveDot} aria-hidden="true" />}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
