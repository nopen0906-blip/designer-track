import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const MotionLink = motion.create(Link);

/* A button/link pulled toward the cursor while hovered, springing back on
   leave. Pass `to` for an in-app route (/work) or `href` for an anchor
   (#contact) or external link. Clay fill-sweep + arrow are styled in CSS. */
export default function MagneticButton({ to, href, className = '', children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const reset = () => { mx.set(0); my.set(0); };

  // Mobile: subtle magnetic shift using phone's gyroscope
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent || reduce) return;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
    if (!coarse) return; // Only use gyro on touch devices

    let baseline = null;
    const clamp = (v, n) => Math.max(-n, Math.min(n, v));
    
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      if (!baseline) baseline = { beta: e.beta, gamma: e.gamma };
      // Subtly shift button up to ±8px (less sensitive than hero 3D text)
      mx.set(clamp(e.gamma - baseline.gamma, 20) / 20 * 8);
      my.set(clamp(e.beta - baseline.beta, 20) / 20 * 8);
    };

    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [mx, my, reduce]);

  const inner = (
    <>
      <span className="btn-label">{children}</span>
      <span className="btn-arrow" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 10.5L10.5 4.5M10.5 4.5H5.5M10.5 4.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
        </svg>
      </span>
    </>
  );

  const shared = {
    ref,
    className,
    style: { x, y },
    onMouseMove: onMove,
    onMouseLeave: reset,
  };

  return to
    ? <MotionLink to={to} {...shared}>{inner}</MotionLink>
    : <motion.a href={href} {...shared}>{inner}</motion.a>;
}
