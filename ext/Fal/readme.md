# ext/Fal — fal.ai Image Generation

fal.ai integration for AI image generation, segmentation, healing, and video.
Connects to fal's serverless GPU API; outputs land in `gen/` as `.jpg` + `.json` sidecars.

---

## ⚠️ Living Knowledge Rule

**Whenever you use a fal model in this project, document what you learned:**
- Add or update the model entry in `models.json` (params, costs, tips, gotchas).
- Keep `models.json` as the single source of truth for model knowledge —
  the UI reads it; future sessions read it; treat it like a changelog.
- Cost per run, average duration, quirks, dos and don'ts all belong there.

---

## Setup (one-time)

### 1. API key (permanent, Windows)
```powershell
[System.Environment]::SetEnvironmentVariable("FAL_KEY", "YOUR_KEY_HERE", "User")
```
Open a new terminal after setting. Key is now in `$env:FAL_KEY` everywhere.

### 2. MCP (Claude Code integration)
```bash
claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp --header "Authorization: Bearer $FAL_KEY"
```
MCP tools become available on next session start. Tools: `search_models`,
`get_model_schema`, `recommend_model`, `run_model`, `submit_job`, `check_job`,
`get_pricing`, `search_docs`, `upload_file`.

> **Use `submit_job` not `run_model`** for anything slow — `run_model` is synchronous
> and blocks the Claude session until complete.

### 3. JS client (for Node scripts)
```bash
npm install @fal-ai/client
```

---

## models.json

`Fal/models.json` is the model knowledge base. It stores:
- `endpoint` — the exact fal model ID to pass to `fal.subscribe()`
- `cost_per_image_usd` (or `cost_per_req_usd`, `cost_per_second_usd`)
- `params` — full input schema with types, defaults, allowed values
- `tips` — what works well, workflow notes
- `dont` — known gotchas

**Always check costs before calling a new model.** Use `get_pricing` via the MCP
or look up in `models.json`. Most models cost pennies per run, but video and
training can be significantly more.

### Currently documented models

| Model ID | Task | Cost |
|----------|------|------|
| `xai/grok-imagine-image` | Text → image | ~$0.02/img |
| `fal-ai/flux/schnell` | Text → image (fast/cheap) | ~$0.003/img |
| `fal-ai/sam2/auto-segment` | Auto-segment all objects | $0.005/req |
| `xai/grok-imagine-video/image-to-video` | Image → video | $0.05–0.07/s |

---

## File Layout

```
ext/Fal/
  readme.md          ← this file — setup, conventions, model index
  models.json        ← model params, pricing, tips (single source of truth)
  vision.md          ← long-term product vision
  0/
    Fal0.js          ← Workspace0 subclass: gen browser UI
    Fal0.css
    page.js          ← mounts Fal0 workspace
    gen.mjs          ← Node CLI: generate + save images
    gen/             ← output: .jpg + .json sidecar per image
    readme.md        ← MVP doc: what's built, how it works, next steps
```

---

## Generating Images

```bash
node public/framework/ext/Fal/0/gen.mjs "your prompt here"
```

Output: `gen/TIMESTAMP_ID.jpg` + `gen/TIMESTAMP_ID.json` sidecar.
The sidecar stores full generation metadata (model, params, request_id, duration, cost).

---

## Confirmed Working (2026-06-27)

- MCP installed pointing to `https://mcp.fal.ai/mcp`
- `@fal-ai/client` installed at project root
- First test image: `xai/grok-imagine-image`, ~6.3s, $0.02, 277KB JPEG
- Gen browser UI (`Fal0` extends `Workspace0`) rendering in browser
- `directory.json` + sidecar pattern works for lazy metadata loading

---

## Architecture Notes

- **`gen.mjs`** is a standalone CLI — no Claude, no MCP at runtime
- **`Fal0.js`** only browses existing `gen/`; it never calls fal directly
- Model knowledge lives in `models.json`, not hardcoded in JS
- The UI reads `models.json` to show tips alongside each image
- Future: a prompt bar in the UI to generate from the browser; for now, use the CLI

---

## Class Progression

| Version | Adds |
|---------|------|
| **0** | Gen browser: directory listing → thumbnail grid → viewer → sidecar metadata |
| **1** | Prompt bar in UI; generates from browser; Item/List backing for gen history |
| **2** | Vary / Dissect / Heal actions on selected image; tree view instead of flat grid |
| **3** | LoRA training workflow; style sets |
