import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/* An image that drifts vertically as you scroll (parallax) and gently
   zooms on hover. The surrounding frame must have `overflow: hidden`
   and a defined height — the image is taller (130%) to give drift room. */
export default function ParallaxImage({
  src,
  alt,
  imgClass = '',
  range = 8,        // how far it drifts, in % of image height
  hover = false,    // enable hover zoom (for project cards)
  eager = false,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`]);

  return (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      className={`media-img ${imgClass}`}
      style={{ y: reduce ? 0 : y }}
      whileHover={hover && !reduce ? { scale: 1.06 } : undefined}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
