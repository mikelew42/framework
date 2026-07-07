import View, { div } from "../../View/View.js";
import HashRouter from "../../../ext/HashRouter/HashRouter.js";

View.stylesheet(import.meta, "Pager.css");

/**
 * Pager — base navigation controller for a Page's children.
 *
 * Page is the NOUN (title/content/children); a Pager decides how its children
 * are PRESENTED + routed. The base handles everything shared — routes, nav
 * buttons, lazy render, activate/deactivate. Variants override just two seams:
 *
 *   container()     → WHERE child pages render (nested card vs shared flat row)
 *   activated(pg)   → what happens after a child becomes active (scroll, breadcrumb…)
 *
 * Pick a variant per page via `Page.Pager` (see core/Page/3). Default here =
 * nested (children render inside the host's own card).
 */
export default class Pager {
    constructor(...args){
        Object.assign(this, ...args);   // { host }
        this.instantiate();
    }

    instantiate(){
        this.host.pager = this;         // set BEFORE we activate, so breadcrumbs etc. can walk the chain
        this.current = null;
        this.classify();
        this.host.view.append({ nav: div() });   // child buttons live in the host card
        this.nav = this.host.view.nav;
        this.columns = this.container();          // override seam: where children mount
        this.router = this.host.route || HashRouter.singleton();

        // create-all-then-match: a HashRouter matches inside its constructor and
        // fires activate synchronously — so every pg.route must be ASSIGNED first,
        // then matched (see core/Page/2/readme.md).
        for (const pg of this.host.pages) this.add(pg);
        for (const pg of this.host.pages) pg.route.match();

        this.activate_default();                              // default-open the first (if nothing matched)
        this.router.on("reset", () => this.activate_default());
    }

    // Open the first child when none is active. Called at construction, on router
    // reset, AND whenever the host re-activates (see activate) — so navigating away
    // and back re-opens the default child instead of coming back to an empty page.
    activate_default(){
        if (!this.current && this.host.pages?.length) this.activate(this.host.pages[0]);
    }

    classify(){ this.host.view.ac("pager"); }

    // default: children render NESTED inside the host card
    container(){
        this.host.view.append({ pages: div() });
        return this.host.view.pages;
    }

    add(pg){
        pg.button = div.c("page-btn", pg.title).click(() => pg.route.go());
        this.nav.append(pg.button);
        // get_captured:false + no parent → dormant (no constructor match yet)
        pg.route = new HashRouter({
            path: pg.slug, get_captured: false,
            activate:   () => this.activate(pg),
            deactivate: () => this.deactivate(pg),
        });
        this.router.add(pg.route);              // wire parent + register (no match)
        pg.route.router = this.router.router;   // root-router ref
    }

    activate(pg){
        if (!pg || this.current === pg) return;
        this.current && this.deactivate(this.current);
        this.current = pg;                       // set BEFORE render, so nested activations see the full chain
        pg.button.ac("active");
        if (!pg.rendered) pg.render(this.columns);   // lazy: render on first open
        pg.view.show();
        // if pg has sub-pages but the deactivate-cascade closed its active child,
        // re-open its default so a revisited page isn't empty. (Runs synchronously
        // before paint, so a subsequent deep-link route match overrides it cleanly.)
        if (pg.pager) pg.pager.activate_default();
        this.activated(pg);
    }

    deactivate(pg){
        pg.view && pg.view.hide();          // view may not exist yet (never opened)
        pg.button && pg.button.rc("active");
        if (this.current === pg) this.current = null;
        // cascade: closing a page closes its active descendant too, so deeper
        // columns/tabs don't linger when we switch away. (The router's own
        // deactivation can't be relied on here — default-opened pages were
        // activated directly, so their route.active is false.)
        if (pg.pager && pg.pager.current) pg.pager.deactivate(pg.pager.current);
    }

    activated(pg){}   // override hook (scroll, breadcrumb, close button…)
}
