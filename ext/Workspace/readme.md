# Workspace — The App Shell

The intuitive root container for any app. `app.workspace` is THE shell — one per app.
It manages named panels (left, main, right, header, footer), broadcasts selection events
for cross-component communication, and optionally persists layout state via a Session.

Think of it as the operating surface: a structured container that knows which panels are
visible, what content they carry, and how to route selections and navigation events to
the right place without components coupling to each other.

---

## Current State (v0)

`Workspace0` is a **pure UI layer** — no persistence, no routing, no session. It gives
you the captor-based panel API and flex layout. See [0/readme.md](0/readme.md) for the
full v0 API.

The v0 hierarchy:
```
Workspace0
  └── Panel0[]          ← flex columns, ordered horizontally
        └── Card0[]     ← content units within a panel
```

---

## Logical Hierarchy (v1+)

```
App
└── workspace: Workspace    ← one per app, always exists
      ├── header: Panel     ← top toolbar (optional)
      ├── left:   Panel     ← sidebar / nav (optional)
      ├── main:   Panel     ← primary content area
      ├── right:  Panel     ← properties / inspector (optional)
      ├── footer: Panel     ← status bar (optional)
      ├── session: Session  ← save/restore layout state
      └── events            ← 'select', 'navigate', 'layout_change'
```

Named panels (`workspace.left`, `workspace.main`, etc.) are the primary API.
Sub-apps add themselves to a panel: `workspace.main.push(explorer_view)`.

---

## Panel Page Stack

Each panel maintains a **page stack** — a history of views, so navigation is intuitive:

```js
workspace.main.push(new_view)     // show new page, hide current (adds to history)
workspace.main.pop()              // go back to previous view
workspace.main.replace(new_view)  // replace current (no history entry)
workspace.main.clear()            // clear all pages
```

This lets sub-apps navigate without knowing about each other. The panel manages
what's visible; sub-apps just push views onto the panel they own.

---

## Selection Broadcasting

Any selectable component in any sub-app can broadcast a selection:

```js
// Sub-app (e.g. Explorer, WebEditor, file tree):
on_click(item) {
    this.workspace.select(item);    // broadcasts 'select' to all listeners
}

// Properties panel (right sidebar) listens:
workspace.on('select', item => {
    workspace.right.replace(item.props_view);
});
```

This is the intuitive way to wire up a context-sensitive inspector panel:
nothing couples directly, everything routes through the workspace.

---

## Card Sizing Model

Cards size in **three modes** per axis independently:

| Mode    | Width                     | Height                   |
|---------|---------------------------|--------------------------|
| default | fill (flex stretch)       | hug (auto, grows)        |
| `fill`  | flex-grow: 1              | flex-grow: 1             |
| `hug`   | fit-content               | fit-content              |
| `fixed` | explicit px/em value      | explicit px/em value     |

Panel widths use the same three modes.

---

## Routing Strategy

| Concern                    | Mechanism                               |
|----------------------------|-----------------------------------------|
| App mode / page            | **HashRouter** (`#editor`, `#settings`) |
| Layout state (sizes, which panels open) | **Session** → **LocalStorageSaver** |
| Cross-device sync          | **Session** → **FileSaver**             |
| Multi-column navigation    | **Explorer** (built on Workspace)       |

---

## Captor Pattern

Creating a `Panel0` inside `workspace.capture(fn)` auto-adds it, no `.add()` needed.

```js
const ws = workspace(() => {
    panel({ title: "Sidebar", width_mode: "fixed", width: 16 }, () => {
        card({ content: navView });
    });
    panel({ title: "Main" }, () => {
        card({ height_mode: "fill", content: editorView });
    });
    panel({ title: "Inspector", width_mode: "hug" }, () => {
        card({ content: propsView });
    });
});
app.$root.append(ws.view);
```

---

## Class Progression

| Version | Status | Adds |
|---------|--------|------|
| **0** | ✅ | `Workspace0`, `Panel0`, `Card0` — captor pattern, flex layout, sizing |
| **1** | 🗂 planned | Named panels (left/main/right/header/footer), Item9 backing, LocalStorageSaver, panel page stack |
| **2** | 🗂 planned | `Row` class (explicit horizontal grouping), panel drag-to-resize, split() |
| **3** | 🗂 planned | HashRouter integration: named workspace modes, URL-addressable layouts |
| **4** | 🗂 planned | Session class, cross-device sync via FileSaver |
| **5** | 🗂 planned | Selection broadcasting, multi-app coordination |

---

## Relationship to WebApp, WebEditor, and Explorer

**WebApp** (`ext/WebApp/`) is a simpler, concrete version of the same concept —
a 3-panel shell (header + left + main + right). It was extracted from WebEditor
before Workspace existed. See the WebApp readme for its current API.

The eventual direction is for Workspace to absorb WebApp's role:
`new Workspace({ preset: '3panel' })` would replicate WebApp's layout
with the added power of page stacks, sessions, and selection broadcasting.

**WebEditor** (`ext/WebEditor/`) currently uses WebApp as its shell.
A future v3 would use Workspace directly, so the editor's panels participate
in the app-wide selection broadcasting and session system.

**Explorer** (`ext/Explorer/`) is a planned multi-column pager that lives inside
`workspace.main` and uses Workspace-compatible panel navigation. See `ext/Explorer/readme.md`.

---

## Suggested Improvements

### 1. Converge WebApp into Workspace

WebApp and Workspace solve the same problem. The duplication is confusing:
developers have to choose between them, and neither has the full feature set.

**Proposal:** Workspace v1 adopts WebApp's named-panel API as a preset:
```js
// Instead of new WebApp({ ... }), you'd do:
app.workspace = new Workspace({
    preset: 'shell',    // header + left + main + right + footer
    left_width: 260,
    right_width: 280,
});
// Then the same named-panel API works:
app.workspace.left.append(nav);
app.workspace.main.push(editor);
app.workspace.right.replace(props);
```
WebApp stays as a simpler alias for apps that don't need sessions/selection — but
internally it's a Workspace with a fixed preset.

### 2. Selection Bus as a Core Feature (v5)

Any component that renders selectable things — a file tree, a canvas, a list — needs
to broadcast selection so the right sidebar can update intuitively.

**Proposal:** `workspace.select(item)` is THE canonical way to do this:
```js
workspace.select(item);              // broadcast
workspace.on('select', item => { }); // listen
workspace.deselect();                // clear
```
The workspace is the hub; panels and sub-apps are spokes. No direct coupling required.

### 3. Session for Layout Persistence (v4)

Browser reloads, new tabs, and different devices should see the same layout state.

**Proposal:** A `Session` class backed by `Item9 + LocalStorageSaver` (local) or
`Item9 + FileSaver` (cloud sync):
```js
app.workspace.session = new Session({
    key: 'my-app',
    saver: new LocalStorageSaver(),  // or FileSaver for cross-device
});
// Panel widths, open/closed state, and active pages auto-persist.
```

### 4. Explorer Integration (see ext/Explorer/readme.md)

An `Explorer` sub-app living in `workspace.main` would give column-based navigation.
Selecting a file in Explorer column 1 → pushes details into Explorer column 2.
Selecting a file in Explorer → broadcasts via `workspace.select(item)` → right panel updates.

---

## Open Questions

- Should `workspace.main` be a Panel (page-stack model) or an Explorer (multi-column) by default?
- Should panel show/hide be animated? (CSS transitions vs. instant)
- Should `workspace.select()` support multi-select? (`workspace.select([a, b])`)?
- Where does the workspace pager/back button live — in the workspace header, or per-panel?
- When two sub-apps are both visible, which one "owns" the selection bus?
