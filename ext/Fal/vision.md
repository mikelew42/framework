# Vision: fal.ai Image Workspace

## Status (2026-06-27)

Foundation working:
- MCP installed (`fal-ai` server at `https://mcp.fal.ai/mcp`)
- `@fal-ai/client` installed; `gen.mjs` CLI generates + saves images
- First model: `xai/grok-imagine-image` — ~$0.02, ~6s, clean aesthetic quality
- `Fal0` workspace browses `gen/` — thumbnail grid, full viewer, sidecar metadata
- `models.json` established as the knowledge base for model params/pricing/tips

**Note on model choice:** The fal.ai website has a good-enough generation UI.
Our value-add is the tree/workspace/lineage layer the vision describes below —
not recreating the raw generation form. Keep that in mind when building Fal1+.

---

## The Problem with Existing Tools

Most AI image tools expose the API as the UX. 100 models × 20 parameters each = an interface that requires you to be an engineer just to make a picture. You lose your prompt when you navigate. Generations are orphaned from their context. There's no lineage — you can't tell what came from what.

## The Core Idea

A **prompt-centric generation workspace** where:

- The prompt is a persistent, first-class object — not a text box that clears
- Every output is a node in a tree, anchored to its origin
- Task-oriented actions (Dissect, Heal, Vary, Style) hide the API complexity
- Claude Code writes the automation tools once; the tools run without Claude after that

---

## The Prompt

The prompt is the most important object in the workspace. It behaves like a persistent document:

- **It never disappears on navigation.** If you switch to a different image node, your in-progress prompt comes with you — it floats at the workspace level, not tied to any specific image yet.
- **It persists across page reloads** via localStorage.
- **It can be directed.** Once you decide where a prompt is going (which node it applies to, which action it triggers), you attach it. But you can write the prompt first and figure out the destination later.
- **Each image node also has its own pending prompt.** When you navigate to a node, if that node has a pending prompt saved, it surfaces — but doesn't overwrite what you were already writing. The UI makes it clear which is which: "workspace prompt" vs "node prompt."
- **Images can be attached to prompts**, but the mechanism varies by task — a style reference works differently than an inpainting mask, which works differently than a composition reference. The prompt UI adapts to the active task type.

---

## The Generation Tree

Every generation exists in a tree rooted on a source — an uploaded image, a text prompt, or an imported result.

```
[source: product photo]
  ├── [vary: studio lighting]
  │     ├── [vary: warmer tone]
  │     └── [vary: cooler tone]
  ├── [dissect]
  │     ├── [object: background → transparent PNG]
  │     ├── [object: product → transparent PNG]
  │     └── [object: shadow → transparent PNG]
  └── [heal: remove background]
        └── [vary: new background, outdoor]
```

- Selecting a node **does not affect the prompt**. Selection and prompting are independent.
- A node carries its full generation record: model, params, seed, request_id, cost, timestamp. Enough to replay it exactly or use it as a starting point.
- 1000 variants of a node are still all findable — they're children of the node you varied, not loose images in a flat list.

---

## Task-Oriented Actions, Not Parameter-Oriented

Instead of exposing API surface, the workspace offers named actions. Each action has a fixed, well-tuned parameter set underneath — determined through experimentation, then baked in.

| Action | What it does | Visible controls |
|---|---|---|
| **Vary** | Generate variations with same or modified prompt | Prompt, strength slider |
| **Dissect** | Segment image into per-object transparent PNGs | Object name hints (optional) |
| **Heal** | Remove named object, fill background | Object to remove |
| **Inpaint** | Paint a mask, replace masked area | Brush tool, prompt |
| **Style** | Apply a style reference or LoRA | Style picker |
| **Upscale** | Increase resolution | Scale factor |
| **Extend** | Outpaint in a direction | Direction, prompt |

The complex parameters (guidance_scale, steps, scheduler, mask blur, etc.) are hidden behind each action. Power users can expand an "Advanced" panel per action. But the default path has no exposed API knobs.

---

## The Automation Layer

The workspace is the front end. Behind it, a set of standalone Node.js CLI tools call fal's REST API directly — no Claude, no MCP at runtime.

Every action taken in the UI (or by Claude Code during prototyping) is logged as a replayable record. The log entry contains everything needed to re-run the operation from the command line. This means:

- Batch jobs run as `node tools/dissect.js ./photos/ --all`
- A watcher can auto-trigger tasks when files land in a folder
- Nothing is locked inside a chat session

Claude Code's role is to **write these tools** through experimentation and conversation, then step aside.

---

## Style Sets / LoRA

A style set is a named collection of reference images + a trained LoRA, attached to any node or prompt. Once trained, it's a first-class object in the workspace — pick it from a style picker, not from a file path field. Creating a style set is a guided workflow (pick images → name it → train → done), not a parameter form.

---

## What This Is Not

- Not a Photoshop replacement (no pixel-level editing)
- Not a model management tool (fal handles that)
- Not a chat interface (Claude Code is for setup, not runtime)
- Not a prompt database (though the log serves that function incidentally)