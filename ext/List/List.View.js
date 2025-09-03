import { app, el, div, test, View } from "../../app.dev.js";

export default class ListView extends View {
    initialize(){
		this.append(this.render);
	}

	render(){
		this.ac("list");
		this.bar = div.c("list-bar", () => {
			this.name = div.c("list-name", this.list.name || "unnamed list");
			// this.edit, this.delete, this.add
		});
		this.children = div.c("list-children");

		this.update();
	}

	update(){
		// debugger;
		this.children.buffer();
		this.children.empty(() => {
			this.list.each(child => {
				this.render_child(child);
				// if (child.render){
				// 	div.c("list-item", child)
				// 	child.render();
				// } else {
				// 	this.render_child(child);
				// }
			});
		});
		this.children.flush();
	}

	render_child(child){
		div.c("list-item", child);
	}
}