import Page1 from "../1/Page1.js";
import is from "../../util/is/is.js";   // real `is` (View.js's is is stubbed empty in Node)
import Pager from "./Pager.js";

/**
 * Page2 — URL-addressable navigation.
 *
 * Replaces Page/1's placeholder show/hide nav with a Pager (hash routing). Same
 * `page()` toolbelt, same dormant/lazy contract — but now sub-pages are
 * deep-linkable (#one/a), survive refresh, and work with browser back/forward.
 *
 * Page stays the noun: Page2 only swaps render_pages() to compose a Pager. All
 * the routing lives in Pager (which owns the HashRouter). Page0/1 never import
 * HashRouter; Page2 is the routed level.
 *
 * Layout note: sub-pages render nested (indented, vertical) — readable at any
 * depth, no shrinkage. Flat horizontal columns (HashPager3 style) remain a
 * separate presentation choice for later.
 */
export default class Page2 extends Page1 {

    // URL segment for this page — derived from the title unless set explicitly.
    get slug(){
        return this._slug ?? (this.title || "page").toLowerCase().replace(/\s+/g, "-");
    }
    set slug(v){ this._slug = v; }

    // Swap Page/1's placeholder nav for a routed Pager.
    render_pages(){
        if (!this.pages?.length) return;
        this.pager = new Pager({ host: this });
    }
}

/**
 * page() — same as Page/1's, but creates Page2 instances (routed).
 * Captor decides root vs sub. Exported for the Page2 demo / opt-in use.
 */
export function page(name, content){
    const pg = is.fn(name)
        ? new Page2({ content: name })
        : new Page2({ title: name, content });

    const parent = Page2.captor;
    if (parent) parent.adopt(pg);
    else        Page2.roots.push(pg);

    return pg;
}
