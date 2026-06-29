# Router — pushState Routing

> **Status: Not yet implemented. Design deferred — see decision note below.**

A planned `pushState`-based router to complement the existing `HashRouter`. Where `HashRouter` encodes sub-navigation state in the URL hash (`#tools/layers`), `Router` would own the real path (`/notes/drafts/`) and handle top-level page resolution.

---

## Problem Statement

The current system loads `page.js` by mapping `window.location.pathname` directly to a file on disk. This works perfectly for exact paths (`/notes/` → `/notes/page.js`). It breaks for **dynamic sub-paths** — when `/notes/page.js` wants to own `/notes/drafts/` and `/notes/archive/` without those directories or `page.js` files existing on disk.

---

## Proposed Design

### Walk-Up Resolution

When no `page.js` exists at the exact pathname, the router walks up the path tree until it finds one:

```
Request: /notes/drafts/
  Try:  /notes/drafts/page.js   → not found
  Try:  /notes/page.js          → found ✓

Request: /app/workspace/canvas/
  Try:  /app/workspace/canvas/page.js  → not found
  Try:  /app/workspace/page.js         → not found
  Try:  /app/page.js                   → found ✓
```

The owning `page.js` receives the unmatched remainder as route params:

```js
// in app.js router
function resolve_page(pathname) {
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  while (parts.length >= 0) {
    const candidate = '/' + parts.join('/') + '/page.js';
    if (page_exists(candidate)) {
      const rest = pathname.slice(('/' + parts.join('/')).length);
      return { page: candidate, rest };
    }
    if (!parts.length) break;
    parts.pop();
  }
  return null;
}
```

The `page.js` then handles its own sub-routing — via `HashRouter`, its own mini-router, or whatever it needs.

### Navigation

```js
Router.go('/notes/drafts/');       // history.pushState + load page
Router.replace('/notes/drafts/');  // history.replaceState (no new history entry)
Router.back();                     // history.back()
```

Browser back/forward work natively since `pushState` is used throughout.

---

## Open Question: How to Know Which Paths Exist?

The walk-up algorithm needs to check whether a `page.js` exists before trying to fetch it. Two options were considered:

### Option A — Rely on `directory.json`

`directory.json` is already a full filesystem listing. The router could check it to avoid unnecessary fetches.

**Pros:** Fast, synchronous lookup once loaded, no extra network round trips.  
**Cons:** `directory.json` is a build artifact that can go stale. Couples the router to a specific infrastructure detail that may not always be present. Makes the router harder to use in other contexts.

### Option B — Try the fetch, handle 404

Just attempt `fetch('/notes/drafts/page.js')`. If 404, walk up and try again.

**Pros:** No dependency on `directory.json`. Works in any environment.  
**Cons:** Extra network round trips per navigation. Noticeable latency on deep paths.

### Option C — Explicit route registration

`page.js` files declare their sub-routes explicitly:

```js
// /notes/page.js
export const routes = ['/notes/drafts/', '/notes/archive/', '/notes/:id/'];
```

Router loads these at startup (or lazily) to build a manifest.

**Pros:** Precise. No guessing, no stale data.  
**Cons:** Manual — devs must remember to update `routes`. Breaks the "just add a page.js" zero-config feel.

---

## Decision: Deferred

**Decided 2026-06-28 — do not implement yet.**

The pushState router is architecturally sound but the right implementation path isn't settled:

- Option A (directory.json) creates an infrastructure coupling we're not sure we want.
- Option B (fetch+fallback) has latency we haven't validated as acceptable.
- Option C (explicit routes) adds manual registration that works against the zero-config philosophy.

The current page system (exact-path `page.js` loading + `HashRouter` for sub-navigation) handles the real use cases well today. Revisit when there's a concrete case where a `page.js` genuinely needs to own dynamic real-path sub-routes and `HashRouter` can't fill the gap.

When revisiting, consider whether this belongs in `app.js` (the loader) rather than as a standalone framework module — the walk-up logic is small and the loader already owns pathname resolution.

---

## Relationship to HashRouter

`HashRouter` (`ext/HashRouter/`) handles sub-navigation *within* a page via the URL hash. The two are complementary and non-overlapping:

| | Router (pushState) | HashRouter |
|---|---|---|
| Owns | `/real/path/` | `#sub/route` |
| Scope | Top-level page resolution | In-page state |
| Anchor `#id` links | ✓ works | ✗ conflicts |
| Server catch-all needed | yes | no |
| Browser history | native | native |

A page loaded by `Router` can freely use `HashRouter` for its own sub-navigation. They do not interfere.
