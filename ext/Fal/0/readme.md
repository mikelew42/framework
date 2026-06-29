# Fal/0 — Image Workspace MVP

Minimal gen-browser workspace. Connects to the fal.ai API via `gen.mjs` CLI,
writes images to `gen/`, and displays them in a Workspace0-based UI.

---

## What's Here

| File | Purpose |
|------|---------|
| `Fal0.js` | Workspace0 subclass — gen browser, viewer, info panel |
| `Fal0.css` | Workspace-specific styles |
| `page.js` | Entry point: mounts Fal0 into app root |
| `gen.mjs` | Node CLI: `node gen.mjs "your prompt"` — generates + saves |
| `gen/` | Output directory: `.jpg` + `.json` sidecar per generation |

---

## How It Works

1. `gen.mjs` calls `xai/grok-imagine-image` via `@fal-ai/client`, downloads the image,
   saves `gen/TIMESTAMP_ID.jpg` and a sidecar `gen/TIMESTAMP_ID.json` with full metadata.
2. `page.js` loads `Fal0`, which fetches `/directory.json` and filters for `gen/` images.
3. Left panel: thumbnail grid (newest first).
4. Center panel: large selected image.
5. Right panel: prompt, generation details, model tips from `../models.json`.

---

## Running

```bash
# Generate an image (requires FAL_KEY in env)
node public/framework/ext/Fal/0/gen.mjs "a red apple on a white table"

# Browse in the UI
# Start the server, navigate to /framework/ext/Fal/0/
```

---

## Fal0 Class

Extends `Workspace0`. All panel setup happens in `initialize()` (the correct
post-construction hook), not the constructor. `load_data()` is async and fires
after the workspace is rendered — panels update reactively when data arrives.

```
Fal0 extends Workspace0
  Left  panel (fixed 13em) — .fal-grid  → thumbnails
  Center panel (fill)       — .fal-viewer → selected image
  Right panel (fixed 17em) — prompt + details + model tips
```

---

## Sidecar JSON Schema

Every generated image has a paired `.json`:

```json
{
  "model":      "xai/grok-imagine-image",
  "input":      { "prompt": "...", "num_images": 1, "aspect_ratio": "1:1",
                  "resolution": "1k", "output_format": "jpeg" },
  "request_id": "...",
  "image_url":  "https://...",
  "duration_ms": 6345,
  "timestamp":  "2026-06-27T21:32:52.281Z",
  "filename":   "2026-06-27T21-32-52_230ba566.jpg"
}
```

---

## Confirmed Working (2026-06-27)

- `xai/grok-imagine-image` → ~6s, ~$0.02/image, 1k JPEG
- `@fal-ai/client` installed at project root, uses `fal.subscribe()`
- MCP installed (`claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp`)
  — MCP tools load on next session restart

---

## Next Steps

- Wire a prompt bar to actually submit from the UI
- Add a refresh button (reload directory.json)
- Add generation count + total cost in the header
- Consider polling directory.json on interval for live updates
- Add keyboard navigation (arrow keys for next/prev image)
- Wire Vary / Dissect / Heal actions on selected image
- Build `Fal1.js` with Item/List backing for persistent selection state
