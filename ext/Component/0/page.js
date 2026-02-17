import app, { el, div, View, h1, h2, h3, p, is, test, Test } from "/app.js";
import Component0 from "./Component0.js";


app.$root.ac("page");

h1("Component0");

test("basic", async t => {
	const comp = new Component0();
	await comp.ready;
	comp.set("prop1", "one");
});

test("basic2", async t => {
	const comp = new Component0({
		path: "sub"
	});
	await comp.ready;
	comp.set("prop1", "one");
});

test("other name", async t => {
	const comp = new Component0({
		name: "other"
	});
	await comp.ready;
	// comp.set("prop1", "one");
	// comp.delete();
});

// throws
// test("without await", t => {
// 	const comp = new Component0({
// 		name: "faster"
// 	});
// 	comp.set("immediate", "prop");
// });


// test("nested", async t => {
// 	const comp = new Component0({
// 		name: "parent"
// 	});

// 	const child = new Component0({
// 		name: "child"
// 	});

// 	await comp.ready;
// 	await child.ready;
	
// });