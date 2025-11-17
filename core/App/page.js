import app, { el, div, View, h1, h2, h3, p, is, test, Test } from "../../../app.js";

import exported from "./exported.page.js";
import exported_fn from "./exported_fn.page.js";

app.$root.ac("page");

h1("class App");

// el("style", `
//     body { font-family: "Montserrat"; }
// `);

// await app.font("Montserrat");

Test.controls();

div("before");
// await app.font();
div("after");
/**
 
app.use(socket); => app.ready gets rebuilt with app.ready + socket.ready?

app.ready = Promise.all([app.ready, socket.ready]);

 */

test("is the app ready?", async t => {
    console.log("before");
    await app.ready;
    console.log("after");
});

test("this is a test2", t => {
    h1("this is a test");
    h2("this is a test");
    h3("this is a test");
    p("this is a test");
    div("this is a test");
});

test("exported", t => {
    exported.render();
});

test("exported fn", t => {
    exported_fn();
    div(el("a", "exported_fn").attr("href", "exported_fn"))
    div(el("a", "root content").attr("href", "content"))
});