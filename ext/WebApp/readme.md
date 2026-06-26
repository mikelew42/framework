# WebApp

A generic three-panel app shell: header + left sidebar + main content + right sidebar.
Extracted from the WebEditor pattern into a reusable layout primitive.

Pair with `framework/ui` (controls) and `framework/ux` (tabs, accordion, etc.) to build tools quickly.

Default import (`WebApp.js`) always points to the latest stable version.

---

## Versions

| Version | Status | Adds |
|---------|--------|------|
| **0** | ✅ | Core shell: header, panels, btn/sep/spacer |
| **1** | ✅ | Resizable panels, optional status bar |
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

// Right sidebar — use ui.form for quick bound property panels
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
- Panels are `position:relative` containers — add any content via `.main.append()`.
- Resize handles use the Pointer Capture API (robust across viewport boundaries).
- `header_right` is a flex row — append badges, buttons, etc.
- `WebApp.js` re-exports the latest stable level for stable default imports.
