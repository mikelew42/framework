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
Base behavior + a **styling class** (no bespoke layout code). The active child renders under a tab
strip; ancestors stack vertically. Best when children are **panels of one thing** (settings, a
wizard) rather than a drill-down. Two looks, chosen by a class (not a subclass):

| look | class | helper | feel |
|------|-------|--------|------|
| **paper** (default) | `.paper-tabs` | `tabs()` | white; the active tab flows into the content, inactive tabs dimmed — document-like |
| **button** | `.button-tabs` | `tabs.buttons()` | pill buttons; accent-colored active — toolbar-like |

Set `pg.tab_full = true` for a **full-width, full-height** strip (top-level tab bars that fill the
screen — the active panel takes the remaining height). `classify()` reads `tab_style`/`tab_full`
off the host and tags the view; since the look is purely a class, a full subclass would be overkill
(see design note below).

### `ColumnPager` — columns (the `page()` default)
Every active page in a **contiguous column chain** is a column in **one shared flat row** (created
on the chain's top page), so ancestors stay visible **side-by-side** — no nested-DOM shrinkage.
Because the row roots to the *chain* top (not the whole app), a column section nested inside a tab
keeps its columns **inside that tab**. Adds:
- **breadcrumb** — the real `/page.js` path → active hash trail, for jump-back nav
- **per-column close (✕)** — drops the column + its descendants (navigates to the parent route)
- **horizontal scroll** to reveal the newest column
- **mobile** — full-width columns (swipe one at a time; breadcrumb + ✕ to move)
- **column-width options** — see the style guide below

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

## Style guide — layout options (classes)

Presentation is driven by **classes** you can add, plus the CSS tokens below. Live examples on the
demo page (`core/Page/3/`, the **Styles** tab).

### Tab looks (on the `.tab-pager`)
| class | effect |
|-------|--------|
| `.paper-tabs` | white, active flows into content, inactive dimmed *(default)* |
| `.button-tabs` | pill buttons, accent-colored active |
| `.full` | full-width strip (tabs grow equally) + fills height so the panel takes the rest |

Set via `tabs()` / `tabs.buttons()` and `pg.tab_full = true` — no need to touch the class directly.

### Column widths (on the `.col-root`)
| class | effect |
|-------|--------|
| *(default)* | fixed `--col-w`, never shrinks → the row scrolls horizontally |
| `.cols-narrow` / `.cols-wide` | fixed, 18em / 32em |
| `.cols-even` | every column shares the row equally (no scroll) |
| `.cols-fill` | columns grow to fill, capped at `--col-max` |

Or just set `--col-w` / `--col-max` anywhere (`:root`, a page `<style>`, the `.col-root`).

---

## Theming (CSS variables)

Each Pager ships its own CSS, but the look is driven by tokens on `:root` (in `Pager.css`) — override
them anywhere (a page's `<style>`, app theme, or `.col-root`) to retheme without touching the Pagers:

| token | default | controls |
|-------|---------|----------|
| `--col-w` | `24em` | column width (fixed / fill basis) |
| `--col-max` | `40em` | cap for `.cols-fill` columns |
| `--page-card` | `#fff` | column / tab-content background |
| `--page-line` | `rgba(0,0,0,.12)` | borders |
| `--page-accent` | `#3b82f6` | active column button / button-tab |
| `--page-muted` | `#6b7280` | breadcrumb + dimmed paper-tabs text |

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

Screenshotted via own headless Playwright (the MCP browser stays locked). Working: full-screen
top **paper tabs** filling the viewport, columns nesting **inside** a tab (breadcrumb + drill-down
stay in the tab), tabs-in-tabs with mixed looks, and the live style guide (tab looks, column-width
options, theme tokens). Zero console errors on load + navigation.

Earlier pass: columns as clean cards on the app bg, breadcrumb trail, per-column ✕, horizontal
scroll, full-width columns on mobile.

**Fixed:** switching away from a column left its descendant columns lingering — because
default-opened pages are activated directly (route.active stays false), the router's deactivation
cascade was skipped. `Pager.deactivate()` now cascades into `pg.pager.current` so the whole active
subtree closes.

**Fixed:** the default child didn't re-open when you navigated away from a parent and back — it only
default-opened at pager construction. Since the deactivate cascade clears the child pager's `current`,
returning showed an empty page. `activate()` now calls `pg.pager.activate_default()` after showing a
page, so a revisited parent re-opens its default child (a later deep-link route match still overrides
it, synchronously, before paint). Default-open is now one method: `Pager.activate_default()`.

## Open — design direction (raised, not yet done)

- **Collapse the pager variants toward classes, not subclasses.** `TabPager` is now *just* a class
  toggle (`.paper-tabs` / `.button-tabs` / `.full`) — no unique layout code. The natural next step
  is to drop the subclass and have `tabs()` do `pager.ac(...)` on the base Pager, so we keep the nice
  `page()` / `tabs()` API with fewer classes. `ColumnPager` stays a real subclass (it overrides
  `container()`). Part of the broader "**too many progressions — consolidate as things stabilize**"
  push (see CLAUDE.md).
- **A `.breadcrumb()` seam on the base Pager.** Breadcrumbs and a tab strip are arguably the *same
  buttons* rendered differently. Idea: the base builds `buttons`, and a class on the pager renders
  them as **tabs**, **breadcrumbs**, or **neither** (buttons live inside each page instead). Would let
  ColumnPager's breadcrumb become a shared, configurable method rather than bespoke code.
- **A "switcher" default?** Open question whether the *default* pager should fully swap content
  (activating a page replaces 100% of the panel) rather than columns — i.e. `pager > pages > page`,
  one visible at a time. The base `Pager` (nested show/hide) is already close; it just needs a helper.

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
