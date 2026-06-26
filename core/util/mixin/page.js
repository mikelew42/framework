import app, { h1, p, el } from "/app.js";
import test_obj from "./mixin.node.test.js";

app.$root.ac("page");
h1("mixin");
p("Compose multiple classes into one. Last arg is the base; first arg has highest priority.");
el("pre", "class Thing extends mixin(Three, Two, One) {}");

test_obj.render();
