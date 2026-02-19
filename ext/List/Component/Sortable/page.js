import app, { el, div, h1, test, assert, util } from "/app.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import ListComponent from "/framework/ext/List/Component/ListComponent.js";
import FileComponent from "/framework/ext/Component/File/FileComponent.js";

FileComponent.types.push(ListComponent);

Sortable.ListComponent = class SortableListComponent extends ListComponent {
	// adopt(child){
    //     child.setup(parent);
    //     return this;
    // }
};
Sortable.ListComponent.View = Sortable.List.View;

FileComponent.types.push(Sortable.ListComponent);

div.c("page", () => {
	h1("SortableListComponent");



	test("1", async t => {
		let fcomp = window.fcomp = new FileComponent({
			name: "test"
		});

		// div(fcomp);

		// el("button", "Delete").click(async () => {
		// 	await fcomp.delete();
		// 	window.location.reload();
		// });

		// el("button", "Sortable").click(async () => {
		// 	const slcomp = new Sortable.ListComponent({
		// 		name: "sortable_list"
		// 	});

		// 	await fcomp.ready;
		// 	fcomp.set("sortable_list", slcomp);
		// 	await fcomp.ready;
		// 	window.location.reload();
		// });

		el("button", "Reset").click(async () => {
			await fcomp.delete();
			fcomp = window.fcomp = new FileComponent({
				name: "test"
			});

			await fcomp.ready;

			const slcomp = new Sortable.ListComponent({
				name: "sortable_list"
			});

			fcomp.set("sortable_list", slcomp);

			await fcomp.ready;

			window.location.reload();
		});

		div.c("mb");

		// fcomp.set("sortable_list", slcomp);
		await fcomp.ready;
		t.view.container.append(() => {
			el("button", "Add").click(() => {
				// debugger;
				fcomp.get("sortable_list").add(new Sortable.ListComponent({ name: "Step " + fcomp.get("sortable_list").children.length }));
			});
			// debugger;

			const sortable_list = fcomp.get("sortable_list");
			sortable_list?.render();
		});

		// fcomp.sortable_list.append(new Sortable.ListComponent({ name: "Step 1" }));
		// fcomp.sortable_list.append(new Sortable.ListComponent({ name: "Step 2" }));
		// fcomp.sortable_list.append(new Sortable.ListComponent({ name: "Step 3" }));

		// slcomp.render();
	// 	const lcomp = new ListComponent({
	// 		name: "list"
	// 	});

		
	// 	await fcomp.ready;
	// 	fcomp.set("list", lcomp);
	// 	lcomp.add("something");
	// 	// t.assert(fcomp.get("list") === lcomp);
	// 	// debugger;
	});
});