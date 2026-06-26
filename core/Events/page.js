import app, { h1, p, el } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Events from "./Events.test.js";

app.$root.ac("page");
h1("Events");
p("on/off/once/emit/clear — both instance and static. Each subclass gets its own isolated static event map.");

await Events.test.run();
new Test1.View({ suite: Events.test }).render();
