import Base from "../../core/Base/Base..js";
import { el, div, h1, h2, View, p, App, is } from "../../core/App/App.js";
import HashRouter from "../HashRouter/HashRouter.js";

// App.stylesheet(import.meta, "HashPager.css"); DNE

class HashPager extends Base {
    instantiate(...args){
        this.active = false;
        this.assign(...args);
        this.initialize_page();
        this.initialize();
    }

    initialize_page(){
        
        this.pages = [];

        this.slug = this.slug || this.label?.toLowerCase().replace(/\s+/g, "-") || "undefined";

        if (this.get_captured){
            // we can't add -> activate yet, just get the reference, add() after creating route
            this.parent = HashPager.get_captor();
            this.got_captured = true;


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
                    this.deactivate();
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
        this.view = div.c("page page-" + this.slug, {
            header: h2(this.label),
            buttons: div()
        }).append_to(HashPager.pager.view.pages).hide();

        // !!! this.content is a function that can create sub pages
        this.capture(() => {
            this.view.append(this.content);
        });

        this.button = div.c("button", this.label).click(() => {
            // debugger;
            this.route.go();
        });
        
        if (this.parent.view)
            this.button.append_to(this.parent.view.buttons);
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

    initialize_pager(){
        // this is an important step, but confusing interaction with root router...
        HashRouter.singleton().on("reset", () => this.reset());
        this.current = null;
        this.view = div.c("pager", {
            buttons: div(),
            pages: div()
            // pages: div({
            //     left: div(),
            //     right: div()
            // })
        });
    }

    reset(){
        this.pages[0].activate();
    }

    add(label, content){
        let page;
        if (label instanceof HashPager){
            page = label;
            page.parent = this;
        } else {
            page = new this.constructor({ label, content, parent: this });
        }

        this.pages.push(page);

        return page;
    }

    debug(){
        console.log("HashPage", this);
    }

    capture(fn){
        if (this.route){ // for the make() method, we weren't properly capturing routes, outside of route.initialize
            // unforuntately, we still need the route.initialize thing, for order of operations
            this.route.capture(() => {
                this._capture(fn);
            })
        } else {
            this._capture(fn);
        }
        return this;
    }

    _capture(fn){
        this.constructor.set_captor(this);
        fn(this);
        this.constructor.restore_captor();
    }

    // make(n=1, max=1){
    //     if (!n)
    //         return;

    //     if (max !== 1)
    //         max = n;

    //     this.capture(() => {    
    //         for (var i = 0; i <= max; i++){
    //             this.add("Made " + n + "." + i, "Content for " + n + "." + i).make(i, max);
    //         }
    //     });
            
    //     return this;
    // }

    make(n, currentPath = "") {
        // Base Case: Stop the recursion when the required number of sub-items is 0 or less.
        if (n <= 0) {
            return this;
        }
        
        this.capture(() => {
            // Loop from 1 up to 'n' to create the items for the current level.
            // If n=5, it creates 1, 2, 3, 4, 5.
            // If n=2, it creates .1, .2.
            for (let i = 1; i <= n; i++) {
                const newPath = currentPath ? `${currentPath}.${i}` : `${i}`;
                const title = `Page ${newPath}`;
                const content = `Content for ${newPath}`;

                // Add the current page
                // Note: We are using 'this.add' which is conceptually adding the page
                // to the parent, but here it just logs/stores it flatly.
                this.add(new this.constructor({
                    label: title,
                    slug: "" + i, // !!! major problem if router tries to use numeric path
                    content
                })).make(n-1, newPath);
            }
        });

        return this;
    }

    static set_captor(pager){
        this.previous_captors.push(this.captor);
        this.captor = pager;
    }

    static restore_captor(){
        this.captor = this.previous_captors.pop();
    }

    // automatically creates root
    static get_captor(){
        if (!this.captor){
            this.captor = this.singleton();
        }
        return this.captor;
    }

    static singleton(){
        if (!this.pager){
			this.pager = new this({ get_captured: false, label: "pager" });
            this.pager.initialize_pager();
		}
		return this.pager;
    }
}



HashPager.previous_captors = [];
HashPager.prototype.get_captured = true;

export default HashPager;

function page(name, fn){
    if (is.fn(name)){
        return new (HashPager.get_captor().constructor)({ content: name })
        // return new HashPager({ content: name });
    } else {
        return new (HashPager.get_captor().constructor)({ label: name, content: fn })
        // return new HashPager({ label: name, content: fn });
    }
}

export { page };