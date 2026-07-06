import app, { el, div, h1, h2, p } from "/app.js";
import Page, { page } from "./Page1.js";
import test_obj from "./Page1.node.test.js";

app.$root.ac("pad");

el("style", `
    .page { margin-bottom: 1em; }
    .page > .nav { display: flex; gap: 0.5em; margin: 0.5em 0; }
    .page-btn { cursor: pointer; padding: 0.4em 0.8em; background: rgba(0,0,0,0.08); }
    .page-btn.active { background: rgba(0,0,0,0.2); font-weight: bold; }
    .page > .pages { padding-left: 1em; border-left: 2px solid rgba(0,0,0,0.1); }
`);

h1("class Page (Page1)");
p("One `page()` helper makes both the root document and nested sub-pages — the captor decides which. Pages stay dormant until rendered; App.load_page() flushes the roots.");

el("style", `.takeaways{background:#fffbe6;border-left:4px solid #f5b300;padding:.7em 1em;margin:.4em 0 1.5em;max-width:46em;border-radius:.2em}.takeaways b{display:block;margin-bottom:.3em}.takeaways p{margin:.2em 0}`);
div.c("takeaways", () => {
    el("b", "What makes Page1 unique");
    p("• ONE `page()` helper builds both root documents and nested sub-pages — the captor decides (like test/assert).");
    p("• Pages are dormant until rendered; sub-pages render lazily on first open.");
    p("• Nav here is a placeholder show/hide — NOT URL-addressable. Page2 adds routing.");
});

// Root document — registers into Page.roots; App.load_page() renders it.
// (No export needed, though `export default page(...)` works too.)
page("Docs", (pg) => {
    h1("Docs");
    p("A page is the thing that lives at a /path/.");

    // sub-pages — captured as children of Docs (one nav per level)
    page("Install", () => {
        h2("Install");
        p("No npm. No bundler. Just serve and import.");
    });

    page("Guides", () => {
        h2("Guides");
        p("Pick a guide.");

        // nests freely — same helper, any depth
        page("Routing", () => p("HashRouter encodes state in the URL hash."));
        page("Pages",   () => p("page() creates roots and sub-pages alike."));
    });

    page("About", () => p("Built with the frozen-helix framework."));
});

// Render the Node test suite below the demo. App.load_page() collects root
// pages via a private captor (not the global Page.roots), so the suite poking
// Page.roots here can't affect the live "Docs" root above.
test_obj.render();
