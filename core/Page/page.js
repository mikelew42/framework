import { app, el, div, h1, h2, h3, p, a, ul, li, span, strong, code, page, tabs } from "/app.js";

/* Index + design doc for the Page module — auto-loads at /framework/core/Page/.
   Goal: explain the BASICS simply, then work through the auto-render dilemma
   (why page() is dormant, what the App collector costs, and a best-of-both plan).

   This page dogfoods the system it documents: the section tabs below ARE tabs(),
   so reading it is also a live demo. */

app.$root.ac("pad");

el("style", `
    .doc { max-width: 54em; }
    .doc pre.code {
        background: #1e1e2e; color: #e7e7f2; border-radius: .5em;
        padding: .9em 1.1em; margin: .7em 0; overflow-x: auto;
        font-size: .82em; line-height: 1.55; white-space: pre;
    }
    .doc .note {
        border-left: 3px solid #e0b03f; background: #fff8e6;
        padding: .6em .9em; border-radius: 0 .3em .3em 0; margin: .8em 0;
    }
    .doc .note.good { border-left-color: #3fae5a; background: #eefaf0; }
    .doc .note.bad  { border-left-color: #e0574a; background: #fdefed; }
    .doc h3 { margin: 1.5em 0 .3em; }
    .doc h2 { margin: .2em 0 .4em; }
    .doc li { margin: .25em 0; }
    .doc p, .doc li { line-height: 1.6; }
`);

// ── tiny inline-markdown: **bold**, `code`, and bold-containing-code ──────────
// frag() appends text into the current captor, turning `x` into <code>.
function frag(text){
    text.split(/(`[^`]+`)/g).forEach(seg => {
        if (!seg) return;
        if (seg[0] === "`" && seg.endsWith("`")) code(seg.slice(1, -1));
        else span(seg);
    });
}
// md(...) → a <p> with **bold** and `code` (bold may contain code).
function md(...segs){
    return p(() => segs.forEach(text =>
        text.split(/(\*\*[^*]+?\*\*)/g).forEach(part => {
            if (!part) return;
            if (part.startsWith("**") && part.endsWith("**")) strong(() => frag(part.slice(2, -2)));
            else frag(part);
        })
    ));
}
// li with inline markdown
const mli = (t) => li(() => frag_bold(t));
function frag_bold(text){        // same as md's inner, but into the current <li>
    text.split(/(\*\*[^*]+?\*\*)/g).forEach(part => {
        if (!part) return;
        if (part.startsWith("**") && part.endsWith("**")) strong(() => frag(part.slice(2, -2)));
        else frag(part);
    });
}
// code block (trims outer blank lines)
const cb = (t) => el("pre", t.replace(/^\n+/, "").replace(/\s+$/, "")).ac("code");

// ── Landing (renders inline into $root, BEFORE the tabs) ──────────────────────
div.c("doc", () => {
    h1("class Page");
    md("**Page** is the noun — a titled unit of content with children. **Pager** is the navigator — it decides how a page's children appear (columns / tabs) and wires routing. A page never renders itself; someone calls `render(target)` (the App, a parent's Pager, or you).");
    md("The helpers: `page(\"Title\", fn)` lays a node's children out as **columns**; `tabs(\"Title\", fn)` as **tabs**. The rule that trips everyone up:");
    div.c("note", () => md("**The helper you call sets how a node lays out ITS children. A node's own appearance is decided by its PARENT.** So you nest freely: columns in a tab, tabs in a column, tabs in tabs."));
});

// ── The section tabs (this is itself a live tabs() demo) ──────────────────────
tabs("Page docs", () => {

    // ---- BASICS ----------------------------------------------------------------
    page("Basics", () => div.c("doc", () => {
        h2("The mental model");
        ul(() => {
            mli("**Page = data.** Title + content + a list of child pages. Dormant until rendered.");
            mli("**Pager = presentation.** One per page that has children. Picks columns vs tabs, owns the nav buttons, show/hide, and routing.");
            mli("**Router = URL.** One global `HashRouter`; every pager registers its children's routes into it. (Selection is per-group; the URL is global.)");
        });

        h3("Sub-page vs root");
        md("Where you *call* `page()` decides what it becomes:");
        ul(() => {
            mli("**Inside** another page's content fn → adopted as a **child** (the parent's Pager lays it out).");
            mli("**At the top level** of a `page.js` → a **root** (the App renders it — see the Auto-render tab).");
        });
        cb(`page("Docs", () => {        // Docs's children -> COLUMNS
    page("Guide", () => {});    // a column of Docs
    tabs("Settings", () => {   // Settings's children -> TABS
        page("Profile", () => {});
    });
});`);

        h3("Construction");
        md("`constructor()` -> `assign()` -> `instantiate()` -> `initialize()`. A page only *stores* its args until `render(target)` is called. `render()` is idempotent (renders once); children render lazily on first activation.");
    }));

    // ---- TWO CAPTORS -----------------------------------------------------------
    page("Two captors", () => div.c("doc", () => {
        h2("There are two separate captor stacks");
        md("This is the single biggest source of confusion. Element helpers and `page()` capture into **different** places:");
        ul(() => {
            mli("**View captor** — element helpers (`div`, `p`, `h1`) append into the *current view*. Set by `div(() => ...)`, `view.append(fn)`, or the App (`View.set_captor($root)`).");
            mli("**Page captor** — `page()` / `tabs()` adopt into the *current page*. Set while a page renders its content. If none is active, `page()` becomes a root.");
        });
        div.c("note", () => md("`div()` follows the **View** captor. `page()` follows the **Page** captor. They are independent — setting one does **not** set the other."));

        h3("Why this bites (the CodeEditor case)");
        md("A `CodeEditor` runs your snippet inside `content.append(fn)`, which sets only the **View** captor. So `div(\"x\")` lands in the editor's viewport — but `page(\"x\", ...)` follows the **Page** captor, which is still the App's root-collector, so the page renders **outside** the editor (down in `$root`). Nothing throws; it just lands in the wrong parent.");
        div.c("note bad", () => md("Symptom: `div()` shows inside the code preview, `page()` appears below it. Cause: two captors — the preview only redirected one of them."));
        md("Fix shape: whatever sets up a render context (App, CodeEditor, a parent page) should set **both** captors — or route `page()` through a Page captor whose `adopt` renders into the same view. See Auto-render for the general resolution.");
    }));

    // ---- AUTO-RENDER DILEMMA (the requested deep dive) -------------------------
    page("Auto-render", () => div.c("doc", () => {
        h2("The auto-render dilemma");
        md("**Views auto-render on create** — synchronous, ordered, captured. It just works. **Pages are dormant** — created but not rendered — so a module can `export` a page without it drawing itself the moment it's imported. Those two behaviors pull in opposite directions. This is the core tension of the whole system.");

        h3("What the App collector does");
        md("`App.load_page()` sets a Page captor whose `adopt` pushes into a `collected[]` array, dynamically imports the `page.js`, then — **after** the module finishes — renders every collected page into `$root`:");
        cb(`Page.set_captor({ adopt: (pg) => collected.push(pg) });
const mod = await import(pageUrl);              // your page.js body runs here
for (const pg of collected) pg.render($root);   // ...rendered only AFTER`);

        h3("What that costs");
        md("Because rendering happens *after* the module runs, batched to the end, you lose the three things views give you for free:");
        ul(() => {
            mli("**Order** — interleaved `p()` / `page()` / `p()` no longer renders top-to-bottom; the pages jump to the end.");
            mli("**Capture** — a `page()` written inside a `div(() => ...)` or a CodeEditor can't render there; it's collected globally instead.");
            mli("**Synchronicity** — the page appears a beat later, after the whole module (and its async imports) settle.");
        });

        h3("Why the collector exists (two reasons)");
        ul(() => {
            mli("**1. Root content should “just work.”** `p(\"hi\")` at the top of a page.js renders into `$root`. — Actually this is the **View** captor (App sets `$root`), *independent* of the page collector. So this reason doesn't really need the collector.");
            mli("**2. Pages must be exportable.** If pages auto-rendered like views, then `import X from \"./somepage.js\"` (where somepage exports a `page()`) would **draw it on import** — you'd lose all control of placement. **This** is the real reason pages are dormant.");
        });

        h3("Why one magic page() can't do both");
        md("The author's *intent* differs, but the call looks identical:");
        ul(() => {
            mli("`page(\"X\", ...)` on its own line → “render it **here**” (statement / side-effect).");
            mli("`export default page(\"X\", ...)` → “give me the **value** to place later” (expression).");
        });
        md("JavaScript can't tell statement position from expression position at runtime — both invoke `page()` the same way. So a single helper can't reliably know which you meant.");

        h3("Best-of-both: two explicit verbs");
        div.c("note good", () => md("Make the intent explicit instead of magic. `page()` renders; `def()` defers. One rule, consistent with views (`div()` renders; `new View({capture:false})` defers)."));
        ul(() => {
            mli("**`page(...)` / `tabs(...)` = render here.** Inside a parent page → adopt as child (unchanged). At the root → render **inline into the View captor**, so it's ordered, captured, synchronous — exactly like `div()`. Fixes the CodeEditor case and interleaving.");
            mli("**`def(...)` (or `Page(...)`) = dormant value.** Creates the page, renders nothing, returns it. Use for `export default def(\"Docs\", ...)`. Importing it is always safe — no captor can make it draw.");
        });
        md("Then `App.load_page()` drops the collector entirely: set the View captor to `$root`, import, done. Top-level `page()` calls render inline; `def()` never renders. The safety comes from **which verb you chose**, not from batching.");
        cb(`// entry page.js -- renders inline, in order
p("intro");
page("Live", () => { ... });   // renders right here, after "intro"
p("outro");                    // correct order

// reusable module -- exported, NOT rendered on import
export default def("Docs", () => { ... });`);

        h3("The rejected “magic” option");
        md("You *could* keep one `page()` and detect entry-vs-dependency at runtime: compare the caller's module URL (from `Error().stack`) against the URL the App is currently loading — auto-render only when they match. Rejected because:");
        ul(() => {
            mli("Stack formats differ across browsers and break under minifiers.");
            mli("Indirection breaks it — a `page()` called from a shared helper is attributed to the helper's module, not your entry.");
            mli("It's spooky: identical code behaves differently depending on who imported it.");
        });
        md("Two named verbs are simpler, explicit, and match the framework's ethos. Door left open if a compelling need appears.");

        h3("Open question");
        md("`def()` still needs a good name and ergonomics — is it `def()`, `Page()`, `page.def()`? And should the entry `page.js` get any sugar so the common case (one root page) stays a one-liner? TBD.");
    }));

    // ---- LEVELS ----------------------------------------------------------------
    page("Levels", () => div.c("doc", () => {
        h2("Progression");
        md("Each level is fully usable on its own; `Page.class.js` re-exports the blessed default (Page3).");
        ul(() => {
            [["0", "minimal: title + content, render(target)"],
             ["1", "page() helper + captor + sub-pages (adopt)"],
             ["2", "URL-addressable: slug + Pager (hash routing)"],
             ["3", "swappable Pager — page() = columns, tabs() = tabs  (default)"]].forEach(([n, d]) =>
                li(() => { a(`Page${n}`).href(`./${n}/`); span(` — ${d}`); }));
        });
        p(() => a("Full columns + tabs demo").href("./3/"));
    }));
});
