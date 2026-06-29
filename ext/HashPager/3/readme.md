# HashPager/3

Keep HashPager's **flat-container column** architecture (the correct insight from the original),
fix the **subclass/extensibility pain** exposed by `2/`, and position it as the **pager layer**
that the new `Page` system can delegate to.

Follows the original `HashPager.js` as closely as possible. Changed only what's necessary.

---

## Status — Built (first cut)

`HashPager3.js` + `page.js` demo shipped. Delivered items 1–3 from the plan below:

- ✅ **Proper subclassing** — every self-reference is `this` / `this.constructor`; statics are
  this-scoped via `Object.hasOwn` (`singleton()`, `own()`), and a static `page()` resolves the
  captor's class. `class MyPager extends HashPager3 {}` now works with **zero** manual plumbing
  (the demo proves it with `FancyPager`). This was the headline `2/` pain.
- ✅ **Lazy content** — `render()` builds only the page shell (so routing works); `render_content()`
  runs on first `activate()`. Adding 100 pages costs nothing until one is visited.
- ✅ **Non-numeric, unique slugs** in `make()` (`p-1-2-3`), fixing the router-path collision.

Deferred (next):
- ⏳ **Page-object integration** — make `Page` (core/Page) delegate its `render_pages()` to a
  HashPager3 so the placeholder nav is replaced by routing + columns. (Currently HashPager3 is
  self-contained/page-like, like the original.)
- ⏳ **Adaptive columns** — Finder-style collapse of ancestor columns at depth (JS; CSS can't).
- ⏳ **activate/deactivate at depth** — only deactivate the diverging tail of the path. Currently
  inherits the router's recursive activate/deactivate (good enough for the demo).

**Cannot be Node-tested** (HashRouter needs `window` + `Events`, both browser-only / stubbed in
Node) — same as the original HashPager. Verify in the browser via `page.js`.

---

## Plan (original)

---

## What Stays (the original got this right)

- **One flat `.pages` container** holds every page card at every depth → equal-width columns,
  no nested-DOM shrinkage. This is HashPager's whole reason to exist over HashPage; keep it.
- **HashRouter-backed routes** — each page is a hash segment; `route.go()` navigates;
  activate/deactivate on match.
- **Captor pattern** for auto-registering nested pages.
- **`render` → route.initialize ordering** — route created before render so page content can
  create sub-routes that get captured (the original's load-bearing comment; preserve it).

## What Changes

### 1. Fix static inheritance (the `2/` pain)
`2/page.js` needed 3 lines of manual plumbing to subclass because the singleton + captor live on
the **base class** (`HashPager.pager`, `HashPager.captor`). Fix: use `this`-scoped statics so a
subclass gets its own scope.

```js
static get_captor(){ return this.captor ??= this.singleton(); }
static singleton(){ return this.pager ??= this.make_root(); }
```

`class MyPager extends HashPager {}` should then "just work" — no manual `set_captor`. When this
lands, `HashPager/2/` (the diagnostic) can be deleted.

### 2. Stop owning "what a page is" — defer to `Page`
The original `HashPager` conflates *page* (title, content, view, route) with *pager* (the
collection, the flat container, the captor). The new split:

- **`Page` (core/Page/)** = the noun: `title`, `content`, `render(target)`. No routing.
- **`HashPager` (this)** = the pager layer: takes Pages, gives each a route + a column slot in
  the flat `.pages` container, runs activate/deactivate.

So HashPager/3 manages **Pages**, it doesn't *subclass into* them. `pg.pager` is a HashPager;
`pager.add(pg)` wires a `Page` for routing + layout.

### 3. Lazy sub-render
Original renders all pages on construction (fine for the demo, bad for 100 imported pages).
HashPager/3 renders a page's content on **first activate**. Page stays dormant until visited.

### 4. Adaptive columns (the real remaining UX problem)
Flat container fixed *shrinkage* but not *running out of width at depth*. Plan: when active depth
exceeds available width, collapse leftmost ancestor columns to a breadcrumb (Finder column view).
Pure JS — CSS can't do it. Lives entirely in the pager; Pages don't know about it.

> Scope call: ship 3/ with items 1–3 first (the structural wins). Item 4 (adaptive columns) can
> be a follow-up within `3/` once the Page integration is proven.

---

## Relationship to the Page System

```
core/Page/1/   page("Name", fn)  ──creates──►  Page (noun)
                                                  │ adopt(child)
                                                  ▼
ext/HashPager/3/   HashPager (pager layer) ── route + column for each Page
                          │
                          ▼
ext/HashRouter/   HashRouter ── hash segment per page, activate/deactivate
```

- `page()` helper lives in **Page/1**, not here. HashPager/3 is the machinery `Page` delegates to.
- Dependency direction: `Page → HashPager → HashRouter`. HashPager never imports Page.
- The `page()`/`pg`/`Page` naming is owned by the Page system; HashPager/3 drops its own
  `page()` helper and `page("...")` panel vocabulary to avoid the "two meanings of page" clash.

---

## Carry-over Bugs to Fix

- **activate/deactivate at depth** (noted in `HashPager/page.js`): exiting a deep page should
  only deactivate the diverging tail of the path, not blindly all ancestors. Standard fix: diff
  the new active path against the old, toggle only what changed.
- **numeric slugs** in `make()` (`slug: "" + i`) collide with router path matching — give
  generated pages real slugs.

---

## Files (planned)

| File | Role |
|------|------|
| `HashPager3.js` | extends/rewrites HashPager: this-scoped statics, manages Pages, lazy render |
| `page.js` | Demo driven through the Page system (`page()` + nested subs) |
| (later) adaptive-columns module | Finder-style collapse at depth |

---

## Success Criteria

1. `class MyPager extends HashPager3 {}` works with zero manual captor plumbing.
2. `core/Page/1` drives sub-pages through HashPager3 with no `Page → HashRouter` import.
3. 100 sub-pages can be added; only visited ones render.
4. Flat-column layout preserved; deep navigation still readable (item 4 or horizontal scroll
   as interim).
