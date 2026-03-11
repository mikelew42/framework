import List from "../List.js";
import Component from "../../Component/0/Component0.js";
import util from "../../../lib/util.js";
import is from "../../../lib/is.js";

export default class ListComponent extends util.mixin(List, Component) {
	// constructor(...args){
    //     this.assign(...args);
    //     this.instantiate();
    //     this.initialize();
    // }
	
	instantiate(){
		this.instantiate_component(); // 1
		this.children = this.data.children = this.data.children || []; // whoa
		// this.instantiate_list(); // this is just this.children?
		this.instantiate_data();
		this.instantiate_children();
	}

	instantiate_children(){
		for (let i = 0; i < this.children.length; i++){
			const child = this.children[i];
			if (child?.type){
				// ListComponent.types[] must be the same as Component.types[], not sure that's best
				const Type = this.constructor.get_Type(child.type);
				this.children[i] = new Type({ data: child, name: child.name, parent: this });
			}
		}
	}
	
    update(){
		// console.log("Update...");
		// debugger;
        this.views && this.views.each(view => {
            view.update(this);
        });

		console.group(this.name);
		console.log(this.children.map(c => c.name));
		console.groupEnd();

		// console.log("Saving?");
		this.save();
    }

	changed(){
		// Component.changed => save()
		// List.changed => update => save()

		// Without this, Component's changed was overriding List's changed
		// console.log("changed?");
		List.prototype.changed.call(this);
	}

	adopt(child){
        if (is.obj(child)){ // or instance of list?
            // we might get conflicts with other hierarchical things....
            // if child.parent, child.remove()?
            // the problem there, is that then you can't add one list to two others... only 1 parent?
            if (child.setup){
				child.setup(this);
			} else {
				child.parent = this;
			}
            if (this === child)
                console.warn("Add list to itself?");
        }
        return this;
    }
}