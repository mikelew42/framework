import Base from "../../core/Base/Base.js";
import is from "../../lib/is.js";

export default class List extends Base {
    
	instantiate(...args){
		this.assign(...args);
        this.children = this.children || [];
		this.initialize();
	}

    initialize(){}

    each(fn){
        for (const child of this.children){
            if (fn.call(this, child) === false) break;
        }
        return this;
    }

    // no filtering, breaking, returning
    // see underscore.js for examples
    walk(fn){
        this.each(child => {
            if (child.walk) {
                child.walk(fn);
            } else {
                fn.call(this, child);
            }
        });
        return this;
    }

    add(child){
        if (is.obj(child)){
            child.parent = this;
        }

        this.children.push(child);

        return this;
    }

    render(){
        this.each(child => child.render());
    }

    _clone(){ // doesn't actually clone
        const clone = new this.constructor();
        // clone.children = this.children.slice(); // shallow clone
        // deep clone ? clone.children = this.children.map(child => child.clone());
        return clone;
    }

    filter(fn){
        return new this.constructor({
            children: this.children.filter(fn)
        });
    }
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
}

/* When possible, it's probably better to just use an array, rather than a List? 

For specific things, it's not a problem. */