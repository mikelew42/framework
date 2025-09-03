import Base from "../../core/Base/Base.js";
import { View, el, div } from "../../core/View/View.js";
import is from "../../lib/is.js";
import ListView from "./List.View.js";
// not sure this is a good idea:
View.stylesheet("/framework/ext/List/styles.css");


export default class List extends Base {
    
	instantiate(...args){
		this.assign(...args);
        this.immediate?.();

        // why do you need to pass in children?
        if (this.children){
            this.set_children(this.children);
        } else {
            this.set_children([]);
        }
		this.initialize();
	}

    set_children(children){
        this.children = children;
        this.each(child => this.adopt(child));
    }

    initialize(){}

    render(){
        if (!this.constructor.View)
            throw "Need List.View class";

        if (!this.views){
            this.views = new List({ list: this });
        }

        this.views.append(new this.constructor.View({
            list: this
        }, this.view)); // this.view is undefined by default
                        // use new List({ view: {...} }) to pass properties
    }

    changed(){
		if (this.update && !this.updating){
			this.updating = setTimeout(() => {
				this.updating = false;
				this.update();
			}, 0);
		}
    }

    update(){
        this.views && this.views.each(view => {
            view.update(this);
        });
    }

    // author: ChatGPT
    [Symbol.iterator]() {
        let index = 0;
        const children = this.children;

        return {
            next() {
                return index < children.length
                ? { value: children[index++], done: false }
                : { done: true };
            }
        };
    }

    each(fn){
        for (let i = 0; i < this.children.length; i++) {
            if (fn.call(this, this.children[i], i, this) === false) break;
        }
        return this;
    }

    // no filtering, breaking, returning
    // see underscore.js for examples
    walk(fn){
        this.each(child => {
            if (fn.call(this, child) === false) return false;;
            
            if (child?.walk) {
                child.walk(fn);
            }
        });
        return this;
    }

    // walk could break the whole thing?
    // what if you want to skip, but not stop?
    // .run() => return false to skip this one and children
    //      but siblings are checked, the whole thing runs through
    // .walk() => return false could stop the whole thing

    append(child){
        this.adopt(child);
        this.children.push(child);
        this.changed();
        return this;
    }

    adopt(child){
        if (is.obj(child)){ // or instance of list?
            // we might get conflicts with other hierarchical things....
            // if child.parent, child.remove()?
            // the problem there, is that then you can't add one list to two others... only 1 parent?
            child.parent = this;
            if (this === child)
                console.error("Uh oh");
        }
        return this;
    }

    add(...args){
        return this.append(...args);
    }

    log(){
        this.each(child => console.log(child));
    }

    // do list.clone("deep") for recursive clone
    // or list.clone(1) to only clone children
    // or list.clone(depth) to clone depth generations
    clone(depth){ // doesn't actually clone
        if (depth){
            if (is.num(depth)) depth--;
            return new this.constructor({
                children: this.children.map(child => (child && child.clone && child.clone(depth)) || child)
            });
        } else {
            return new this.constructor({
                children: this.children.slice()
            });
        }
    }


    insert(child, index){
        this.adopt(child);
        this.children.splice(index, 0, child);
        this.changed();
        return this;
    }

    // maybe don't have these, it's more clear to just write it out...?
    // could add instrumentation...
    find(fn){
        return this.children.find(fn);
    }

    // get own index
    index(){
        return this.parent.index_of(this);
    }

    index_of(child){
        return this.children.indexOf(child);
    }
    
	remove(child){
		if (child){
            // this.find? multiple instances?
			this.each((item, i) => {
				if (item === child){
                    if (child.parent === this) delete child.parent;
					this.children.splice(i, 1);
                    // this.get("order").splice(i, 1);
                    // this.save();
				}
			});
			this.changed();

        // (if !child), we're calling mod.remove() with no args => remove self from parent
		} else if (this.parent){
			this.parent.remove(this);
		}
	}

    // like find, but returns the first value returned by the fn
    deduce(fn){
        var value;
        this.each(child => {
            value = fn.call(this, child);
            if (value !== undefined) return false;
        });
        return value;
    }

    // filters the current list (oo style, not immutable)
    filter(fn){
        // reset children or splice?
    }

    // like each, but the returned value gets set as the new child value
    revalue(fn){
        return this.each((child, i) => {
            this.children[i] = fn.call(this, child, i, this);
            if (is.obj(this.children[i])) {
                this.children[i].parent = this;
            }
        });
    }

    empty(){
        this.set_children([]);
        this.changed();
        return this;
    }

    map(fn){
        /**
         * the problem here, is that the new List isn't here in time to pass as an argument to the map cb
         */
        const self = this;
        return new List({
            // this is just to get the children cloned before initialize()?
            // and without making an empty .children array
            // and to get a handle on the new List
            // honestly though, if this is just the simple List, and we're not intending on extending it...? 
            // tricky spot here...
            immediate(){
                this.set_children(self.children.map((child, i) => {
                    return fn.call(this, child, i, this);
                }));
            }
        });

        // return new List().set_children(this.children.map((child, i) => fn.call(this, child, i, this)));
        /**
         * PArt of the problem with the above, was trying to avoid creating that blank .children array, only to overwrite it immediately.
         * 
         * If we're doing a lot of mapping, this could be a problem?  It would take a lot though.
         */
    }

    // filter(fn){
    //     return new this.constructor({
    //         children: this.children.filter(fn)
    //     });
    // }
    /* If the children are lists also, they could be recursively filtered?
    The filter fn still has to return true/false to filter... Needs testing. */

    dig(depth, fn){
        this.each(child => {
            if (depth > 0) {
                if (child.dig) {
                    child.dig(depth - 1, fn);
                } else if (fn.call(this, child) === false) {
                    return false; // stop digging
                }
            } else {
                if (fn.call(this, child) === false) {
                    return false; // stop digging
                }
            }
        });
    }
    
    static make(){
        return new this({ name: "Made" }).append("One").append("Two").append("Three");
    }

    static make_deep(n){
        if (!n)
            return this.make();

        const list = new this({ name: "Deep"+n });
        
        for (var i = n - 1; i >= 0; i--){
            list.append(this.make_deep(i));
            list.append("And Another")
        }
        
        return list;
    }
}

List.View = ListView;

/* When possible, it's probably better to just use an array, rather than a List? 

For specific things, it's not a problem. */