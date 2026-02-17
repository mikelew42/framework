import app, { el, div, View, h1, h2, h3, p, is, test, Test, assert } from "/app.js";
import FileComponent from "./FileComponent.js";
import Component from "../0/Component0.js";


app.$root.ac("page");

h1("FileComponent");

test("basic", async t => {
	const comp = new FileComponent();
	await comp.ready;
	// comp.set("prop1", "one");
});

test("basic2", async t => {
	const comp = new FileComponent({
		path: "sub"
	});
	await comp.ready;
	// comp.set("prop1", "one");
	t.assert(comp.get("prop1") === "one");
});

test("other name", async t => {
	const comp = new FileComponent({
		name: "other"
	});
	await comp.ready;
	// comp.set("prop1", "one");
	// comp.delete();
});

test("parent", async t => {
	const parent = new FileComponent({
		name: "parent"
	});
	const child = new Component({
		name: "child"
	});

	p("Here's what's happening here:");
	p("The child is created fresh each reload.  The parent is loaded from file.  The parent, upon loading, does auto-instantiation, and creates its own parent.child from its data.  And then we reset the `parent.set({ child })`, which completely overrides that 'own child'...  The new child gets identical properties, and then gets saved in the same way, it's just all that works is sort of for nothing.");

	await parent.ready;
	await child.ready;
	debugger;
	parent.set({child});
	child.set("one", 1);
	child.set("two", { three: 3 });
	
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