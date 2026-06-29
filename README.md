# framework

A local-first, no-bundler, no-build-step JS framework. Static HTML + ES modules served from Node. Everything imports from `/framework/...` paths directly.

## Quick Import

```js
import app, { el, div, h1, p, style, ui, ux, List, Item, Store, Keys } from '/app.js';
```

`/app.js` is the single entry point. Import everything from there unless you need to pin a specific version of a class.

---

## Architecture Overview

```
View  ←  the DOM layer (div, el, h1, p, style helpers)
Item  ←  persistent domain objects (get/set/save/undo)
List  ←  ordered collections (add/remove/filter/sort)
Saver ←  persistence backends (FileSaver, ListSaver, MemorySaver, LocalStorageSaver)
Store ←  named Item registry (store.item('settings') → FileSaver-backed Item)
ui    ←  primitive controls (input, slider, toggle, color, form, button, …)
ux    ←  higher-level patterns (tabs, modal, toast, accordion, popover, …)
WebApp ← three-panel app shell (header + left + main + right)
Keys  ←  global keyboard shortcut manager
```

---

## Core Modules (`core/`)

| Module | Description |
|--------|-------------|
| [`core/Item/`](core/Item/) | Persistent domain objects. `Item.js` → Item9 (full stack: get/set, events, schema, undo/redo). |
| [`core/List/`](core/List/) | Ordered collections. `List.js` → List8 (full stack: events, filter, sort, group_by, index_by). |
| [`core/View/`](core/View/) | DOM abstraction. `el`, `div`, `h1`, `p`, `style` helpers. See `.claude/skills/view-guide`. |
| [`core/App/`](core/App/) | App singleton — `app.$root`, `app.$header`, `app.$sidenav`. |
| [`core/Events/`](core/Events/) | `on/off/once/emit/clear` mixin. Used by Item5+, List1+. |
| [`core/Test/`](core/Test/) | `Test0` (Node-runnable) + `Test1` (browser renderer). 26 suites, 21 Playwright tests. |
| [`core/mixin/`](core/mixin/) | `mixin(A, B, Base)` — compose multiple classes without deep prototype chains. |

---

## Extensions (`ext/`)

| Module | Description |
|--------|-------------|
| [`ext/Saver/`](ext/Saver/) | `FileSaver` (per-item JSON), `ListSaver` (whole list JSON), `MemorySaver` (tests), `LocalStorageSaver` |
| [`ext/Store/`](ext/Store/) | Named Item registry — `store.item('name')` returns a FileSaver-backed Item |
| [`ext/WebApp/`](ext/WebApp/) | Three-panel app shell. `WebApp0` (base), `WebApp1` (resizable + status bar), `WebApp2` (planned) |
| [`ext/WebEditor/`](ext/WebEditor/) | Visual layout editor — Figma-style tree editor built on Item9 + WebApp1 |
| [`ext/Notes/`](ext/Notes/) | `NoteItem` + `NoteList` demo app — full stack: Item9 + List7 + ListSaver |
| [`ext/Todo/`](ext/Todo/) | `TodoItem` + `TodoList` demo app — Item7 + List4 + ListSaver |
| [`ext/Keys/`](ext/Keys/) | Global keyboard shortcut manager singleton |
| [`ext/Bind/`](ext/Bind/) | Two-way DOM bindings (`bind`, `bind_text`, `bind_checked`, etc.) |
| [`ext/Component/`](ext/Component/) | **Legacy** persistence layer. Do not use in new code — see migration guide in its readme. |

---

## UI + UX (`ui/`, `ux/`)

| Namespace | Description |
|-----------|-------------|
| `ui.*` | Primitive controls: `input`, `textarea`, `slider`, `scrub`, `toggle`, `color`, `number`, `combobox`, `button`, `form`, `bound` |
| `ux.*` | Patterns: `tabs`, `accordion`, `modal`, `toast`, `context_menu`, `popover`, `tooltip`, `command_palette`, `sheet`, `notification` |

Both namespaces are exported from `/app.js` and have live demo pages at `/framework/ui/` and `/framework/ux/`.

---

## Typical App Pattern

```js
import app, { div, h1, ui, ux } from '/app.js';
import Item  from '/framework/core/Item/Item.js';
import { Store, ListSaver } from '/app.js';

// Named persistent slots
const store = new Store({ dir: '/data/' });
const settings = store.item('settings');
settings.schema({ theme: String, font_size: Number });
await store.load_all();

// Reactive UI
settings.on('change', (key, val) => { /* update UI */ });

// Three-panel shell
import WebApp from '/framework/ext/WebApp/WebApp.js';
const webapp = new WebApp({ title: 'My App', left_width: 260, right_width: 280 });
webapp.left.append(ux.tabs([{ label: 'Settings', content: settingsPanel }]));
webapp.main.append(myCanvas);
app.$root.append(webapp.root);
```

---

## Class Progression Pattern

Each module has numbered levels (`0/`, `1/`, `2/…`) — lower levels are minimal and fully testable, higher levels extend without breaking the lower contracts. The top-level `Module.js` re-exports the current stable level.

See [CLAUDE.md](../CLAUDE.md) for the full convention.

---

## Dev Conventions

- **No bundler, no build step** — import paths are `/framework/...` served directly.
- **No React, Vue, JSX** — UI is built with `View` helpers (`div`, `el`, `h1`, etc.).
- **No comments** unless the WHY is non-obvious.
- **snake_case** for vars, methods, args.
- **Run tests after edits**: `node scripts/run-all.mjs` (26 suites) or `npx playwright test` (21 browser tests).
- **`readme.md` per module** — living design docs. Keep them updated.
