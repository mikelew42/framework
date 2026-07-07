# Page/0 — Minimal MVP

The "learning class" for the Page system. A `Page` is **the thing that lives at a `/path/`** —
a document. This level is the smallest version that teaches the core idea, with **no routing,
no sub-pages, no pager**. Just: a titled unit of content that renders into a container *when
told to*.

> Naming note: `Page` is the class, `pg` is an instance, `page()` is the helper (added in Page/1).
> We reserve "Page" for `/path/` documents — HashPager's swappable panels are a *different*
> concept and should not be called Pages.

---

## The One Big Rule: A Page Never Renders Itself

This is the whole design. Construction only *registers* the page; it never touches the DOM.
Something else decides when to render:

- **The root document** → rendered by `App.load_page()` (the path the browser navigated to).
- **A sub-page** (Page/1) → rendered by its parent when the parent runs its content fn.
- **An imported page** → stays dormant until the importer calls `pg.render(target)`.

This inverts the usual "auto-run on import" default and makes the three cases fall out for free
(see "Why" below). No `is_page_file()` stack-sniffing needed.

---

## API (Page/0)

```js
import Page from "/framework/core/Page/0/Page0.js";

const pg = new Page({
    title: "Getting Started",
    content: (pg) => {            // content is a fn (run at render time) or a View/string
        h1(pg.title);
        p("Welcome.");
    }
});

// nothing has rendered yet — pg is dormant

pg.render(app.$root);            // NOW it renders into the given container
```

### Shape

| Member | Role |
|--------|------|
| `title` | Display title (also future `<title>` / meta source) |
| `content` | A fn `(pg) => {...}`, or a View/string — the body |
| `render(target)` | Render `content` into `target`. Idempotent. Returns `pg`. |
| `rendered` | Flag — render once, no-ops on repeat |

Constructor follows the framework standard: `constructor(...args){ this.assign(...args) }`
(`assign` = `Object.assign(this, ...args)`), so `new Page({ title, content })` works in any order.

---

## render()

```js
render(target){
    if (this.rendered) return this;       // idempotent
    this.rendered = true;
    this.view = div.c("page", () => {
        // content fn runs with the page view as captor, so helpers (h1, p…) land inside
        if (is.fn(this.content)) this.content(this);
        else this.view.append(this.content);
    }).append_to(target);
    return this;
}
```

The content fn runs *inside* `render`, captured by the page's own view — so `h1()`, `p()`, etc.
called in the fn land in the page. This is the same captor mechanic the rest of the framework uses.

---

## Why "never self-render" (the payoff, realized in Page/1 + App)

`App.load_page()` will, after dynamically importing the URL's `page.js`, render whatever root
pages were created during that import (`Page.roots`). Because pages don't render themselves:

1. `export default page(...)` → App renders it. Export still allows importing/SSG. ✓
2. bare `page(...)` no export → App still renders it (it's in `Page.roots`). ✓
3. imported from another module → dormant; nothing flushes it there, so it waits for an
   explicit `.render()`. ✓

Page/0 doesn't implement `Page.roots` or the helper — it just establishes the *contract*
(never self-render) that makes all of the above possible. Page/1 adds the helper + flush.

---

## Deliberately NOT in Page/0

- No `page()` helper (→ Page/1)
- No sub-pages / children / nesting (→ Page/1 via HashPager)
- No HashRouter / hash segments (→ Page/1)
- No `Page.roots` flush wiring in App (→ Page/1)
- No lazy-on-activate (→ Page/1)

Keep this level tiny: it should make the "a page is a dormant, titled, render-on-demand unit"
idea obvious at a glance.

---

## Files (planned)

| File | Role |
|------|------|
| `Page0.js` | The minimal class |
| `Page0.node.test.js` | Test3 suite — construct dormant, render once, idempotent |
| `page.js` | Browser demo |

---

## Note on `core/Page/Old_App_Like_Page.class.js`

That file is an **older, unrelated experiment** — essentially a fork of `App.js` that loads real
sub-`page.js` files by filesystem path (`load_sub_page`). It is *not* this Page system. It was
renamed from `Page.class.js` → `Old_App_Like_Page.class.js` so the `Page.class.js` name could be
reused for the blessed re-export (`Page.class.js → ./3/Page3.js`), freeing the lowercase `page.js`
for a demo page. Kept for reference; retire when nothing needs it.
