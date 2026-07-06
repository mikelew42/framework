import { app, h2, el, div, p } from "/app.js";
import HashPager3, { page } from "./HashPager3.js";

app.$root.ac("pad");
el("style", `
    /* fill the viewport height so the horizontal scrollbar sticks near the
       bottom instead of floating mid-page. (Proper fix is a full-height app
       shell; this vh approach is the demo-level version.) */
    .pager { display: flex; gap: 1em; height: calc(100vh - 9em); }
    .pager > .buttons { min-width: 10em; overflow-y: auto; }
    /* flat column container: scroll horizontally when the active path is deeper
       than the viewport. min-width:0 is REQUIRED — flex items default to
       min-width:auto, which would expand the row instead of letting it scroll. */
    .pager > .pages { flex: 1 1 0%; min-width: 0; overflow-x: auto; display: flex; gap: 1em; }

    /* fixed-width columns that don't grow/shrink → they overflow → scroll.
       each column fills the row height and scrolls its OWN vertical content. */
    .page { background: white; padding: 2em; flex: 0 0 26em; overflow-y: auto; }
    .page > .buttons { margin-bottom: 1.5em; }
    .page > .buttons .button { margin-bottom: 0.5em; background: rgba(0,0,0,0.08); padding: 0.6em 1em; cursor: pointer; }
    .page > .buttons .button.active { background: rgba(0,0,0,0.2); font-weight: bold; }

    /* mobile: near-full-width columns → swipe one at a time */
    @media (max-width: 40em) { .page { flex-basis: 85vw; } }
`);

el("h1", "class HashPager3");
p("Flat-container columns + hash routing + lazy content. The root pager is auto-created on the first page() call.");

el("style", `.takeaways{background:#fffbe6;border-left:4px solid #f5b300;padding:.7em 1em;margin:.4em 0 1.5em;max-width:46em;border-radius:.2em}.takeaways b{display:block;margin-bottom:.3em}.takeaways p{margin:.2em 0}`);
div.c("takeaways", () => {
    el("b", "What makes HashPager3 unique");
    p("• Flat columns (no shrinkage) + horizontal scroll when the active path is deeper than the viewport.");
    p("• Subclass with ZERO plumbing (this-scoped statics) — see FancyPager below; this fixes the /2 pain.");
    p("• Lazy CONTENT only (the card shell is eager). Page/2's Pager is more fully lazy — it defers the whole view.");
});

// --- root-level pages (auto-captured by the singleton pager) ---

page("Test", (tpg) => {
    h2("Lazy content");
    p("This content only rendered when you first opened this page — sub-pages stay dormant until visited.");
}).activate();   // open the first page by default

page("One", (one) => {
    h2("Page One");
    p("Open a sub-page — it appears as a NEW column beside this one (flat container, no shrinkage).");
    page("A", () => p("You are on One / A"));
    page("B", () => p("You are on One / B"));
});

page("Two", (two) => {
    h2("Page Two");
    page("A", () => p("You are on Two / A"));
    page("B", () => {
        h2("Two / B");
        page("Deep", () => p("You are on Two / B / Deep — columns keep their width."));
    });
});

// --- stress test: a recursive hierarchy with unique, non-numeric slugs ---
HashPager3.singleton().make(4);

// --- extensibility proof: a subclass with zero manual plumbing ---
// (HashPager/2 needed 3 lines to wire the singleton/captor; HashPager3's
//  this-scoped statics make `extends` just work.)
class FancyPager extends HashPager3 {
    render(){
        super.render();
        this.view.ac("fancy");   // subclass customization
    }
}
FancyPager.page("Fancy", (f) => {
    h2("FancyPager");
    p("Rendered by a HashPager3 SUBCLASS — no manual captor/singleton plumbing required.");
    FancyPager.page("Nested", () => p("Subclass nesting works too."));
});
