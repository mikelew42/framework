// Stable default for the Page system — currently Page3 (swappable Pager:
// page() = columns, tabs() = tabs). Pinned imports use a level directly
// (e.g. ./2/Page2.js); this moves forward as levels are promoted.
export { default, page, tabs } from "./3/Page3.js";
