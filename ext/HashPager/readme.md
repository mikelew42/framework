# HashPager

Evolved multi-column hash-routed pager. Solves `HashPage`'s nested-DOM shrinkage problem
by rendering **all pages into one shared flat container** — a single `.pages` flex row.
Each page's content and sub-nav live inside the page card, but the cards themselves are
siblings, not nested.

---

## The Key Architectural Shift (vs HashPage)

`HashPage`: sub-pages rendered inside parent's `.children` div → nested DOM → shrinking columns

`HashPager`: ALL pages at ALL levels rendered into `HashPager.pager.view.pages` → flat DOM →
equal columns, no shrinkage

```
pager.view
  .buttons   ← top-level nav (tabs for root pages)
  .pages     ← ALL page cards live here, flat
    .page-test
      .header
      .buttons  ← sub-nav for Test's children
      [content]
    .page-one
      .header
      .buttons
      [content]
    .page-one-a
      ...
```

When you click into "One → A", pages for One and A both show (are active), appearing as
side-by-side columns in `.pages`. Pages that aren't active are `display:none`.

---

## How It Works

- `HashPager.singleton()` auto-creates the root pager (`.pager { buttons, pages }`)
- `page("Label", fn)` constructs a `HashPager` with `get_captured: true`, which grabs the
  current `HashPager.captor` as its parent
- The page creates a `HashRouter` route; within `route.initialize`, it calls `this.render()`
- `render()` appends to `HashPager.pager.view.pages` (always the flat root container)
- Sub-nav buttons (`this.button`) append to `this.parent.view.buttons` — so each level's
  buttons appear inside its parent's card

---

## Key Files

| File | Role |
|------|------|
| `HashPager.js` | The class, including `make(n)` recursive page generator |
| `page.js` | Demo: manual pages + `.make(5)` stress test |
| `2/page.js` | Subclassing experiment (see `HashPager/2/readme.md`) |

---

## `make(n)` — Recursive Page Generator

`pager.make(n)` generates a full recursive hierarchy n-levels deep.
`make(3)` → each page has 3 children, each of those has 3 children, etc.
Used in the demo to stress-test column layout with many levels.

---

## The Remaining Problem: Space at Depth

Flat container solves the *shrinkage* problem but not the *space* problem. With 4+ active
levels, you run out of horizontal room. The page.js CSS gives pages `min-width: 30em`, so
at depth they just overflow horizontally (or need horizontal scroll).

**The ideal fix:** adaptive column management. When depth exceeds what fits:
1. Hide (collapse to breadcrumb) the leftmost ancestor columns
2. Show a "back" affordance to resurface them
3. This is essentially macOS Finder's column view or VS Code's breadcrumb bar

This would require JS: tracking which level is "active deepest" and toggling `.hidden`
or `width:0` on columns that overflow. CSS alone can't do this.

---

## Activate/Deactivate Bug (noted in page.js)

When navigating to a deep page and then back to a shallow one, deactivating ancestors
may not fire correctly. The comment in `page.js` explains the dilemma:
- Deactivating all on exit → re-activate all ancestors on entry → thrash for sibling switches
- Not deactivating → stale UI state

Classic solution: walk the new active path upward, compare with old path, only
deactivate/activate the diverging nodes.

---

## Open Questions

- Should sub-page columns be visible *while* their parent is visible (always), or only when
  the sub-page is active? Currently: visible = `active` class.
- Should the pager root's buttons panel be in `.pager > .buttons`, or should each page's
  nav appear inside its own card? Currently: each page card has its own `.buttons`.
- When the pager is used for "structured content" (100 sub-pages imported from data), do
  we want all pages pre-rendered (current), or lazy-rendered on first activate?

---

## Current Version: `3/`

**`3/HashPager3.js` is the active version.** It keeps this flat-container architecture and adds:
proper subclassing (this-scoped statics — fixes the `2/` extensibility pain), lazy content
render (content on first activate), and non-numeric unique slugs in `make()`. See `3/readme.md`.
Browser-verified. Still open: Page-object integration, adaptive columns at depth.

---

## Recommendation

**This is the right foundation to build on.** The flat-container insight is correct and
makes the column layout tractable. Next step: add adaptive column management for deep hierarchies.

For the "structured content" use case (importing sets of pages, no individual page.js files):
the API already supports it — just call `page()` or `pager.add()` programmatically from
imported page definitions. The `make(n)` method is a proof-of-concept of exactly this pattern.
