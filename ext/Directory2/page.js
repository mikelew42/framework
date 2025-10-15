import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon } from "/app.js";
import Directory2 from "./Directory2.js";

app.$root.ac("pad");

h1("Directory2");

div.c("card", () => {
    const dir = new Directory2();

    dir.render();
});