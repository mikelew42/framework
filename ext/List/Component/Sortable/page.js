import app, { el, div, h1, test, assert, util } from "/app.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import ListComponent from "/framework/ext/List/Component/ListComponent.js";
import FileComponent from "/framework/ext/Component/File/FileComponent.js";

FileComponent.types.push(ListComponent);

Sortable.ListComponent = class SortableListComponent extends ListComponent {
	toJSON(){
		return this.data;
	}
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
		const fcomp = window.fcomp = new FileComponent({
			name: "test"
		});

		// const slcomp = new Sortable.ListComponent({
		// 	name: "sortable-list"
		// });

		await fcomp.ready;

		fcomp.sortable_list.render();
		// fcomp.set("sortable_list", slcomp);
		// slcomp.append(new Sortable.ListComponent({ name: "Step 1" }));
		// slcomp.append(new Sortable.ListComponent({ name: "Step 2" }));
		// slcomp.append(new Sortable.ListComponent({ name: "Step 3" }));

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