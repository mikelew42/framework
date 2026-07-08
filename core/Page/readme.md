# Page — module design doc

`Page` is the **noun**: a titled unit of content with children. A `Pager` is the **navigator**:
it decides how a Page's children are presented (columns / tabs) and routed. This is the top-level
design doc for the whole `core/Page/` module — the per-level readmes (`0/`, `1/`, `2/`, `3/`,
`Pager/`) hold the fine detail; this one holds the big picture, decisions, and paths forward.

> **Naming:** `Page` = class, `pg` = instance, `page()` = helper. Levels are named `Page0..Page3`
> (renamed from bare `Page` so `constructor.name` and stack traces disambiguate the level).

---

## Where we are (built + working)

### The progression
| level | adds |
|-------|------|
| `Page0` | minimal: title + content, `render(target)`, renders once, never self-renders |
| `Page1` | the `page()` helper + captor + sub-pages (`adopt`), root-collection |
| `Page2` | URL-addressable: `slug`, composes a `Pager` (hash routing) in `render_pages()` |
| `Page3` | **swappable Pager** via `static Pager` → the same content shows as columns or tabs |

`Page.js` re-exports the blessed default (`Page3`).

### The end-user toolbelt (Page3)
```js
import { page, tabs } from "/app.js";

page("Docs", () => {        // children → COLUMNS (Finder drill-down)   [ColumnPager]
    page("Guide", () => {}); // a column
    tabs("Settings", () => { // children → TABS (paper look)            [TabPager]
        page("Profile", () => {});
    });
});
```
- `page(name, fn)` → columns. `tabs(name, fn)` → paper tabs. `tabs.buttons(name, fn)` → button tabs.
- **The helper sets how a node lays out ITS children; a node's own appearance is decided by its
  parent.** So you nest freely: columns-in-a-tab, tabs-in-a-column, tabs-in-tabs.
- `pg.tab_full = true` → a full-width, full-height tab strip (top-level bars).

### Pagers (see `Pager/readme.md` for depth)
- **`Pager`** (base) — routes, nav buttons, lazy render, `activate/deactivate/current`, the
  create-all-then-match ordering. Two override seams: `container()` (where children mount) and
  `activated(pg)` (post-activate hook); plus `classify()` (tags the view with a CSS class).
- **`ColumnPager`** — the `page()` default. Every active page in a **contiguous column chain** is a
  column in one shared flat row → ancestors stay side-by-side. Breadcrumb + per-column ✕ + scroll.
- **`TabPager`** — in-place tabs. **The look is a CSS class, not a subclass**: `.paper-tabs`
  (default) / `.button-tabs`, plus `.full`. `classify()` reads `tab_style`/`tab_full` off the host.

### Recent fixes (see `Pager/readme.md`)
- **Deactivate cascade** — switching away from a page closes its active descendant subtree.
- **`root()` climbs the column chain** — a column section nested in a tab keeps its columns inside
  that tab (instead of escaping to the app root).
- **`activate_default()` on re-activation** — navigating away from a parent and back now re-opens its
  default child instead of returning to an empty page. (Default-open is now one method.)

---

## The Page ⇄ Pager interface

A Pager is `new Pager({ host: page })`, then talks to the host + children through this contract:

**Requires of `host` (a Page):**
| touchpoint | for |
|---|---|
| `host.view` | appends `{nav}` + `{pages}`, reads `.nav`, calls `.ac()` (classify / container) |
| `host.pages` | the child Pages to present |
| `host.route` | *optional* — host's own route, used as router parent (else `HashRouter.singleton()`) |
| writes `host.pager = this` | so descendants can walk the chain |

**Requires of each child `pg` (also a Page):**
- reads: `pg.title` (button text), `pg.slug` (route path), `pg.rendered` (lazy guard),
  `pg.view` (`.show()`/`.hide()`), `pg.pager` (nested cascade)
- calls: `pg.render(container)`
- stamps back: `pg.button`, `pg.route`

**Pager owns:** `current`, the `router`, the nav buttons, and
`activate / deactivate / activate_default / activated / classify / container`.

**Routing is welded into the base.** The button doesn't call `activate` directly — it routes:
`button.click → pg.route.go() → hashchange → route.match → activate(pg)`. Activation is **driven by
HashRouter**, not the click. This is the main thing a simpler, unrouted variant would peel off.

---

## The Switcher / Selection question (parked — decided to leave as-is for now)

We explored extracting the "one-of-many visible" core. The useful conclusion, kept for later:

- **Two roles, don't conflate them:** a **Switcher** is the *controller* (does activate/deactivate);
  a **selection** is the *state* it tracks (which member is current). (Earlier draft mislabeled the
  controller "Selection" — that named the state, not the controller.)
- **The real primitive is two layers:**
  - **`Toggle`** (atom) — one thing: active/inactive, `show()/hide()`, fires activated/deactivated.
    This is what **modal, drawer, tooltip, popover, one accordion panel** actually share.
  - **`Switcher`** (group policy) — "at most one active" over a set of toggles. This is what
    **tabs, single-open accordion, one-drawer-at-a-time, wizard step, `Pager.current`** share.
  - Most widgets need the atom, not the group. A single drawer/modal is a **boolean**, not a
    switcher. Multi-open accordion is N toggles. The *policy over a set* is the switcher — you get
    one **instance per group** (e.g. one managing `{left, right}` drawers), and they nest/cascade.
- **It's a selection model, not a general state machine** — states = members, transition =
  `activate(member)`. No guards/arbitrary edges. Don't build an FSM engine.
- **Undo alignment (the good idea, with a trap):** if `current` were a value in an **Item field**,
  `activate()` = `item.set(key, id)` and Item9's undo makes CTRL+Z revert a selection for free.
  But (a) selection-undo usually belongs in a *navigation* history, **not** the document edit stack
  (CTRL+Z after typing should undo text, not a tab click); and (b) **routed selections already have
  undo** — HashRouter back/forward *is* nav undo/redo. So don't hard-bake undo; instead make
  `current` a **get/set seam** (in-memory default, Item field opt-in) and **emit activate/deactivate
  events** so logging / keyboard / undo hook in without the core knowing.
- **Decision:** the only concrete win today is removing the duplication between `Pager.activate` and
  `ux/Tabs`'s `_apply`. Not worth a new abstraction until we next touch tabs. Left as-is.

---

## The auto-render dilemma

The deepest tension in the module — worked through live on `core/Page/page.js` (Auto-render tab).

**The two behaviors pull opposite ways.** Views **auto-render on create** — synchronous, ordered,
captured; it "just works". Pages are **dormant** — created but not rendered — so a module can
`export` a page without it drawing itself the moment it's imported.

**The App collector** bridges them: `App.load_page()` sets a Page captor that pushes created pages
into `collected[]`, dynamically imports the `page.js`, then renders them into `$root` **after** the
module finishes. Because that render is batched to the end, it **loses three things views give free**:
- **Order** — interleaved `p()` / `page()` / `p()` no longer renders top-to-bottom.
- **Capture** — a `page()` inside a `div(() => …)` or a `CodeEditor` can't render there.
- **Synchronicity** — the page appears a beat later, after the module settles.

**Why the collector exists — really only one reason.** (1) "root `p("hi")` just works" is actually
the *View* captor (`$root`), independent of the collector. (2) The real reason: **pages must be
exportable** — if they auto-rendered like views, `import X from "./somepage.js"` would draw X on
import, losing placement control.

**Why one magic `page()` can't do both:** JS can't tell statement position (`page(…)` on its own line
= "render here") from expression position (`export default page(…)` = "give me the value"). Same call.

**Proposed best-of-both — two explicit verbs (not magic):**
- `page(…)` / `tabs(…)` = **render here.** Inside a parent → adopt as child (unchanged). At the root →
  render **inline into the View captor** (ordered, captured, synchronous, like `div()`). This fixes the
  CodeEditor case *and* interleaving.
- `def(…)` (name TBD — `def` / `Page` / `page.def`) = **dormant value.** Creates, renders nothing,
  returns it. For `export default def("Docs", …)`. Import is always safe.
- Then `App.load_page()` drops the collector: set the View captor to `$root`, import, done. Safety
  comes from *which verb you chose*, not from batching.

**Rejected:** a single `page()` that sniffs entry-vs-dependency via `Error().stack` caller URL vs the
App's loading URL. Fragile (browser stack formats, minifiers), breaks under helper indirection, and is
spooky (same code behaves differently by who imported it). Explicit verbs match the framework's ethos.

**Related — the two-captor split** (also documented on the page): element helpers use the **View
captor**; `page()`/`tabs()` use the separate **Page captor**. Setting one doesn't set the other — which
is exactly why `page()` inside a `CodeEditor` (which only redirects the View captor) escapes to `$root`.
The general fix is: a render context should set **both**, or route `page()` through a Page captor whose
`adopt` renders into the same view.

**Status:** analysis + proposal only. No core change yet — `def()`'s name/ergonomics and whether the
common single-root case keeps a one-liner are open. Decide before implementing.

---

## Docs & viewing — the meta-goal (why any of this exists)

The Page/Pager/tabs system isn't the product; it's the **tool for building, organizing, and viewing
UI fast** — "see the right things in the right place." The pieces serve that:
- **`page.js`-per-directory** — every folder can auto-render a demo/doc page (this file is one). The
  convention: keep each class's page **very simple** — the 1–3 things that make it unique.
- **Tabs / columns / sub-pages** — organize many small demos so you can drill without losing context.
  (`core/Page/page.js` dogfoods this: its section tabs *are* `tabs()`.)
- **`CodeEditor`** (`ext/CodeEditor`) — code next to its rendered output, with a drag handle to resize
  → you see *exactly* what produces what, responsively. The `code.eval(src, fn)` form exists so the
  snippet can use the page module's scope (at the cost of `eval` + the two-captor gotcha above).
  Open question: is `eval` worth it, or should previews be plain functions passed in?
- **Responsiveness is a first-class requirement**, not a polish step — every layout above must collapse
  gracefully (see the Pager readme's styling factors: overflow menus, swipe, horizontal-list widget).

The through-line: **simple authoring, organized viewing, inherently responsive.** When a Page/Pager
decision is ambiguous, prefer whichever keeps *authoring a demo* a one-liner and *viewing it* obvious.

---

## Paths forward

### 1. `ui.tabs` — and the AI-generated `ux/Tabs` already exists
There is already a **`ux/Tabs/Tabs.js`** (AI-generated) — a self-contained tabbed View
(`{label, content}[]`, `select(i)`, eager panels, `.ux-tab` styling). It is a **parallel, simpler
reimplementation** of the same activate/show-hide logic as `Pager`, with **no routing and no lazy
render**. Two directions:
- **Consolidate:** extract the selection core (the Switcher above) and have both `ux/Tabs` **and**
  `TabPager` drive off it — one activation model, tested once.
- **Invert the dependency:** make `ui.tabs` the primitive and have the Page/Pager system *use*
  `ui.tabs` for its tab presentation (Page keeps routing + the Page contract on top). This is the
  cleaner long-term shape: tabs are a UI widget; Page adds routing/hierarchy.

Either way: pick one tab implementation. Right now we have two.

### 2. Rethink the default → customization path
Today customization is a mix: CSS classes (`paper-tabs`/`button-tabs`/`full`, `cols-*`), CSS tokens
(`--col-w`, `--col-max`, `--page-*`), and setting properties on the returned `pg` before render
(`tab_style`, `tab_full`). Open questions: how does an end user get a **handle** to the nav/buttons
view to `.ac()` them? A config object at `page()`/`tabs()` call sites? Per-page overrides? (`pg.pager`
only exists *after* render — lazy — so creation-time config needs its own path.) See factors below.

---

## Styling / layout factors to design for

A wide range of real-world layouts needs to be expressible. Capturing the axes so the customization
API is designed against them (not one-off patched). **Routing caveat** noted per factor — most are
routing-independent, which is the real argument for a simpler, testable, unrouted core: you can build
and prove all of this *without* routing in the way.

- **Overridable defaults, no class-fighting.** Default should be white-bg / paper so you don't have
  to *remove* a class to restyle. Idea: define base styles in a low-priority CSS `@layer`
  (`base`/`theme`) so a plain `.ac("my-look")` overrides **without specificity fights**. Goal:
  customize by *adding*, never by *undoing* the default. *(routing: none)*
- **Button styling + a handle.** Want a grip on the nav/buttons view to `.ac()` / restyle (e.g. a
  `tabs.buttons` view handle). *(routing: none — buttons exist routed or not)*
- **Breadcrumbs.** Same underlying "list of buttons," but usually placed/styled differently from the
  tab bar. *(routing: THIS one is route-specific — a breadcrumb is the active **route trail**;
  unrouted tabs have no natural breadcrumb. Breadcrumb belongs to the routed layer.)*
- **Padded vs full-width / bg, and "squeeze".** The whole tab system, the buttons, and the pages each
  independently want either full-bleed (background spans the width) or centered-with-max-width. Likely
  needs an extra wrapper: `.pages` goes full-width (for bg), with `.pages > .pages-layout` doing
  max-width + centering (**"squeeze"**). *(routing: none — pure layout)*
- **Border & radius** on every element (bar, buttons, content). *(routing: none)*
- **Background color(s) + active styles** for every element. *(routing: none)*
- **Box shadows.** Tricky with the paper-tab look — getting the active tab to *flow* into the content
  without a seam, and without the shadow getting clipped by overflow. *(routing: none)*
- **Mobile / responsive.** Collapse overflowing buttons/breadcrumbs (into a menu, or partial-collapse
  + "more" button), horizontal swipe, etc. Probably belongs in a **generic "horizontal list" UI
  component** (swipe / partial-collapse+button / overflow menu) that both the tab bar and the
  breadcrumb reuse. *(routing: none — a horizontal-list widget is routing-agnostic; it just needs to
  know which item is "current")*
- **Horizontal vs vertical tabs.** Orientation of the nav strip. *(routing: none)*

**Summary of routing's actual caveats** (what a simpler core *doesn't* have to deal with): (1) URL as
source of truth — activation driven by `route.match`, not the click; (2) the create-all-then-match
ordering constraint; (3) breadcrumbs as a routed concept; (4) back/forward giving free selection
undo. Everything visual/layout above is independent of routing — so the value of a decoupled
tab/switcher core is **testability and simplicity**, not a need for unrouted pages per se (unrouted
pages are rarely wanted on their own).

---

## Files
```
core/Page/
  Page.js            → re-exports Page3 (blessed default)
  readme.md          ← this doc
  0/ 1/ 2/ 3/        Page0..Page3 (+ page.js demos, per-level readmes)
  Pager/
    Pager.js/.css        base machinery + nested default
    ColumnPager.js/.css  flat columns + breadcrumb + close + width options
    TabPager.js/.css     paper / button looks (a class, not a subclass) + full
    readme.md            Pager design doc + style guide
```
Related, elsewhere: `ext/HashRouter/` (routing), `ux/Tabs/` (parallel AI-generated tabs widget),
`ui/ui.js` (control factories).
