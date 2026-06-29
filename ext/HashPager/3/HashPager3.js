import Base from "../../../core/Base/Base.js";
import { div, h2 } from "../../../core/App/App.js";
import is from "../../../core/util/is/is.js";   // real `is` (View.js's is is stubbed empty in Node)
import HashRouter from "../../HashRouter/HashRouter.js";

/**
 * HashPager3 — multi-column, hash-routed pager.
 *
 * Keeps the original HashPager's winning idea: ALL page cards, at every depth,
 * render into ONE flat `.pages` flex container → equal-width columns, no
 * nested-DOM shrinkage (the problem HashPage had).
 *
 * Fixes over the original (see ./readme.md):
 *  1. Proper subclassing — every class self-reference is `this` / `this.constructor`
 *     (the original hardcoded `HashPager`, which is why HashPager/2 needed 3 lines
 *     of manual plumbing). `class MyPager extends HashPager3 {}` now just works.
 *  2. Lazy content — a page renders its shell up front (so routing works) but only
 *     renders its CONTENT on first activate. Adding 100 pages costs nothing until
 *     one is visited.
 *  3. Non-numeric, unique slugs in make().
 *
 * Construction sequence per framework convention:
 *   constructor → instantiate → assign → initialize_page → initialize
 */
export default class HashPager3 extends Base {
    instantiate(...args){
        this.active = false;
        this.assign(...args);
        this.initialize_page();
        this.initialize();
    }

    initialize_page(){
        this.pages = [];
        this.slug = this.slug || this.label?.toLowerCase().replace(/\s+/g, "-") || "undefined";

        if (this.get_captured){
            // grab the active pager as our parent; add() happens after the route
            // exists (route creation captures content → sub-routes).
            this.parent = this.constructor.get_captor();
            this.got_captured = true;

            this.route = new HashRouter({
                path: this.slug,

                // The route must exist before render so page content can create
                // sub-routes that get captured. Render runs inside route.initialize,
                // which the router captures — so nested page() → child routes.
                initialize: () => {
                    this.render();
                },
                activate: () => {
                    this.activate();
                },
                deactivate: () => {
                    this.deactivate();
                },
            });
        }

        // add() registers us in parent.pages[]; activation is driven by the route.
        if (this.got_captured)
            this.parent.add(this);
    }

    // Shell only — cheap, ready for routing. Content is deferred to first activate.
    render(){
        this.view = div.c("page page-" + this.slug, {
            header: h2(this.label),
            buttons: div(),
        }).append_to(this.constructor.pager.view.pages).hide();

        this.button = div.c("button", this.label).click(() => {
            this.route.go();
        });

        if (this.parent.view)
            this.button.append_to(this.parent.view.buttons);
    }

    // Lazy: render content once, on first activate. Captured by this.route so any
    // page() inside the content creates child routes under this page.
    render_content(){
        if (this.content_rendered) return;
        this.content_rendered = true;
        this.capture(() => {
            this.view.append(this.content);
        });
    }

    activate(){
        if (!this.active){
            this.active = true;
            this.parent.current && this.parent.current.deactivate();
            this.parent.current = this;
            this.render_content();   // lazy content render
            this.update();
        }
    }

    deactivate(){
        this.active = false;
        this.update();
    }

    update(){
        if (!this.view) return;
        if (this.active){
            this.view.ac("active").show();
            this.button.ac("active");
        } else {
            this.view.hide().rc("active");
            this.button.rc("active");
        }
    }

    // Only called on the root singleton pager — builds the flat column container.
    initialize_pager(){
        HashRouter.singleton().on("reset", () => this.reset());
        this.current = null;
        this.view = div.c("pager", {
            buttons: div(),
            pages: div(),
        });
    }

    reset(){
        this.pages[0] && this.pages[0].activate();
    }

    add(label, content){
        let page;
        if (label instanceof HashPager3){
            page = label;
            page.parent = this;
        } else {
            page = new this.constructor({ label, content, parent: this });
        }
        this.pages.push(page);
        return page;
    }

    capture(fn){
        if (this.route){
            // capture child routes under this page's route (order-of-ops matters)
            this.route.capture(() => this._capture(fn));
        } else {
            this._capture(fn);
        }
        return this;
    }

    _capture(fn){
        this.constructor.set_captor(this);
        fn(this);
        this.constructor.restore_captor();
    }

    // Stress-test helper: build an n-deep recursive hierarchy.
    // make(3) → each page has 3 children, each of those 3, etc.
    make(n, path = ""){
        if (n <= 0) return this;
        this.capture(() => {
            for (let i = 1; i <= n; i++){
                const sub = path ? `${path}.${i}` : `${i}`;
                // get_captured (default) → auto-adds to this via initialize_page
                new this.constructor({
                    label: `Page ${sub}`,
                    slug: "p-" + sub.replace(/\./g, "-"),   // FIX: non-numeric, unique slug
                    content: `Content for ${sub}`,
                }).make(n - 1, sub);
            }
        });
        return this;
    }

    debug(){ console.log("HashPager3", this); }

    // --- statics: this-scoped so subclasses get their OWN pager/captor ---

    static set_captor(pager){
        this.own("previous_captors", []).push(this.captor);
        this.captor = pager;
    }

    static restore_captor(){
        this.captor = this.own("previous_captors", []).pop();
    }

    // The active captor; auto-creates the root pager on first use.
    static get_captor(){
        if (!this.captor)
            this.captor = this.singleton();
        return this.captor;
    }

    // Root pager singleton — Object.hasOwn so a SUBCLASS gets its own, instead of
    // inheriting the base class's pager (the HashPager/2 extensibility bug).
    static singleton(){
        if (!Object.hasOwn(this, "pager")){
            this.pager = new this({ get_captured: false, label: "pager" });
            this.pager.initialize_pager();
        }
        return this.pager;
    }

    // page() / page.add() resolve the captor's class, so the hierarchy stays in
    // one class (works for HashPager3 and any subclass).
    static page(name, fn){
        const Cls = this.get_captor().constructor;
        return is.fn(name)
            ? new Cls({ content: name })
            : new Cls({ label: name, content: fn });
    }

    // ensure an OWN static array exists on this class (not inherited from base)
    static own(prop, init){
        if (!Object.hasOwn(this, prop)) this[prop] = init;
        return this[prop];
    }
}

HashPager3.prototype.get_captured = true;

// Toolbelt helper bound to HashPager3. Subclasses use `MyPager.page(...)`.
export function page(name, fn){
    return HashPager3.page(name, fn);
}
