import { el, div, View } from "../../App/App.js";

export default class List0View extends View {
    initialize(){
		this.append(this.render);
	}

	render(){
		this.ac("list");
		this.bar = div.c("list-bar", () => {
			this.name = div.c("list-name", this.list.name || "unnamed list");
		});
		this.children = div.c("list-children");

		this.update();
	}

	update(){
		this.children.empty(() => {
			this.list.each(child => {
				this.render_child(child);
			});
		});
	}

	render_child(child){
		div.c("list-item", child);
	}
}
