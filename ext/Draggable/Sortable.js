import Movable from "./Movable.js";
import List from "../List/List.js";
import Draggable from "./Draggable.js";
import is from "../../lib/is.js";
import View from "../../core/View/View.js";

export default class Sortable extends Movable {
    instantiate(...args){
        this.assign(...args);
        this.instantiate_draggable();
        Sortable.Target.register(this.view.el, this);
        this.instantiate_sortable();
        this.initialize();
    }

    instantiate_sortable(){
        document.addEventListener("contextmenu", this.contextmenu.bind(this));
    }

    contextmenu(e){
        if (this.dragging){
            console.log("right click -> cancelling drag");
            e.preventDefault();
            this.cleanup();
            this.stop();
            this.release();
        }
    }

    release(){
        console.log("....release");
        this.previewing = false;
        this.origin.el.insertBefore(this.view.el, this.origin.el.children[this.origin.index] || null);
    }
    start(e){
        super.start(e);
        this.origin = {
            el: this.view.el.parentNode,
            index: this.view.index()
        };
    }

	/**
	 * When do we want to drop?
	 * Don't we want to avoid list.insert if it hasn't changed?
	 * Just get it working first...
	 */
	drop_check(e){
		return this.lookup(e);
	}

    drop(e){
        console.group("drop");
        
        const target = this.lookup(e);
        const index = target.index(e);

        // 1. this has to be removed (from parent) before added to new
        this.list?.remove();  // although, this could/should happen automatically
        
        target.list.insert(this.value || this.list, index.i)

        console.groupEnd();
    }

    move3(e){
        // set's this.target
        this.lookup(e);
        this.targeting(e);
    }

	move(e){
		const target = this.lookup(e);

		// no target
		if (!target){
			this.last_target?.view?.rc("drag-target");
			delete this.last_target;
			return;
		}

		// if (this.target.container){
		// 	this.indexing(e);
		// 	this.preview();
		// }
		
		// update the preview/index
		target.preview(this, target.index(e));

		if (target !== this.last_target){
			target.view.ac("drag-target");
			this.last_target?.view.rc("drag-target");
			this.last_target = target;
		}
	}

	lookup(e){
		// same "raw" target => lookup will be the same
		if (e.target === this.last_raw_target){
			return this.last_target;
		} else {
			this.last_raw_target?.classList.remove("drag-raw-target");
			e.target.classList.add("drag-raw-target");
			this.last_raw_target = e.target;
			return Sortable.Target.lookup(e.target);
		}
	}

    targeting(e){
        
        if (this.target){

            if (this.target !== this.last_target){
                // new target
                console.group("new target", this.target.list.name);
                this.target.view?.ac("drag-target");
                this.last_target?.view?.rc("drag-target");
                
                this.indexing(e);
                this.preview();
                
                this.last_target = this.target;

                console.groupEnd();
            } else {
                // console.group("same target");
                this.indexing(e);
                this.preview();
                // console.groupEnd();
            }
        } else {
            this.last_target?.view?.rc("drag-target");
            this.last_target = null;
        }
    }
        
    preview(){
        console.warn("Sortable preview(), not used?");

        // is there no way to transition from/to same target, but index -> no index?
        // no index means no children, basically, so it's unlikely that 
        // there are children before, and then no children after
        // but the whole wrapper thing is a bit iffy here.

		if (!this.target.container)
			return;

		this.last_index?.classList?.remove("drag-index");

        // // no index AND different target
        // if (!this.index && this.target !== this.last_target){
        
        //     console.log("preview -> no index -> append");
        //     this.target.container.append(this.view);

        // // new index
		// // what if new target, can 
        // } else if (this.index && this.index !== this.last_index){
            
        //     if (this.index === "append"){
                
        //         console.log("preview -> index = 'append'");
        //         this.target.container.append(this.view);
                
        //     } else { // else if (this.index !== this.view.el) { // not necessary, if we filter this.view.el from children in indexing()

        //         this.index.classList.add("drag-index");
        //         console.log("preview -> index = ", this.index);
        //         this.target.container.el.insertBefore(this.view.el, this.index);
                
        //     }

        // } else {
        //     // this would be:
        //     // !index && same target, or
        //     // index && same index
        // }
		
		if (
			(!this.index && (this.target !== this.last_target)) || 
			this.index === "append"){
				console.log("preview -> append");
				this.target.container.append(this.view);
		} else if (this.index !== this.last_index){
			console.log("preview -> insert");
			this.index.classList.add("drag-index");
			this.target.container.el.insertBefore(this.view.el, this.index);
		}

        if (this.index !== this.last_index)
            this.last_index = this.index;
    }
        
    destroy(){
        this.handle.off("pointerdown", this.pointerdown);
        Sortable.Target.unregister(this.view.el);
    }
}

Sortable.Target = class SortableTarget extends Sortable {
	preview(sortable, index){
		const target_changed = this !== sortable.last_target;
		if (target_changed || index.el !== sortable.last_index?.el){
			sortable.last_index = index;
			// if index.el === null, this becomes an append
			this.container.el.insertBefore(sortable.view.el, index.el);
		}
	}

	// index.el is either the el or null, used in preview()
    index(e){
        const children = Array.from(this.container.el.children)
							.filter(child => child !== this.view.el);
        const clientY = e.clientY;
        
		for (let i = 0; i < children.length; i++){
			const child = children[i];
			const rect = child.getBoundingClientRect();
			
			// first child (midpoint) below cursor
			if (clientY < (rect.top + (rect.height / 2))){
				return { el: child, i };
			}
		}

		return { el: null };
    }
    // we need to climb the dom tree, so child dom elements don't have
	// to all be registered...
	static lookup(el) {
		while (el) {
			const target = this.registry.get(el);
			if (target) {
				return target;
			} else {
				el = el.parentElement;
			}
		}
		return undefined;
	}

	static register(el, draggable) {
		this.registry.set(el, draggable);
	}

	static unregister(el) {
		this.registry.delete(el);
	}
}

Sortable.Target.registry = new WeakMap();

Sortable.List = class SortableList extends List {}
Sortable.List.View = class SortableListView extends Sortable.List.View {
    render(){
        // console.log(this.parent);
        super.render();

        // console.warn(this.parent.hc("list-item"));

		// "root" sortable, not inside a list-item
        if (!this.parent.hc("list-item")){
            this.draggable = new Sortable.Target({
                view: this, // drag self
                handle: this.bar,
                list: this.list
            });

		// inside a list item
		// i can't remember the significance of this, but i think it has
		// something to do with which element gets dragged (not leaving
		// behind the .list-item), and maybe how the target is looked up?
        } else {
            this.draggable = new Sortable.Target({
                view: this.parent, // the div.list-item // drag the list-item
                handle: this.bar,
                list: this.list,
                container: this.children
            });
        }
    }
}

Sortable.View = class SortableView extends View {
	render(){
		super.render();
		this.draggable = new Sortable({
			view: this,
			handle: this.bar
		});
	}
}

function findClosestNumber(array, inputNumber) {
	// debugger;
    // Initialize variables to store the closest number and the smallest difference
    let closestNumber = array[0];
    let smallestDifference = Math.abs(array[0] - inputNumber);
    let index = 0;

    // Loop through the array
    for (let i = 1; i < array.length; i++) {
        // Calculate the difference between the current array element and the input number
        const currentDifference = Math.abs(array[i] - inputNumber);

        // If the current difference is smaller than the smallest difference found so far
        if (currentDifference < smallestDifference) {
            // Update the smallest difference and the closest number
            smallestDifference = currentDifference;
            closestNumber = array[i];
            index = i;
        }
    }

    // Return the closest number found
    return { value: closestNumber, index };
}