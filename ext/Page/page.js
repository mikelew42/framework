import app, { App, el, div, View, h1, h2, h3, icon, p, is, test } from "/app.js";
import Page from "./Page.class.js";

app.$root.ac("pad");

h1("class Page");

test("one", t => {

    const page = new Page({ name: "Test Page" });
    page.add(new Page({ name: "Sub Page 1" }));
    page.add(new Page({ name: "Sub Page 2" }));
    
    console.log(page);
    page.render();
});

