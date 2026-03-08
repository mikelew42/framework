import app, { el, div, test, View, is, p, h1  } from "/app.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";

app.$root.ac("page");

h1("Draggable/test/")

test("Sortable.List spaced", t => {
	t.view.ac("spaced");
	el("button", "Debug").click(() => {
		t.view.tc("debug");
	});
	const list = new Sortable.List({ name: "Root" });

	list.append(new Sortable.View().append("Item 0"));
	list.append(new Sortable.List({ name: "Step 1" }));
	list.append(new Sortable.List({ name: "Step 2" }));
	list.append(new Sortable.List({ name: "Step 3" }));
	list.append(new Sortable.List({ name: "Step 4" }));
	list.append(new Sortable.List({ name: "Step 5" }));
	list.append(Sortable.List.make_deep(2));
	list.render();
});