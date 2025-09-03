import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/framework/app.dev.js";
import Module from "./Module.js";

Test.controls();

// app.$main.style("flex-direction", "column");
// View.set_captor(app.$main);

test("create an instance", async t => {

    const comp = window.mod = await new Module({
        name: "Root",
        id: "mod",
        path: "/framework/ext/Module/"
    }).ready;
    comp.set("test", "prop");
    // comp.make(10);

    comp.render();
});