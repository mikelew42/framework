# Page/2 — real navigation via the pager layer

Page/1 ships a **placeholder** sub-page nav (button per child, show/hide, no URL). Page/2
replaces it with **hash routing**, by having `Page` delegate sub-page presentation to a `Pager`
that owns the routes — without `Page` becoming routing-aware itself.

**Page is the noun; the Pager owns routing.**

---

## Status — Built & promoted ✅

`Page2.js` + `Pager.js` + `page.js` demo shipped and browser-verified. `core/Page/Page.js` now
re-exports Page2, so `import { page } from "/app.js"` is routed everywhere (the `/examples/` tree
is now URL-addressable). Node suite covers the non-routing logic (slug, page() → Page2,
inheritance); routing is browser-verified (deep-link, refresh, back/forward).

**What shipped (chose Option A — compose a Pager):**
- `Pager` (this folder) drives `Page` objects via `title` / `slug` / `render(target)`. `Page2`
  only overrides `render_pages()` to `new Pager({ host: this })`. `Page0/1` never import HashRouter.
- `Page.slug` getter (derives from title).
- Hash routing: deep-linkable (`#two/b/deep`), refresh-stable, browser back/forward.
- **Fully lazy render:** `Pager.add()` eagerly creates only the nav **button + route**; the entire
  page **view + content** is deferred to first activate (`if (!pg.rendered) pg.render(columns)`).
  This is lazier than HashPager3, which renders every card's shell up front (it bundles
  button-creation into `render()`). See `ext/HashPager/3/readme.md` → "Eager shell vs lazy view".
- **Layout:** nested/indented (vertical), not flat horizontal columns — readable at any depth, no
  shrinkage. Flat columns (HashPager3 style) remain a separate presentation choice.

**Two bugs found & fixed during the build (worth remembering):**
1. **Static-captor shadowing.** The Page2 test suite (rendered on the demo page) called
   `Page2.captor = null`, creating an *own* static that shadowed the inherited `Page1.captor`, so
   `page()` and `render_content()` read different captors → sub-pages weren't adopted. Fixed by
   routing all captor/roots state through one shared `core/Page/context.js` (accessors on the Page
   class, so subclasses can't shadow). See [[project-page-system]].
2. **Route-assigned-after-activate.** A `HashRouter` matches inside its own constructor and fires
   `activate` synchronously — before `pg.route = new HashRouter(...)` is assigned. The child's
   Pager then read an undefined `host.route` and fell back to the root router (wrong remainder), so
   deep links failed on fresh load. Fixed with **create-all-then-match**: build + assign every
   child route first, then match them.

**Deferred:** flat horizontal columns; activate/deactivate-at-depth refinement; `this.pages` → `List`.

---

## The mismatch to resolve

- `HashPager3` is currently **page-like**: it creates its own cards from a `content` fn, owns the
  route, the view, the captor. It manages *itself*, not external objects.
- `Page` is a separate noun with `title` + `content` + `render(target)`.

To let `Page` delegate to a pager, the pager must **drive generic page objects**, not create its
own. So Page/2 needs a small, explicit **pager↔page contract**.

---

## Proposed contract (what a pager needs from a page)

A pager (HashPager3-as-driver) needs each child to provide:

| Member | Meaning |
|--------|---------|
| `title` | Button label + slug source |
| `slug` | URL segment (derived from title if absent) |
| `render(target)` | Render the page's content into `target` (idempotent, lazy-friendly) |
| `on_activate?()` / `on_deactivate?()` | Optional hooks the pager calls on route match |

`Page` already has `title`, `slug` (add it), and `render(target)`. So the pager can:
1. give each child a `HashRouter` route keyed on `slug`,
2. render a nav button per child,
3. on first activate: `child.render(this.columns)` (lazy — into the flat `.pages` container),
4. show/hide columns on activate/deactivate.

The page stays ignorant of all of it.

---

## Two ways to wire it (decide here)

### Option A — `Page` composes a `Pager` (recommended)
`Page.render_pages()` (the Page/1 seam) creates a pager and hands it the children:

```js
render_pages(){
    if (!this.pages?.length) return;
    this.pager = new Pager({ host: this });   // routing + flat columns
    for (const pg of this.pages) this.pager.add(pg);   // pager drives Page objects
}
```

- `Pager` = HashPager3 refactored to *drive* page objects via the contract above (not create its
  own content cards). The page-like `make()`/`content`-card behavior moves to a thin
  `HashPager3` subclass or a demo, keeping `Pager` generic.
- Dependency: `Page/2 → Pager(HashPager3) → HashRouter`. `Page` core still never imports HashRouter.
- Clean: swap `Pager` for a `TabPager`/`AccordionPager` later without touching `Page`.

### Option B — `HashPager3` absorbs `Page`
Make `Page` a subclass of `HashPager3` (or mix routing in). Fewer objects, but recouples the noun
to routing and brings back the static-singleton awkwardness. **Rejected** unless A proves clumsy.

---

## Work items

1. **Extract the driver.** Refactor `HashPager3` so the routing + flat-column machinery operates
   on the pager↔page contract (objects with `title`/`slug`/`render`), not on an internal `content`
   card. Keep the original page-like demo working via a thin subclass.
2. **`Page.slug`** — derive in Page/0 (`title.toLowerCase().replace(/\s+/g,'-')`), used by the pager.
3. **`Page/2` (Page2.js)** — override `render_pages()` to compose a `Pager` and add children.
   Drop the placeholder `show()`.
4. **Lazy + activate/deactivate-at-depth** — inherit HashPager3's lazy render; fix the
   diverging-path deactivation while here.
5. **Demo + headless verify** — `2/page.js`: a Page tree that navigates by URL hash with columns.

---

## Open questions

- Where do root pages get their slug into the URL? A root `Page` rendered by `App.load_page()` is
  at a real `/path/` — its *sub-pages* are the hash segments. So the root page's pager owns the
  hash; the root itself isn't a hash segment. Confirm this in the driver (root pager = no route).
- Should the pager be created eagerly in `render_pages()` or lazily on first sub-page? Eager is
  simpler; lazy saves nothing meaningful since `render_pages` only runs when `pages` is non-empty.
- Does `Page` keep `this.pages` as an array, or finally become a `List` subclass (per "lean into
  List")? Page/2 is a good moment to switch — the pager could consume a `List` and get
  add/remove reactivity for free.

---

## Files (planned)

| File | Role |
|------|------|
| `Page2.js` | extends Page1; `render_pages()` composes a `Pager`, drops placeholder nav |
| `Page2.node.test.js` | contract: slug derivation, pager receives children, dormancy |
| `page.js` | Browser demo: URL-hash-navigable Page tree with columns |
