# WebEditor 0 — MVP

**Status: ✅ complete and verified.**

Three-panel visual editor. Insert elements from the sidebar, select them on the canvas,
edit properties on the right, save to file.

---

## What's in this version

- `WebEditor0.js` — root class, builds the full UI, owns the tree
- `WebTree0.js` — `Item9` subclass: `data.tree` is the canvas as a recursive plain object
- `Canvas0.js` — renders the tree, HTML5 D&D drop zone, click-to-select
- `Sidebar0.js` — library of draggable elements (Frame, Text)
- `Props0.js` — properties panel: Label, Size (Hug/Fill/Fixed), Layout, Style, Text
- `page.js` — browser entry, hides Lew42 chrome, adds Geist + Material Symbols fonts
- `save.json` — auto-created on first Save; persists across page reloads

---

## What works (verified)

- Three-panel layout loads clean, matching layoutlab.html style
- Library sidebar shows Frame and Text with Google Material icons
- Inserting nodes updates the canvas reactively
- Clicking a node selects it (purple outline) and populates the properties panel
- Props panel shows: Label input, Hug/Fill/Fixed size toggles (active state highlighted),
  Layout (Dir Row/Col, Gap, Pad for frames), Style (BG color, Radius), Text section for
  text nodes
- Save button writes `save.json` via WebSocket RPC; tree persists on page reload
- `window.__we_editor` exposed for debug/test access

---

## Known bugs / gaps to fix in v1

1. **Undo button doesn't update after Save.** `Item9.save()` calls `checkpoint()` but
   doesn't emit `'change'`. `_update_undo_redo()` never fires. Fix: call it directly after
   `await tree.save()` in the save button handler in `WebEditor0.js`.

2. **D&D drop indicator positioning** uses `getBoundingClientRect()` relative to the parent
   element. Works for shallow trees; may drift on deeply nested layouts with scroll offsets.

3. **Canvas `fill` width on the root node** — `flex: 1` on root has no effect because
   `.canvas-inner` isn't a flex container. Root expands to block width naturally (fine for
   now), but explicitly setting `.canvas-inner { display: flex; flex-direction: column; }`
   would make `fill` semantics consistent at the root level.

4. **No delete or keyboard shortcuts.** Clicking a node and pressing Backspace does nothing.

5. **Props inputs don't update when a different node is selected.** The panel re-renders
   correctly via `tree.on('change')`, but if you select a node and then select another
   without triggering a tree change, the panel stays stale. Fix: `select()` should emit
   a standard `'change'` event so Props0 re-renders.

   _Actually this may already work — `WebTree0.select()` calls `this.emit('change', 'selected', ...)` which Props0 listens to. Needs manual verification._

---

## WebTree0 API reference

```js
// Static node factories
WebTree0.new_frame(extra?)  // → WebNode (kind: 'frame')
WebTree0.new_text(extra?)   // → WebNode (kind: 'text')
WebTree0.uid()              // → unique id string

// Static tree utilities
WebTree0.clone(node)             // deep clone
WebTree0.walk(node, fn, parent)  // depth-first walk
WebTree0.find(root, id)          // find by id
WebTree0.parent_of(root, id)     // find parent node

// Instance methods
tree.select(id)                  // set data.selected, emit 'change'
tree.insert(node, parent_id, i)  // insert node at index i in parent's children
tree.remove(id)                  // remove node from tree
tree.move(id, parent_id, i)      // reparent + reindex (safe: won't drop into self)
tree.update(id, patch)           // Object.assign patch onto node, then set('tree', ...)
tree.set_mode(id, dim, mode, px) // update node.w or node.h

// Inherited from Item9
tree.save()     // checkpoint() + FileSaver write
tree.undo()     // restore previous checkpoint
tree.redo()     // restore undone checkpoint
tree.can_undo   // boolean
tree.can_redo   // boolean
```
