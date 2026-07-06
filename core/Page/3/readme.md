# Page/3 — swappable Pager (columns vs tabs)

Page/2 hard-wired one navigation style. Page/3 makes it a **choice** via `static Pager`, and ships
two toolbelt helpers that are explicit about what you get:

| helper | children laid out as | Pager |
|--------|----------------------|-------|
| `page("X", fn)` | **columns** (infinite nestable, Finder-style) — *default* | `ColumnPager` |
| `tabs("X", fn)` | **tabs** (in-place, indented panels) | `TabPager` |

Both create a `Page`; they differ only in `static Pager`. Promoted default — `import { page, tabs }
from "/app.js"`.

---

## The rule (composability)

**The helper you use sets how THAT node lays out ITS children.** A node's own appearance (column
vs tab) is decided by its parent. So they nest freely:

```js
page("Docs", () => {          // Docs' children are COLUMNS
    page("Guide", () => {});   // a column; its own children would be columns too
    tabs("Settings", () => {   // a column, but ITS children are TABS
        page("Profile", () => {});   // a tab
    });
});
```

---

## How it works

```js
export default class Page extends Page2 {
    static Pager = ColumnPager;
    render_pages(){
        if (!this.pages?.length) return;
        new this.constructor.Pager({ host: this });   // the Pager sets this.pager
    }
}
class TabsPage extends Page { static Pager = TabPager; }

export const page = (name, fn) => create(Page,     name, fn);   // columns
export const tabs = (name, fn) => create(TabsPage, name, fn);   // tabs
```

`render_pages()` is the only override vs Page/2 — it instantiates `this.constructor.Pager` instead
of a fixed class. Everything else (slug, dormancy, captor, routing) is inherited. See
`core/Page/Pager/readme.md` for the Pager variants and the open responsiveness questions.

---

## Why columns is the default

Tabs are *in-place* — they read as "panels of one thing," less like navigating between pages.
Columns keep the trail visible and feel pagey (each pick is a place you can deep-link to). So
`page()` defaults to columns and `tabs()` is the opt-in for panel-style grouping. (This also frees
the `tabs`/`tab` vocabulary to mean what `HashTabs` always meant.)

---

## Status

Built & promoted. Node suite covers the config logic (which Pager each helper picks, inheritance,
captor — inherits Page0–2). Layout/routing is browser-only; verify via `page.js`.

**Not yet verified in-browser** (column layout, breadcrumb, close, mobile reflow) — see the
responsiveness open questions in the Pager readme.

## Files

| File | Role |
|------|------|
| `Page3.js` | swappable `static Pager`; `page()` + `tabs()` helpers |
| `Page3.node.test.js` | helper → Pager mapping, inheritance, captor |
| `page.js` | demo: columns with a nested tabs section |
