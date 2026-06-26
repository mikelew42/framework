# WebEditor 1

**Status: ✅ fully implemented.**

Live at: `http://localhost/framework/ext/WebEditor/1/`
Demo (pre-built layout): `http://localhost/framework/ext/WebEditor/demo/`

---

## Files

```
ext/WebEditor/1/
  WebTree1.js    ← extends WebTree0; 6 new factories, duplicate(), wrap_in_frame()
  Canvas1.js     ← extends Canvas0; all 7 kinds, inline edit, zoom bar, context menu, grid
  Sidebar1.js    ← new View; Elements/Layers tabs, 7 elements in 3 sections
  Layers1.js     ← new View; tree-view with collapse, auto-expand, scroll-to-selected
  Props1.js      ← extends Props0; breadcrumb, align/justify, font, bg-none, image upload
  WebEditor1.js  ← extends WebEditor0; delete/dup/wrap toolbar, shortcuts, auto-save
  page.js        ← browser entry; loads Geist font, hides chrome
  save.json      ← empty starting tree; auto-created on first save
  readme.md      ← this file
```

---

## What's in v1

### New vs v0

| Feature | v0 | v1 |
|---------|----|----|
| Element types | Frame, Text | + Heading, Image, Button, Input, Divider, Columns preset |
| Inline text editing | ✗ | ✅ double-click on canvas |
| Layers panel | ✗ | ✅ second sidebar tab with collapse/expand |
| Delete node | ✗ | ✅ toolbar button + Backspace/Delete |
| Duplicate | ✗ | ✅ Ctrl+D |
| Wrap in Frame | ✗ | ✅ Ctrl+G |
| Keyboard navigation | ✗ | ✅ arrow keys traverse tree |
| Undo/Redo | buttons only | + Ctrl+Z/Y/Shift+Z |
| Auto-save | ✗ | ✅ 1.5s debounce + status indicator |
| Right-click menu | ✗ | ✅ context menu (duplicate/wrap/delete) |
| Canvas zoom | ✗ | ✅ zoom bar + Ctrl+=/-/0 |
| Canvas grid | ✗ | ✅ dot-pattern toggle |
| Props: Align | ✗ | ✅ align-items + justify-content for frames |
| Props: Effects | ✗ | ✅ shadow, overflow, border (frames) |
| Props: Breadcrumb | ✗ | ✅ clickable ancestor path |
| Props: Font family | ✗ | ✅ Default/Sans/Serif/Mono/Georgia/Arial |
| Props: Typography | ✗ | ✅ leading (line-height) + tracking (letter-spacing) |
| Props: BG transparency | confusing | ✅ "None" button + dimmed picker |
| Image upload | ✗ | ✅ base64 via FileReader |

### Keyboard shortcuts

| Shortcut         | Action                  |
|------------------|-------------------------|
| `Ctrl+Z`         | Undo                    |
| `Ctrl+Shift+Z`   | Redo                    |
| `Ctrl+Y`         | Redo (alternate)        |
| `Ctrl+S`         | Save                    |
| `Ctrl+D`         | Duplicate selected      |
| `Ctrl+G`         | Wrap selected in Frame  |
| `Del`/`Bksp`     | Delete selected         |
| `↑`              | Select parent           |
| `↓`              | Select first child      |
| `←`/`→`         | Prev/next sibling       |
| `Ctrl+=`         | Zoom in                 |
| `Ctrl+−`         | Zoom out                |
| `Ctrl+0`         | Reset zoom              |
| dbl-click        | Inline edit text        |
| right-click      | Context menu            |

---

## WebTree1 API

```js
// New static factories (extend WebTree0):
WebTree1.new_heading(extra?)   // { kind:'heading', level:1, text:'Heading', size:32, ... }
WebTree1.new_button(extra?)    // { kind:'button', text:'Button', variant:'primary', radius:8, ... }
WebTree1.new_image(extra?)     // { kind:'image', fit:'cover', src:null, ... }
WebTree1.new_divider(extra?)   // { kind:'divider', color:'#ececea', h:{mode:'fixed',px:1}, ... }
WebTree1.new_input(extra?)     // { kind:'input', placeholder:'Enter text…', input_type:'text', ... }
WebTree1.new_columns(extra?)   // row frame with 2 fill-width child frames

// New instance methods:
tree.duplicate(id)             // clone + re-UID all nodes + insert after original → returns clone
tree.wrap_in_frame(id)         // create wrapper frame at same position + move node inside → returns frame
```

---

## Known issues

1. **Color picker closes on pick** — props panel does `innerHTML = ''` on every
   `tree.on('change')`, destroying the active native color picker. The user must
   re-open after each color change. Fix in v2: debounce re-renders or do granular
   DOM updates.

2. **Zoom bar scrolls away** — `.we-zoom-bar` is `position: absolute` inside
   `.canvas-wrap` (`overflow: auto`). When canvas content exceeds viewport, the bar
   scrolls off-screen. Fix in v2: separate the zoom bar into a non-scrolling overlay.

3. **Layers1 re-renders when hidden** — `tree.on('change')` fires even when the Layers
   tab isn't visible. Add a dirty flag that defers render until the tab is activated.

4. **`node_css` defined twice** — Canvas0 and Canvas1 each define their own copy.
   Planned: `WebEditor/util.js` shared module.

5. **`WebEditor1.constructor()` teardown** — calls `super()` (builds full v0 UI), then
   clears and rebuilds. Wasteful but correct. v2 should use factory methods or DI.

6. **BG color picker default** — when `bg: 'transparent'`, the color picker shows
   `#ffffff`. Picking a color requires two interactions (first 'input' event re-renders,
   closing the picker; user must re-open). Known quirk.

---

## Open questions / directions for v2

- **Multi-select**: `Ctrl+click` to add to selection, `selected_ids: string[]` replacing
  `selected: string | null`. All v1 code compat via `selected = selected_ids[0] ?? null`.
- **Copy/paste**: `Ctrl+C` clones to `window.__we_clipboard`, `Ctrl+V` inserts as sibling.
- **Layers DnD**: drag rows in layers panel → `tree.move()`. Much easier to reorder deep
  nodes than dragging on canvas.
- **Per-side padding**: `pad_top/right/bottom/left` replacing uniform `pad`. Props panel
  shows compact T/R/B/L inputs.
- **Color picker debounce**: 100ms delay on props re-render when color is changing, so
  the native picker stays open.
- **Asset files for images**: base64 in JSON works for demos but gets large. v3 could
  upload files to the local filesystem and store paths.
