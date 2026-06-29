import Page, { page } from './Page2.js';
import Page1 from '../1/Page1.js';
import Page1Suite from '../1/Page1.node.test.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

// Node covers the non-routing logic: slug derivation, page() makes Page2
// instances, inheritance. Routing (Pager/HashRouter) needs window → browser
// only, verified by page.js.
// Inherits Page1's contract (which inherits Page0's).
export default Page.test = test(Page, Page1Suite, () => {

function reset(){ Page.roots = []; Page.captor = null; Page.previous_captors = []; }

test("extends Page1", () => {
    reset();
    const pg = new Page({ title: "X" });
    assert(pg instanceof Page1, "is a Page1");
});

test("slug derives from title", () => {
    reset();
    assert(new Page({ title: "Getting Started" }).slug === "getting-started", "spaces → dashes, lowercased");
    assert(new Page({ title: "One" }).slug === "one", "simple title");
});

test("slug can be set explicitly", () => {
    reset();
    const pg = new Page({ title: "Whatever", slug: "custom" });
    assert(pg.slug === "custom", "explicit slug wins");
});

test("slug falls back when no title", () => {
    reset();
    assert(new Page({}).slug === "page", "default slug");
});

test("page() creates Page2 instances", () => {
    reset();
    const pg = page("Docs", () => {});
    assert(pg instanceof Page, "page() → Page2");
    assert(Page.roots[0] === pg, "root collected");
});

test("page() captor → sub-page adopted (inherited behavior)", () => {
    reset();
    const parent = new Page({ title: "P" });
    Page.set_captor(parent);
    const child = page("C", () => {});
    Page.restore_captor();
    assert(parent.pages[0] === child && child.parent === parent, "adopted, wired");
    assert(Page.roots.length === 0, "not a root");
});

}); // end Page.test
