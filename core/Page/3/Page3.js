import Page2 from "../2/Page2.js";
import is from "../../util/is/is.js";   // real `is` (View.js's is is stubbed empty in Node)
import ColumnPager from "../Pager/ColumnPager.js";
import TabPager from "../Pager/TabPager.js";

/**
 * Page3 — swappable Pager (navigation/layout becomes a choice).
 *
 * Page2 hard-wired one Pager. Page3 picks it via `static Pager` (the framework's
 * `new this.constructor.Pager()` pattern), so the SAME Page noun can present its
 * children as columns, tabs, etc. — without touching content.
 *
 * Two toolbelt helpers, clear about what you get:
 *   page("X", fn)  → children are COLUMNS (infinite nestable, Finder-style)   [default]
 *   tabs("X", fn)  → children are TABS    (in-place, indented panels)
 *
 * The helper you use sets how THAT node lays out ITS children. A node's own
 * appearance (column vs tab) is decided by its PARENT. So you can nest freely:
 * a `tabs()` section inside a `page()` column, etc.
 */
export default class Page3 extends Page2 {
    static Pager = ColumnPager;   // page() → columns by default

    render_pages(){
        if (!this.pages?.length) return;
        new this.constructor.Pager({ host: this });   // the Pager sets this.pager
    }
}

// children presented as in-place tabs
class TabsPage extends Page3 {
    static Pager = TabPager;
}

function create(Cls, name, content){
    const pg = is.fn(name)
        ? new Cls({ content: name })
        : new Cls({ title: name, content });

    const parent = Page3.captor;           // shared captor (context.js) — see Page1
    if (parent) parent.adopt(pg);
    else        Page3.roots.push(pg);

    return pg;
}

export function page(name, content){ return create(Page3,    name, content); }   // columns
export function tabs(name, content){ return create(TabsPage, name, content); }   // tabs
