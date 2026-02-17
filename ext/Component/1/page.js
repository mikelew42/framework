import app, { el, div, View, h1, h2, h3, p, is, test, Test } from "/app.js";
import Component1 from "./Component1.js";


app.$root.ac("page");

h1("Component1");

test("basic", async t => {
	const comp = new Component1();
	await comp.ready;
	comp.set("prop1", "one");
});

