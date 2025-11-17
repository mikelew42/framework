import Base from "../../core/Base/Base..js";
import { el, div, h1, View, p, App, is } from "../../core/App/App.js";
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
            console.warn("Does this happen?  I think this is for capturing sub pages.");
            // we still need a route here, need to combine this with below
            // we can't add -> activate yet, just get the reference
            this.parent = HashPage.captor || HashPage.root; // is this a hack?
            this.got_captured = true;
        } else {
            // if page.add("sub"), then we have parent before initialize, and this will run.
            // if we have new HashPage or page() within, it won't yet work
            // we'd just need to capture first, by setting .parent?
            // HashPage.get_captor().adopt(this) => sets parent, adds to parent's children...
            // this route gets captured...
            this.route = new HashRouter({
                path: this.slug,

                /**
                 * We need to create the route before rendering, so that page content can create routes and be properly captured by the page.route.
                 * 
                 * Even though page.route doesn't exist yet, the new Route captures initialize, so it works.
                 * 
                 * And we can't page.render() after new Route, because after initialize, the route.match() will route.activate() which will page.activate(), which needs page.view for page.view.ac("active");
                 */
                initialize: () => {
                    
                    // must be done before match() is called (right after route.initialize), because match() -> activate() -> needs views

                    // also, router is capturing initialize, so if we want page content to be able to create sub routes (like hash tabs), rendering must be captured...
                    this.render();
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

            // actually, no activate will happen here, page.activate is triggered by the route
            // this just adds the sub page to parent.pages[]
    }

    render(){
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

        this.button = div.c("button", this.label).click(() => {
            // debugger;
            this.route.go();
        }).append_to(this.parent.view.content.buttons);
    }

    activate(){
        if (!this.active){
            // console.group("activate tab", this.label); 

            this.active = true;
            this.parent.current && this.parent.current.deactivate();
            this.parent.current = this;
            this.update();
            // console.groupEnd();
        }
    }

    deactivate(){
        // console.log("deactivate tab", this.label);
        this.active = false;
        this.update();

    }

    update(){
        if (!this.view) return; 
        if (this.active){
            this.view.ac("active").show();
            this.button.ac("active");
        } else {
            this.view.hide().rc("active");
            this.button.rc("active");
        }
    }

    initialize_root(){
        // this is an important step, but confusing interaction with root router...
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

        return page;
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



HashPage.previous_captors = [];
HashPage.prototype.get_captured = true;

export default HashPage;

function page(name, fn){
    if (is.fn(name)){
        return new HashPage({ content: name });
    } else {
        return new HashPage({ label: name, content: fn });
    }
}

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


export { page };