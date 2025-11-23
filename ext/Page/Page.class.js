import { View,  Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "../../core/App/App.js";
import List from "../List/List.js";

export default class Page {
    constructor(...args){
        this.assign(...args);
        this.instantiate();
    }

    instantiate(){
        this.pages = new List({ parent: this });

        // don't auto init?
        // app could initialize the page AFTER import but before rendering
        // what if the page awaits some data, and it doesn't arrive before render?
        // we could either try to render the container, and async append
        // or, we try to create an async render support in the app?
        // await page.ready; then app.$root.append(page);?
        this.initialize();
    }

    initialize(){}

    add(...args){
        this.pages.add(...args);
    }

    link(){
        el("a", this.name).attr("href", this.href());
    }

    render(){
        this.view = div.c("page " + this.name.toLowerCase().replace(/\s+/g, "-"), () => {
            this.header();
            this.content();
            // this.footer();
        });
    }

    header(){
        h1(this.name);
    }

    content(){
        this.pages.render();
    }

    preview(){
        el("a", div.c("page-preview", this.name)).attr("href", this.href());
    }

    
    href(){
        if (this.meta.url.endsWith(".page.js")){
            // what about the /path/path.page.js pattern?  ugh
            return this.meta.url.replace(".page.js", "");
        }
    }

    
    back(){
        let url;

        // if /path/page/, go up to /path/
        if (window.location.pathname.endsWith("/"))
            url = "../";

        // if /path/page , go to /path/
        else 
            url = "./";

        el("a", "Back").attr("href", url);
    }
    
	assign(...args){
		return Object.assign(this, ...args);
	}
}
/**


page(pg => {
    // content here?    
});


page({
    title: "Title Case Title",
    props,
    preview(){},
    content(){}
}).add(subs)

 */