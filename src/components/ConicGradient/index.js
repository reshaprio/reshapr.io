import React, {useEffect, useRef, useState} from 'react';
import {motion, useMotionValue, useTransform} from 'motion/react';
import styles from './styles.module.css';

function useElementDimensions(ref) {
  const [size, setSize] = useState({width: 0, height: 0, top: 0, left: 0});

  function measure() {
    if (!ref.current) return;
    setSize(ref.current.getBoundingClientRect());
  }

  useEffect(() => {
    measure();
  }, []);

  return [size, measure];
}

export default function ConicGradient() {
  const ref = useRef(null);
  const [{width, height, top, left}, measure] = useElementDimensions(ref);
  const gradientX = useMotionValue(0.5);
  const gradientY = useMotionValue(0.5);
  const background = useTransform(
    () =>
      `conic-gradient(from 0deg at calc(${
        gradientX.get() * 100
      }% - ${left}px) calc(${
        gradientY.get() * 100
      }% - ${top}px), #0cdcf7, #ff0088, #fff312, #0cdcf7)`,
  );

  return (
    <div
      className={styles.container}
      onPointerMove={(e) => {
        gradientX.set(e.clientX / width);
        gradientY.set(e.clientY / height);
      }}>
      <motion.div
        ref={ref}
        className={styles.gradient}
        style={{background}}
        onPointerEnter={() => measure()}
      />
    </div>
  );
}
