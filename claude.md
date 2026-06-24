# Claude Instruction Manual

This file is specifically for Claude to read upon entering the workspace. 

## How to use this workspace
1. **Read `context.md`:** Understand the high-level architecture and current state.
2. **Read `memory.md`:** Review the latest changes made by Antigravity or the User to avoid duplicate work or overwriting recent progress.
3. **Follow `agentguide.md`:** Adhere to the step-by-step process for making and tracking changes.

## Communication with other agents
If you are handing off a task or want Antigravity to be aware of a specific architectural decision, leave a note here or in `memory.md`.

### Handoff Notes:
- **[2026-06-22] ACTIVE HANDOFF → Antigravity (Gemini): see `ANTIGRAVITY_PLAN.md`** (supersedes
  the older `HANDOFF.md`). Client rejected the first 3D pass + wanted a luxurious theme.
  Claude (Opus) has since: built an approved Figma mockup
  (https://www.figma.com/design/UsAZPxWtgD0DoqlyjdaIHK), implemented the **Dark Gallery Luxe**
  theme (obsidian/ivory/brass-gold — builds clean), and written a full plan for Gemini to
  (1) rebuild `HeroScene.jsx` as a **glass architectural massing**, (2) add a **cinematic
  scroll camera**, (3) build + `npx vercel --prod`. Starter code, gotchas, and acceptance
  criteria are all in `ANTIGRAVITY_PLAN.md`.
- **Blender MCP Server Setup:** ✅ **DONE [2026-06-24] (Claude/Opus).** The `ahujasid/blender-mcp` 3D workflow is fully connected: repo cloned at `C:\Users\Admin\Desktop\blender-mcp`, addon installed + enabled in Blender 5.1 (socket listening on `127.0.0.1:9876`), and the MCP server registered in `~/.claude.json` as `"blender"` (`uvx blender-mcp`, `✔ Connected`). See the [2026-06-24] entry in `memory.md` for full state + gotchas.
  - **Repository Link:** https://github.com/ahujasid/blender-mcp
  - **Note:** The `mcp__blender__*` tools only load in a Claude session started *after* the server was registered — restart the session (or use `/mcp`) if they're missing, and make sure Blender is open with "Connect to MCP server" started.

### Browser Debugging Findings [2026-06-24]:
Antigravity ran a browser subagent check on the local dev server (`http://localhost:5174/` and `http://localhost:5174/sample`).
- **Main Page (`/`)**: 
  - No console errors. 
  - Visual Layout: Since the `HeroScene` 3D structure was removed from `sections.jsx`, the right half of the hero section is completely empty. The layout isn't functionally broken, but visually there is a large, imbalanced empty space where the 3D element used to be.
- **Sample Page (`/sample`)**: 
  - No functional errors (only standard Three.js deprecation/precision warnings). 
  - Visual Layout: The `VillaHero` 3D procedural villa renders perfectly on the right side. No issues.
