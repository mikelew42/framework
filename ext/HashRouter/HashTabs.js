import { el, div, View, p, Base } from "../../core/core.js";
import HashRouter from "./HashRouter.js";

// this doesn't seem to always block FOUC, we might need to await all the stylesheets
View.stylesheet(new URL('HashTabs.css', import.meta.url).pathname);

class HashTab extends Base {
    instantiate(...args){
        this.active = false;
		this.assign(...args);
		this.initialize_tab();
		this.initialize();
	}

    initialize_tab(){
        if (!this.tabs && this.get_captured){
            // we can't add -> activate yet, just get the reference
            this.tabs = HashTabs.captor;
            this.got_captured = true;
        }

        this.route = new HashRouter({
            path: this.label.toLowerCase().replace(/\s+/g, "-"),
            initialize: () => {
                this.button = div.c("button", this.label).click(() => {
                    // debugger;
                    this.route.go();
                }).append_to(this.tabs.view.buttons);
                
                // this.route.capture(() => {
                this.content = div.c("content", this.content).hide().append_to(this.tabs.view.contents);
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
        if (this.got_captured)
            this.tabs.add(this);
    }

    activate(){
        if (!this.active){
            // console.group("activate tab", this.label);
            this.active = true;
            this.tabs.current && this.tabs.current.deactivate();
            this.tabs.current = this;
            this.button.ac("active");
            this.content.show();
            // console.groupEnd();
        }
    }

    deactivate(){
        // console.log("deactivate tab", this.label);
        this.active = false;
        this.button.rc("active");
        this.content.hide();
    }
}

HashTab.prototype.get_captured = true;

class HashTabs extends Base {
	instantiate(...args){
		this.assign(...args);
		this.initialize_tabs();
		this.initialize();
	}

    initialize_tabs(){
        HashRouter.singleton().on("reset", () => this.reset());
        this.tabs = [];
        this.current = null;
        this.view = div.c("tabs", {
            buttons: div(),
            contents: div()
        });
    }

    reset(){
        this.tabs[0].activate();
    }

    add(label, content){
        let tab;
        if (label instanceof HashTab){
            tab = label;
            tab.tabs = this;
        } else {
            tab = new HashTab({ label, content, tabs: this });
        }

        this.tabs.push(tab);

        // console.log("hashtabs", this, "push", tab);
        if (this.tabs.length === 1){
            tab.activate();
        }
        return this;
    }

    debug(){
        console.log("hashtabs", this);
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
};


HashTabs.previous_captors = [];
HashTabs.prototype.get_captured = true;

export default HashTabs;

function tabs(fn){
    return new HashTabs().capture(fn);
}

tabs.c = function(cls, fn){
    const tbs = new HashTabs().capture(fn);
    tbs.view.ac(cls);
    return tbs;
}

function tab(label, content){
    return new HashTab({ label, content });
}

tab.c = function(cls, label, content){
    const tb = new HashTab({ label, content });
    tb.button.ac(cls);
    tb.content.ac(cls);
    return tb;
};


export { tabs, tab };