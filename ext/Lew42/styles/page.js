import app, { App, el, div, View, h1, h2, h3, p, code, section } from "/app.js";

app.$root.ac("page");

h1("Lew42/styles");

section(() => {

    h2("Section Title");

    p("Add notes here.  Use `backticks` for code.");

    code.edit(
// keep code string templates at root indentation
`div.c("flex", () => {
    p.c("intro", "This is an intro paragraph.");
    p.c("intro", "This is an intro paragraph.");
});`);

});