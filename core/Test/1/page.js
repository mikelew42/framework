import app, { h1 } from "/app.js";
import Test1 from "./Test1.js";
import Item3 from "../../Item/3/Item3.test.js";

app.$root.ac("page");

h1("Test1 — browser test renderer");

// Demo: inline test suite
const suite = new Test1({ _name: "Demo suite" });
suite.add("always passes", t => { t.assert(true, "true is truthy"); });
suite.add("always fails", t => { t.assert(false, "intentional failure"); });

const inner = new Test1({ _name: "inner" });
inner.add("inner test", t => { t.assert(1 + 1 === 2, "1 + 1 = 2"); });
suite.add(inner);

await suite.run();

h1("Demo suite");
new Test1.View({ suite }).render();

// The real Item3 test suite (full inherited contract)
h1("Item3 test suite");
await Item3.test.run();
new Test1.View({ suite: Item3.test }).render();
