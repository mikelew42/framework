import { div } from "../../View/View.js";
import is from "../../util/is/is.js";   // real `is` (View.js's is is stubbed empty in Node tests)
import Page0 from "../0/Page0.js";
import ctx from "../context.js";

/**
 * Page1 — the `page()` helper + captor + sub-pages.
 *
 * Adds the toolbelt: ONE `page()` function that makes both root documents and
 * nested sub-pages, disambiguated by the captor (exactly like test()/assert()).
 *
 *   page("Docs", (pg) => {           // no captor → ROOT (dormant in Page.roots)
 *       page("Install", fn);          // captor present → SUB-page (adopted)
 *   });
 *
 * Root pages are flushed by App.load_page() (the path the browser navigated to);
 * everyone else stays dormant. See core/Page/1/readme.md.
 *
 * Naming: `Page` = class, `pg` = instance, `page()` = helper.
 *
 * NOTE: sub-page presentation here is a MINIMAL built-in nav (button per child,
 * lazy render, hide siblings). HashPager/3 is meant to replace render_pages()
 * with hash routing + flat-column layout. Page stays the noun; the pager layer
 * owns routing/columns.
 */
export default class Page1 extends Page0 {

    // --- captor: set while a page renders its content, so page() calls inside
    //     it register as sub-pages. Backed by the shared `ctx` (see context.js) so
    //     subclasses can't shadow it with own static props. These accessors keep
    //     the `Page.roots` / `Page.captor` / `Page.set_captor` API for App + tests.
    static get roots(){ return ctx.roots; }
    static set roots(v){ ctx.roots = v; }
    static get captor(){ return ctx.captor; }
    static set captor(v){ ctx.captor = v; }
    static get previous_captors(){ return ctx.stack; }
    static set previous_captors(v){ ctx.stack = v; }
    static set_captor(pg){ ctx.set_captor(pg); }
    static restore_captor(){ ctx.restore_captor(); }

    // Wire a sub-page to this parent. Lazily creates the pages list.
    adopt(pg){
        pg.parent = this;
        (this.pages ??= []).push(pg);
        return pg;
    }

    // Wrap content rendering with the Page captor, so any page() called inside
    // the content fn is captured as a sub-page of THIS page.
    render_content(){
        Page1.set_captor(this);
        super.render_content();      // View captor + run content fn
        Page1.restore_captor();
    }

    render(target){
		console.log("rendering page", this.title);
        const first = !this.rendered;
        super.render(target);        // builds view, renders content (adopts subs)
        if (first) this.render_pages();
        return this;
    }

    // Minimal built-in sub-page nav (placeholder for HashPager/3).
    render_pages(){
        if (!this.pages?.length) return;

        this.view.append({
            nav:   div(),            // → this.view.nav
            pages: div(),            // → this.view.pages
        });

        this.pages.forEach((pg) => {
            pg.btn = div.c("page-btn", pg.title).click(() => this.show(pg));
            this.view.nav.append(pg.btn);
        });

        this.show(this.pages[0]);    // reveal the first sub-page by default
    }

    // Reveal one sub-page, hide siblings. Renders lazily on first show.
    show(pg){
        if (this.current === pg) return;
        if (!pg.rendered) pg.render(this.view.pages);   // lazy render

        this.pages.forEach((p) => {
            const on = p === pg;
            p.view && (on ? p.view.show() : p.view.hide());
            p.btn && (on ? p.btn.ac("active") : p.btn.rc("active"));
        });

        this.current = pg;
    }
}

/**
 * The toolbelt helper. Captor decides root vs sub:
 *   page("Title", fn)  |  page("Title", "string")  |  page(fn)
 */
export function page(name, content){
    const pg = is.fn(name)
        ? new Page1({ content: name })
        : new Page1({ title: name, content });

    const parent = Page1.captor;
    if (parent) parent.adopt(pg);     // sub-page
    else        Page1.roots.push(pg);  // root document — dormant until App flushes

    return pg;
}
