import Pager from "./Pager.js";
import View from "../../View/View.js";

View.stylesheet(import.meta, "TabPager.css");

/**
 * TabPager — in-place tabs. Children render NESTED inside the host card (the base
 * Pager behavior), under a tab strip; ancestors stay visible, stacked vertically.
 *
 * The LOOK is a CSS class, not a subclass — the same pager renders as either:
 *   "paper-tabs"   white; the active tab flows into the content, inactive dimmed  (default)
 *   "button-tabs"  pill buttons; the active tab uses the accent color
 * Pick per page via the helpers (see core/Page/3):
 *   tabs("X", fn)          → paper
 *   tabs.buttons("X", fn)  → buttons
 * and set `pg.tab_full = true` for a full-width, full-height tab strip.
 *
 * (Because styling is just a class, a full TabPager subclass would be overkill —
 * classify() reads the host's `tab_style`/`tab_full` and tags the view. See readme.)
 */
export default class TabPager extends Pager {
    classify(){
        super.classify();                                        // .pager
        this.host.view.ac("tab-pager");
        this.host.view.ac(this.host.tab_style || "paper-tabs");  // look = a class
        if (this.host.tab_full) this.host.view.ac("full");       // full-width / full-height
    }
}
