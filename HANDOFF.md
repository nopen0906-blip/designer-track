# HANDOFF — 3D Upgrade Verification & Deploy

**From:** Claude (Opus) · **To:** Antigravity (Gemini) · **Date:** 2026-06-22

---

## TL;DR for Gemini

I implemented the full **Designer Track 3D upgrade** from `MASTER_PROMPT.md`. It is
**code-complete and builds cleanly**, but it is **NOT deployed** and **NOT yet
visually verified in a browser** (I have no browser in my environment — you do).

**Your two jobs:**
1. **Visually verify** the new 3D hero + interactions in a real browser.
2. **Deploy to production** once it looks right (`npx vercel --prod`).

Do **not** redesign the scene. Do **not** un-split the lazy chunk. Details below.

---

## The scenario (what just happened)

The client (architect Saiyed Mukhatyarali) wants the live React 19 + Vite + Framer
Motion site upgraded to a professional **3D** site. The spec is in `MASTER_PROMPT.md`
and the scene design was pre-approved — implement exactly, no redesign.

I reinstalled the Three.js stack (previously removed — see `memory.md`) and built the
upgrade. The HeroScene **composition is byte-for-byte the approved spec** (this is the
abstract Mies-pavilion geometry, NOT the old cartoonish procedural house that was
removed). I added delivery-quality guards on top (perf/accessibility/fallback) and
code-split the 3D so it doesn't bloat first paint.

## What I changed

**New files**
- `src/components/HeroScene.jsx` — approved WebGL scene: ghost-solid + glowing-wireframe
  slabs/walls/columns, floating blueprint particles, bloom.
- `src/components/Card3D.jsx` — mouse-tracking 3D tilt wrapper (`<article>` replacement).

**Edited**
- `src/sections.jsx` — Hero is now a 55/45 grid (`InteractiveText` left, lazy `<HeroScene>`
  right with a `SHT. 01 — Architectural Composition — 3D` caption; the old photo
  `hero-figure` is gone). `WorkShowcase` feature blocks wrapped in `Card3D`.
- `src/pages/WorkPage.jsx` — `/work` cards wrapped in `Card3D`.
- `src/App.css` — new hero grid + `.hero-scene` / `.hero-scene-caption` /
  `.hero-scene-fallback` + mobile stacking; removed dead `.hero-figure`/`.hero-media`
  rules; `.reveal` now rises from Z-depth (perspective/translateZ); `.practice-item`
  lifts in Z on hover.
- `package.json` — added `three`, `@react-three/fiber`, `@react-three/drei`,
  `@react-three/postprocessing`.
- `memory.md` + `context.md` — changelog + Active Tasks updated.

**Quality guards I added (delivery-only, NOT visual changes — keep them):**
- `dpr={[1,2]}` (caps pixel ratio), `performance={{ min: 0.5 }}` (graceful frame drops).
- `prefers-reduced-motion` → Canvas `frameloop="demand"` (single static frame). CSS alone
  does NOT stop a WebGL render loop, so this is required to honor reduced motion.
- `hasWebGL()` check → renders a quiet `.hero-scene-fallback` gradient panel instead of
  crashing where WebGL is unavailable.
- `HeroScene` is `React.lazy`-loaded → Three.js is in its own chunk.

## Build status (verified by me)

`npm run build` → **clean, exit 0, 480 modules**. After code-splitting:
- main bundle `index-*.js`: **387 KB / 125 KB gz** (was 1,340 KB before splitting)
- `HeroScene-*.js`: **953 KB / 251 KB gz** (Three.js, loaded lazily only when hero mounts)

---

## YOUR TASKS

### 1. Run locally and verify visually
```bash
npm run dev -- --force
```
(`--force` clears Vite's dep cache after the new install — same gotcha we hit with
framer-motion / react-router.)

**Checklist — confirm each in the browser:**
- [ ] Hero shows the 3D scene on the **right**, with a **transparent** background
      (warm ivory page shows through — NOT an opaque black box). ⚠️ See gotcha #5.
- [ ] 3D scene drifts/rotates and reacts to the **mouse**.
- [ ] Hero text on the left still has its 3D tilt (`InteractiveText` untouched).
- [ ] Sections reveal with Z-depth rise (not just fade-up).
- [ ] `/work` cards and homepage feature blocks **tilt in 3D on hover**.
- [ ] Practice items lift in Z on hover.
- [ ] **Mobile** (≤760px): hero stacks vertically, 3D scene below the text, no horizontal
      overflow. Use **CDP `Emulation.setDeviceMetricsOverride`** for responsive testing —
      NOT the `--screenshot` CLI flag (see `memory.md`, it lies about layout width).
- [ ] `prefers-reduced-motion: reduce` → 3D shows a **static** frame (no animation loop).

### 2. Deploy to production (only after the above looks right)
```bash
npx vercel --prod
```
⚠️ The Vercel CLI is **not globally installed** here (`vercel` is only a devDependency).
`npx vercel` will likely need a login/auth step. `vercel.json` (framework vite, SPA
rewrite) is already in place from a prior change, so deep links to `/work` won't 404.

### 3. Wrap up
- Update `memory.md` with a short changelog entry noting your verification result + deploy.
- Tick the "3D visual verification" box in `context.md` Active Tasks.

---

## GOTCHAS (read before touching anything)

1. **Don't redesign HeroScene.** Sizes/positions/colors/bloom/camera are client-approved.
   This is abstract architecture — do NOT turn it into a literal house/building (that was
   built and removed before for looking amateur; see `memory.md`).
2. **Don't un-split the lazy chunk.** The 500 KB chunk-size build warning now refers ONLY
   to the lazily-loaded `HeroScene` chunk — that's expected and good. Leave it.
3. **`Card3D` inline styles override the CSS `.reveal` transition** — cards animate their
   transform in ~0.25s (opacity still fades over 0.9s). This is by design, not a bug.
4. **31 npm vulnerabilities** were reported on install (transitive deps). I did NOT run
   `npm audit fix --force` (it can introduce breaking changes). Leave for a deliberate pass.
5. **⚠️ Transparency risk (the one thing I couldn't check):** `EffectComposer` + `Bloom`
   over an `alpha:true` canvas can sometimes render an **opaque black background** instead
   of preserving transparency. If you see a black box behind the wireframes: the scene
   composition is correct, the fix is at the postprocessing/composer layer (e.g. ensure the
   composer/renderer clears with alpha and the Bloom pass composites over transparent).
   Fix the compositing, NOT the approved geometry.

## Key files to read first
`MASTER_PROMPT.md` (the spec) · `memory.md` (full history + past mistakes) · `context.md`
(architecture) · `src/components/HeroScene.jsx` · `src/sections.jsx` · `src/App.css`
