import React, {useCallback, useState} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

import placeholders from '../../data/video-placeholders.json';

import styles from './styles.module.css';

const FALLBACK = {
  placeholder: null,
  aspectRatio: 16 / 9,
};

/**
 * @param {object} props
 * @param {string} props.src - Public path, e.g. /img/foo.mp4 (must match video-placeholders.json key)
 * @param {string} [props.className] - Root element
 * @param {string} [props.videoClassName] - Video element
 * @param {object} [props.style] - Root inline style
 * @param {boolean} [props.reduceMotion] - Static image only, no autoplay video
 * @param {React.ReactNode} [props.children] - Optional <source> children; otherwise single mp4 source from src
 */
export default function VideoWithPlaceholder({
  src,
  className,
  videoClassName,
  style: rootStyle,
  reduceMotion = false,
  children,
  ...videoProps
}) {
  const [videoReady, setVideoReady] = useState(false);
  const resolvedSrc = useBaseUrl(src);

  const meta = placeholders[src] ?? FALLBACK;
  const {placeholder, aspectRatio} = meta;

  const onLoadedData = useCallback(() => {
    setVideoReady(true);
  }, []);

  const ar = Number.isFinite(aspectRatio) ? Number(aspectRatio.toFixed(5)) : 16 / 9;
  const rootStyles = {
    ...rootStyle,
    '--reshapr-video-ar': String(ar),
  };

  if (reduceMotion && placeholder) {
    return (
      <div className={clsx(styles.root, className)} style={rootStyles}>
        <img
          src={placeholder}
          alt=""
          className={clsx(styles.mediaFill, videoClassName)}
        />
      </div>
    );
  }

  return (
    <div className={clsx(styles.root, className)} style={rootStyles}>
      {placeholder ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={clsx(styles.placeholder, videoReady && styles.placeholderHidden)}
        />
      ) : null}
      <video
        className={clsx(styles.video, videoClassName)}
        onLoadedData={onLoadedData}
        {...videoProps}>
        {children ?? <source src={resolvedSrc} type="video/mp4" />}
      </video>
    </div>
  );
}
