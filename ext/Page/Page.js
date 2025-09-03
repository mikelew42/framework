import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "../../core/App/App.js";
import List from "../List/List.js";

export default class Page extends List {
    // instantiate(...args){
	// 	this.assign(...args);
	// 	this.initialize();
    // }
	// instantiate(...args){
	// 	this.assign(...args);
    //     // this.immediate?.();
    //     if (this.children){
    //         this.set_children(this.children);
    //     } else {
    //         this.set_children([]);
    //     }
	// 	this.initialize();
	// }
    render(){
        this.$view = this.$view || div.c("page page-fullview", {
            title: h1(this.name || "Unnamed Page Fullview"),
            content: () => {
                this.content();
            }
        });

        return this.$view;
    }

    content(){
        this.each(child => {
            // console.log(child);
            child.preview()   
        });
    }

    preview(){
        this.$preview = this.$preview || div.c("page page-preview", this.name || "Unnamed Page").click(view => {
            // this.app.go(this.path);
            if (this.parent){
                this.parent.$view.content.empty(this.render())
            } else {
                this.$preview.replace(this.render())
            }
        });

        return this.$preview;
    }
}