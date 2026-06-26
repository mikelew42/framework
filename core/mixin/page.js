import app, { el, h1, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import mixin from "./mixin.test.js";

app.$root.ac("page");
h1("mixin");
p("Compose multiple classes into one. Last arg is the base; first arg has highest priority.");

el("pre", `class Thing extends mixin(Three, Two, One) {}`);

await mixin.test.run();
new Test1.View({ suite: mixin.test }).render();
