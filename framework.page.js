import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/framework/app.dev.js";

app.$body.style("background", "#eee");

h1("Framework").click(() => {
    window.location.href = "/framework/";
}).style("cursor", "pointer");


// new HashRunner();
// app.dir = new Directory();
// app.dir.render();
app.directory.render();
app.directory.container();