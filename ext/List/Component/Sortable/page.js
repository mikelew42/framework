import app, { el, div, style, h1, test, assert, util, View } from "/app.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import ListComponent from "/framework/ext/List/Component/ListComponent.js";
import FileComponent from "/framework/ext/Component/File/FileComponent.js";
style(`
	p:has(.p-handle){
		position: relative;
	}
	.p-handle {
		width: 10px;
		top: 5px;
		bottom: 5px;
		background-color: #ccc;
		position: absolute;
		cursor: move;
		left: -20px;
	}
`);
class P extends View {
	initialize(){
		if (this.parent.saver)
			this.saver = this.parent.saver;
		
		if (!this.data)
			this.data = { content: "New p." };

		this.append(this.render);
	}
	render(){
		this.attr("contenteditable", "true");
		this.handle = div.c("p-handle");
		this.append(this.data.content);
		this.on("input", e => {
			this.saver.save();
		});

		this.sortable = new Sortable({
			view: this,
			handle: this.handle
		});
	}
	toJSON(){
		return { type: "P", content: this.el.textContent };
	}
	setup(parent, name){
		if (parent)
			this.parent = parent;

		if (name)
			this.name = name;
		
		this.saver = this.parent.saver;
	}
}
P.prototype.tag = "p";

// prevents p.parent from becoming the div.root, and instead becomes the SortableListComponent
P.prototype.capture = false;

FileComponent.types.push(ListComponent, View, P);

Sortable.ListComponent = class SortableListComponent extends ListComponent {
	// adopt(child){
    //     child.setup(parent);
    //     return this;
    // }
};
Sortable.ListComponent.View = Sortable.List.View;

FileComponent.types.push(Sortable.ListComponent);

div.c("page spaced", () => {
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
				fcomp.get("sortable_list").add(new Sortable.ListComponent({ 
					name: "Step " + fcomp.get("sortable_list").children.length 
				}));
			});			
			
			el("button", "P").click(() => {
				// debugger;
				fcomp.get("sortable_list").add(new P({ parent: fcomp.get("sortable_list") }).attr("contenteditable", "true").on("input", e => {
					fcomp.save();
				}));
			});
			// debugger;

			div.c("mb");

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