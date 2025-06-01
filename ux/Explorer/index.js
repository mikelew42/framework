import Explorer from "./Explorer.js";
import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/framework/app.dev.js";
import HashRunner from "/framework/App/HashRunner.js";

new HashRunner();
// app.use(Explorer);

test("1", t => {
    const explorer = new Explorer();
});