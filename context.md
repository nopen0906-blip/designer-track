# Project Context

This file provides the global context and current state of the repository for AI agents.

## Project Overview
- **Name:** Website (Designer Tract)
- **Framework/Tech Stack:** React (Vite) + `react-router-dom` (routes: `/` Home, `/work` full portfolio). `framer-motion` powers the motion layer: 3D hero text (`InteractiveText`), scroll-parallax images (`ParallaxImage`), magnetic CTAs (`MagneticButton`), count-up stats (`CountUp`).
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

---
*Note for AI Agents: Please update the "Active Tasks" and "Project Overview" sections as the project evolves.*
