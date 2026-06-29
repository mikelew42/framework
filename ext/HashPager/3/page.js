import { app, h2, el, div, p } from "/app.js";
import HashPager3, { page } from "./HashPager3.js";

app.$root.ac("pad");
el("style", `
    .pager { display: flex; gap: 1em; }
    .pager > .buttons { min-width: 10em; }
    .pager > .pages { flex: 1 1 0%; display: flex; gap: 1em; }
    .pager > .pages > * { flex: 1 2 0%; }

    .page { background: white; padding: 2em; max-width: 40em; min-width: 22em; flex: 1 1 0%; }
    .page > .buttons { margin-bottom: 1.5em; }
    .page > .buttons .button { margin-bottom: 0.5em; background: rgba(0,0,0,0.08); padding: 0.6em 1em; cursor: pointer; }
    .page > .buttons .button.active { background: rgba(0,0,0,0.2); font-weight: bold; }
`);

el("h1", "class HashPager3");
p("Flat-container columns + hash routing + lazy content. The root pager is auto-created on the first page() call.");

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
HashPager3.singleton().make(3);

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
