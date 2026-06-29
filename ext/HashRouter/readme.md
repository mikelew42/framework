# HashRouter — URL-Hash Routing

A simple, intuitive hash-based router that lets you wire UI components to URL segments
without a build step or framework dependency. Uses `window.location.hash` (e.g. `#tools/layers`)
to encode app state in the URL, giving you shareable links and browser back/forward for free.

The captor pattern makes registration automatic: create a `HashTabs` or `HashPage` inside
a router's `capture(fn)` and it auto-registers as a child route. No manual wiring.

---

## Files

| File | Role |
|------|------|
| `HashRouter.js` | Core router class — path matching, activate/deactivate |
| `HashTabs.js` | Tabs UI backed by HashRouter — hash segment switches tabs |
| `page.js` | Demo page |

Related modules:
- `ext/HashPage/HashPage.js` — single-page routing (activate/deactivate one page at a time)
- `ext/HashPager/HashPager.js` — multi-page pager (sibling pages with buttons, recursive hierarchy)

---

## How It Works

The root `HashRouter.singleton()` listens to `hashchange`. When the hash changes, it
splits the hash into segments and walks its child routes, calling `match()` on each.
A child route matches if its `path` equals the current segment; on match it calls
`activate()` and recurses into its own children for the next segment.

```
hash:   #tools/layers
splits: ['tools', 'layers']

root router
  └── route { path: 'tools' }  ← matches 'tools', activates
        └── route { path: 'layers' } ← matches 'layers', activates
```

---

## HashTabs — Tab Bar with Routing

`HashTabs` creates a tab bar where each tab is a hash route. Clicking a tab calls
`route.go()` which sets the hash; the hashchange event re-matches and activates the tab.

```js
import HashTabs from '/framework/ext/HashRouter/HashTabs.js';
import { tab } from '/framework/ext/HashRouter/HashTabs.js';

const tabs = new HashTabs();   // creates tab bar, registers with root router

tabs.capture(() => {
    tab({ label: 'Tools',  content: toolsView });    // hash: #tools
    tab({ label: 'Layers', content: layersView });   // hash: #layers
});

app.$root.append(tabs.view);
```

Or with the shorthand (same as above, just more readable):
```js
const tabs = ux.tabs([
    { label: 'Tools',  content: toolsView },
    { label: 'Layers', content: layersView },
]);
```

---

## HashRouter — Raw Routing

For lower-level routing without a tab bar UI:

```js
import HashRouter from '/framework/ext/HashRouter/HashRouter.js';

const router = HashRouter.singleton();   // root router

router.add('editor', {
    initialize() { /* called once when route is first created */ },
    activate()   { /* called when hash matches #editor */       },
    deactivate() { /* called when navigating away */            },
});

router.add('settings', {
    activate()   { settingsPanel.show(); },
    deactivate() { settingsPanel.hide(); },
});

// Navigate programmatically:
HashRouter.singleton().routes[0].go();  // → sets hash to #editor
```

---

## Captor Pattern

Like Workspace and HashTabs, `HashRouter` uses a class-level captor for auto-registration.
When a child HashRouter (or HashTab) is constructed with `get_captured: true` (the default
for tab/page helpers), it grabs `HashRouter.captor` as its parent and adds itself.

```js
parent_router.capture(() => {
    new HashRouter({ path: 'child', ... });  // auto-captured by parent_router
});
```

---

## URL Segments

The hash is split on `/` and each segment is matched depth-first:

```
#                         → root (reset, activate first route)
#tools                    → activate route with path 'tools'
#tools/layers             → activate 'tools', then activate its child 'layers'
#editor/documents/readme  → activate 'editor' → 'documents' → 'readme'
```

Routes call `route.go()` to navigate: it builds the full path by walking up the
parent chain and joins segments with `/`.

---

## Related Modules (Status)

| Module | Status | Notes |
|--------|--------|-------|
| `HashTabs` | Stable | Best for flat tab-panel UIs; no column layout |
| `HashPage` | Superseded | Nested DOM causes column shrinkage — see its readme |
| `HashPager` | Active | Flat-container design; right foundation for multi-column |
| `HashPager/2` | Diagnostic | Extensibility probe; not a real variant |

---

## Suggested Improvements

### 1. Explorer Integration

The `Explorer` multi-column pager (planned in `ext/Explorer/`) would use HashRouter
to give each column a URL segment. Navigating into a file in column 2 would add a
segment: `#docs` → `#docs/readme.md`.

**Proposal:** Explorer creates a child HashRouter for each column. When a column
navigates to a new page, it calls `column.router.go()`, updating the hash segment
for that column position.

### 2. Workspace Mode Switching

`app.workspace` switching between modes (e.g., view, edit, settings) should be
intuitively URL-addressable:

```
#                  → default workspace mode
#editor            → editor mode (WebEditor fills main panel)
#settings          → settings mode
#editor/canvas     → editor, canvas sub-route active
```

**Proposal:** `Workspace` v3 creates a child HashRouter with paths for each named mode.
`workspace.activate('editor')` calls `workspace.router.go()`, updating the URL.

### 3. Named Routes

Currently routes are matched by position/path string. Named routes would make
programmatic navigation more intuitive:

```js
router.add('editor', { ... });
router.go('editor');           // navigate to #editor intuitively
router.go('editor/canvas');    // navigate to #editor/canvas
```

---

## Open Questions

- Should HashRouter handle query strings (`?key=val`) or just hash segments?
- Should `route.go()` push to browser history, or replace? (Currently always pushes)
- When the hash doesn't match any route, should the first route activate by default?
  (Currently: `reset()` calls first route's activate)
- Should routes be lazy-rendered until first activation (like `HashPage`) or
  eager (like `HashTabs`)? Currently this depends on the consumer.
