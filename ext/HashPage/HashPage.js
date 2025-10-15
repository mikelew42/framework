import { el, div, h1, View, p, Base, App } from "../../core/App/App.js";
import HashRouter from "../HashRouter/HashRouter.js";

App.stylesheet(import.meta, "HashPage.css");

class HashPage extends Base {
    instantiate(...args){
        this.active = false;
        this.assign(...args);
        this.initialize_page();
        this.initialize();
    }

    initialize_page(){
        
        this.pages = [];

        if (!this.label){
            this.label = "Root";
        }

        this.slug = this.label.toLowerCase().replace(/\s+/g, "-");

        if (!this.parent && !HashPage.root){
            this.initialize_root();

        // don't think this will work, we need to make the route even if captured...
        } else if (!this.parent && this.get_captured){
            // we can't add -> activate yet, just get the reference
            this.parent = HashPage.captor || HashPage.root;
            this.got_captured = true;
        } else {
            // this route gets captured...
            this.route = new HashRouter({
                path: this.slug,
                initialize: () => {
                    // this.button = div.c("button", this.label).click(() => {
                    //     // debugger;
                    //     this.route.go();
                    // }).append_to(this.parent.view.buttons);
                    
                    // this has to be here, so that it's ready for children
                    this.view = div.c("page page-" + this.slug).append_to(this.parent.view.children).hide();

                    // this could create child pages, so we need this.view to be set before we can do this part
                    this.view.append({
                        content: div({
                            buttons: div()
                        }),
                        children: div()
                    });

                    // !!! this.content is a function that can create sub pages
                    this.view.content.append(() => {
                        this.content(this);
                    });

                    this.button();

                    // this has to be here, because Route gets matched -> activated immediately
                    // before this.route is even set
                    // putting this in activate() won't work, because this.route won't be defined...
                    // this.route.capture(() => {
                        // this.$content = div.c("content", () => { 
                        //     this.content(this);
                        // }).append_to(this.parent.view.contents);
                    // });
                },
                activate: () => {
                    this.activate();
                },
                deactivate: () => {
                    // this.deactivate();
                    // leave the tabs UI active => it remembers state
                    // if you deactivate here, then no tabs are active when the parent becomes visible again
                }
            });
        }



        if (this.got_captured)
            this.parent.add(this); // add will immediately activate() if first page, we must have rendered
    }

    activate(){
        if (!this.active){
            // console.group("activate tab", this.label); 

            this.active = true;
            this.parent.current && this.parent.current.deactivate();
            this.parent.current = this;
            this.$button?.ac("active");
            this.view.ac("active").show();
            // console.groupEnd();
        }
    }

    deactivate(){
        // console.log("deactivate tab", this.label);
        this.active = false;
        this.$button?.rc("active");
        this.view.hide().rc("active");

    }

    initialize_root(){
        HashRouter.singleton().on("reset", () => this.reset());
        HashPage.root = this;
        this.current = null;
        this.view = div.c("page page-root active", {
            content: div({
                buttons: div()
            }),
            children: div()
        });
    }

    reset(){
        this.pages[0].activate();
    }

    add(label, content){
        let page;
        if (label instanceof HashPage){
            page = label;
            page.parent = this;
        } else {
            page = new HashPage({ label, content, parent: this });
        }

        this.pages.push(page);

        // console.log("hashtabs", this, "push", tab);
        // if (this.pages.length === 1){
        //     page.activate();
        // }
        return page;
    }

    button(){
        this.$button = div.c("button", this.label).click(() => {
            // debugger;
            this.route.go();
        }).append_to(this.parent.view.content.buttons);
    }

    debug(){
        console.log("HashPage", this);
    }

    capture(fn){
        this.constructor.set_captor(this);
        fn(this);
        this.constructor.restore_captor();
        return this;
    }

    static set_captor(tabs){
        this.previous_captors.push(this.captor);
        this.captor = tabs;
    }

    static restore_captor(){
        this.captor = this.previous_captors.pop();
    }
}

HashPage.prototype.get_captured = true;



HashPage.previous_captors = [];
HashPage.prototype.get_captured = true;

export default HashPage;

// function tabs(fn){
//     return new HashTabs().capture(fn);
// }

// tabs.c = function(cls, fn){
//     const tbs = new HashTabs().capture(fn);
//     tbs.view.ac(cls);
//     return tbs;
// }

// function tab(label, content){
//     return new HashTab({ label, content });
// }

// tab.c = function(cls, label, content){
//     const tb = new HashTab({ label, content });
//     tb.button.ac(cls);
//     tb.content.ac(cls);
//     return tb;
// };


// export { tabs, tab };