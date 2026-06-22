# Project Context

This file provides the global context and current state of the repository for AI agents.

## Project Overview
- **Name:** Website (Designer Track)
- **Framework/Tech Stack:** React (Vite) + `react-router-dom` (routes: `/` Home, `/work` full portfolio). `framer-motion` powers the motion layer: 3D hero text (`InteractiveText`), scroll-parallax images (`ParallaxImage`), magnetic CTAs (`MagneticButton`), count-up stats (`CountUp`). **Three.js / React Three Fiber / drei / postprocessing** power the WebGL layer: the abstract architectural hero scene (`HeroScene`, lazy-loaded into its own chunk) and the 3D tilt cards (`Card3D`).
- **Current Goal:** A polished, responsive, *animated* editorial site. Home is a slim landing (hero, statement, 3 featured projects, approach, studio, contact); the full project list lives on `/work`. All copy/images/links are user-editable in a single file: `src/content.js`.

## File Map
- `src/App.jsx` — router layout (Header + Footer + Routes + ScrollManager).
- `src/sections.jsx` — all shared section components + `useReveal` hook.
- `src/pages/Home.jsx` — homepage (featured projects only).
- `src/pages/WorkPage.jsx` — `/work` portfolio grid (all projects).
- `src/content.js` — single edit point: nav, hero, projects (`featured: true` shows on home), workPage copy, etc.

## Architecture Guidelines
- Follow existing patterns found in the codebase.
- Maintain clean, minimal, and modern aesthetics if editing the UI.

## Active Tasks
- [x] Initialize shared AI context files.
- [x] Added interactive 3D hero text tracking mouse position.
- [x] Added site-wide "alive" motion: scroll-parallax + clip-reveal images, magnetic CTA buttons with clay fill-sweep & sliding arrow, count-up stats, heading wipe-reveals, animated link underlines. All respect `prefers-reduced-motion`.
- [x] Added routing: slim Home shows 3 featured projects; full portfolio moved to a dedicated `/work` page (2-col card grid). Nav + hero CTA point to `/work`.
- [x] Rich luxury color grading: warm espresso/terracotta/amber/gold palette, fixed ambient light blooms (`.ambient`), gradient accent text, graded image overlays + soft shadows, full-bleed espresso Studio & Footer bands with warm glows. Tokens live in `index.css` (`--grad-*`, `--glow-*`, `--shadow-*`).
- [x] Replaced the "Approach" process steps with a professional Capabilities section — "This is the work we do." (6 services). Section is now `Practice` / `content.practice` / `#practice`; fixed the per-word wrap bug from the old 5-column layout.
- [x] QA pass: removed `Type` metadata from project showcase + work cards; fixed mobile nav (full-screen glass overlay, `html { overflow-x: clip }`) — verified no horizontal overflow via CDP device emulation.
- [x] Hero headline now tilts to the phone's gyroscope on mobile (DeviceOrientation), alongside the desktop mouse tilt. iOS shows a one-tap "enable motion" prompt; needs HTTPS to test on a real device.
- [x] **3D upgrade:** Replaced the hero photo with a live WebGL hero scene (`HeroScene` — abstract Mies-pavilion geometry, ghost solids + glowing wireframes + blueprint particles + bloom). Added 3D scroll-depth reveals, `Card3D` hover tilt on home feature blocks and `/work` cards, and Z-lift on Practice items. 3D is `React.lazy`-split (main bundle 125 KB gz, Three.js in a separate 251 KB gz chunk), `prefers-reduced-motion` freezes to a static frame, and a WebGL-absent fallback panel is in place. Clean `vite build`.
- [ ] **Handoff / Verification:** Verify the Gyro tilt effect on a physical phone over the deployed HTTPS Vercel URL. (iOS requires tapping the "enable motion" pill). Agent to confirm the page/pill render via browser before user tests on phone.
- [x] **3D visual verification:** Open the running site in a real browser and confirm the hero 3D scene renders with a transparent background (bloom over `alpha:true` canvas), tilts to the mouse, stacks correctly on mobile, and that reduced-motion shows a static frame. Then deploy.
- [x] **Fixed invisible scroll-3D:** the pinned-hero scroll camera wasn't showing because `body { overflow-x: hidden }` broke `position: sticky` (it forces `overflow-y: auto`). Changed to `overflow-x: clip` and made the camera progress hero-relative. Verified via CDP — scene pins and camera orbits/rises with scroll. **Redeploy still pending** to push this fix to the live site.

---
*Note for AI Agents: Please update the "Active Tasks" and "Project Overview" sections as the project evolves.*
