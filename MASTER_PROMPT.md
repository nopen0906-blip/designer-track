# MASTER PROMPT — Designer Track 3D Upgrade
# Paste this entire file into Antigravity Claude Code chat

---

## WHO YOU ARE & WHAT THIS PROJECT IS

You are upgrading the **Designer Track** architecture firm website (designer-track.com) owned by architect **Saiyed Mukhatyarali**. This is a React 19 + Vite + Framer Motion site deployed on Vercel.

The site already exists and is live. Your job is to upgrade it to a **professional 3D website** without breaking what already works.

---

## PROJECT FILE MAP — READ THESE FIRST

Before touching anything, read these files in order:

1. `context.md` — project overview and architecture
2. `memory.md` — full changelog of every change ever made (critical: avoid repeating past mistakes)
3. `src/content.js` — ALL editable text/images live here (never hardcode content in components)
4. `src/sections.jsx` — all section components (Hero, Statement, WorkShowcase, Practice, Studio, Contact, Footer)
5. `src/components/InteractiveText.jsx` — existing 3D tilt hero text (mouse + gyroscope)
6. `src/App.css` — full design system CSS
7. `src/index.css` — CSS variables (colors, typography, spacing tokens)
8. `src/pages/Home.jsx` — homepage route
9. `src/pages/WorkPage.jsx` — /work portfolio page

---

## DESIGN SYSTEM — NEVER DEVIATE FROM THESE

```
Colors (from index.css CSS variables):
--paper:    #f1ebdf   (warm ivory background)
--ink:      #16110d   (deep espresso text)
--clay:     #b9532a   (terracotta accent)
--amber:    #c8863a   (warm orange)
--gold:     #d8ab54   (gold highlight)

Typography:
--serif: 'Fraunces'       (display headings)
--sans:  'Space Grotesk'  (body)
--mono:  'Space Mono'     (labels, technical text)
```

The aesthetic is **warm editorial-luxury**. Everything should feel like a high-end architecture publication — not a tech startup, not a game engine demo.

---

## CRITICAL HISTORY — DO NOT REPEAT THESE MISTAKES

From `memory.md`:

1. **DO NOT build a literal 3D house/building model** — a procedural house was built before and removed because it looked cartoonish and amateur. The 3D must be ABSTRACT architectural geometry.
2. **DO NOT install duplicate dependencies** — Three.js and @react-three packages were previously removed. If reinstalling, use `npm install --force` if Vite cache issues arise, then restart with `npm run dev -- --force`.
3. **DO NOT add `.site-nav` as position:fixed inside a parent with backdrop-filter** — this causes the mobile menu to get trapped. The fix is already in place; don't undo it.
4. **DO NOT use `--screenshot` CLI flag for responsive testing** — use CDP `Emulation.setDeviceMetricsOverride` instead.
5. **The "Approach" section was intentionally replaced with "Practice"** — do not restore it.
6. **Gradient text needs BOTH** `-webkit-text-fill-color: transparent` AND `color: transparent`.

---

## WHAT TO BUILD — THE 3D UPGRADE

### STEP 1 — Install dependencies

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
```

If Vite crashes after install: `npm run dev -- --force`

---

### STEP 2 — Create `src/components/HeroScene.jsx`

This is the main 3D hero scene. It goes on the RIGHT side of the hero (replacing the old hero-figure image). It shows an **abstract architectural composition** — floating wireframe slabs and walls like a deconstructed Mies van der Rohe pavilion.

**Exact scene design (already prototyped and approved):**

```jsx
import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Brand palette (matches CSS variables exactly)
const AMBER = '#d4a855'
const CLAY  = '#b9532a'
const GOLD  = '#e8c070'

// Single architectural element: ghost solid + glowing wireframe edges
function ArchElement({ size, position, color, solidOpacity = 0.06 }) {
  const solidGeo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(solidGeo), [solidGeo])

  return (
    <group position={position}>
      <mesh geometry={solidGeo}>
        <meshStandardMaterial
          color={color} transparent opacity={solidOpacity}
          roughness={0.1} metalness={0.95} side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.82} />
      </lineSegments>
    </group>
  )
}

// Floating blueprint particles
function Particles() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const count = 180
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 8
      pos[i*3+1] = (Math.random() - 0.5) * 5
      pos[i*3+2] = (Math.random() - 0.5) * 6
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.018
    ref.current.rotation.x = t * 0.010
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={AMBER} size={0.025} transparent opacity={0.45} />
    </points>
  )
}

function Scene() {
  const groupRef = useRef()
  const { mouse } = useThree()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = 0.38 + Math.sin(t * 0.09) * 0.22 + mouse.x * 0.10
    groupRef.current.rotation.x = -0.08 + Math.sin(t * 0.07) * 0.06 - mouse.y * 0.05
  })

  return (
    <>
      <ambientLight intensity={0.5} color="#f5e8d0" />
      <pointLight position={[4, 4, 4]} intensity={2.5} color="#d8ab54" />
      <pointLight position={[-3, -1, 3]} intensity={1.2} color="#b9532a" />

      <group ref={groupRef} rotation={[-0.08, 0.38, 0.02]}>
        {/* Horizontal floor plates */}
        <ArchElement size={[4.4, 0.05, 2.6]}  position={[0,    -0.75,  0]}   color={AMBER} solidOpacity={0.07} />
        <ArchElement size={[3.3, 0.05, 1.9]}  position={[0.2,  -0.08, -0.1]} color={AMBER} solidOpacity={0.05} />
        <ArchElement size={[2.2, 0.05, 1.3]}  position={[-0.1,  0.58,  0.1]} color={GOLD}  solidOpacity={0.04} />
        {/* Vertical walls */}
        <ArchElement size={[0.045, 1.35, 1.6]} position={[-1.55, -0.1,  0.2]}  color={CLAY} solidOpacity={0.14} />
        <ArchElement size={[0.045, 0.95, 1.1]} position={[1.05, -0.18, -0.2]}  color={CLAY} solidOpacity={0.11} />
        {/* Back glass curtain wall */}
        <ArchElement size={[3.7, 1.45, 0.045]} position={[0.05, -0.08, -1.05]} color={GOLD} solidOpacity={0.05} />
        {/* Accent columns */}
        <ArchElement size={[0.06, 1.35, 0.06]} position={[-0.9, -0.05, -1.05]} color={GOLD} solidOpacity={0.3} />
        <ArchElement size={[0.06, 1.35, 0.06]} position={[0.9,  -0.05, -1.05]} color={GOLD} solidOpacity={0.3} />
      </group>

      <Particles />

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.05} luminanceSmoothing={0.85} radius={0.7} />
      </EffectComposer>
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [3.8, 2.2, 5.0], fov: 42 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
```

---

### STEP 3 — Update Hero layout in `src/sections.jsx`

**Replace** the entire `Hero` export with this new side-by-side layout:

```jsx
import HeroScene from './components/HeroScene'
import { Suspense } from 'react'

export function Hero() {
  const { hero } = content
  const lines = hero.headline.split('/')
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <p className="eyebrow reveal">{hero.eyebrow}</p>
        <InteractiveText lines={lines} />
        <div className="hero-foot reveal">
          <p className="hero-sub">{hero.sub}</p>
          <div className="hero-cta">
            <MagneticButton className="btn btn-solid" {...linkProps(hero.ctaPrimary.href)}>{hero.ctaPrimary.label}</MagneticButton>
            <MagneticButton className="btn btn-ghost" {...linkProps(hero.ctaSecondary.href)}>{hero.ctaSecondary.label}</MagneticButton>
          </div>
        </div>
      </div>

      <div className="hero-scene" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <div className="hero-scene-caption">
          <span className="sheet">SHT. 01</span>
          <span>Architectural Composition — 3D</span>
        </div>
      </div>
    </section>
  )
}
```

---

### STEP 4 — Update `src/App.css` hero styles

**Remove** the old `.hero`, `.hero-figure`, `.hero-media` rules.
**Add** these new rules:

```css
/* ---- NEW HERO: side-by-side grid layout ---- */
.hero {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 55fr 45fr;
  min-height: 100svh; align-items: center;
  max-width: var(--maxw); margin: 0 auto;
}
.hero-inner {
  padding: clamp(7rem, 14vh, 10rem) var(--pad) clamp(4rem, 8vw, 6rem);
}
.hero-scene {
  position: relative; height: 100%; min-height: 520px;
  display: flex; flex-direction: column;
}
.hero-scene canvas {
  flex: 1; min-height: 0;
}
.hero-scene-caption {
  position: absolute; bottom: 2rem; left: 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-soft); z-index: 10;
  pointer-events: none;
}

/* Mobile: stack vertically */
@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero-inner { padding-bottom: 0; }
  .hero-scene { height: 60vw; min-height: 280px; }
}
```

---

### STEP 5 — Add 3D scroll depth to section reveals

In `src/App.css`, **replace** the `.reveal` rule:

```css
/* 3D scroll depth — elements rise in from Z depth */
.reveal {
  opacity: 0;
  transform: perspective(1200px) translateY(40px) translateZ(-50px) rotateX(4deg);
  transition: opacity 0.9s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.is-visible {
  opacity: 1;
  transform: perspective(1200px) translateY(0) translateZ(0) rotateX(0deg);
}
```

---

### STEP 6 — Add 3D card hover tilt to project cards

Create `src/components/Card3D.jsx`:

```jsx
import { useRef, useCallback } from 'react'

export default function Card3D({ children, className }) {
  const ref = useRef()

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2   // -1 to 1
    const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2   // -1 to 1
    el.style.transform = `perspective(1000px) rotateY(${dx * 7}deg) rotateX(${-dy * 4}deg) translateZ(10px) scale(1.01)`
    el.style.boxShadow = `${-dx * 12}px ${dy * 12}px 40px rgba(22,17,13,0.25), 0 30px 60px -20px rgba(22,17,13,0.35)`
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)'
    el.style.boxShadow = ''
  }, [])

  return (
    <article
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease', willChange: 'transform' }}
    >
      {children}
    </article>
  )
}
```

Then in `src/pages/WorkPage.jsx`, import and use `Card3D` instead of `<article className="card reveal">`:

```jsx
import Card3D from '../components/Card3D'

// Replace: <article className="card reveal" key={p.no}>
// With:
<Card3D className="card reveal" key={p.no}>
  {/* ...existing card children unchanged... */}
</Card3D>
```

Also apply the same `Card3D` wrapper to `.feature` articles in `src/sections.jsx` `WorkShowcase`:

```jsx
import Card3D from './components/Card3D'

// In WorkShowcase, replace: <article className={`feature reveal ...`}>
// With: <Card3D className={`feature reveal ...`}>
```

---

### STEP 7 — Add 3D depth shimmer to Practice section items

In `src/App.css`, add to `.practice-item`:

```css
.practice-item {
  /* add to existing styles: */
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}
.practice-item:hover {
  transform: perspective(800px) translateZ(16px) rotateX(-1deg);
  box-shadow: 0 24px 48px -18px rgba(185, 83, 42, 0.2);
}
```

---

### STEP 8 — Verify build is clean

```bash
npm run build
```

Expected: no errors, bundle compiles cleanly. Three.js adds ~600KB to the bundle — this is expected and acceptable.

---

### STEP 9 — Deploy

```bash
npx vercel --prod
```

---

## FINAL VERIFICATION CHECKLIST

Before considering done, verify each of these:

- [ ] Hero shows 3D architectural scene on the right side (floating wireframe slabs/walls with bloom glow)
- [ ] Hero text on left still has 3D tilt (mouse + gyro) — `InteractiveText.jsx` unchanged
- [ ] Sections reveal with 3D depth (Z-axis rise, not just fade-up)
- [ ] Project cards on `/work` page tilt in 3D on hover
- [ ] Feature articles on homepage tilt in 3D on hover
- [ ] Practice section items lift in Z on hover
- [ ] Mobile: hero stacks vertically (3D scene below text), all effects work
- [ ] `prefers-reduced-motion` respected (existing CSS rule handles this)
- [ ] Clean `npm run build` — zero errors
- [ ] Deployed to Vercel — live on designer-track.com

---

## IMPORTANT NOTES FOR THE AGENT

1. **The `HeroScene` 3D scene design is final and approved.** Do not redesign it — implement exactly as specified above (the exact sizes, positions, colors, and composition were prototyped and approved by the client).

2. **Do not touch `src/content.js`** — all content stays as-is.

3. **Do not remove existing framer-motion effects** — `ParallaxImage`, `MagneticButton`, `CountUp`, `InteractiveText` all stay in place.

4. **Three.js + R3F were previously in this project and removed** (see memory.md). Reinstalling is intentional and approved. Use `npm run dev -- --force` after install if Vite cache issues occur.

5. **Update `memory.md`** at the end with a changelog entry following the same format as existing entries.

6. **Update `context.md`** Active Tasks section to mark new 3D tasks as complete.

7. If you hit any Vite/dependency issue, check `memory.md` — past agents have documented the exact fixes.
