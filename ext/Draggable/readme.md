# Draggable

Drag interaction primitives. This module covers every case where the user grabs something and moves it: resizing panels, scrubbing values, free-moving elements, reordering lists, and dropping cards between containers.

---

## Current state (legacy files)

The original `ext/Draggable/` files were written incrementally and have accumulated some cruft:

| File | Status | Notes |
|---|---|---|
| `Draggable.js` | superseded | Binds to `document` instead of using Pointer Capture; `drop()` / `drop_check()` are stubs |
| `Movable.js` | superseded | "Follow cursor" is just `on_move(dx,dy)` + `transform`; drop logic is half-finished |
| `Previewable.js` | experimental, half-baked | Has a `debugger` statement; the preview idea is good but needs a clean rewrite |
| `Sortable.js` | working but messy | Mixes Target registry, list ops, preview, context-menu cancel — too much in one class |
| `Rewidth.js` | superseded | Use `ext/Splitter` for panel resize; a Draggable0 subclass for single-element resize |

The new progression starts at `0/`. Old files stay for backwards compat.

---

## Progression

### `0/Draggable0.js` — Core pointer lifecycle
Pointer Capture, `start`/`move(dx,dy)`/`stop` hooks. No target system.

Use for: resize handles, scrub controls, free-move — anything that doesn't need drop zones.

### `1/Draggable1.js` — Adds target system
All of Draggable0 still works. Switches to document events so `e.target` reflects what's under the cursor. Every Draggable1 auto-registers its `view.el` as a potential drop target. The dragging item's `drop_check(target, e)` decides if a drop is valid.

See `1/readme.md` for the full design.

### `2/Draggable2.js` — Sortable (planned)
Extends Draggable1. Adds insertion-index calculation and a live DOM ghost/preview during drag. Needs a `List` reference for data ops (`list.remove` / `list.insert`). See `2/readme.md`.

---

## Key design decisions

**Every Draggable1 is automatically a target.** No separate `new Target()` step. The WeakMap lookup finds whatever Draggable1 instance is registered under the cursor. The *dragging* item's `drop_check()` then decides if that target is valid — not a type/accepts filter on the target side.

**`drop_check` not `type/accepts`.** Filtering logic lives on the dragging item. This handles all cases: "only drop on columns", "only drop if column has room", "only drop if shift held" — all just `drop_check` logic.

**Draggable0 uses Pointer Capture. Draggable1 uses document events.** Pointer Capture is cleaner for the no-target case (pointer stays tracked even off the element). Document events are necessary for target detection (`e.target` = element under cursor, as long as `pointer-events: none` is set on the dragged view during drag).

---

## Usage mental model

| I want to... | Use |
|---|---|
| Resize a panel / scrub a value | `Draggable0` — `move(dx)` hook, no drop |
| Move an element freely | `Draggable0` — `move(dx,dy)` → transform, commit in `stop` |
| Drag a card to another panel | `Draggable1` — `drop_check` + `drop` |
| Reorder a list | `Sortable` (extends Draggable1) |
| Resize a panel split | `ext/Splitter` (standalone, see its readme) |

---

## Legacy files (keep, don't delete)

`Draggable.js`, `Movable.js`, `Sortable.js`, `Previewable.js`, `Rewidth.js` — all superseded by the numbered progression but left for backwards compat.
