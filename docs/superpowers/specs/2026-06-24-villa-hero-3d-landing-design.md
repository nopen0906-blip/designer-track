# Spec — "Villa Hero" 3D Animated Landing (Test Sample)

- **Date:** 2026-06-24
- **Author:** Claude (Opus)
- **Status:** Approved (design) — proceeding to implementation plan
- **Branch:** `villa-hero-3d-sample`

## 1. Goal

Build a "best-in-class" 3D animated landing hero for **designer-track.com** whose centerpiece
is a **Blender-modeled modern villa** (replacing the current procedural glass-slab massing).
Delivered as a **test sample the user previews before deciding to ship** — nothing on the live
homepage changes until explicitly approved.

## 2. Current state (context)

- Stack: **Vite + React 19**, `react-router-dom` (`/` Home, `/work`), `framer-motion`,
  and **React Three Fiber / drei / postprocessing** (`three@0.184`). Deployed on Vercel.
- Existing 3D hero: `src/components/HeroScene.jsx` — 4 stacked glass slabs w/ brass edges,
  procedural studio lights, cinematic scroll camera, perf guards (LOW_POWER, reduced-motion,
  WebGL fallback). Lazy-loaded.
- Theme: **Dark Gallery Luxe** — obsidian `#0e0c0b` / ivory `#f3ecdf` / brass-gold `#d8ab54`
  / clay `#b9532a`. Tokens in `src/index.css`.
- Content is centralized in `src/content.js`. Brand: "Designer Track", architect Saiyed
  Mukhatyarali. Hero headline: *"Spaces shaped by the way light moves."*
- **Blender MCP** is wired up (Blender 5.1 ↔ `uvx blender-mcp`, socket `127.0.0.1:9876`).

## 3. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Delivery | **New `/sample` route in the existing Vite app** | Reuses theme + content + 3D setup; preview in real context; zero risk to live site; no Next.js migration (R3F is identical either way). |
| Scene concept | **Signature modern villa** | An architecture studio's strongest hero is a building the visitor can orbit. Highest wow; showcases the actual craft. |
| Villa style | **Generic clean minimalist modern** | Broadest appeal; can be retargeted to a real portfolio project later. |
| Asset sourcing | **Model parametrically in Blender via MCP** → Draco GLB → drei `useGLTF` | Full control, clean topology, small file, on-brand. (Alternatives: Hyper3D text→3D, PolyHaven/Sketchfab — rejected for control/quality/licensing.) |
| Framework | **Stay on Vite + React** | User selected the in-site test-route delivery; Next.js not required for the 3D goal. |

## 4. Architecture (all additive — nothing deleted)

New files:
- `src/pages/SamplePage.jsx` — the test page: real homepage layout with `VillaHero` swapped
  in for the hero. All sections below (statement, featured work, practice, studio, contact)
  reused as-is.
- `src/components/VillaHero.jsx` — the new 3D hero: `<Canvas>` + GLB loader + scroll camera +
  sun sweep + perf guards. Lazy-loaded into its own chunk.
- `public/models/villa.glb` — exported Blender model (Draco-compressed).
- `src/App.jsx` — add one `<Route path="/sample">` line.

On approval to ship: swap `HeroScene → VillaHero` on `src/pages/Home.jsx` and deploy. The
`/sample` route and this spec can then be removed or kept.

## 5. The 3D scene (Blender → glTF → R3F)

**Geometry (minimal, elegant — not over-detailed):**
- Two offset rectilinear **concrete volumes**; the upper floor **cantilevers** over the lower.
- Floor-to-ceiling **tinted glass** curtain wall on the main elevation.
- Thin **brass fascia** line at the roof edge; a few slender columns under the cantilever.
- A low stone **plinth**/podium the villa sits on.

**Materials (mapped to brand palette):**
- Concrete — matte, light roughness variation, ivory-warm grey.
- Glass — dark tinted, low roughness, slight reflection (not full real-time transmission, for perf).
- Brass — brushed metallic gold (`#d8ab54`), the single "metal" accent.

**Lighting:**
- **PolyHaven HDRI** (studio or sunset) for real reflections (`Environment`), `background={false}`.
- One warm low **key "sun"** (directional) casting the moving shadow.
- Soft **ContactShadows** + subtle ground reflection under the plinth.

## 6. Animation / interaction

- **Cinematic scroll camera:** opens 3/4-front; as the pinned hero scrolls, orbit ~120° +
  dolly in + rise. Reuse the proven **hero-relative scroll-progress** hook from `HeroScene.jsx`
  (measures the pinned hero's scroll range so the sweep completes exactly while pinned).
- **Sun sweep:** key light arcs slightly so shadows crawl across the concrete = "light moves."
- **Mouse / gyro parallax** layered on top (subtle).
- **Idle:** very slow auto-orbit float when not scrolling.

## 7. Performance + accessibility (reuse existing guards)

- **Lazy-loaded** (`React.lazy`) — 3D never blocks first paint; Three.js stays in its own chunk.
- **LOW_POWER path** (coarse pointer / width < 900 / ≤4 cores / ≤4GB): capped `dpr`,
  `antialias:false`, lighter material, lower env resolution, no heavy reflections.
- **`prefers-reduced-motion`:** `frameloop='demand'` → one static composed frame (CSS alone
  does not stop a WebGL loop).
- **WebGL absent:** render the existing `.hero-scene-fallback` panel instead of crashing.
- **Draco-compressed GLB** keeps the model small; target a lean hero chunk.

## 8. Blender workflow + prerequisite + fallback

**Prerequisite (Blender path):** Blender 5.1 open with the BlenderMCP addon's
*"Connect to MCP server"* started (port 9876). `mcp__blender__*` tools only load in a Claude
session started *after* the server was registered — reconnect via `/mcp` or restart if missing.

**Workflow:** verify connectivity (`get_scene_info`) → build villa with `execute_blender_code`
(parametric) → assign materials → load PolyHaven HDRI + set sun → iterate using
`get_viewport_screenshot` (shown to user) → export Draco GLB to `public/models/villa.glb`.

**Fallback (Blender link down):** the sample still ships — fall back to a refined **procedural
villa built directly in R3F** (same camera, lighting, materials; geometry-in-code instead of a
GLB). The Blender route is the ideal; this guarantees a result regardless.

## 9. Acceptance criteria

1. Visiting `/sample` shows the homepage with the new villa hero; the live homepage (`/`) is unchanged.
2. The villa renders with correct materials (concrete/glass/brass) and HDRI reflections; transparent canvas background (no black box).
3. Scroll pins the hero and drives the camera through a full orbit + dolly + rise; shadows move ("sun sweep").
4. Mouse/gyro parallax works; idle auto-orbit works.
5. Reduced-motion shows a single static frame; phones use the LOW_POWER path and stay smooth; WebGL-absent shows the fallback panel.
6. `vite build` is clean; the 3D sits in a lazily-loaded chunk.
7. User can preview locally and decide to ship (swap into Home + deploy) or discard (delete branch).

## 10. Out of scope (YAGNI)

- No Next.js migration. No changes to `/` or `/work` until ship-approval. No new content in
  `content.js`. No interior/furnishing detail on the villa. No real-time glass transmission
  (reflective tinted glass only, for perf). No new dependencies beyond what's installed
  (drei provides `useGLTF` + Draco).
