# Pager — navigation/layout variants for Pages

A `Pager` decides how a `Page`'s **children** are presented and routed. **Page is the noun;
Pager is the navigator.** Page/3 picks one via `static Pager`, so the same content can be shown
as columns, tabs, etc. — without changing the page.

```
Page (noun)  →  composes one of:
    Pager        base machinery (nested default)
    TabPager     in-place tabs (indented panels)
    ColumnPager  infinite nestable columns (Finder/Miller style)   ← page() default
```

---

## The two override seams

Everything shared — routes, nav buttons, lazy render, activate/deactivate, the
create-all-then-match ordering — lives in the **base `Pager`**. A variant overrides just:

| seam | meaning |
|------|---------|
| `container()` | WHERE child pages render (nested card vs a shared flat row) |
| `activated(pg)` | what happens after a child becomes active (scroll, breadcrumb, close button…) |

That's the whole extension surface. `classify()` (a third tiny seam) tags the host view with a
CSS class so each variant can style itself; each Pager ships its own `.css`.

---

## Variants

### `Pager` (base) — nested
Children render into a `.pages` div inside the host's own card. Usable directly; mostly the
shared substrate the others extend.

### `TabPager` — in-place tabs
Base behavior + a styling class. The active child renders indented under a tab strip; ancestors
stack vertically. Best when children are **panels of one thing** (settings, a wizard) rather than
a drill-down. Exposed as `tabs()`.

### `ColumnPager` — columns (the `page()` default)
Every active page in the whole tree is a column in **one shared flat row** (created on the root
page), so ancestors stay visible **side-by-side** — no nested-DOM shrinkage. Adds:
- **breadcrumb** — the real `/page.js` path → active hash trail, for jump-back nav
- **per-column close (✕)** — drops the column + its descendants (navigates to the parent route)
- **horizontal scroll** to reveal the newest column
- **mobile** — full-width columns (swipe one at a time; breadcrumb + ✕ to move)
- **`--col-width`** CSS var to tune column width

---

## Configuration (end-user API)

Via Page/3's helpers — clear about what you get:

```js
import { page, tabs } from "/app.js";

page("Docs", () => {          // children → COLUMNS
    page("Guide", () => { ... });
    tabs("Settings", () => {  // children → TABS (nested inside a column)
        page("Profile", () => { ... });
    });
});
```

The helper you use sets how **that** node lays out **its** children; a node's own appearance is
decided by its parent. Mix freely.

For a custom layout: subclass `Page` and set `static Pager = MyPager`, or write a new Pager that
overrides `container()` / `activated()`.

---

## Theming (CSS variables)

Each Pager ships its own CSS, but the look is driven by tokens on `:root` (in `Pager.css`) — override
them anywhere (a page's `<style>`, app theme, or `.col-root`) to retheme without touching the Pagers:

| token | default | controls |
|-------|---------|----------|
| `--col-w` | `24em` | column width |
| `--page-card` | `#fff` | column / tab-content background |
| `--page-line` | `rgba(0,0,0,.12)` | borders |
| `--page-accent` | `#3b82f6` | active column button |
| `--page-muted` | `#6b7280` | breadcrumb text |

The **TabPager** uses a *seamless* active tab: the active tab is `--page-card` (white) with its
bottom border erased so it flows directly into the content box — subtle, no visible seam.

### The `.page` collision (important)
framework.css defines a generic document style `@layer theme { .page { max-width:60em; padding:4rem;
background:#fff } }`. Page views reuse the class `.page`, so that bled in (huge padding, white-on-white
columns). `Pager.css` neutralizes it for interactive pages (`.pager { max-width:none; padding:0;
background:transparent }`, unlayered → wins over the theme layer). **Proper long-term fix:** give Page
views their own class (e.g. `.pg`) instead of overloading `.page`, or scope the generic rule — part of
the broader CSS revamp.

---

## Status — browser-verified

Screenshotted at desktop / tablet / mobile (own headless Playwright; the MCP browser stays locked).
Working: columns as clean cards on the app bg, breadcrumb trail, per-column ✕, horizontal scroll,
nested `tabs()` with the seamless active tab, full-width columns on mobile.

**Fixed during this pass:** switching away from a column left its descendant columns lingering —
because default-opened pages are activated directly (route.active stays false), the router's
deactivation cascade was skipped. `Pager.deactivate()` now cascades into `pg.pager.current` so the
whole active subtree closes.

## Open — responsiveness (ColumnPager)

- **Auto-hide ancestor columns** when they overflow (collapse leftmost into the breadcrumb) instead
  of horizontal scroll. Needs JS width measurement — the *hide-and-let-flex-reflow* idea.
- **Full-height frame.** `.col-root` uses `height: calc(100vh - 7em)` — a guess tied to the heading
  height. Proper fix: a full-height app shell so the row flexes into real space (scrollbar pinned to
  the bottom, no magic offset).
- **Mobile drill.** Default-open drills to the deepest child, but the full-width view can land on an
  ancestor (scroll vs. deepest). Consider not auto-drilling on mobile, or always scroll-to-deepest.
- **Close semantics.** ✕ navigates to the parent route; top-level ✕ resets to root. Revisit.

---

## Files

| File | Role |
|------|------|
| `Pager.js` / `.css` | base machinery + nested default |
| `TabPager.js` / `.css` | in-place tabs |
| `ColumnPager.js` / `.css` | flat columns + breadcrumb + close + responsive |

Browser-only (HashRouter needs `window`); verify via `core/Page/3/page.js`.
