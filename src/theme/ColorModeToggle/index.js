/**
 * Single light / dark pill toggle (Gram-style). Effective theme follows the OS when the user
 * has not chosen yet (respectPrefersColorScheme + no storage); each click locks an explicit choice.
 */
import React, {useCallback, useMemo} from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {translate} from '@docusaurus/Translate';
import {useColorMode} from '@docusaurus/theme-common';
import {motion, useReducedMotion} from 'motion/react';
import IconLightMode from '@theme/Icon/LightMode';
import IconDarkMode from '@theme/Icon/DarkMode';
import styles from './styles.module.css';

const springSoft = {
  type: 'spring',
  stiffness: 210,
  damping: 30,
  mass: 0.88,
};

function ColorModeToggle({className, buttonClassName}) {
  const isBrowser = useIsBrowser();
  const {colorMode, setColorMode} = useColorMode();
  const reduceMotion = useReducedMotion();

  const thumbLeftPercent = colorMode === 'dark' ? 75 : 25;

  const toggle = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  const switchLabel = useMemo(
    () =>
      translate({
        message: 'Dark mode',
        id: 'theme.colorToggle.switchLabel',
        description: 'Switch role label: dark theme on or off',
      }),
    [],
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={colorMode === 'dark'}
      aria-label={switchLabel}
      title={
        colorMode === 'dark'
          ? translate({
              message: 'Switch to light mode',
              id: 'theme.colorToggle.switchToLight',
              description: 'Tooltip when site is dark',
            })
          : translate({
              message: 'Switch to dark mode',
              id: 'theme.colorToggle.switchToDark',
              description: 'Tooltip when site is light',
            })
      }
      disabled={!isBrowser}
      onClick={toggle}
      className={clsx(
        'clean-btn',
        styles.wrapper,
        className,
        buttonClassName,
        'reshapr-color-segmented',
      )}>
      <span className={styles.track}>
        {isBrowser ? (
          <motion.span
            className={styles.thumb}
            aria-hidden
            initial={false}
            animate={{
              left: `${thumbLeftPercent}%`,
              top: '50%',
              x: '-50%',
              y: '-50%',
            }}
            transition={reduceMotion ? {duration: 0} : springSoft}
          />
        ) : (
          <span
            className={styles.thumb}
            style={{
              left: `${thumbLeftPercent}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden
          />
        )}
        <span className={styles.iconRow} aria-hidden>
          <span
            className={clsx(
              styles.iconHint,
              colorMode === 'light' && styles.iconHintActive,
            )}>
            <IconLightMode className={styles.icon} />
          </span>
          <span
            className={clsx(
              styles.iconHint,
              colorMode === 'dark' && styles.iconHintActive,
            )}>
            <IconDarkMode className={styles.icon} />
          </span>
        </span>
      </span>
    </button>
  );
}

export default React.memo(ColorModeToggle);
