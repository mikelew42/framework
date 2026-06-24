import { View, el, div } from "../../View/View.js";
import is from "../../../lib/is.js";
import List0View from "./List0.View.js";
import App from "../../App/App.js";


App.stylesheet(import.meta, "List.css");


export default class List0 {
	constructor(...args){
		this.assign(...args);
		this.instantiate();
		this.initialize();
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	instantiate(){
		this.instantiate_list();
	}

	instantiate_list(){
		this.immediate?.();
		this.children = this.children || [];
	}

    initialize(){}

    render(){
        if (!this.constructor.View)
            throw `Need ${this.constructor.name}.View class`;

        if (!this.views){
            this.views = new List0({ list: this });
        }

        this.views.append(new this.constructor.View({
            list: this
        }, this.view));
    }

    changed(){
		if (this.update && !this.updating){
			this.updating = setTimeout(() => {
                this.update();
				this.updating = false;
			}, 0);
		}
    }

    update(){
        this.views && this.views.each(view => {
            view.update(this);
        });
    }

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

    walk(fn){
        this.each(child => {
            if (fn.call(this, child) === false) return false;
            if (child?.walk) child.walk(fn);
        });
        return this;
    }

    append(...args){
        for (const arg of args){
            this.adopt(arg);
            this.children.push(arg);
        }
        this.changed();
        return this;
    }

    adopt(child){
        if (is.obj(child)){
            child.parent = this;
            if (this === child)
                console.warn("Add list to itself?");
        }
        return this;
    }

    add(...args){
        return this.append(...args);
    }

    log(){
        this.each(child => console.log(child));
    }

    clone(depth){
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
        if (index == null) index = this.children.length;
        this.adopt(child);
        this.children.splice(index, 0, child);
        this.changed();
        return this;
    }

    find(fn){
        return this.children.find(fn);
    }

    index(){
        return this.parent.index_of(this);
    }

    index_of(child){
        return this.children.indexOf(child);
    }

	remove(child){
		if (child){
			this.each((item, i) => {
				if (item === child){
                    if (child.parent === this) delete child.parent;
					this.children.splice(i, 1);
				}
			});
			this.changed();
		} else if (this.parent){
			this.parent.remove(this);
		}
	}

    deduce(fn){
        var value;
        this.each(child => {
            value = fn.call(this, child);
            if (value !== undefined) return false;
        });
        return value;
    }

    map(fn){
        const self = this;
        return new this.constructor({
            immediate(){
                this.children = self.children.map((child, i) => fn.call(this, child, i, this));
            }
        });
    }

    dig(depth, fn){
        this.each(child => {
            if (depth > 0) {
                if (child.dig) {
                    child.dig(depth - 1, fn);
                } else if (fn.call(this, child) === false) {
                    return false;
                }
            } else {
                if (fn.call(this, child) === false) {
                    return false;
                }
            }
        });
    }

    static make(){
        return new this({ name: "Made" }).append("One").append("Two").append("Three");
    }

    static make_deep(n){
        if (!n) return this.make();

        const list = new this({ name: "Deep"+n });

        for (var i = n - 1; i >= 0; i--){
            list.append(this.make_deep(i));
            list.append("And Another");
        }

        return list;
    }
}

List0.View = List0View;
