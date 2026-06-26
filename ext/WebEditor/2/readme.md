# WebEditor 2 — Planning

**Status: 📐 planned**

v2 focuses on multi-select, copy/paste, and interaction polish.

> **Note:** Several features originally planned for v2 were shipped in v1:
> - Image upload ✅ shipped in v1
> - Canvas zoom + zoom bar ✅ shipped in v1
> - Right-click context menu ✅ shipped in v1
> - Wrap in Frame (Ctrl+G) ✅ shipped in v1
> - Canvas grid toggle ✅ shipped in v1
>
> v2 picks up from where v1 left off. The biggest remaining gap is **multi-select**,
> which requires a data model change.

---

## Theme: Multi-select and fluid interaction

v1 is complete and functional. v2 is about interactions that don't work with a single
selection: selecting multiple nodes, copy/paste, distributing/aligning, and Layers DnD.

---

## Feature list

### Multi-select
- Shift+click in the layers panel or canvas adds/removes from selection
- Selection is an array (`data.selected_ids: string[]`) replacing the current single
  `data.selected: string | null`
- Canvas outlines all selected nodes (purple)
- Toolbar: delete and duplicate operate on all selected nodes
- Props panel: shows shared properties across selection; mixed values show `—`

### Copy / Paste
- `Ctrl+C` copies the selected node(s) as JSON into `window.__we_clipboard`
- `Ctrl+V` inserts the copied node(s) as siblings of the current selection (or children
  of root if nothing is selected)
- Pasted nodes get fresh UIDs
- Cross-tab paste could use `navigator.clipboard` (JSON string), but start with
  in-memory for simplicity

### Layers panel DnD
- Drag rows in the layers panel to reorder nodes
- Target indicator shows the insertion point between rows
- Delegates to `tree.move()` on drop

### Canvas zoom + pan
- `Ctrl++` / `Ctrl+-` to zoom in/out (10% steps)
- `Ctrl+0` to reset zoom
- Zoom slider in the header
- The `.canvas-inner` wrapper gets `transform: scale(zoom)` with `transform-origin: top left`
- Pan: hold Space + drag, or middle-mouse drag
- Zoom state is local to the session (not persisted)

### Align tools (toolbar)
When multiple nodes (with a common parent) are selected:
- Align left / center / right — adjusts `w.mode` and offsets
- Align top / middle / bottom — adjusts `h.mode`
- Distribute horizontally / vertically — sets gap to even distribution

### Per-side padding
- Frame nodes get `pad_top`, `pad_right`, `pad_bottom`, `pad_left` (px values)
  replacing the uniform `pad`
- Props panel shows a compact 4-field grid (T / R / B / L)
- `node_css` generates `padding: ${pad_top}px ${pad_right}px ${pad_bottom}px ${pad_left}px`
- Migration: if only `pad` is set, treat as shorthand for all four

### Canvas zoom positioning fix ✅ partly done
- The zoom bar is positioned `absolute` inside `.canvas-wrap` (which is `overflow: auto`)
- When the canvas content is larger than viewport, the zoom bar scrolls away
- Fix: introduce a `.canvas-outer` wrapper (`position: relative`, no overflow) that
  contains both `.canvas-wrap` (scrollable) and `.we-zoom-bar` (overlay)
- Canvas0's `this._wrap` should point at the scrollable inner element, not the outer

---

## Architecture notes

### Multi-select: data model change

Currently `data.selected: string | null` (single id). v2 changes this to:
```
data.selected_ids: string[]   // empty = nothing selected
data.selected: string | null  // kept for compat: first of selected_ids or null
```

All v1 code that reads `data.selected` continues to work. v2 code reads `selected_ids`.
`WebTree2.select(id)` sets `selected_ids = [id]` and `selected = id` for compat.
`WebTree2.select_toggle(id)` adds/removes from `selected_ids`.

### ContextMenu view

`ContextMenu` is a standalone `View` that:
1. Renders as a floating `position: fixed` div with z-index: 1000
2. Appends itself to `document.body` when shown
3. Removes itself on `click` outside or `Escape`
4. Receives an array of `{ label, icon, action }` items

This is general enough to be extracted to `framework/ui/ContextMenu/` for use by
other parts of the app.

### Zoom implementation

The `.canvas-inner` div gets CSS `transform: scale(${zoom})`. The `.canvas-wrap` must
have `overflow: auto` and scroll to accommodate the zoomed content. The transform origin
should stay at `top left` (default) so that zooming in keeps the top-left of the canvas
fixed.

Challenge: the drop indicator positioning in `_show_indicator` uses
`getBoundingClientRect()` which returns viewport coordinates, not canvas-space coordinates.
The zoom transform means rect values are already in viewport coordinates, which is what we
want for the indicator — so this may just work.

---

## File layout

```
ext/WebEditor/2/
  WebEditor2.js    ← extends WebEditor1; multi-select toolbar, zoom controls, context menu
  WebTree2.js      ← extends WebTree1; selected_ids, select_toggle, wrap_in_frame
  Canvas2.js       ← extends Canvas1; multi-select outlines, rubber-band select, zoom
  Sidebar2.js      ← extends Sidebar1; DnD reorder in layers panel
  Props2.js        ← extends Props1; multi-select props (mixed values), per-side padding
  ContextMenu.js   ← new standalone View: right-click context menu
  page.js
  readme.md
```

---

## Open questions

- **Rubber-band select**: click-drag on the canvas background to select all nodes in a
  rect. Requires hit-testing node positions (another use of getBoundingClientRect).
  Worth the complexity? Shift+click in layers is likely sufficient for v2.
- **Undo granularity**: Ctrl+Z currently undoes one tree change at a time. For multi-node
  operations (delete 5 selected), should that be one undo step? Item9's checkpoint()
  makes it easy to batch.
- **Clipboard format**: should `Ctrl+C` write JSON to the system clipboard
  (`navigator.clipboard.writeText`)? This enables cross-tab paste but requires async
  handling in the paste path. Start simple (in-memory), upgrade later.
- **Zoom persistence**: should the zoom level be saved to the file? Probably not — it's
  a viewport preference, not document state. Store in `sessionStorage` if needed.
