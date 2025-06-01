import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/framework/app.dev.js";

app.$body.style("background", "#eee");

el("a", "/framework/ux/").attr("href", "/framework/ux/");

p("This page is included in the framework.");
p("Maybe the theme is quite basic.");

test("Test.css is automatically loaded", () => {
    p("Maybe the css is inlined into the script?  Honestly though, we have a dozen files being loaded, so a few extra isn't a problem.");
});