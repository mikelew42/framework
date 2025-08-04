import Directory from "./Directory3.js";

import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/framework/app.dev.js";

app.$main.ac("flex pad flex-h-center");

div.c("card", () => {
    h1("class Directory3");

    const directory = new Directory({ 
        app,
        ignore: ["home.page.js", "framework.page.js"]
    });
    directory.render();
});