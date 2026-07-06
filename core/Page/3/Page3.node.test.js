import Page, { page, tabs } from './Page3.js';
import Page2 from '../2/Page2.js';
import Page2Suite from '../2/Page2.node.test.js';
import ColumnPager from '../Pager/ColumnPager.js';
import TabPager from '../Pager/TabPager.js';
import { test, assert } from '/framework/core/Test/3/Test3.js';

// Node covers the config logic: which Pager each helper picks, inheritance,
// captor. Actual layout/routing needs window → browser (page.js demo).
// Inherits Page2's contract (slug, page() → Page, routing dormancy).
export default Page.test = test(Page, Page2Suite, () => {

function reset(){ Page.roots = []; Page.captor = null; Page.previous_captors = []; }

test("extends Page2", () => {
    reset();
    assert(new Page({ title: "X" }) instanceof Page2, "is a Page2");
});

test("page() → ColumnPager (children are columns)", () => {
    reset();
    const pg = page("Docs", () => {});
    assert(pg instanceof Page, "page() → Page3");
    assert(pg.constructor.Pager === ColumnPager, "lays out children as columns");
    assert(Page.roots[0] === pg, "root collected");
});

test("tabs() → TabPager (children are tabs)", () => {
    reset();
    const t = tabs("Settings", () => {});
    assert(t instanceof Page, "tabs() is a Page");
    assert(t.constructor.Pager === TabPager, "lays out children as tabs");
});

test("the helper sets only that node's child layout", () => {
    reset();
    // a page() is always columns, regardless of where it's used
    const p = page("X", () => {});
    assert(p.constructor.Pager === ColumnPager, "page() always columns");
    // a tabs() child of a page would still lay out ITS own children as tabs
    const t = tabs("Y", () => {});
    assert(t.constructor.Pager === TabPager, "tabs() always tabs");
});

test("captor still routes sub-pages to the parent", () => {
    reset();
    const parent = new Page({ title: "P" });
    Page.set_captor(parent);
    const child = page("C", () => {});
    Page.restore_captor();
    assert(parent.pages[0] === child && child.parent === parent, "adopted + wired");
    assert(Page.roots.length === 0, "not a root");
});

}); // end Page.test
