# HANDOFF → Antigravity (Gemini): Live-site content fixes + redeploy

**From:** Claude (Opus) · **Date:** 2026-06-27
**Supersedes nothing** — this is a fresh, small task on top of current `main`.
(The older `HANDOFF.md` from 2026-06-22 and `ANTIGRAVITY_PLAN.md` stay as history.)

---

## TL;DR

The client is looking at the **live (production)** site and reported two things:

1. The contact **address** still shows the old Pune one.
2. A monospace label **`SHT. 01 — ARCHITECTURAL COMPOSITION — 3D`** near the hero
   "looks bad" — they want it **removed**.

**Critical context:** *Neither string exists in the current source anymore.* The live
deployment is **stale** (serving an older build). So the core job is **rebuild + redeploy
current `main`**, plus the one address-wording tweak Claude already committed.

---

## Item 1 — Contact address  ✅ already fixed in source

- **Live shows:** `Studio 04, Old Mill Compound, Pune, India`
- **Client wants:** `Danilimbda Circle, Kalapi Complex, Ahmedabad`
- Claude edited [`src/content.js`](src/content.js) (~line 156):

  ```js
  address: 'Danilimbda Circle, Kalapi Complex, Ahmedabad',
  ```

  Single source of truth — renders in `Contact` via
  [`src/sections.jsx`](src/sections.jsx) (`<p className="contact-addr">{contact.address}</p>`).
- **Your action:** nothing to edit; just ensure it ships in the redeploy.

## Item 2 — Remove the `SHT. 01 — Architectural Composition — 3D` caption  ✅ already gone from source

- **Live shows:** clay sheet badge `SHT. 01` + label `ARCHITECTURAL COMPOSITION — 3D` near the hero.
- This was part of the **old `HeroScene`** (documented in `HANDOFF.md` line 42:
  *"...lazy `<HeroScene>` right with a `SHT. 01 — Architectural Composition — 3D` caption..."*).
  That HeroScene was **removed** from `src/sections.jsx`.
- `grep` across `src/**/*.jsx` for `SHT` / `Composition` / `sheet` / `caption` / `Architectural`
  → **no JSX matches**. Only leftovers: a dead `.sheet` rule in
  [`src/App.css`](src/App.css) (~line 211) + doc references.
- **Your action:**
  1. Confirm the current `Hero` in `src/sections.jsx` renders no such caption (it doesn't as of now).
  2. ⚠️ **Verify [`src/components/VillaHero.jsx`](src/components/VillaHero.jsx) does NOT render the
     caption via a drei `<Html>` overlay** — Claude was interrupted before confirming this one file.
     If it does, remove that overlay. (Grep for `Html`, `sheet`, `SHT`, `Composition` in that file.)
  3. Optional: delete the unused `.sheet` rule in `src/App.css`.

---

## The real fix: redeploy (this is the actual work)

Both reported issues are already resolved in `main`; **the live site is just behind.** The git
log even has a commit titled *"force vercel redeploy and prevent caching on mobile"* — stale
caching has bitten this site before, so bust the cache.

1. `npm run build` — must be clean.
2. `npx vercel --prod` (or `git push` if auto-deploy is wired).
   - The Vercel CLI is **not installed** in Claude's environment, which is why this is handed to
     you. If yours is authed, you're the right one to deploy.
3. **Hard-refresh** the live URL + check **mobile** (caching), then verify acceptance below.

---

## Acceptance criteria

- [ ] `npm run build` passes clean.
- [ ] Production deploy is live and the client's URL actually serves it (cache busted, mobile checked).
- [ ] Live contact address reads `Danilimbda Circle, Kalapi Complex, Ahmedabad`.
- [ ] No `SHT. 01` / "Architectural Composition" caption anywhere near the hero.
- [ ] `VillaHero.jsx` confirmed free of any leftover `<Html>` caption overlay.
- [ ] Add a short changelog entry to `memory.md` noting the deploy + verification.
