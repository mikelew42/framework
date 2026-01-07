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
            e.preventDefault();
            this.cleanup();
            this.stop();
            this.release();
        }
    }

    release(){
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
        this.lookup(e);
        this.indexing(e);

        this.list.remove();
        
        if (is.def(this.index_index)){
            this.target.list.insert(this.list, this.index_index)
        } else {
            this.target.list.append(this.list);
        }

        delete this.target;
    }

    move(e){
        this.lookup(e);
        this.targeting(e);
    }
    
    lookup(e){
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
                this.target.view?.ac("drag-target");
                this.last_target?.view?.rc("drag-target");
                
                this.indexing(e);
                this.preview();
                
                this.last_target = this.target;
            } else {
                this.indexing(e);
                this.preview();
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
            return false;
        }

        for (let i = 0; i < children.length; i++){
            const child = children[i];
            const rect = child.getBoundingClientRect();
            
            if (clientY < (rect.top + (rect.height / 2))){
                this.index = child;
                this.index_index = i;
                return;
            }
        }

        this.index = "append";
    }
        
    preview(){
        if (!this.index && this.target !== this.last_target){
            this.last_index?.classList?.remove("drag-index");
            this.target.container.append(this.view);

        } else if (this.index && this.index !== this.last_index){
            this.last_index?.classList?.remove("drag-index");
            
            if (this.index === "append"){
                this.target.container.append(this.view);
            } else {
                this.index.classList.add("drag-index");
                this.target.container.el.insertBefore(this.view.el, this.index);
            }
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
        super.render();

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
