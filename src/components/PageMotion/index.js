import React, {useCallback, useMemo} from 'react';
import {LazyMotion, domAnimation, m, useReducedMotion} from 'motion/react';

export const scrollEase = [0.25, 0.1, 0.25, 1];

export const heroItemSpring = {
  type: 'spring',
  stiffness: 72,
  damping: 28,
  mass: 0.85,
};

/**
 * Shared motion presets matching the landing page (stagger, in-view reveals, load fade).
 */
export function usePageRevealMotion() {
  const reduceMotion = useReducedMotion();

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.05,
        },
      },
    }),
    [reduceMotion],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: reduceMotion ? {opacity: 0} : {opacity: 0, y: 18},
      visible: {
        opacity: 1,
        y: 0,
        transition: heroItemSpring,
      },
    }),
    [reduceMotion],
  );

  const inViewBase = useMemo(
    () =>
      reduceMotion
        ? undefined
        : {
            opacity: 1,
            y: 0,
          },
    [reduceMotion],
  );

  const inViewHidden = useMemo(
    () => (reduceMotion ? false : {opacity: 0, y: 18}),
    [reduceMotion],
  );

  const headerTransition = useMemo(
    () =>
      reduceMotion
        ? {duration: 0}
        : {duration: 0.5, ease: scrollEase},
    [reduceMotion],
  );

  const cardTransition = useCallback(
    (index) =>
      reduceMotion
        ? {duration: 0}
        : {duration: 0.45, delay: index * 0.07, ease: scrollEase},
    [reduceMotion],
  );

  const loadTransition = useMemo(
    () =>
      reduceMotion
        ? {duration: 0}
        : {duration: 0.5, ease: scrollEase},
    [reduceMotion],
  );

  const loadInitial = useMemo(
    () => (reduceMotion ? false : {opacity: 0, y: 18}),
    [reduceMotion],
  );

  const loadAnimate = useMemo(
    () => (reduceMotion ? false : {opacity: 1, y: 0}),
    [reduceMotion],
  );

  return {
    reduceMotion,
    scrollEase,
    heroItemSpring,
    containerVariants,
    itemVariants,
    inViewBase,
    inViewHidden,
    headerTransition,
    cardTransition,
    loadTransition,
    loadInitial,
    loadAnimate,
  };
}

function PageMotionRoot({children}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

export default PageMotionRoot;
export {PageMotionRoot};

/**
 * Simple full-width fade/slide-in on mount (docs home, doc pages, blog).
 */
export function LoadReveal({children, className, style, delay = 0}) {
  const {reduceMotion, loadInitial, loadAnimate, loadTransition} = usePageRevealMotion();
  return (
    <m.div
      className={className}
      style={style}
      initial={loadInitial}
      animate={loadAnimate}
      transition={{
        ...loadTransition,
        delay: reduceMotion ? 0 : delay,
      }}>
      {children}
    </m.div>
  );
}

