import Directory2 from "./Directory2.js";

import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/framework/app.dev.js";

// app.$main.ac("flex pad flex-h-center");

div.c("card", () => {
    h1("class Directory2");

    const directory = new Directory2({ app });
    directory.render2();
});