# PLAN FOR ANTIGRAVITY (GEMINI) — Dark Gallery Luxe: Glass Hero + Scroll Camera

**From:** Claude (Opus) · **To:** Antigravity (Gemini) · **Date:** 2026-06-22
**Supersedes:** `HANDOFF.md` (that one described the old wireframe hero, now being replaced).

> Paste this whole file into Antigravity if you want Gemini to run with it. It is written
> as an executable spec (like `MASTER_PROMPT.md`), with starter code, gotchas, and
> acceptance criteria.

---

## 0. THE SCENARIO

Client: architect **Saiyed Mukhatyarali** · live site **designer-track.com**
(React 19 + Vite + Framer Motion + Three.js/R3F, deployed on Vercel).

The client rejected the first 3D pass ("worst 3D model I've ever seen") and asked for a
**rich, luxurious, professional-architect** look with a **best-in-class scroll-driven 3D
animation**. We agreed on a direction (all four confirmed by the client):

| Decision | Choice |
|---|---|
| **Color theme** | **Dark Gallery Luxe** — obsidian canvas, ivory type, brass-gold + terracotta accents |
| **3D hero** | **Glass architectural massing** — translucent volumes w/ real reflections + contact shadows |
| **Scroll** | **Cinematic camera move** — camera glides around the scene as you scroll |
| **Figma** | Palette + hero mockup approved in Figma; 3D is coded |

**Figma reference (approved look):** https://www.figma.com/design/UsAZPxWtgD0DoqlyjdaIHK
(palette board = node `1:2`, hero mockup = node `2:2`).

---

## 1. WHAT IS ALREADY DONE (by Claude) — do NOT redo

1. **Dark Gallery Luxe theme is fully implemented and builds clean.**
   - `src/index.css` `:root` flipped to dark: `--paper` = obsidian `#0e0c0b`, `--paper-2`
     espresso `#17130f`, `--ink` ivory `#f3ecdf`, `--ink-soft` `#b6ab99`, light-on-dark
     hairlines, dark `--grad-ink`, richer glow tokens, near-black shadows. Body background
     is a dark gradient. **Accent ramp (clay/amber/gold) unchanged — it's the brand "metal".**
   - `src/App.css`: every "light text on dark band" rule that used `var(--paper)` was
     flipped to `var(--ink)` (Studio, Footer, stat labels, card-no badge, lightbox close);
     primary CTA `.btn-solid` is now **gold**; `.eyebrow` is **gold**.
2. **3D plumbing already in place** (keep it): `HeroScene` is `React.lazy`-loaded and
   `<Suspense>`-wrapped in `src/sections.jsx`; `Card3D` tilt on `/work` cards + home
   feature blocks; `.reveal` rises from Z-depth; `.practice-item` Z-lift on hover.
   `dpr={[1,2]}`, `performance={{min:0.5}}`, `prefers-reduced-motion` → static frame, and a
   `hasWebGL()` → `.hero-scene-fallback` panel are wired into the current HeroScene wrapper.
3. **Deps installed:** `three`, `@react-three/fiber`, `@react-three/drei`,
   `@react-three/postprocessing`.

**Design tokens to use in the 3D (match these exactly):**
`GOLD #d8ab54` · `CLAY #b9532a` · `AMBER #c8863a` · `IVORY #f3ecdf` · `OBSIDIAN #0e0c0b`

---

## 2. YOUR JOB

### TASK A — Rebuild `src/components/HeroScene.jsx` as a GLASS ARCHITECTURAL MASSING
Replace the current wireframe-box scene. Target look: a small, elegant abstract massing of
**translucent glass volumes** (stacked/offset slabs — a deconstructed pavilion/tower), with
**thin brass-gold glowing edges**, **real reflections** (studio lighting), **soft contact
shadows** grounding it, and **bloom** on the gold edges. It must read as a premium
architectural object — NOT a literal house (that was removed before, see `memory.md`), NOT
flat wireframe boxes.

Use `@react-three/drei`: `Environment` + `Lightformer` (procedural studio lighting, **no
external HDRI** — avoids a CDN dependency), `MeshTransmissionMaterial` (glass),
`ContactShadows`, `Float` (subtle idle life). Keep `EffectComposer`/`Bloom`.

### TASK B — Add the CINEMATIC SCROLL CAMERA
As the user scrolls the page, the camera should **glide around/through** the massing
(orbit + dolly + slight rise), damped/eased, with mouse parallax layered on top. The hero
3D should **stay visible and reframe** while the hero region is on screen. Respect
`prefers-reduced-motion` (freeze camera).

### TASK C — Build, verify in a browser, deploy
`npm run build` clean, eyeball it (see acceptance criteria), then `npx vercel --prod`.

---

## 3. STARTER CODE (drop-in for `src/components/HeroScene.jsx`, then iterate)

> This compiles against the installed deps and is a strong starting point. **Tune materials,
> camera path, and counts in the browser** — 3D always needs visual iteration.

```jsx
import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const GOLD = '#d8ab54', CLAY = '#b9532a', IVORY = '#f3ecdf'

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// Scroll progress 0..1 over the first ~1.6 viewport heights (the hero region)
function useScrollProgress() {
  const ref = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const max = window.innerHeight * 1.6
      ref.current = Math.min(1, Math.max(0, window.scrollY / max))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return ref
}

// One glass slab + its glowing gold edges
function GlassSlab({ args, position }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...args)), [args[0], args[1], args[2]])
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={args} />
        <MeshTransmissionMaterial
          transmission={1} thickness={1.1} roughness={0.14} ior={1.45}
          chromaticAberration={0.04} anisotropy={0.2} distortion={0.1}
          color={IVORY} attenuationColor={GOLD} attenuationDistance={4}
          samples={6} resolution={256} background={null}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={GOLD} transparent opacity={0.9} />
      </lineSegments>
    </group>
  )
}

function Massing({ scrollRef }) {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.1, 0), [])
  useFrame(() => {
    const p = scrollRef.current
    const angle  = 0.55 + p * Math.PI * 0.85          // orbit sweep with scroll
    const radius = 7.2 - p * 1.6                       // dolly in
    const height = 2.3 + p * 2.4                       // rise
    const mx = PREFERS_REDUCED_MOTION ? 0 : mouse.x * 0.7
    const my = PREFERS_REDUCED_MOTION ? 0 : mouse.y * 0.5
    const L = 0.06
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(angle) * radius + mx, L)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(angle) * radius, L)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, height + my, L)
    camera.lookAt(target)
  })

  // Abstract offset massing — tune freely
  const slabs = [
    { args: [2.4, 0.45, 2.4], position: [0,    -1.15, 0]    },
    { args: [1.85, 0.45, 1.85], position: [0.28, -0.45, -0.12] },
    { args: [1.35, 0.45, 1.35], position: [-0.18, 0.28, 0.14] },
    { args: [0.85, 0.6, 0.85], position: [0.12, 1.05, -0.06] },
  ]
  return (
    <Float speed={PREFERS_REDUCED_MOTION ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group rotation={[0, 0.3, 0]}>
        {slabs.map((s, i) => <GlassSlab key={i} {...s} />)}
        <ContactShadows position={[0, -1.45, 0]} opacity={0.55} scale={11} blur={2.6} far={4.5} color="#000000" />
      </group>
    </Float>
  )
}

function Lighting() {
  // Procedural studio rig — gives glass real reflections without an external HDRI.
  return (
    <Environment resolution={256} background={false}>
      <Lightformer form="rect"   intensity={3.0} color={IVORY} position={[ 3, 3,  3]} scale={[5, 5, 1]} />
      <Lightformer form="rect"   intensity={1.4} color={GOLD}  position={[-4, 1,  2]} scale={[3, 3, 1]} />
      <Lightformer form="circle" intensity={2.2} color={CLAY}  position={[ 0,-2,  3]} scale={[3, 3, 1]} />
      <Lightformer form="rect"   intensity={1.0} color={IVORY} position={[ 0, 4, -4]} scale={[6, 2, 1]} />
    </Environment>
  )
}

export default function HeroScene() {
  const scrollRef = useScrollProgress()        // hooks BEFORE any early return
  if (!hasWebGL()) return <div className="hero-scene-fallback" aria-hidden="true" />
  return (
    <Canvas
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      frameloop={PREFERS_REDUCED_MOTION ? 'demand' : 'always'}
      shadows
      camera={{ position: [4.2, 2.6, 5.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <Lighting />
        <Massing scrollRef={scrollRef} />
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.2} luminanceSmoothing={0.85} radius={0.7} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
```

### Optional CSS for a "pinned" cinematic feel (so the 3D reframes down the page)
In `src/App.css`, make the hero scene sticky and give the hero scroll range on desktop.
**Test carefully and keep the mobile stack intact:**
```css
@media (min-width: 761px) {
  .hero { align-items: start; min-height: 180vh; }   /* scroll range for the camera */
  .hero-inner { position: sticky; top: 0; min-height: 100svh;
    display: flex; flex-direction: column; justify-content: center; }
  .hero-scene { position: sticky; top: 0; height: 100svh; }
}
```
(If 180vh feels too long, drop to ~150vh. If you prefer the simplest version, skip this
block — the camera still animates while the 100svh hero is in view, just over a shorter
range.)

---

## 4. GOTCHAS (read before coding)

1. **Postprocessing + transparent canvas:** `Bloom`/`EffectComposer` over `alpha:true` can
   render a black background instead of staying transparent. If you see a black box behind
   the glass: keep `alpha:true`, ensure no `Environment background`, and if needed wrap Bloom
   so it composites over transparency (or drop `EffectComposer` and use an emissive-edge glow
   fallback). The obsidian page is dark anyway, so a near-black bleed is less obvious — but
   verify it's actually transparent.
2. **`MeshTransmissionMaterial` is expensive** — each transmission mesh does buffer passes.
   4 slabs × transmission may drop FPS on weak GPUs. If perf suffers: lower `samples`
   (4) and `resolution` (128), reduce slab count, or give the smaller slabs a cheap
   `meshPhysicalMaterial` with `transmission={0.9}` instead of `MeshTransmissionMaterial`.
3. **Hooks ordering:** `useScrollProgress()` must run before the `hasWebGL()` early return
   (already correct above) — never put hooks after a conditional return.
4. **Keep the delivery guards:** `dpr={[1,2]}`, `performance={{min:0.5}}`, reduced-motion
   `frameloop`, and the `hasWebGL` fallback are intentional. Don't strip them.
5. **Don't un-split the lazy chunk** — the 500 KB build warning refers to the lazily-loaded
   HeroScene chunk; that's expected and good.
6. **After any `npm install`, restart Vite with `npm run dev -- --force`** (Vite dep-cache
   gotcha noted throughout `memory.md`).
7. **Responsive testing:** use CDP `Emulation.setDeviceMetricsOverride`, NOT the
   `--screenshot` CLI flag (it lies about layout width — see `memory.md`).
8. **Figma seat is "View" (starter tier)** — file creation happened to work, but editing may
   be limited. The mockup is already built; you shouldn't need to touch Figma.
9. **`drei` Environment/Lightformer** render an env scene; `background={false}` keeps the
   page background showing. If reflections look flat, bump Lightformer `intensity`.

---

## 5. ACCEPTANCE CRITERIA (verify in a real browser before deploying)

- [ ] Hero right column shows **glass volumes with real reflections + gold glowing edges**,
      grounded by a soft contact shadow — clearly premium, not flat boxes.
- [ ] Background behind the 3D is **transparent/obsidian** (no black box — see gotcha #1).
- [ ] **Scrolling glides the camera** around the massing (orbit + dolly + rise), smoothly
      damped; mouse adds subtle parallax.
- [ ] Whole site reads **Dark Gallery Luxe**: obsidian bg, ivory type, gold eyebrow + gold
      primary CTA, gold gradient accent line in the headline, gold stat numerals.
- [ ] Studio + Footer bands + lightbox + card badges all have **legible ivory text** (no
      dark-on-dark).
- [ ] **Mobile** (≤760px): hero stacks (text, then 3D below), no horizontal overflow, 3D
      still renders; camera motion acceptable.
- [ ] `prefers-reduced-motion`: 3D is a **static** frame (no orbit, no float).
- [ ] `npm run build` clean. Then `npx vercel --prod` (CLI not global — `npx`/login needed).
- [ ] Update `memory.md` (changelog entry) + tick `context.md` Active Tasks.

---

## 6. FILES TO READ FIRST
`MASTER_PROMPT.md` · `memory.md` (history + past mistakes) · `context.md` ·
`src/components/HeroScene.jsx` (current, to replace) · `src/sections.jsx` (Hero + lazy import) ·
`src/index.css` + `src/App.css` (new dark tokens) · this file.
