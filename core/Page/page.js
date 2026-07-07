import { app, el, div, h1, h2, p, a } from "/app.js";

// Index page for the Page module — auto-loads at /framework/core/Page/
app.$root.ac("pad");

h1("Page — module index");
p("Page = the noun (title + content + children). Pager = the navigator (columns / tabs + routing). See readme.md for the full design doc.");

h2("Levels");
const levels = [
    ["0", "minimal: title + content, render(target)"],
    ["1", "page() helper + captor + sub-pages"],
    ["2", "URL-addressable: slug + Pager (hash routing)"],
    ["3", "swappable Pager — page() = columns, tabs() = tabs  ← blessed default"],
];
div.c("flex v gap", () => {
    levels.forEach(([n, desc]) => {
        div(() => {
            a(`Page${n}`, `./${n}/`).style({ "font-weight": 600, "margin-right": ".5em" });
            el("span", desc).style({ color: "#666" });
        });
    });
});

h2("Blessed default");
p(() => {
    el("span", "page() / tabs() come from ");
    a("Page.class.js", "./Page.class.js");
    el("span", " → 3/Page3.js. Full demo: ");
    a("core/Page/3/", "./3/");
});
