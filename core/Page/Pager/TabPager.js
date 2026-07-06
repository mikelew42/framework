import Pager from "./Pager.js";
import View from "../../View/View.js";

View.stylesheet(import.meta, "TabPager.css");

/**
 * TabPager — in-place tabs. Children render NESTED inside the host card (the base
 * behavior), indented under a tab strip. All ancestors stay visible, stacked
 * vertically. Use via tabs()/tab() (see core/Page/3).
 *
 * This is the lightest variant: it's the base Pager + a styling class. Good when
 * the children are panels of one thing (settings, a form wizard) rather than a
 * drill-down hierarchy.
 */
export default class TabPager extends Pager {
    classify(){ super.classify(); this.host.view.ac("tab-pager"); }
}
