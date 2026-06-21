# Shared AI Memory

This file serves as a shared memory between AI agents (e.g., Antigravity and Claude) working on this project. 

## Recent Changes & Changelog

### [2026-06-21] - Fixed Mobile Menu Z-Index/Transparency Trap
- **Action:** Fixed a bug where the mobile `.site-nav` background was transparent, overlapping site content. 
- **Agents Involved:** Antigravity (Gemini)
- **Details:** The root cause was that when the user scrolled, the header gained `backdrop-filter: blur()`. A `backdrop-filter` creates a new containing block for all descendants. Thus, `.site-nav` (which had `position: fixed; inset: 0`) got trapped inside the 60px height of the header instead of covering the viewport. The menu text overflowed downwards, but its frosted background did not.
- **Fix:** Added CSS so that when the menu opens, `.site-header.is-open` forcefully strips its own `backdrop-filter` and `background`. This removes the containing block trap, allowing the `.site-nav` frosted background to properly cover the entire screen again. Also added Safari fallbacks (`-webkit-` prefix and a solid `var(--paper)` fallback for older iOS devices that don't support `color-mix`).

### [2026-06-21] - Increased 3D Rotation Sensitivity
- **Action:** Made the 3D text rotation in `InteractiveText.jsx` more responsive to both mouse and gyro.
- **Agents Involved:** Antigravity (Gemini)
- **Details:** Increased max `useTransform` rotation from ±12 degrees to ±24 degrees. Reduced the mobile `deviceorientation` clamp from 26 degrees to 16 degrees, meaning the text hits maximum tilt with smaller physical phone movements.

### [2026-06-21] - Gyro Tilt Test Handoff (Vercel Verification)
- **Action:** Created explicit handoff note from Claude to Gemini for verifying the DeviceOrientation (gyro tilt) feature.
- **Agents Involved:** Antigravity (Gemini)
- **Details:** The Gyro tilt works (rotates hero text based on DeviceOrientation), but the key gotcha is that DeviceOrientation requires a **secure context**. A plain `http://<LAN-IP>` address will silently fail to fire tilt events on mobile. 
- **Next Steps:** Open the deployed HTTPS Vercel URL on a physical phone. On iOS, the "tap to enable" pill should render and prompt for permission. On Android, it tilts immediately. Antigravity will confirm the page/pill render on the Vercel deployment before the user tests it on their phone.

### [2026-06-21] - Added vercel.json for Deployment (SPA routing fix)
- **Action:** Added `vercel.json` (framework: vite, output: dist, and a `rewrites` rule sending `/(.*)` → `/index.html`).
- **Agents Involved:** Claude (Opus)
- **Details:** Without the rewrite, Vercel 404s on deep links / refreshes of client-side routes like `/work` (this was the deploy gotcha noted in the routing changelog). The rewrite only applies when no static file matches, so `/assets/*` still serve directly. **Must redeploy (`npx vercel --prod`) or commit+push (if Git-connected) for it to take effect** — a deploy made before this file won't have the fix.

### [2026-06-21] - Hero Text Tilts to Phone Gyroscope (Mobile)
- **Action:** Extended `src/components/InteractiveText.jsx` so the 3D hero headline tilts to the phone's physical orientation on mobile (DeviceOrientation `gamma`/`beta`), in addition to the existing mouse tilt on desktop. Both feed the same framer-motion spring → rotateX/rotateY pipeline. Added a small `.tilt-enable` prompt (styled in `App.css`) shown only on iOS, which requires a tap to grant motion access.
- **Agents Involved:** Claude (Opus)
- **Details:** Gating: only runs when `matchMedia('(pointer: coarse)')` (touch) and NOT `prefers-reduced-motion`. The first orientation reading is captured as the "rest" pose, so tilt is relative to how the phone is held. iOS 13+ path uses `DeviceOrientationEvent.requestPermission()` (must be called from the tap handler); Android/others attach the listener directly. Verified via CDP (touch emulation + synthetic `DeviceOrientationEvent`): at rest the title transform is `none`; after a tilt event it becomes a `matrix3d(...)` rotation. Clean `vite build`.
- **Gotchas (for next agent):** (1) DeviceOrientation needs a **secure context** — works on `localhost` but NOT over plain `http://<LAN-IP>`; testing on a real phone needs HTTPS (vite https, a tunnel like cloudflared/ngrok, or a deployed HTTPS host). (2) Headless Chrome `Emulation.setDeviceMetricsOverride {mobile:true}` does NOT make `pointer: coarse` match — you must also call `Emulation.setTouchEmulationEnabled {enabled:true}` to test the touch path. (3) Chrome has no `DeviceOrientationEvent.requestPermission`, so the iOS permission pill can't be exercised in Chrome — it only appears on real iOS Safari.

### [2026-06-21] - QA Fixes: Removed Type Meta + Fixed Mobile Nav
- **Action:** (#3) Removed the `Type` metadata block from `WorkShowcase` (`sections.jsx`) and the `/work` cards (`WorkPage.jsx`) — projects now show only name + blurb. (#4) Rebuilt the mobile nav: the old off-canvas drawer (`.site-nav` `position:fixed; translateX(100%)`) extended past the right edge and, with no horizontal clip on `html`, caused horizontal overflow on mobile. Replaced it with a full-screen glass overlay (`inset:0`, hidden via `opacity`/`visibility`, hamburger→✕ morph via `[aria-expanded="true"]`). Added `html { overflow-x: clip }` in `index.css` as a hard guard.
- **Agents Involved:** Claude (Opus)
- **Details:** Verified via Chrome DevTools Protocol (device emulation 390px): closed → toggle visible at x≈332, overlay hidden, `documentElement.scrollWidth == 390` (no overflow); open → overlay visible, `aria-expanded=true`, still no overflow.
- **Gotchas (IMPORTANT for next agent):** `chrome --headless --screenshot --window-size=WxH` does NOT reliably set the CSS layout viewport in `--headless=new` — it rendered the page at desktop width even at `--window-size=390`, so the mobile nav looked "missing/broken" in screenshots when the page was actually fine. **For responsive testing use CDP `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot`** (a small Node script with the global `WebSocket` works; see the throwaway `/tmp/verify.mjs` pattern), not the `--screenshot` CLI flag. `.feature-meta`/`.card-meta` CSS rules are now unused (dead, harmless) since the `Type` markup was removed.
- **RESOLVED (audit items #1/#2):** User chose option **A** — keep "Practice / This is the work we do" ONLY. The old "Approach / Five moves" section is intentionally gone and should NOT be restored. Do not re-add it.

### [2026-06-21] - Reframed "Approach" → "This is the work we do" (Capabilities)
- **Action:** Replaced the process-step "Approach" section with a professional Capabilities section. `content.js`: `approach` block → `practice` (label "Capabilities", title "This is the work we do.", `intro`, and `items[]` of 6 real services: Architectural Design, Structural Engineering, Interior Architecture, Site & Landscape Planning, Construction Documentation, Project Delivery). Nav "Approach"/#approach → "Practice"/#practice. `sections.jsx`: renamed `Approach` component → `Practice` (reads `content.practice`, `id="practice"`, new `.practice*` markup). `Home.jsx`: updated import + usage. `App.css`: removed `.approach`/`.steps`/`.step*`, added `.practice` 3-col grid with a warm reveal tick on each item.
- **Agents Involved:** Claude (Opus)
- **Details:** Also FIXED a layout bug: the old `.step` used `padding: ... var(--pad) ...` (up to 6rem) on every one of 5 columns, which crushed text width and wrapped each word onto its own line. New `.practice-item` uses modest internal padding and the section carries the `var(--pad)` edge padding instead. Grid: 3 cols → 2 (≤920px) → 1 (≤760px). Clean `vite build`, screenshotted.

### [2026-06-21] - Rich Luxury Color Grading + Ambient Lighting
- **Action:** Re-graded the whole site from flat "concrete paper" minimal to a warm editorial-luxury system. `index.css`: expanded palette (deeper espresso `--ink`, warm graded paper, accent ramp `--clay`/`--amber`/`--gold` + `--sage`), gradient tokens (`--grad-warm`, `--grad-ink`, `--grad-hair`), ambient-glow tokens, soft-shadow tokens, and a fixed graded body background. `App.jsx`: added a fixed `.ambient` layer (radial light blooms). `App.css`: ambient lighting layer; hero accent line + studio stats + footer brand now use clay→gold gradient text; buttons sweep a warm gradient with amber glow; `.media-frame` got soft luxury shadows + a warm-sheen/cinematic-vignette `::after` grading overlay + graded image filters; Studio & Footer became full-bleed espresso-gradient bands with warm ambient glows.
- **Agents Involved:** Claude (Opus)
- **Details:** Used the `frontend-design` + `high-end-visual-design` skills (Editorial Luxury archetype). Kept the editorial structure/typography — only color, depth, gradients, and lighting changed. Verified clean `vite build` (CSS 4.55 KB gz) and screenshotted home + /work.
- **Gotchas (for next agent):** (1) Gradient text needs BOTH `-webkit-text-fill-color: transparent` AND `color: transparent`; setting `color` later (e.g. a hover) is a no-op because `-webkit-text-fill-color` wins. (2) Footer is now full-bleed: `.site-footer` has no max-width — its inner `.footer-top/.footer-bottom` carry `max-width: var(--maxw); margin-inline: auto`. (3) `.media-frame::after` is the grading overlay at `z-index:1`; anything that must sit on top of an image (e.g. `.card-no` badge) needs `z-index: 2`. (4) `.ambient` and the body gradient are both `position: fixed` behind content (z 0) — keep section backgrounds transparent so they show through.

### [2026-06-21] - Removed Year & Place from Project Meta (display + data)
- **Action:** Removed the `Year` and `Place` rows from project meta in both `src/sections.jsx` (homepage `feature-meta`) and `src/pages/WorkPage.jsx` (card-meta) — only `Type` remains. Then removed the `year` and `location` keys entirely from all 10 projects in `content.js`.
- **Agents Involved:** Claude (Opus)
- **Details:** Projects now carry only `no`, `name`, `type`, `image`, `blurb` (+ optional `featured`). Confirmed no code references `p.year`/`p.location`. Clean `vite build`.

### [2026-06-21] - Added Routing: Slim Home + Dedicated /work Page
- **Action:** Installed `react-router-dom`. Split the single-page app into routes: `/` (Home) and `/work` (full portfolio). Home now shows only featured projects (3); /work shows all. New files: `src/sections.jsx` (all shared section components + `useReveal`, moved out of App.jsx), `src/pages/Home.jsx`, `src/pages/WorkPage.jsx`. Rewrote `src/App.jsx` (Router layout + `ScrollManager`), wrapped app in `<BrowserRouter>` in `main.jsx`. `MagneticButton` now supports `to` (route) in addition to `href` (anchor) via `motion.create(Link)`. Added `.work-grid`/`.card`/`.workpage`/`.work-viewall` CSS.
- **Agents Involved:** Claude (Opus)
- **Details:** Homepage Work section filters `content.work.projects` by `featured: true` (fallback: first 3). The `/work` page renders every project as a 2-col card grid. Nav: "Work" → `/work` route; "Studio/Approach/Contact" → home-page `#hash` anchors (Header builds `{pathname:'/', hash}` Links). `ScrollManager` scrolls to the hash target (or top) on navigation. **To add a project:** add an entry in `content.js` `work.projects`; add `featured: true` to also show it on the homepage. Verified clean `vite build` + both routes screenshotted.
- **Gotchas (for next agent):** (1) After `npm install react-router-dom` while Vite was running, restart with `npm run dev -- --force` so Vite re-optimizes the new dep (same caching issue noted with framer-motion). (2) `useReveal` lives in `sections.jsx` and is called inside EACH page component (Home, WorkPage) — not in App — so newly-mounted `.reveal` elements on route change get observed. It uses `[]` deps (run once per mount). (3) Routing relies on Vite's SPA fallback for `/work`; a static host needs a catch-all rewrite to `index.html` or deep links 404.

### [2026-06-21] - Site-Wide "Alive" Motion Layer
- **Action:** Added motion to images, text, and buttons. New components: `src/components/ParallaxImage.jsx` (scroll-parallax drift + hover zoom), `MagneticButton.jsx` (cursor-follow magnetic CTA), `CountUp.jsx` (stat numbers count up in view). Updated `App.jsx` (Hero CTAs, all feature images, studio image, stats) and `App.css` (button clay fill-sweep + sliding arrow, `.media-frame`/`.media-img` parallax + clip-path reveal, heading wipe-reveals, animated underlines).
- **Agents Involved:** Claude (Opus)
- **Details:** Built on the already-installed `framer-motion`. Kept Antigravity's `InteractiveText` 3D hero tilt. All effects honor `prefers-reduced-motion` (via `useReducedMotion` + the global reduced-motion CSS). Parallax images are sized 128% inside `overflow:hidden` frames so the drift never reveals gaps. Verified clean `vite build`.
- **Gotchas & Mistakes (for next agent):** Parallax (framer sets inline `transform: translateY`) and CSS hover-zoom (`transform: scale`) conflict on the same element — inline style wins, so the CSS hover rule silently does nothing. Fix used: do the zoom in framer via `whileHover={{ scale }}`, which composes with the parallax `y`. Also: any image inside a `.reveal` gets `clip-path` hidden until `.is-visible`; if you add a new image, make sure its frame has `overflow:hidden` + a defined height or the 128% image will blow out the layout.

### [2026-06-21] - Added Interactive 3D Typography
- **Action:** Implemented a mouse-tracking 3D hero text effect using `framer-motion`. Created `src/components/InteractiveText.jsx` and updated `src/App.jsx`.
- **Agents Involved:** Antigravity
- **Gotchas & Mistakes:** After installing `framer-motion` while Vite was running, Vite crashed complaining about a missing `@react-three/drei` dependency. This was a Vite caching bug from a previous session. **Fix:** Restarted Vite using `npm run dev -- --force` to clear the dependency cache. Always remember to use `--force` if Vite gets stuck on old cached dependencies.

### [2026-06-21] - Removed 3D, Built Editable Editorial Landing Page
- **Action:** Removed all Three.js / R3F 3D code. Deleted `Scene.jsx`, `ModernHouse.jsx`, `Approach1.jsx`, `Approach2.jsx`. Rebuilt `App.jsx`, `App.css`, `index.css` as a single-page editorial architecture landing page. Removed `three`, `@react-three/*`, `gsap` from `package.json` deps.
- **Agents Involved:** Claude (Opus)
- **Details:** User said the 3D model was a bad idea. New design = "Architectural Editorial" aesthetic (Fraunces serif + Space Grotesk + Space Mono, warm concrete paper, clay accent, drawing-sheet numbering, scroll-reveal). **All editable text/images/links live in `src/content.js`** — that is the single file the user edits to change the site. Uses real photos `campaign1.png` (hero/Veil House) and `campaign2.png` (Board-Form Pavilion / studio). Verified with clean `vite build` (20 modules, 63 KB gz).

### [2026-06-21] - Dual Approach Landing Page
- **Action:** Built `Approach1.jsx` and `Approach2.jsx` with a toggle in `App.jsx`. Generated placeholder architectural images for the portfolio.
- **Agents Involved:** Antigravity
- **Details:** User requested a sample of two different architectural landing page layouts. Built them so the user can test live and decide.

### [2026-06-21] - Created 3D Modern House
- **Action:** Created `ModernHouse.jsx` and updated `Scene.jsx` and `App.jsx`.
- **Agents Involved:** Antigravity
- **Details:** Built a procedural 3D modern house to demonstrate architectural styling for the Designer Track website.

### [2026-06-21] - 3D Website Setup
- **Action:** Created Vite + React app, installed Three.js and R3F. Set up standard `Scene.jsx` with a floating hotpink cube.
- **Agents Involved:** Antigravity
- **Details:** User requested a 3D setup. Created a boilerplate project for future prompts.

### [2026-06-21] - Initialization
- **Action:** Created shared state files (`memory.md`, `context.md`, `claude.md`, `agentguide.md`).
- **Agents Involved:** Antigravity
- **Details:** Set up a collaborative state for AI agents to communicate code changes and share context.

---
*Note for AI Agents: Whenever you make a significant change to the codebase, add an entry to the top of the "Recent Changes" list with the date, the action taken, your agent identity, and the details.*
