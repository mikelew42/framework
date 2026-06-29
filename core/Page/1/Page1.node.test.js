import Page, { page } from './Page1.js';
import Page0 from '../0/Page0.js';
import Page0Suite from '../0/Page0.node.test.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

// Node tests cover the LOGIC layer: captor disambiguation, roots collection,
// adopt, dormancy. Rendering (render_pages/show) builds Views (browser-only)
// and is exercised by the page.js demo.
// Inherits Page0's contract via the variadic test() form.
export default Page.test = test(Page, Page0Suite, () => {

// reset shared static state before each assertion group (tests share the class)
function reset(){ Page.roots = []; Page.captor = null; Page.previous_captors = []; }

test("extends Page0 — still dormant on construction", () => {
    reset();
    const pg = new Page({ title: "X", content: () => {} });
    assert(pg instanceof Page0, "is a Page0");
    assert(!pg.rendered, "dormant — no render on construction");
});

test("page() at root → goes to Page.roots, not rendered", () => {
    reset();
    const pg = page("Docs", () => {});
    assert(Page.roots.length === 1, "one root collected");
    assert(Page.roots[0] === pg, "the pg is the root");
    assert(!pg.rendered, "root stays dormant until App flushes it");
    assert(pg.title === "Docs", "title set");
});

test("page(fn) — content-only form", () => {
    reset();
    const pg = page(() => {});
    assert(pg.title === undefined, "no title");
    assert(is_fn(pg.content), "content is the fn");
    function is_fn(v){ return typeof v === "function"; }
});

test("captor present → page() becomes a sub-page (adopted, not a root)", () => {
    reset();
    const parent = new Page({ title: "Parent" });
    Page.set_captor(parent);
    const child = page("Child", () => {});
    Page.restore_captor();

    assert(Page.roots.length === 0, "sub-page does NOT go to roots");
    assert(parent.pages.length === 1, "parent adopted one child");
    assert(parent.pages[0] === child, "the child is adopted");
    assert(child.parent === parent, "child.parent points back");
});

test("adopt() wires parent/child and lazily creates pages list", () => {
    reset();
    const parent = new Page({ title: "P" });
    assert(parent.pages === undefined, "no pages list until first adopt");
    const child = new Page({ title: "C" });
    parent.adopt(child);
    assert(parent.pages.length === 1 && child.parent === parent, "adopt wires both ways");
});

test("captor stack restores correctly when nested", () => {
    reset();
    const a = new Page({ title: "A" });
    const b = new Page({ title: "B" });
    Page.set_captor(a);
    Page.set_captor(b);
    assert(Page.captor === b, "innermost captor active");
    Page.restore_captor();
    assert(Page.captor === a, "restores to outer");
    Page.restore_captor();
    assert(Page.captor === null, "restores to none");
});

}); // end Page.test
