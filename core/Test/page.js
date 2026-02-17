import app, { el, div, View, h1, h2, h3, p, is, test, Test, assert } from "/app.js";

Test.controls();

app.$root.ac("page");

test("basic", t => {
	assert(1 == 2);
	assert(true, "basic test");
});