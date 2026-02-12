import app, { App, el, div, View, h1, h2, h3, p, is, icon, test, section, code } from "../app.js";

// app.$body.style("background", "#eee").style("font-family", "'Courier New', Courier");

// app.sidenav();

app.$root.ac("page");

h1(icon("code"), "Framework");

section(() => {
    h2("HTML")
    code.edit(`div("hi")`);
});

section(() => {
    h2("CSS");
    p("If a Thing.css loads before framework.css, and it tries to define layer-specific styles, that layer will be defined as the root layer.");
    p("This often happens, because framework.css and Lew42.css are loaded inside `app.instantiate()`, and Thing.css is just auto-imported at the root of the script.")
});

section(() => {
    h2("JS")
    code.edit(
`div(() => {
    for (let i = 0; i < 3; i++) {
        el("p", i);
    }
})`);
});