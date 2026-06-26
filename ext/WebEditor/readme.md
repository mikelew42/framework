# WebEditor

A visual layout editor for the frozen-helix framework. Three-panel UI: sidebar (left),
canvas (center), properties (right). Figma-style sizing (hug / fill / fixed).
File-backed persistence via `FileSaver` + WebSocket RPC.

---

## Status

| Version | Status  | URL                                    | Save file              |
|---------|---------|----------------------------------------|------------------------|
| **0**   | ✅ done  | `/framework/ext/WebEditor/0/`          | `WebEditor/0/save.json`|
| **1**   | ✅ done  | `/framework/ext/WebEditor/1/`          | `WebEditor/1/save.json`|
| **demo**| ✅ done  | `/framework/ext/WebEditor/demo/`       | `WebEditor/demo/demo.json` |
| **2**   | 📐 planned | —                                  | —                      |

---

## What v1 implements

All 7 element types, inline text editing, keyboard shortcuts, layers panel, zoom, context
menu, image upload, font picker, auto-save with status indicator.

### Element types

| Kind      | Canvas renders as           | Notable props                                  |
|-----------|-----------------------------|------------------------------------------------|
| `frame`   | flex div (row or col)       | gap, pad, bg, radius, shadow, border, overflow, align_items, justify_content |
| `heading` | `<h1>`/`<h2>`/`<h3>`      | level, text, size, weight, color, font, line_height, letter_spacing |
| `text`    | `<span>`                    | text, size, weight, color, font, line_height, letter_spacing |
| `image`   | `<img>` or placeholder div  | src (base64), fit (cover/contain), radius      |
| `button`  | `<button>`                  | text, variant (primary/secondary/ghost), radius|
| `input`   | styled `<div>` (read-only)  | placeholder, input_type, radius                |
| `divider` | thin `<div>`                | color, height (px)                             |
| `columns` | 2-child row frame (preset)  | same as frame                                  |

### Keyboard shortcuts

| Key              | Action                    |
|------------------|---------------------------|
| `Ctrl+Z`         | Undo                      |
| `Ctrl+Shift+Z`   | Redo                      |
| `Ctrl+Y`         | Redo (alternate)          |
| `Ctrl+S`         | Save                      |
| `Ctrl+D`         | Duplicate selected        |
| `Ctrl+G`         | Wrap selected in Frame    |
| `Del` / `Bksp`  | Delete selected           |
| `↑`             | Select parent             |
| `↓`             | Select first child        |
| `←` / `→`      | Select prev / next sibling|
| `Ctrl+=`         | Zoom in                   |
| `Ctrl+−`         | Zoom out                  |
| `Ctrl+0`         | Reset zoom                |
| dbl-click        | Inline edit text node     |
| right-click      | Context menu              |

### Canvas features

- **Zoom bar** (bottom-right): 11 steps 25%–400%, click % to reset, `Ctrl+=/-/0`
- **Grid toggle**: "Grid" button in zoom bar shows 20px dot pattern for alignment
- **Drop indicator**: blue line shows where dragged node will land
- **Inline editing**: double-click text/heading/button → `contenteditable`; Enter saves, Escape reverts
- **Context menu**: right-click any node → Duplicate, Wrap in Frame, Delete

### Props panel

- **Breadcrumb** at top showing ancestor path — click to navigate up
- **Label**: rename node in the tree
- **Size**: W and H each have Hug / Fill / Fixed toggle + px input
- **Layout** (frame): direction (row/col), gap, padding
- **Align** (frame): align-items + justify-content toggles
- **Style** (frame/image): BG color picker with **None** button (transparent), radius
- **Effects** (frame): shadow toggle, overflow (clip/show), border width + color
- **Heading**: H1/H2/H3 level picker, text area, size, weight, color
- **Text**: text area, size, weight, color (inherited from Props0)
- **Font** (text+heading): family select — Default, Sans-serif, Serif, Monospace, Georgia, Arial
- **Typography** (text+heading): leading (line-height), tracking (letter-spacing em)
- **Image**: Upload / Replace / Clear + fit toggle (Cover/Contain)
- **Button**: text label, variant (Primary/Secondary/Ghost), radius
- **Input**: placeholder text, type (text/email/number/password), radius
- **Divider**: color picker, thickness (px)

---

## Architecture

### The tree is a plain recursive JS object

`WebTree0` extends `Item9`. Its `data.tree` is a single recursive object — NOT a List of
Items. Serialization is trivial: `FileSaver` writes `JSON.stringify(item.data)`. No custom
deserialization needed.

### WebNode shape (plain object, never a class instance)

```js
{
  id: 'n1x2y3',           // unique string; root always 'root'
  kind: 'frame' | 'text' | 'heading' | 'button' | 'image' | 'divider' | 'input',
  label: 'My Frame',      // shown in Layers panel + Props breadcrumb

  // sizing (all nodes):
  w: { mode: 'fill' | 'hug' | 'fixed', px?: 200 },
  h: { mode: 'hug'  | 'fill' | 'fixed', px?: 100 },

  // frame-only:
  dir: 'row' | 'col',
  gap: 16, pad: 16,
  bg: '#ffffff' | 'transparent',
  radius: 0,
  shadow: false,
  border_width: 0, border_color: '#d0d0ce',
  align_items: 'flex-start',
  justify_content: 'flex-start',
  overflow: 'visible',
  children: [ ...WebNode ],

  // text / heading:
  text: 'Hello',
  size: 16, weight: 400, color: '#1b1b19',
  font: 'inherit' | 'sans-serif' | 'serif' | 'monospace' | ...,
  line_height: 1.4,
  letter_spacing: 0,      // em units

  // heading-only:
  level: 1 | 2 | 3,

  // button-only:
  variant: 'primary' | 'secondary' | 'ghost',

  // image-only:
  fit: 'cover' | 'contain',
  src: null | 'data:image/...',   // base64 DataURL

  // input-only:
  placeholder: 'Enter text…',
  input_type: 'text' | 'email' | 'number' | 'password',

  // divider-only:
  color: '#ececea',
}
```

### Sizing model → CSS

| mode    | CSS                                       |
|---------|-------------------------------------------|
| `hug`   | `width: max-content` / `height: auto`    |
| `fill`  | `flex: 1; align-self: stretch`           |
| `fixed` | `width: {px}px` / `height: {px}px`      |

### Persistence

Save file is next to the class: `WebEditor/N/save.json`. `FileSaver` fetches it via HTTP
(404 → empty start). Saves via WebSocket RPC. `Item9.save()` calls `checkpoint()` first,
so undo/redo persists across the save boundary.

### Class map

| File                   | Version | Role                                           |
|------------------------|---------|------------------------------------------------|
| `0/WebTree0.js`        | 0       | Item9 subclass, static helpers, 2 factories    |
| `1/WebTree1.js`        | 1       | +6 factories, +duplicate(), +wrap_in_frame()   |
| `0/Canvas0.js`         | 0       | Renders tree, HTML5 DnD                        |
| `1/Canvas1.js`         | 1       | All 7 kinds, inline edit, zoom, context menu   |
| `0/Sidebar0.js`        | 0       | Draggable library (Frame, Text)                |
| `1/Sidebar1.js`        | 1       | Elements/Layers tabs, 7 elements in 3 sections |
| `1/Layers1.js`         | 1       | Tree-view panel, expand/collapse, auto-scroll  |
| `0/Props0.js`          | 0       | Base props panel, 4 sections                   |
| `1/Props1.js`          | 1       | All 7 kinds + font + bg-none + upload          |
| `0/WebEditor0.js`      | 0       | Root: tree + panels + undo/redo                |
| `1/WebEditor1.js`      | 1       | +delete/dup/wrap toolbar, shortcuts, autosave  |
| `demo/page.js`         | —       | Demo entry: loads demo.json content            |
| `demo/demo.json`       | —       | Pre-built 6-section layout for demo            |

---

## Known issues / technical debt

1. **`node_css` duplication**: Canvas0 and Canvas1 each define their own `node_css` /
   `size_css` helpers. Extract to `WebEditor/util.js` in v2.

2. **Color picker closes on pick**: Props panel re-renders on every `tree.on('change')`,
   which destroys the active color picker mid-selection. Fix in v2: debounce the render
   or do granular DOM updates instead of `innerHTML = ''`.

3. **Zoom bar position under scroll**: The `.we-zoom-bar` is `position: absolute` inside
   `.canvas-wrap` (which is `overflow: auto`). When the canvas content is larger than the
   viewport and the user scrolls, the zoom bar scrolls away. Fix: restructure canvas DOM
   to have a non-scrolling overlay container.

4. **WebEditor1 super() teardown**: `WebEditor1.constructor()` calls `super()` (which
   builds the full v0 UI), then tears it down and rebuilds. Wasteful but correct. Fix in
   v2 with a factory-method pattern or proper dependency injection.

5. **BG color picker UX**: When a frame has `bg: 'transparent'`, the "None" button is
   active and the picker shows `#ffffff`. Opening the picker and dragging immediately
   shows the color. Closing the picker commits the hex. The first interaction requires
   two clicks (the picker re-renders after the first 'input' event). Known quirk.

6. **Layers1 re-renders when hidden**: Layers1 listens to `tree.on('change')` even when
   its tab is not active in Sidebar1. Minor perf waste; add a dirty flag + lazy render.

---

## Decisions made

- **Recursive tree object** (not flat Map) — simple serialization, easy to traverse. Fine
  for typical page trees. Revisit if trees grow to 1000+ nodes.
- **HTML5 DnD** for insert and reorder. DataTransfer carries `web-editor-kind` and
  `web-editor-id`. No external DnD library.
- **`window.__we_editor`** exposed in WebEditor constructor for debug/test console access.
- **Context menu via event delegation** on `.canvas-wrap`, not per-node listeners.
- **Image as base64 DataURL** in save.json. Fine for prototypes; v3 should extract to
  asset files and store paths.
- **Input nodes rendered as `<div>`** on the canvas (not `<input readOnly>`) to avoid
  native focus/cursor behavior on click.

---

## Potential next steps (v2+)

See `2/readme.md` for full v2 plan. Top priorities:

1. **Multi-select** (`Ctrl+click`, shift-click in layers) — requires `selected_ids: []`
   replacing `selected: null`, all v1 code stays compat via `selected = selected_ids[0]`
2. **Copy/paste** (`Ctrl+C/V`) — clone + re-UID + insert as sibling
3. **Layers DnD** — drag rows in layers panel to reorder (delegates to `tree.move()`)
4. **Per-side padding** — replace uniform `pad` with `pad_top/right/bottom/left`
5. **Canvas zoom positioning fix** — restructure DOM so zoom bar sticks to viewport edge
6. **Color picker debounce** — 100ms debounce on props re-render to keep picker open
7. **`util.js`** — shared `node_css` / `size_css` helpers used by both Canvas levels
8. **Component library** — save selection to library, drag from library onto canvas
