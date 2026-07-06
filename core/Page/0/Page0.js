import Base from "../../Base/Base.js";
import { View, div } from "../../View/View.js";
import is from "../../util/is/is.js";   // real `is` (View.js's is is stubbed empty in Node tests)

/**
 * Page0 — the minimal "learning class" for the Page system.
 *
 * A Page is the thing that lives at a `/path/` — a document.
 * This MVP level has NO routing, NO sub-pages, NO pager. Just a titled
 * unit of content that renders into a container *when told to*.
 *
 * THE ONE BIG RULE: a Page never renders itself. Construction only stores
 * title + content; nothing touches the DOM until someone calls render(target).
 * (App renders the root document; a parent renders its sub-pages; an importer
 * renders on demand. See core/Page/0/readme.md.)
 *
 * Naming: `Page` is the class, `pg` an instance, `page()` the helper (Page/1).
 */
export default class Page0 extends Base {

    // Construction does NO work beyond storing args — the page stays dormant.
    // (Base.instantiate already does assign() + initialize(); no setup needed here.)

    /**
     * Render this page's content into `target`. Idempotent — renders once.
     *
     * Call this directly: `pg.render(app.$root)`. Don't rely on
     * `container.append(pg)` — View.append auto-invokes `.render()` on objects,
     * which would recurse. Explicit render(target) is the contract.
     */
    render(target){
        if (this.rendered) return this;   // render once
        this.rendered = true;

        // the page shell — content lands inside this
        this.view = div.c("page");

        this.render_content();

        if (target) this.view.append_to(target);
        return this;
    }

    // Render this page's content into this.view. Pulled out as its own method
    // so subclasses (Page1) can wrap it — e.g. to set a Page-level captor so
    // nested page() calls register as sub-pages.
    render_content(){
        if (is.fn(this.content)){
            // run the content fn with the page view as captor, so element
            // helpers (h1, p, …) called inside land in the page. Pass the pg
            // (not the view) so content reads `(pg) => { ... }`.
            View.set_captor(this.view);
            this.content(this);
            View.restore_captor();
        } else if (is.def(this.content)){
            // a View or a plain string
            this.view.append(this.content);
        }
    }
}
