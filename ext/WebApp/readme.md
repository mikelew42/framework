# WebApp

A simple, intuitive three-panel app shell: header + left sidebar + main content + right sidebar.
Extracted from the WebEditor pattern into a reusable layout primitive.

Pair with `framework/ui` (controls) and `framework/ux` (tabs, accordion, etc.) to build tools quickly.

Default import (`WebApp.js`) always points to the latest stable version.

> **Note:** WebApp and `ext/Workspace` solve overlapping problems. WebApp is the simpler,
> concrete version; Workspace is the generalized, data-powered evolution. The long-term
> direction is for Workspace to absorb WebApp's role. See the Suggested Improvements section.

---

## Versions

| Version | Status | Adds |
|---------|--------|------|
| **0** | ✅ | Core shell: header, panels, btn/sep/spacer |
| **1** | ✅ | Resizable panels (Pointer Capture API), optional status bar |
| **2** | 🗂 planned | Panel persistence (localStorage), animated collapse, keyboard shortcuts — see [2/readme.md](2/readme.md) |

---

## Quick start

```js
import app from '/app.js';
import { ui, ux } from '/app.js';
import WebApp from '/framework/ext/WebApp/WebApp.js';  // always latest

app.$header.hide();
app.$sidenav.hide();

const webapp = new WebApp({
    icon:        'palette',
    title:       'My App',
    left_width:  260,
    right_width: 280,
    status_bar:  true,       // WebApp1+
});

// Left sidebar
webapp.left.append(
    ux.tabs([
        { label: 'Tools',  content: toolsView },
        { label: 'Layers', content: layersView },
    ]),
);

// Right sidebar — ui.form binds controls to an Item intuitively
webapp.right.append(
    ui.form(selected_item, [
        { key: 'color',  type: 'color',  label: 'Color' },
        { key: 'size',   type: 'scrub',  label: 'Size', min: 1, max: 200 },
        { key: 'shadow', type: 'toggle', label: 'Shadow' },
    ]),
);

// Main area
webapp.main.append(myCanvas);

// Status bar (WebApp1+)
webapp.status.add('W 600', 'width');
webapp.status.sep();
webapp.status.add('100%', 'zoom');

app.$root.append(webapp.root);
```

---

## API — WebApp0

### Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `icon` | string | null | Material Icons name for the header logo |
| `title` | string | `''` | App name in header |
| `left_width` | number | `260` | Left panel width px; 0 = hidden |
| `right_width` | number | `0` | Right panel width px; 0 = hidden |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `.root` | View | Mount into `app.$root` |
| `.header` | View | Top bar |
| `.header_right` | View | Right section of header |
| `.left` | View | Left sidebar |
| `.main` | View | Center content (position:relative) |
| `.right` | View | Right sidebar |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `.btn(icon, title, on_click?)` | HTMLButtonElement | Icon toolbar button |
| `.sep()` | View | Vertical separator |
| `.spacer()` | View | Flex spacer |
| `.heading(text)` | View | Panel section heading |
| `.panel_divider()` | View | Panel divider line |
| `.show_left()` / `.hide_left()` / `.toggle_left()` | self | Toggle left panel |
| `.show_right()` / `.hide_right()` / `.toggle_right()` | self | Toggle right panel |

---

## API — WebApp1 (extends WebApp0)

### Additional constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status_bar` | boolean | false | Add bottom status bar |
| `min_panel_w` | number | `140` | Min panel width when dragging |
| `max_panel_w` | number | `700` | Max panel width when dragging |

### Additional properties

| Property | Type | Description |
|----------|------|-------------|
| `.status` | object | Status bar controller (when `status_bar: true`) |

### Status bar methods

```js
webapp.status.add('W 600', 'width');   // add item; key is optional, used for .set()
webapp.status.set('width', 'W 240');   // update by key
webapp.status.sep();                    // vertical separator
webapp.status.spacer();                 // flex spacer (pushes remaining items right)
```

---

## Design decisions

- **No domain logic** — WebApp is pure layout. Domain objects (Item, List) added by consumer.
- Panels are `position:relative` containers — add content via `.main.append()`.
- Resize handles use the Pointer Capture API (robust across viewport boundaries).
- `header_right` is a flex row — append badges, buttons, etc.
- `WebApp.js` re-exports the latest stable level for stable default imports.

---

## Suggested Improvements

### 1. Converge with Workspace

WebApp and `ext/Workspace` solve the same problem. Developers currently have to choose
between them with no intuitive guidance on which to pick. The overlap creates confusion.

**Proposal:** `Workspace` v1 provides a `'shell'` preset that replicates WebApp's layout:
```js
// WebApp stays as-is for existing code.
// New code uses Workspace with a shell preset, gaining sessions + selection bus:
app.workspace = new Workspace({
    preset: 'shell',
    left_width: 260,
    right_width: 280,
});
```
Internally, `WebApp` could become a thin wrapper around `Workspace({ preset: 'shell' })`.
This way existing WebApp users don't break, and new code gets the full Workspace power.

### 2. Page Stack on Panels

Right now `webapp.main` is a static container — you append to it and the old content
stays. There's no intuitive way to "navigate" inside the main panel.

**Proposal:** Add a page stack API to each panel:
```js
webapp.main.push(new_view)     // show new view, previous is hidden (back possible)
webapp.main.pop()              // go back
webapp.main.replace(new_view)  // replace current, no history
webapp.main.clear()            // clear all
```
This makes navigation inside an app intuitive without a full router.

### 3. Selection Broadcasting

Right now there's no standard way for the left panel (e.g., a file tree or layer list)
to communicate to the right panel (e.g., a properties inspector) when something is selected.
Components have to couple directly.

**Proposal:** WebApp (or Workspace) provides a selection bus:
```js
webapp.select(item);               // broadcast selection
webapp.on('select', item => { });  // any panel listens
webapp.right.replace(item.props_view);  // right panel updates intuitively
```

### 4. Keyboard Shortcuts for Panel Toggle

Toggling left/right panels with keyboard shortcuts (e.g., `[` for left, `]` for right)
is a very intuitive UX pattern that WebApp currently leaves to consumers.
WebApp2 should register these by default (configurable).
