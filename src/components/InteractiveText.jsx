import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InteractiveText({ lines }) {
  // Shared tilt values (-1..1). Driven by the mouse on desktop and by the
  // phone's gyroscope on mobile — both feed the same spring/rotation pipeline.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(smoothY, [-1, 1], [12, -12]);
  const rotateY = useTransform(smoothX, [-1, 1], [-12, 12]);

  // iOS 13+ requires an explicit tap to grant motion access; this drives the prompt.
  const [needsPermission, setNeedsPermission] = useState(false);
  const enableRef = useRef(null);

  // ---- Desktop: tilt toward the mouse ----
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    x.set((e.clientX / innerWidth) * 2 - 1);
    y.set((e.clientY / innerHeight) * 2 - 1);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  // ---- Mobile: tilt with the phone's physical orientation (gyroscope) ----
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!coarse || reduce) return; // only touch devices; respect reduced motion

    let baseline = null;
    const clamp = (v, n) => Math.max(-n, Math.min(n, v));
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      // first reading = the "rest" pose, so tilt is measured relative to how
      // the person is naturally holding the phone.
      if (!baseline) baseline = { beta: e.beta, gamma: e.gamma };
      x.set(clamp(e.gamma - baseline.gamma, 26) / 26); // left / right tilt
      y.set(clamp(e.beta - baseline.beta, 26) / 26);   // forward / back tilt
    };

    const DOE = window.DeviceOrientationEvent;
    if (typeof DOE.requestPermission === 'function') {
      // iOS — must request from inside a user gesture (the button tap below)
      setNeedsPermission(true);
      enableRef.current = async () => {
        try {
          const res = await DOE.requestPermission();
          if (res === 'granted') window.addEventListener('deviceorientation', onOrient);
        } catch { /* denied or unsupported — leave the desktop fallback */ }
        setNeedsPermission(false);
      };
      return () => window.removeEventListener('deviceorientation', onOrient);
    }

    // Android / others — works directly (requires a secure context: https or localhost)
    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [x, y]);

  return (
    <>
      <div
        className="interactive-text-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px', display: 'inline-block' }}
      >
        <motion.h1
          className="hero-title interactive-hero-title"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          {lines.map((line, i) => (
            <motion.span className="hero-line" key={i} style={{ transform: `translateZ(${20 + i * 15}px)` }}>
              <span className="hero-line-inner" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                {line.trim()}
              </span>
            </motion.span>
          ))}
        </motion.h1>
      </div>

      {needsPermission && (
        <button type="button" className="tilt-enable" onClick={() => enableRef.current?.()}>
          <span className="tilt-enable-dot" aria-hidden="true" />
          Tilt your phone — tap to enable
        </button>
      )}
    </>
  );
}
