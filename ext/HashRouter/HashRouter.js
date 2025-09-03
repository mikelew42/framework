import { el, div, test, Base, Events, is } from "../../core/core.js";

export default class HashRouter extends Events {
    
	static singleton(){
		if (!this.router){
			this.router = new this({ get_captured: false });
            this.router.instantiate_router();
		}
		return this.router;
	}

    static get_captor(){
        if (!this.captor){
            this.captor = this.singleton();
        }
        return this.captor;
    }

    static capture(fn){
        const route = this.captor || (this.captor = this.singleton());
    }

    capture(fn){
        HashRouter.set_captor(this);
        fn();
        HashRouter.restore_captor();
    }

    static set_captor(route){
		this.previous_captors.push(this.captor);
		this.captor = route;
	}

	static restore_captor(){
		this.captor = this.previous_captors.pop();
	}

    instantiate(...args){
        this.events = {};
        this.routes = [];
        this.assign(...args);

        // don't try to capture the root router
        this.get_captured && HashRouter.get_captor().add(this);

        if (this.parent){
            this.router = this.parent.router; // not sure we need this
            
            // match -> activate, so we need to initialize (render) first
            this.capture(() => {
                this.initialize();
                this.match();
            });
        }
        
    }
    
    // only called on root, singleton router
    instantiate_router(){
        this.router = this;
        this.remainder = window.location.hash.slice(1).split("/").filter(Boolean);
        // console.log("HashRouter: remainder", this.remainder);
        
        window.addEventListener("hashchange", e => {
            this.rematch();
        });
    }

    // only called on router?
    rematch(){
        this.remainder = window.location.hash.slice(1).split("/").filter(Boolean);
        // console.log("HashRouter: rematch", this.remainder);
        if (this.remainder.length){
            this.routes.forEach(route => route.match());
        } else {
            this.reset();
        }
    }

    match(){
        // actually,  no... only call activate if matched
        // let the implementation handle no-hash case
        // if (!window.location.hash){
        //     this.activate(this);
        // }
        if (this.parent.remainder && this.parent.remainder[0] === this.path){
            
            // console.log("match", this.path, this.parent.remainder);
            this.remainder = this.parent.remainder.slice(1);
        
            if (!this.active){
                this._activate();
            }

            this.routes.forEach(route => route.match());
        
        } else if (this.active){
            this._deactivate();
        }
    }

    _deactivate(){
        this.active = false;
        delete this.remainder;
        // this.routes.forEach(route => route.deactivate());
        // console.log("deactivate route", this.full());
        this.deactivate();
    }

    _activate(){
        // console.group("activate route", this.full());
        this.active = true;
        this.activate(this);
        // console.groupEnd();
    }

    activate(){}
    deactivate(){}

    add(path, callback){
        let route;
        if (path instanceof HashRouter){
            route = path;
            route.parent = this;
        } else if (is.obj(path)){
            route = new this.constructor(path, { parent: this, get_captured: false });
        } else {
            route = new this.constructor({
                parent: this,
                path,
                activate: callback,
                get_captured: false
            });
        }
        this.routes.push(route);
        return route;
    }

    full(){
        var full = [this.path], parent = this.parent;
        while (parent){
            // router doesn't have a path, which adds undefined
            if (parent.path){
                full.unshift(parent.path);
            }
            parent = parent.parent;
        }
        return "/" + full.join("/") + "/";
    }

    go(){
        if (this.parent){
            window.location.hash = this.full();
        } else {
            this.reset();
        }
    }
    
    reset(){
        // console.log("reset router");
        history.pushState(null, "", window.location.pathname);
        this.emit("reset");
    }

    debug(){
        this.dview = div.c(this.parent ? "hash-route" : "hash-route hash-router", dview => {
            dview.bar = div.c("bar", this.path || "Router").click(() => this.go());
            dview.children = div.c("children", () => {
                this.routes.forEach(route => route.debug());
            });
        });
    }
}

HashRouter.previous_captors = [];
HashRouter.prototype.get_captured = true;