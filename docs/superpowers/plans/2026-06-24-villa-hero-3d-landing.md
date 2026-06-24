# Villa Hero 3D Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Note:** Task 2 drives the Blender MCP (stateful socket + `mcp__blender__*` tools) and benefits from inline execution in the main session.

**Goal:** Add a `/sample` test route to the existing Vite + React site whose hero is a Blender-modeled modern villa, animated with a cinematic scroll camera — previewable without touching the live homepage.

**Architecture:** A new `SamplePage` mirrors the homepage composition but swaps the hero's 3D for a new lazy-loaded `VillaHero` (React Three Fiber). `VillaHero` renders a Blender-exported GLB (`public/models/villa.glb`) and falls back to an in-code procedural villa if the GLB is absent or Blender is unavailable. Shared 3D helpers (WebGL/low-power detection, hero-relative scroll progress) live in a new `three-helpers.js`. Nothing in `Home`, `HeroScene`, `content.js`, or the theme changes until ship-approval.

**Tech Stack:** React 19, Vite 8, `three@0.184`, `@react-three/fiber@9`, `@react-three/drei@10`, `framer-motion`. Blender 5.1 via `uvx blender-mcp` (MCP socket `127.0.0.1:9876`). Languages: JSX/R3F, Python (Blender), CSS (reused).

## Global Constraints

- **Stay on Vite + React.** No Next.js migration. (Delivery choice: in-site test route.)
- **Additive only.** Create new files + add ONE route line to `src/App.jsx`. Do NOT modify `Home.jsx`, `HeroScene.jsx`, `content.js`, `index.css`, or `App.css`. The live `/` and `/work` routes must be byte-for-byte unchanged.
- **No new dependencies.** `useGLTF` ships with drei; export the GLB WITHOUT Draco so no runtime decoder/CDN is needed.
- **Palette (verbatim):** obsidian `#0e0c0b`, ivory `#f3ecdf`, brass-gold `#d8ab54`, clay `#b9532a`. Concrete `#c9bca6`, glass `#181512`.
- **Perf + a11y guards required** on the 3D: lazy-loaded chunk; `LOW_POWER` path (coarse pointer / width<900 / ≤4 cores / ≤4GB → capped dpr, `antialias:false`, lower env resolution); `prefers-reduced-motion` → `frameloop='demand'` (one static frame); `hasWebGL()` false → `.hero-scene-fallback` panel.
- **Canvas must be `alpha:true`** with NO EffectComposer (preserves transparency over the dark theme — known black-box risk).
- **Reuse existing CSS classes:** `.hero`, `#top`, `.hero-inner`, `.hero-scene`, `.hero-scene-fallback`, `.eyebrow`, `.hero-foot`, `.hero-sub`, `.hero-cta`, `.btn`, `.reveal`.

## Verification approach (read before starting)

This is a **visual WebGL feature**; the project has **no test runner** and adding one is out of scope (YAGNI). "Tests" here are concrete and real:
- **Build:** `npm run build` must be clean (no errors; the 3D in its own lazy chunk).
- **Lint:** `npm run lint` clean.
- **Visual:** run `npm run dev`, open `http://localhost:5173/sample`, confirm the canvas renders (transparent bg, villa visible), the camera sweeps on scroll, mouse parallax works, and the page below matches the homepage. Capture a screenshot (browser, or headless Chrome via CDP `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot` — the project's established method; the `--screenshot` CLI flag does NOT set the mobile viewport reliably).
- **Blender:** `mcp__blender__get_viewport_screenshot` to confirm the model; check the GLB file exists on disk after export.

Do NOT fabricate unit tests for scene-graph composition — verify by build + rendered pixels.

---

### Task 1: React side — animated procedural villa hero at `/sample`

Builds the entire React 3D hero with an **in-code procedural villa** (no Blender yet). This guarantees a working, shippable sample even if Blender never connects (the spec's fallback). Task 2 models the real villa; Task 3 swaps it in.

**Files:**
- Create: `src/components/three-helpers.js`
- Create: `src/components/VillaHero.jsx`
- Create: `src/pages/SamplePage.jsx`
- Modify: `src/App.jsx` (add lazy import + one `<Route>`)

**Interfaces:**
- Produces (`three-helpers.js`): `hasWebGL(): boolean`, `LOW_POWER: boolean`, `PREFERS_REDUCED_MOTION: boolean`, `useHeroScrollProgress(): React.MutableRefObject<number>` (0..1 across the `#top` hero's pinned scroll range).
- Produces (`VillaHero.jsx`): `default export VillaHero()` — a self-contained `<Canvas>` hero; also internal `ProceduralVilla`, `Rig`, `Lighting`, `useVillaMaterials` (consumed by Task 3).
- Produces (`SamplePage.jsx`): `default export SamplePage()` rendering `SampleHero` + reused `Statement/WorkShowcase/Practice/Studio/Contact`.
- Consumes: existing `InteractiveText`, `MagneticButton`, and `useReveal/Statement/WorkShowcase/Practice/Studio/Contact` from `../sections`.

- [ ] **Step 1: Create `src/components/three-helpers.js`**

```js
import { useRef, useEffect } from 'react'

export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

// Phones / small / low-core / low-memory devices get the cheap render path.
export const LOW_POWER = (() => {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  const small = window.innerWidth < 900
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4
  const lowMem = (navigator.deviceMemory || 8) <= 4
  return !!(coarse || small || fewCores || lowMem)
})()

export function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// Scroll progress 0..1 across the pinned hero (#top) scroll range. Measuring the
// hero element (not a fixed viewport multiple) makes the camera complete its full
// cinematic sweep exactly while the 3D is pinned, on any screen height.
export function useHeroScrollProgress() {
  const ref = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('top')
      if (!hero) { ref.current = 0; return }
      const rect = hero.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) { ref.current = 0; return }   // mobile / unpinned: stay at start
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      ref.current = scrolled / total
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return ref
}
```

- [ ] **Step 2: Create `src/components/VillaHero.jsx`** (procedural villa + scroll camera + sun sweep + guards)

```jsx
import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import { hasWebGL, LOW_POWER, PREFERS_REDUCED_MOTION, useHeroScrollProgress } from './three-helpers'

const GOLD = '#d8ab54', CLAY = '#b9532a', IVORY = '#f3ecdf'
const CONCRETE = '#c9bca6', GLASS = '#181512'

// Shared standard materials (reflective tinted glass — NOT real-time transmission, for perf).
export function useVillaMaterials() {
  return useMemo(() => ({
    concrete: new THREE.MeshStandardMaterial({ color: CONCRETE, roughness: 0.85, metalness: 0.0 }),
    glass: new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.12, metalness: 0.7, envMapIntensity: 1.5 }),
    brass: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.32, metalness: 1.0, envMapIntensity: 1.7 }),
  }), [])
}

// In-code villa: low plinth, lower concrete volume, glass front, cantilevered
// upper box, brass roof line, slender columns. Three-space (Y up).
export function ProceduralVilla() {
  const m = useVillaMaterials()
  return (
    <group>
      <mesh position={[0, -0.62, 0]} material={m.concrete}><boxGeometry args={[5.2, 0.24, 4.2]} /></mesh>
      <mesh position={[-0.6, 0, 0]} material={m.concrete}><boxGeometry args={[3.0, 1.0, 3.4]} /></mesh>
      <mesh position={[-0.6, 0, 1.72]} material={m.glass}><boxGeometry args={[2.8, 0.86, 0.04]} /></mesh>
      <mesh position={[0.5, 0.92, -0.1]} material={m.concrete}><boxGeometry args={[3.6, 0.84, 2.6]} /></mesh>
      <mesh position={[0.5, 1.36, 1.2]} material={m.brass}><boxGeometry args={[3.64, 0.06, 0.06]} /></mesh>
      {[-0.8, 0.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.0, 1.0]} material={m.concrete}>
          <cylinderGeometry args={[0.055, 0.055, 1.0, 12]} />
        </mesh>
      ))}
    </group>
  )
}

// Procedural studio rig — gives glass/brass real reflections without an external HDRI.
function Lighting() {
  return (
    <Environment resolution={LOW_POWER ? 64 : 128} background={false}>
      <Lightformer form="rect" intensity={3.0} color={IVORY} position={[3, 4, 3]} scale={[6, 6, 1]} />
      <Lightformer form="rect" intensity={1.3} color={GOLD} position={[-5, 2, 2]} scale={[3, 3, 1]} />
      <Lightformer form="circle" intensity={1.8} color={CLAY} position={[0, -2, 4]} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={1.0} color={IVORY} position={[0, 5, -5]} scale={[8, 2, 1]} />
    </Environment>
  )
}

// Cinematic scroll camera (orbit + dolly + rise) + arcing "sun" (re-shades the
// concrete as it moves = "light moves") + subtle mouse parallax + idle float.
function Rig({ scrollRef, sunRef, children }) {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.25, 0), [])
  useFrame((state) => {
    const p = scrollRef.current
    const t = state.clock.elapsedTime
    const idle = PREFERS_REDUCED_MOTION ? 0 : Math.sin(t * 0.15) * 0.1
    const angle = 0.5 + p * 2.1 + idle           // ~120° orbit
    const radius = 8.6 - p * 2.4                  // dolly in
    const height = 2.6 + p * 2.8                  // rise
    const mx = PREFERS_REDUCED_MOTION ? 0 : mouse.x * 0.6
    const my = PREFERS_REDUCED_MOTION ? 0 : mouse.y * 0.4
    const L = 0.06
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(angle) * radius + mx, L)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(angle) * radius, L)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, height + my, L)
    camera.lookAt(target)
    if (sunRef.current) {
      const a = 0.7 + p * 1.3
      sunRef.current.position.set(Math.cos(a) * 6, 5.2 - p * 1.0, Math.sin(a) * 5 + 1)
    }
  })
  return children
}

export default function VillaHero() {
  const scrollRef = useHeroScrollProgress()   // hooks BEFORE any early return
  const sunRef = useRef()
  if (!hasWebGL()) return <div className="hero-scene-fallback" aria-hidden="true" />
  return (
    <Canvas
      dpr={LOW_POWER ? 1 : [1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop={PREFERS_REDUCED_MOTION ? 'demand' : 'always'}
      camera={{ position: [6.4, 2.8, 6.4], fov: 38 }}
      gl={{ antialias: !LOW_POWER, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight ref={sunRef} intensity={2.2} color={IVORY} position={[4, 5, 3]} />
        <Lighting />
        <Rig scrollRef={scrollRef} sunRef={sunRef}>
          <Float speed={PREFERS_REDUCED_MOTION ? 0 : 0.8} rotationIntensity={0.06} floatIntensity={0.25}>
            <ProceduralVilla />
          </Float>
          <ContactShadows position={[0, -0.74, 0]} opacity={0.55} scale={12} blur={2.6} far={5} color="#000000" frames={1} />
        </Rig>
      </Suspense>
    </Canvas>
  )
}
```

- [ ] **Step 3: Create `src/pages/SamplePage.jsx`** (homepage layout, hero swapped to VillaHero)

```jsx
import { Suspense, lazy } from 'react'
import { content } from '../content'
import { useReveal, Statement, WorkShowcase, Practice, Studio, Contact } from '../sections'
import InteractiveText from '../components/InteractiveText'
import MagneticButton from '../components/MagneticButton'

const VillaHero = lazy(() => import('../components/VillaHero'))

function linkProps(href) {
  return href.startsWith('/') ? { to: href } : { href }
}

function SampleHero() {
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
          <VillaHero />
        </Suspense>
      </div>
    </section>
  )
}

export default function SamplePage() {
  useReveal()
  const all = content.work.projects
  const featured = all.filter((p) => p.featured)
  const sample = (featured.length ? featured : all.slice(0, 3))
  return (
    <>
      <SampleHero />
      <Statement />
      <WorkShowcase projects={sample} showViewAll />
      <Practice />
      <Studio />
      <Contact />
    </>
  )
}
```

- [ ] **Step 4: Add the route in `src/App.jsx`**

Add the lazy import after the existing page imports (line ~6) and a `Suspense`-wrapped route. Replace the import block + `<Routes>` block:

```jsx
import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Header, Footer } from './sections';
import Home from './pages/Home';
import WorkPage from './pages/WorkPage';

const SamplePage = lazy(() => import('./pages/SamplePage'));
```

and inside `<main>`:

```jsx
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/sample" element={<Suspense fallback={null}><SamplePage /></Suspense>} />
        </Routes>
```

- [ ] **Step 5: Lint + build**

Run: `npm run lint` → Expected: clean (no errors).
Run: `npm run build` → Expected: clean; output shows a separate lazy chunk for `VillaHero` (Three.js) and one for `SamplePage`.

- [ ] **Step 6: Visual check**

Run: `npm run dev`. Open `http://localhost:5173/sample`.
Expected: page renders with the villa hero (transparent canvas, villa visible over the dark theme); scrolling the hero orbits/dollies/rises the camera; mouse moves parallax the view; sections below match the homepage; `/` and `/work` are unchanged. Capture a screenshot (CDP method) of `/sample` at 1440×900 and at 390px.

- [ ] **Step 7: Commit**

```bash
git add src/components/three-helpers.js src/components/VillaHero.jsx src/pages/SamplePage.jsx src/App.jsx
git commit -m "Add /sample route with procedural villa 3D hero" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Model the villa in Blender → `public/models/villa.glb`

Uses the Blender MCP to parametrically model the villa, assign materials, preview, and export a GLB. **This task is an enhancement** — if Blender is unreachable, SKIP it; the sample already works (procedural). The site never depends on Blender at runtime.

**Files:**
- Create: `public/models/villa.glb` (binary export from Blender)

**Interfaces:**
- Produces: `public/models/villa.glb` — a Y-up (post-glTF-conversion) GLB containing named meshes (Plinth, LowerVolume, GlassWall, UpperVolume, BrassFascia, Column_*) with Principled materials (Concrete/Glass/Brass). Consumed by Task 3's `useGLTF('/models/villa.glb')`.

- [ ] **Step 1: Verify Blender connectivity**

Call `mcp__blender__get_scene_info`.
Expected: returns scene JSON (Blender open + addon "Connect to MCP server" running on port 9876).
If it errors or the `mcp__blender__*` tools are missing: tell the user to (a) open Blender 5.1, (b) in the BlenderMCP sidebar click "Connect to MCP server", and if tools still don't appear, reconnect via `/mcp` or restart the session (tools only load in a session started after the server was registered). If Blender cannot be brought up, **skip to Task 3 acceptance with the procedural villa** and note it.

- [ ] **Step 2: Build geometry + materials + export (one `execute_blender_code` call)**

Call `mcp__blender__execute_blender_code` with:

```python
import bpy, os

# clean slate: remove existing mesh objects
for obj in list(bpy.data.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)

def material(name, color, rough, metal):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (color[0], color[1], color[2], 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    return m

concrete = material('Concrete', (0.62, 0.56, 0.47), 0.85, 0.0)
glass    = material('Glass',    (0.09, 0.08, 0.07), 0.12, 0.7)
brass    = material('Brass',    (0.85, 0.67, 0.33), 0.32, 1.0)

villa = []
def box(name, dims, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)  # 1m cube
    o = bpy.context.active_object
    o.name = name
    o.scale = (dims[0], dims[1], dims[2])  # full dims (size=1 -> half-extents 0.5; scale=dims gives dims meters)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    villa.append(o)
    return o

# Blender axes: X=width, Y=depth, Z=height (Z up). glTF export converts to Y-up for three.js.
box('Plinth',      (5.2, 4.2, 0.24), (0.0,  0.0, -0.62), concrete)
box('LowerVolume', (3.0, 3.4, 1.0),  (-0.6, 0.0,  0.0),  concrete)
box('GlassWall',   (2.8, 0.06, 0.86),(-0.6, 1.72, 0.0),  glass)
box('UpperVolume', (3.6, 2.6, 0.84), (0.5, -0.1,  0.92), concrete)
box('BrassFascia', (3.64, 0.06, 0.06),(0.5, 1.2,  1.36), brass)

for i, x in enumerate((-0.8, 0.6, 1.6)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=1.0, location=(x, 1.0, 0.0))
    o = bpy.context.active_object
    o.name = 'Column_%d' % i
    o.data.materials.append(concrete)
    villa.append(o)

# nice viewport preview
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces[0].shading.type = 'MATERIAL'

# export ONLY the villa meshes (no camera/lights) to GLB, no Draco
out = 'C:/Users/Admin/Desktop/website/public/models/villa.glb'
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.object.select_all(action='DESELECT')
for o in villa:
    o.select_set(True)
bpy.context.view_layer.objects.active = villa[0]
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True)
print('EXPORTED:', out, 'exists=', os.path.exists(out))
```

Expected: stdout ends with `EXPORTED: C:/Users/Admin/Desktop/website/public/models/villa.glb exists= True`.

- [ ] **Step 3: Preview + confirm file**

Call `mcp__blender__get_viewport_screenshot` and show the user the rendered villa. Confirm proportions read as: low plinth → lower volume with glass front → cantilevered upper box → thin brass roof line. (If a dimension looks off, re-run Step 2 with nudged `box(...)` values; target the silhouette, not exact numbers.)
Run: `ls -la "c:/Users/Admin/Desktop/website/public/models/villa.glb"` → Expected: file exists, non-zero size (expect well under ~1 MB for this simple geometry).

- [ ] **Step 4: Commit**

```bash
git add public/models/villa.glb
git commit -m "Add Blender-modeled villa GLB" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Load the GLB in VillaHero (with procedural fallback)

Swap the in-code villa for the Blender GLB, keeping the procedural villa as an automatic fallback if the GLB is missing/broken (so the page is robust either way).

**Files:**
- Modify: `src/components/VillaHero.jsx`

**Interfaces:**
- Consumes: `public/models/villa.glb` (Task 2), `ProceduralVilla`/`useVillaMaterials` (Task 1).
- Produces: same `default export VillaHero()` (signature unchanged) now rendering the GLB.

- [ ] **Step 1: Update imports** — replace the React + drei import lines at the top of `VillaHero.jsx`:

```jsx
import { useRef, useMemo, useEffect, Suspense, Component } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float, Center, useGLTF } from '@react-three/drei'
```

- [ ] **Step 2: Add the GLB model + error boundary** — insert after `ProceduralVilla` (before `Lighting`):

```jsx
const MODEL_URL = '/models/villa.glb'

// Loads the Blender villa; centers it so R3F framing is independent of Blender origin.
function VillaModel() {
  const { scene } = useGLTF(MODEL_URL)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <Center disableY position={[0, -0.25, 0]}><primitive object={cloned} /></Center>
}
useGLTF.preload(MODEL_URL)

// If the GLB is absent/broken, render the in-code villa instead — page never breaks.
class ModelBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
```

- [ ] **Step 3: Swap the villa node** — in the returned JSX, replace the `<Float>...<ProceduralVilla />...</Float>` block with:

```jsx
          <Float speed={PREFERS_REDUCED_MOTION ? 0 : 0.8} rotationIntensity={0.06} floatIntensity={0.25}>
            <ModelBoundary fallback={<ProceduralVilla />}>
              <Suspense fallback={<ProceduralVilla />}>
                <VillaModel />
              </Suspense>
            </ModelBoundary>
          </Float>
```

- [ ] **Step 4: Lint + build**

Run: `npm run lint` → Expected: clean.
Run: `npm run build` → Expected: clean; `villa.glb` referenced from the lazy 3D chunk.

- [ ] **Step 5: Visual check**

`npm run dev` → `http://localhost:5173/sample`. Expected: the **Blender** villa now renders (centered, correct materials/reflections, transparent bg) and animates with scroll. Temporarily rename `public/models/villa.glb` and reload to confirm the **procedural fallback** appears with no crash, then rename it back. Screenshot `/sample`.

- [ ] **Step 6: Commit**

```bash
git add src/components/VillaHero.jsx
git commit -m "Load Blender villa GLB in VillaHero with procedural fallback" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: QA pass — responsive, reduced-motion, perf, final screenshots

**Files:** none (verification + at most small numeric tweaks to `VillaHero.jsx`)

- [ ] **Step 1: Reduced-motion** — in DevTools (or CDP `Emulation.setEmulatedMedia 'prefers-reduced-motion':'reduce'`), reload `/sample`. Expected: one static composed frame (no orbit/float/parallax); page still readable.
- [ ] **Step 2: Mobile** — CDP `Emulation.setDeviceMetricsOverride` 390×844 + `setTouchEmulationEnabled`. Expected: LOW_POWER path (no antialias, dpr 1), hero stacks correctly, NO horizontal overflow (`documentElement.scrollWidth === 390`), canvas renders.
- [ ] **Step 3: Live routes untouched** — confirm `/` and `/work` render exactly as before (no regression from the route addition). `git diff main -- src/App.jsx` shows ONLY the added import + route line.
- [ ] **Step 4: Final build** — `npm run build` clean; note chunk sizes (3D split out, main shell unaffected).
- [ ] **Step 5: Capture final screenshots** of `/sample` (desktop 1440×900 + mobile 390px) to show the user for the ship/discard decision.
- [ ] **Step 6: Commit any tweaks**

```bash
git add -A
git commit -m "QA pass: reduced-motion, mobile, perf verification for villa hero sample" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## On ship-approval (out of scope for this plan, documented for later)

To "upload": in `src/pages/Home.jsx`/`src/sections.jsx` swap the hero's `HeroScene` for `VillaHero` (or repoint `Hero`'s 3D import), delete the `/sample` route, `npm run build`, deploy (`vercel --prod` / push). To discard: `git checkout main && git branch -D villa-hero-3d-sample`.

## Self-review

- **Spec coverage:** §4 architecture → Task 1 (files + route). §5 scene/materials → Task 1 (procedural) + Task 2 (Blender). §6 animation (scroll cam, sun sweep, parallax, idle) → Task 1 `Rig`. §7 perf/a11y guards → Task 1 (`three-helpers` + Canvas props) + Task 4. §8 Blender workflow + prerequisite + fallback → Task 2 + Task 3 boundary. §9 acceptance → covered across Tasks 1/3/4. ✅
- **Placeholders:** none — every step has full code/commands. ✅
- **Type consistency:** `useHeroScrollProgress`, `hasWebGL`, `LOW_POWER`, `PREFERS_REDUCED_MOTION` defined in Task 1 and imported identically; `ProceduralVilla`/`useVillaMaterials` exported in Task 1, consumed in Task 3; `MODEL_URL='/models/villa.glb'` matches the Task 2 export path `public/models/villa.glb`. ✅
