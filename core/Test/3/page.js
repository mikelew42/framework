import app, { h1, p } from "/app.js";
import test_obj from "./Test3.node.test.js";
import { test, assert } from "./Test3.js";

app.$root.ac("page");
h1("Test3");
p("One test class, global captor. `test(Class, scope)` sets and restores the captor. `.render()` runs and renders synchronously — set a breakpoint to watch the UI build up.");

test("before", () => {
	p("This should auto_render before the test_obj");
});
test_obj.render();
test("after", () => {
	p("This should auto_render after the test_obj");

	test("inside", () => {
		p("test should properly nest");
		assert(true);
	});
});
