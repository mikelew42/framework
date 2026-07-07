import Pager from "./Pager.js";
import View, { div } from "../../View/View.js";
import HashRouter from "../../../ext/HashRouter/HashRouter.js";

View.stylesheet(import.meta, "ColumnPager.css");

/**
 * ColumnPager — infinite nestable columns (Finder / Miller style).
 *
 * Every active page in the whole tree is a column in ONE shared flat row, so
 * ancestors stay visible side-by-side (no nested-DOM shrinkage — the HashPager3
 * insight). Adds:
 *   - a breadcrumb (real /page.js → active hash trail) for jump-back nav
 *   - a per-column close (✕) that drops the column + its descendants
 *   - horizontal scroll to reveal the newest column
 *   - full-width columns on mobile (swipe one at a time; breadcrumb/✕ to navigate)
 *
 * The shared row lives on the ROOT page; every descendant ColumnPager renders its
 * children into that same row, which is what keeps the columns flat.
 *
 * Open responsiveness questions (see readme): auto-hiding ancestor columns when
 * they don't fit (vs. scroll), and measuring exact fit. v1 leans on scroll +
 * breadcrumb + close, which is predictable without width math.
 */
export default class ColumnPager extends Pager {
    classify(){ super.classify(); this.host.view.ac("col-pager"); }

    // ALL columns render into ONE shared flat row, created once on the root page.
    container(){
        const root = this.root();
        if (!root.col_row){
            root.view.ac("col-root");
            root.crumbs  = div.c("col-crumbs");
            root.col_row = div.c("col-row");
            root.view.append(root.crumbs, root.col_row);
        }
        return root.col_row;
    }

    // The "column root" holds the shared flat row. We climb only through a
    // CONTIGUOUS chain of column pages — so a column section nested inside tabs
    // roots to that section (its columns stay inside the tab), instead of
    // escaping to the very top of the app.
    root(){
        let p = this.host;
        while (p.parent && p.parent.pager instanceof ColumnPager) p = p.parent;
        return p;
    }

    activated(pg){
        this.add_close(pg);
        // reveal the newly-active (rightmost) column
        pg.view.el.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
        this.breadcrumb();
    }

    // ✕ closes this column → navigate to its parent route (drops it + descendants)
    add_close(pg){
        if (pg.close_btn) return;
        pg.close_btn = div.c("col-close", "✕").click(() => {
            const parent = pg.route && pg.route.parent;
            if (parent && parent.path) parent.go();     // up to the parent column
            else HashRouter.singleton().reset();          // top-level → clear to root
        });
        pg.view.prepend(pg.close_btn);
    }

    // breadcrumb trail: root page → active child → … (the current-pager chain)
    breadcrumb(){
        const root = this.root();
        if (!root.crumbs) return;

        const trail = [root];
        let pager = root.pager;
        while (pager && pager.current){ trail.push(pager.current); pager = pager.current.pager; }

        root.crumbs.html("");
        root.crumbs.append(() => {
            trail.forEach((pg, i) => {
                div.c("crumb", pg.title || "Home").click(() => {
                    if (pg.route && pg.route.path) pg.route.go();
                    else HashRouter.singleton().reset();
                });
                if (i < trail.length - 1) div.c("crumb-sep", "›");
            });
        });
    }
}
