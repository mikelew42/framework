import app, { h1, p } from "/app.js";
import { test, assert } from "./Test3.js";
import test_obj from "./Test3.node.test.js";

app.$root.ac("page");
h1("Test3");
p("One test class, global captor. `test(Class)` sets the captor; subsequent `test()` calls capture children. `.render()` runs and renders synchronously — set a breakpoint to watch the UI build up.");

test("before");
test_obj.render();
test("after");