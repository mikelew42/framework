import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/framework/app.dev.js";
import File from "./File.js";

app.$body
// app.$main.style("flex-direction", "column");
// View.set_captor(app.$main);

Test.controls();

test("create an instance", async t => {
    
    const file = await new File({ name: "test1.ext" }).ready;
});
test("specify path", async t => {
    
    const file = await new File({ 
        name: "test2.ext",
        path: "test2"
    }).ready;
});