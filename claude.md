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
- **Blender MCP Server Setup:** The user wants to integrate a 3D workflow for generating architectural scenes. Please assist them in setting up the `ahujasid/blender-mcp` server. 
  - **Repository Link:** https://github.com/ahujasid/blender-mcp
  - **Task:** Help the user install the Blender Addon and configure the python-based MCP server in our environment.
