# Workspace0 — MVP

Minimal panel layout system. Pure UI — no persistence, no routing, no Item backing.
The goal is to establish the right API shape and captor pattern before adding complexity.

Everything should be intuitive: creating a panel inside a workspace should just work,
and sizing should have sensible defaults so you only specify what you want to change.

---

## Scope

**In v0:**
- `Workspace0` — flex-row shell that holds panels
- `Panel0` — flex-column with optional title, holds cards
- `Card0` — content unit with fill/hug/fixed sizing on both axes
- Captor pattern so `new Panel0()` / `new Card0()` auto-register with their parent
- CSS-driven sizing via classes (`panel-fill`, `card-fill-h`, etc.)
- Helper functions: `workspace(fn)`, `panel(opts, fn)`, `card(opts)`

**Deferred to v1+:**
- Named panels (left/main/right/header/footer)
- Page stack per panel (push/pop/replace)
- Persistence (LocalStorageSaver / Item backing)
- Selection broadcasting (`workspace.select(item)`)
- HashRouter integration (mode switching)
- Explicit Row class
- Panel drag-to-resize / split
- Session persistence

---

## Class Relationships

```
Workspace0                  ← root container
  panels: Panel0[]          ← ordered list of panels
  view: div.workspace       ← flex-row DOM container

Panel0
  workspace: Workspace0     ← reference to parent (set via captor)
  cards: Card0[]            ← ordered list of cards
  view: div.panel           ← flex-col DOM container
  body: div.panel-body      ← where cards are appended

Card0
  panel: Panel0             ← reference to parent (set via captor)
  view: div.card            ← the card DOM container
  body: div.card-body       ← where content is appended
```

---

## API

```js
import { workspace } from '/framework/ext/Workspace/0/Workspace0.js';
import { panel }     from '/framework/ext/Workspace/0/Panel0.js';
import { card }      from '/framework/ext/Workspace/0/Card0.js';

const ws = workspace(() => {

    panel({ title: "Sidebar", width_mode: "fixed", width: 14 }, () => {
        card({ title: "Navigation", content: navView });
        card({ title: "Tools", content: toolsView });
    });

    panel({ title: "Main" }, () => {    // width_mode "fill" is default
        card({ height_mode: "fill", content: editorView });
    });

    panel({ title: "Inspector", width_mode: "hug" }, () => {
        card({ title: "Properties", content: propsView });
    });

});

app.$root.append(ws.view);
```

**Panel0 constructor options:**
| Prop          | Default  | Values                            |
|---------------|----------|-----------------------------------|
| `title`       | none     | string, shown in panel header     |
| `width_mode`  | `'fill'` | `'fill'`, `'hug'`, `'fixed'`      |
| `width`       | none     | number (em) or CSS string — only used when `width_mode: 'fixed'` |
| `workspace`   | captor   | explicit `Workspace0` ref if not captured |

**Card0 constructor options:**
| Prop           | Default  | Values                              |
|----------------|----------|-------------------------------------|
| `title`        | none     | string, shown in card header        |
| `content`      | none     | View, string, or `fn(card)` called in captor context |
| `width_mode`   | default  | `'fill'`, `'hug'`, `'fixed'`        |
| `height_mode`  | default  | `'fill'`, `'hug'`, `'fixed'`        |
| `width`        | none     | number (em) or CSS string           |
| `height`       | none     | number (em) or CSS string           |
| `panel`        | captor   | explicit `Panel0` ref if not captured |

---

## Sizing CSS

Panels live in a `flex-row` workspace. Cards live in a `flex-col` panel-body.

**Panel widths** (applied via class on `.panel`):
- `.panel-fill` → `flex: 1 1 auto` (grows to fill remaining workspace width)
- `.panel-hug`  → `flex: 0 0 auto; width: fit-content`
- `.panel-fixed` → `flex: 0 0 auto` + inline `width:` style

**Card widths** (cross-axis in flex-col container):
- default → `align-self: stretch` (fills panel width)
- `.card-hug-w` → `align-self: flex-start; width: fit-content`
- `.card-fill-w` → explicit stretch (same as default, for clarity)

**Card heights** (main-axis in flex-col container):
- default → `height: auto` (hug content; natural block height)
- `.card-fill-h` → `flex: 1 1 0` (grows to take remaining panel height)
- `.card-hug-h` → `flex: 0 0 auto` (explicit hug; rarely needed)

---

## Captor Pattern

Mirrors `HashTabs` / `HashTab` exactly — auto-registration without manual `.add()`:

1. `workspace.capture(fn)` sets `Workspace0.captor = workspace`, calls `fn`, restores.
2. Inside `fn`, `new Panel0()` (with `get_captured: true`) grabs `Workspace0.captor`
   as `this.workspace`, renders, then calls `this.workspace.add(this)`.
3. `panel.capture(fn)` sets `Panel0.captor = panel`, calls `fn`, restores.
4. Inside `fn`, `new Card0()` grabs `Panel0.captor` as `this.panel`, calls `this.panel.add(this)`.

The `workspace(fn)` helper is `new Workspace0()` + `ws.capture(fn)` in one call.
The `panel(opts, fn)` helper is `new Panel0(opts)` + `p.capture(fn)` in one call.

---

## Next Steps (v1)

- Named panels: `workspace.left`, `workspace.main`, `workspace.right`
- Page stack per panel: `panel.push(view)`, `panel.pop()`, `panel.replace(view)`
- `Item9` backing to `Workspace0` and `Panel0` so state is serializable
- `LocalStorageSaver` so layout survives page reload
- `workspace.activate(mode)` + `workspace.deactivate()` for mode switching
- `Panel0.List` (`List8` subclass) so panel order can be reactive
- Consider a `Row0` class wrapping a subset of panels into a horizontal band

---

## Suggested Improvements

### Named panels instead of ordered array

v0's `panels[]` array requires index-based access, which is fragile. Intuitive access
looks like `workspace.left`, `workspace.main`, `workspace.right`.

**Proposal for v1:**
```js
// Panel0 opts gain a `name` field:
panel({ name: 'left', width_mode: 'fixed', width: 16 }, () => { ... });

// Workspace0 exposes them as named properties:
workspace.left    // → Panel0
workspace.main    // → Panel0
workspace.right   // → Panel0
```

### Panel page stack is the key missing feature

Right now a card just holds content statically. To make workspace navigation intuitive
(sub-apps pushing new views, back-button behavior, clearing the panel for new content),
panels need a page stack:

```js
workspace.main.push(my_view)    // show my_view, old content hidden (back available)
workspace.main.pop()            // go back
workspace.main.replace(my_view) // replace, no history
workspace.main.clear()          // clear all
```

This pattern makes every panel behave like a browser back-stack, which is intuitive
for anyone who's ever used a browser or a mobile app.
