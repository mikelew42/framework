import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/framework/app.dev.js";
import Deep from "./Deep.js";

Test.controls();

// app.$main.style("flex-direction", "column");
// View.set_captor(app.$main);

test("create an instance", async t => {

    const comp = await new Deep({
        id: "deep",
        path: "/framework/ext/Component/"
    }).ready;
    comp.set("test", "prop");

    comp.render();
});


// this fails, because the path doesn't exist
// test("set path", async t => {
//     const comp = await new Component({
//         path: "/framework/ext/Component/test/"
//     }).ready;
//     comp.set("test", "prop");
// });