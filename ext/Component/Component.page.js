import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/framework/app.dev.js";
import Component from "./Component.js";

Test.controls();

app.$main.style("flex-direction", "column");

test("create an instance", async t => {

    const comp = await new Component().ready;
    comp.set("test", "prop");

});


// this fails, because the path doesn't exist
// test("set path", async t => {
//     const comp = await new Component({
//         path: "/framework/ext/Component/test/"
//     }).ready;
//     comp.set("test", "prop");
// });