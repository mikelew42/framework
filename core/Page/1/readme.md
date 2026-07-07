# Page/1 — `page()` Helper + HashPager Sub-Pages

Builds on Page/0. Adds the three things that make Pages usable as a real toolbelt item:

1. The **`page()` helper** — one function that creates *both* root documents and sub-pages,
   disambiguated by the captor (exactly like `test()`/`assert()`).
2. **Sub-pages** — nesting via HashPager, so a page can drill into columns with hash routing.
3. **`Page.roots` + `App.load_page()` flush** — the "App renders what loaded for this path,
   everyone else stays dormant" rule.

> `Page` = class, `pg` = instance, `page()` = helper.

---

## The Toolbelt Goal

```js
import { page, p, h1 } from "/app.js";

// root document (no captor) — dormant until App flushes it
export default page("Docs", (pg) => {
    h1("Docs");

    // sub-pages (captor is the parent pg) — same helper, reads identically
    page("Install", () => p("npm not required."));
    page("Guides",  (pg) => {
        page("Routing", () => p("HashRouter basics."));   // nests freely
    });
});
```

Even though a root Page (a `/path/` document) and a sub-page (a HashPager panel) are
*technically different things*, `page()` makes them feel the same. That's the point — easy to use.

---

## How `page()` Disambiguates (captor pattern)

```js
function page(title, content){
    const pg = new Page({ title, content });
    const parent = Page.captor;          // set while a parent renders its content fn
    if (parent) parent.adopt(pg);        // SUB-PAGE → wire into parent's pager
    else        Page.roots.push(pg);     // ROOT → dormant, App flushes it
    return pg;
}
```

- **No captor** → root document. Pushed to `Page.roots`. Dormant.
- **Captor present** → sub-page. Handed to the parent's pager. Dormant until rendered/activated.

The captor is set when a `pg` renders its content fn (Page/0's `render` wraps the fn; Page/1
sets `Page.captor = this` around that call), so any `page()` inside a content fn is captured.

---

## Sub-Pages

A parent `pg` adopts children into a lazily-created `pages` list:

```js
adopt(pg){
    pg.parent = this;
    (this.pages ??= []).push(pg);
    return pg;
}
```

**Presentation — current state.** Page/1 ships a *minimal built-in nav* in `render_pages()`:
a button per child, lazy render on first show, hide siblings. This keeps Page/1 functional and
demonstrable on its own. It is a **placeholder** — `render_pages()`/`show()` are the override
seam where **HashPager/3** will plug in hash routing + flat-column layout. Until then there's
no URL hash and no columns, just nav + reveal.

**Lazy sub-render** already holds: a sub-page renders on **first show**, not on construction —
so importing 100 pages and adopting them costs nothing until one is visited. (Root is eager via
the App flush; subs are lazy — they go down different branches, no conflict.)

**Decoupling intent (unchanged).** Page is the noun; routing/columns belong in the pager layer.
Page does **not** `import HashRouter`. When HashPager/3 lands it replaces the placeholder nav
without touching `Page`'s core. (`this.pages` should become a `List` subclass per the "lean into
List" rule — traversal/children for free; kept a plain array for the MVP.)

---

## App Integration — the Flush

`App.load_page()` is the *only* place that renders root pages. After importing the URL's
`page.js`, it flushes whatever roots registered during that import:

```js
async load_page(){
    await import(App.path_to_page_url(window.location.pathname));
    for (const pg of Page.roots) pg.render(this.$root);   // window.location points here
    Page.roots = [];
}
```

Resulting behavior (the "best of both worlds" the design targets):

| Case | Outcome |
|------|---------|
| `export default page(...)` in the URL's page.js | App flushes it. Export still importable/SSG-able. |
| bare `page(...)`, no export, in the URL's page.js | App flushes it (it's in `Page.roots`). |
| `page.js` imported from another module | Dormant — nothing flushes it there; render explicitly. |

**Known boundary:** if the URL's `page.js` *statically imports* another `page.js`, that file's
top-level `page()` calls also land in `Page.roots` during the same import window, so App would
flush them into `$root` too. In practice you reference an imported `pg`'s export and place it
explicitly rather than relying on its bare top-level calls. Document; don't fight it yet.

---

## API Summary (Page/1)

| Member | Role |
|--------|------|
| `page(title, content)` / `page(fn)` | Create root or sub-page (captor decides). Returns `pg`. |
| `Page.roots` | Pending root pages; flushed by `App.load_page()`. |
| `Page.captor` / `set_captor` / `restore_captor` | Captor stack (framework standard). |
| `pg.adopt(child)` | Adopt a sub-page (sets `parent`, pushes to `pages`). |
| `pg.pages` | Sub-pages (plain array, lazily created; future `List`). |
| `pg.render_content()` | Override of Page/0's — wraps content with the Page captor. |
| `pg.render_pages()` / `pg.show(child)` | Placeholder sub-page nav (HashPager/3 replaces). |
| `pg.render(target)` | (from Page/0) render content + sub-pages. |

---

## Resolved: collection isolation via a private collecting captor

**Was:** `Page.roots` is a global that `page()` writes during import and `App.load_page()` read
once after — so anything else running during the import could clobber it. The first casualty was
the demo itself: rendering Page1's own test suite runs test bodies that call `reset()`
(`Page.roots = []`), wiping the live root before App flushed it → the root page silently never
rendered.

**Fix:** `App.load_page()` now sets a *private collecting captor* — a duck-typed
`{ adopt: pg => collected.push(pg) }` — before importing, and renders `collected` after. Top-level
`page()` calls hit `parent.adopt(pg)` → the local array, never the global `Page.roots`. So the
test suite (or any other import-time code) poking `Page.roots`/captor statics can't touch the live
load. A `finally` resets the captor statics directly in case the import left the stack unbalanced.

`Page.roots` remains as the fallback sink for `page()` calls made with **no** captor (e.g. Node
tests, where there's no App) — but the App load path no longer depends on it.

## Open Questions

- Where does `page()` live for the toolbelt import? Re-export from `/app.js` alongside
  `test`, `assert`, `el`, `div`. (`Page/Page.class.js → export { default, page } from "./1/Page1.js"`.) ✓ done
- Should `Page.roots` be cleared on error too, so a failed load doesn't leak into the next?
- Does a root `pg` with sub-pages render its pager into `$root`, with columns flowing from there?
  (Yes — root is just the first column; HashPager/3's flat-container model handles the rest.)
- Title → `document.title` / meta: when (render time? activate time?). Defer to a later level.

---

## Files (planned)

| File | Role |
|------|------|
| `Page1.js` | extends Page0; adds `page()`, `Page.roots`, captor, `adopt`, placeholder nav |
| `Page1.node.test.js` | captor disambiguation, roots collection, adopt, dormancy (inherits Page0) |
| `page.js` | Browser demo: root `Docs` + nested sub-pages (`Install`, `Guides/Routing…`) |

**Also wired:**
- `core/Page/Page.class.js` — re-exports `{ default, page }` from `1/Page1.js` (stable default).
- `core/App/App.js` — `load_page()` now flushes `Page.roots` into `$root` (back-compat preserved).
- `app.js` — exports `Page` and `page` for the toolbelt: `import { page } from "/app.js"`.
