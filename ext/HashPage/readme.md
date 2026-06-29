# HashPage

First attempt at a multi-column hash-routed page hierarchy. Each page owns a `content` div
and a `children` div; sub-pages are rendered inside the parent's `children` div.

---

## How It Works

`HashPage` creates a nested DOM tree:

```
root.view
  .content   ← root's own content + nav buttons
  .children
    page-one.view
      .content   ← One's content + sub-nav buttons
      .children
        page-one-a.view
          .content
          .children
            ...
```

Each page is backed by a `HashRouter` route. Clicking a button calls `route.go()`, which
sets the hash; the router re-matches and calls `page.activate()`, which shows the page's
view and hides siblings.

The root page is special — it's a bare `div.c("page page-root")` created inline, not via
a route. Sub-pages auto-register via the captor pattern: any `new HashPage` created inside
a route's `initialize` callback is captured by the currently-active parent route.

---

## Key Files

| File | Role |
|------|------|
| `HashPage.js` | The class |
| `HashPage.css` | Referenced but minimal |
| `page.js` | Demo: root + One/A/B + Two/A/B |

---

## The Fundamental Problem

**Columns shrink with depth.** Because each page's children live *inside* the parent page's
DOM element, a flex layout means:

- Root gets 100% width, shows content + children side by side → each at 50%
- Level 1 page gets 50%, shows content + children → each at 25%
- Level 2 page gets 25% → 12.5%
- Three levels deep → unreadable

The `page.js` comment explains this directly and notes the fix: all columns must live in the
*same* flex container, not nested ones. That's what `HashPager` solves.

---

## What Was Tried

The hacky root mechanism (`HashPage.root` + `HashPage.captor`) was an attempt to allow
`page()` calls at module scope (outside any explicit parent) to auto-attach to the root.
The comment in `page.js` acknowledges it: "These root hash pages are hackily captured."

---

## Status

**Superseded by HashPager.** The nested-DOM column problem is inherent to this design.
Not worth fixing here when HashPager already moved the architecture in the right direction.

Keep for reference / compat, but don't build on it.

---

## Recommendation

Archive. Don't delete (it's a useful reference for the evolution), but don't extend or
invest in it. Anyone building a column-pager should start from `HashPager`.
