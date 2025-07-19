import List from "../List/List.js";
import File from "./File.js";

import { el, div, icon } from "../../core/View/View.js";

export default class Dir extends List {
    instantiate(...args){
        this.assign(...args);
        this.instantiate_dir();
        this.instantiate_children();
		this.initialize();
    }

    instantiate_dir(){
        
    }

    instantiate_children(){
        if (this.children){
            this.data = this.children;
            this.children = [];
            for (let fd of this.data){
                if (fd.type === 'file'){
                    this.add(new File( fd ));
                } else if (fd.type === 'dir'){
                    this.add(new Dir( fd ));
                } else {
                    console.warn("Unknown directory item type: ", fd.type);
                }
            }
        } else {
            this.children = [];
        }
    }

    render_nav(){
        const dir = div.c("dir" + ( this.root ? " root" : "" ), dir => {
            if (!this.root){

                dir.bar = div.c("bar", {
                    name: div(this.name).click(() => {
                        if (this.real){
                            window.location.assign("/" + this.full + "/");
                        } else if (this.default){
                            window.location.hash = "/" + (this.hash || this.full) + "/";
                            window.location.reload();
                        }
                    })
                })
            }

            if (this.children.length){
                dir.ac("has-icon");
                dir.bar?.prepend(icon("arrow_right").click(() => {
                    dir.tc("open");
                    dir.children.toggle();
                }));
                dir.children = div.c("children", () => {
                    for (const child of this.children){
                        child.render_nav();
                    }
                });

                // hide all but active (1)
                if (  window.location.hash.substring(1) !== ("/" + (this.hash || this.full) + "/")  ){
                    dir.children.hide();
                    dir.ac("active");
                }

                // show root (2)
                if (this.root){
                    dir.children.show();
                }
            }
        });

        if (this.real){
            dir.ac("real");
        } else if (this.default){
            dir.ac("default");
        } else if (this.page){
            dir.ac("page");
        }
    }
}