import app, { el, div, View, h1, h2, h3, p, is, Base, test, Test } from "/app.js";
import File from "./File.js";

app.$body
// app.$main.style("flex-direction", "column");
// View.set_captor(app.$main);

Test.controls();

test("create an instance", async t => {
    
    const file = await new File({ 
        name: "test1.ext",
        path: "framework/ext/File"
    }).ready;
    console.log("file1", file);

    if (!file.data.prop1){
        file.data.prop1 = "one";
        file.save();
    }
});
test("specify path", async t => {
    
    const file = await new File({ 
        name: "test2.ext",
        path: "framework/ext/File/test2"
    }).ready;
});

function noop(){
    new File({ name: "filename.ext" }); // should be /path/ relative?
        // in the constructor, use window.location.pathname?
}