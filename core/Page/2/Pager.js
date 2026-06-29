import { div } from "../../View/View.js";
import HashRouter from "../../../ext/HashRouter/HashRouter.js";

/**
 * Pager — drives a Page's sub-pages with hash routing.
 *
 * This is the "pager layer" the Page system delegates to: it owns the routes,
 * the nav buttons, and activate/deactivate. The Page stays the noun (title +
 * content + render). Page/2 composes one of these in render_pages().
 *
 * Each child page gets:
 *   - a nav button (route.go() on click)
 *   - a HashRouter route keyed on its slug  → URL-addressable, deep-linkable
 *   - lazy render into the host's column container on first activate
 *
 * Routing context: a child's routes nest under the host page's own route (so
 * the URL builds up: #one/a/deep). A ROOT page has no route, so its children
 * attach to the root HashRouter.singleton() — they are the top hash segments.
 *
 * IMPORTANT — create-all-then-match: a HashRouter matches inside its own
 * constructor, which synchronously fires activate → the child's render → the
 * child's own Pager, which reads `host.route`. If we matched as we created, that
 * route wouldn't be ASSIGNED yet (still inside `new HashRouter`), and the child
 * would route against the wrong remainder. So we create + assign every route
 * first, THEN match them.
 */
export default class Pager {
    constructor(...args){
        Object.assign(this, ...args);   // { host }
        this.instantiate();
    }

    instantiate(){
        this.current = null;

        // nav (buttons) + columns (where child pages render), inside the host view
        this.host.view.append({ nav: div(), pages: div() });
        this.nav = this.host.view.nav;
        this.columns = this.host.view.pages;

        // route context: host's route (sub-page) or the root router (root page)
        this.router = this.host.route || HashRouter.singleton();

        // 1) create every child route (dormant) and assign pg.route
        for (const pg of this.host.pages) this.add(pg);

        // 2) NOW match — every pg.route is assigned, so child Pagers see host.route
        for (const pg of this.host.pages) pg.route.match();

        // nothing in the hash selected a child → open the first
        if (!this.current) this.activate(this.host.pages[0]);

        // when the hash resets to root, fall back to the first child
        this.router.on("reset", () => {
            if (!this.current) this.activate(this.host.pages[0]);
        });
    }

    add(pg){
        pg.button = div.c("page-btn", pg.title).click(() => pg.route.go());
        this.nav.append(pg.button);

        // get_captured:false + no parent → dormant (no constructor match).
        pg.route = new HashRouter({
            path: pg.slug,
            get_captured: false,
            activate:   () => this.activate(pg),
            deactivate: () => this.deactivate(pg),
        });
        this.router.add(pg.route);                 // wire parent + register (no match)
        pg.route.router = this.router.router;      // root-router ref (used by go/rematch)
    }

    activate(pg){
        if (!pg || this.current === pg) return;
        this.current && this.deactivate(this.current);
        if (!pg.rendered) pg.render(this.columns);   // lazy: render on first open
        pg.view.show();
        pg.button.ac("active");
        this.current = pg;
    }

    deactivate(pg){
        pg.view && pg.view.hide();          // view may not exist yet (never opened)
        pg.button && pg.button.rc("active");
        if (this.current === pg) this.current = null;
    }
}
