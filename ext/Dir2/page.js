import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon } from "/app.js";
import Dir2 from "./Dir2.js";

app.$root.ac("pad");

h1("Dir2");

div.c("card", () => {
    const dir = new Dir2();
});