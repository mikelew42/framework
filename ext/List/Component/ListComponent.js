import List from "../List.js";
import Component from "../../Component/0/Component0.js";
import util from "../../../lib/util.js";

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
	}
	
    update(){
        this.views && this.views.each(view => {
            view.update(this);
        });

		this.save();
    }
}