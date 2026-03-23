import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import styles from './styles.module.css';

export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useThemeConfig().navbar.items;

  return (
    <>
      <ul className="menu__list">
        {items.map((item, i) => (
          <NavbarItem
            mobile
            {...item}
            onClick={() => mobileSidebar.toggle()}
            key={i}
          />
        ))}
      </ul>
      <div className={styles.sidebarFooter}>
        <NavbarColorModeToggle className={styles.colorModeToggle} />
      </div>
    </>
  );
}
