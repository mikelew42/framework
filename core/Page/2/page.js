import { app, el, div, h1, h2, h3, p } from "/app.js";
import { page } from "./Page2.js";
import test_obj from "./Page2.node.test.js";

app.$root.ac("pad");
el("style", `
    .page { margin-bottom: .5em; }
    .page > .nav { display: flex; flex-wrap: wrap; gap: .5em; margin: .5em 0 .8em; }
    .page-btn { cursor: pointer; padding: .35em .8em; background: rgba(0,0,0,.08); border-radius: .25em; user-select: none; }
    .page-btn.active { background: #3b82f6; color: #fff; font-weight: bold; }
    .page > .pages { padding-left: 1em; border-left: 3px solid rgba(0,0,0,.08); }
`);

h1("class Page2 — URL routing");
p("Sub-pages are hash routes: click around, then check the URL. Deep links (#two/b/deep) and refresh work; so does browser back/forward.");

el("style", `.takeaways{background:#fffbe6;border-left:4px solid #f5b300;padding:.7em 1em;margin:.4em 0 1.5em;max-width:46em;border-radius:.2em}.takeaways b{display:block;margin-bottom:.3em}.takeaways p{margin:.2em 0}`);
div.c("takeaways", () => {
    el("b", "What makes Page2 unique (the promoted default)");
    p("• Adds URL hash routing: deep-linkable, refresh-stable, browser back/forward.");
    p("• Page = the noun; it COMPOSES a `Pager` for navigation. Page0/1 never import HashRouter.");
    p("• Fully lazy: only the button + route are eager; the whole view + content renders on first activate.");
});

// Root document; App.load_page() renders it. Sub-pages become hash segments.
page("Routing demo", (root) => {
    p("Each button below sets the URL hash. The page tree follows the hash.");

    page("One", (one) => {
        h2("Page One");
        p("Open a child — the hash becomes #one/a.");
        page("A", () => p("You are at #one/a"));
        page("B", () => p("You are at #one/b"));
    });

    page("Two", (two) => {
        h2("Page Two");
        page("A", () => p("You are at #two/a"));
        page("B", (b) => {
            h3("Two / B");
            page("Deep", () => p("You are at #two/b/deep — deep-linkable + refresh-stable."));
        });
    });

    page("Three", () => {
        h2("Page Three");
        p("A leaf page with no children.");
    });
});

test_obj.render();
