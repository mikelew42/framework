import Movable from "./Movable.js";
import List from "../List/List.js";
import Draggable from "./Draggable.js";
import is from "../../lib/is.js";

export default class Sortable extends Movable {
    instantiate(...args){
        this.assign(...args);
        this.instantiate_draggable();
        this.instantiate_movable();
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

    drop(e){
        console.group("drop");
        
        this.lookup(e);
        this.indexing(e);

        // 1. this has to be removed (from parent) before added to new
        this.list.remove();  // although, this could/should happen automatically
        
        // 2
        if (is.def(this.index_index)){
            this.target.list.insert(this.list, this.index_index)
        } else {
            this.target.list.append(this.list);
        }

        delete this.target;

        console.groupEnd();
    }

    move(e){
        // set's this.target
        this.lookup(e);
        this.targeting(e);
    }
    
    lookup(e){
        // same "raw" target => lookup will be the same
        if (e.target === this.last_raw_target)
            return;

        this.last_raw_target?.classList.remove("drag-raw-target");
        e.target.classList.add("drag-raw-target");
        this.last_raw_target = e.target;

        this.target = Draggable.lookup(e.target);
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

    indexing(e){
        this.index = null;
        delete this.index_index;
        
        const children = Array.from(this.target.container.el.children)
        .filter(child => child !== this.view.el);
        const clientY = e.clientY;
        
        if (!children.length){
            // console.log("no children");
            return false;
        }

        for (let i = 0; i < children.length; i++){
            const child = children[i];
            const rect = child.getBoundingClientRect();
            
            // first child (midpoint) below cursor
            if (clientY < (rect.top + (rect.height / 2))){
                this.index = child;
                this.index_index = i;
                return;
            }
        }

        this.index = "append"; // insert at end
    }
        
    preview(){
        // console.group("preview");

        // is there no way to transition from/to same target, but index -> no index?
        // no index means no children, basically, so it's unlikely that 
        // there are children before, and then no children after
        // but the whole wrapper thing is a bit iffy here.

        // no index AND different target
        if (!this.index && this.target !== this.last_target){
            
            this.last_index?.classList?.remove("drag-index");
            console.log("preview -> no index -> append");
            this.target.container.append(this.view);

        // new index
        } else if (this.index && this.index !== this.last_index){

            this.last_index?.classList?.remove("drag-index");
            
            if (this.index === "append"){
                
                console.log("preview -> index = 'append'");
                this.target.container.append(this.view);
                
            } else { // else if (this.index !== this.view.el) { // not necessary, if we filter this.view.el from children in indexing()

                this.index.classList.add("drag-index");
                console.log("preview -> index = ", this.index);
                this.target.container.el.insertBefore(this.view.el, this.index);
                
            }

        } else {
            // this would be:
            // !index && same target, or
            // index && same index
        }

        if (this.index !== this.last_index)
            this.last_index = this.index;
    }
        
    destroy(){
        this.handle.off("pointerdown", this.pointerdown);
        Draggable.unregister(this.view.el);
    }
}

Sortable.List = class SortableList extends List {}
Sortable.List.View = class SortableListView extends Sortable.List.View {
    render(){
        // console.log(this.parent);
        super.render();

        // console.warn(this.parent.hc("list-item"));
        if (!this.parent.hc("list-item")){
            this.draggable = new Sortable({
                view: this,
                handle: this.bar,
                list: this.list
            });
        } else {
            this.draggable = new Sortable({
                view: this.parent,
                handle: this.bar,
                list: this.list,
                container: this.children
            });
        }
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