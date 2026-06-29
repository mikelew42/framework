import Page from './Page0.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

// Node tests cover the DORMANT CONTRACT (the heart of Page0): construction
// touches nothing. Actual render() builds Views (browser-only) and is exercised
// by the page.js demo.
export default Page.test = test(Page, () => {

test("stores title and content", () => {
    const fn = () => {};
    const pg = new Page({ title: "Docs", content: fn });
    assert(pg.title === "Docs", "title stored");
    assert(pg.content === fn, "content stored");
});

test("dormant on construction — never renders itself", () => {
    const pg = new Page({ title: "X", content: () => {} });
    assert(!pg.rendered, "rendered is falsy until render() is called");
    assert(pg.view === undefined, "no view built on construction");
});

test("assign-style construction — args in any order, all optional", () => {
    const pg = new Page({ content: "hi", title: "Y" });
    assert(pg.title === "Y", "title via named arg");
    assert(pg.content === "hi", "content can be a plain string");

    const bare = new Page();
    assert(bare.title === undefined && bare.content === undefined, "all args optional");
});

}); // end Page.test
