import Movable from "./Movable.js";
import List from "../List/List.js";
import Draggable from "./Draggable.js";

export default class Previewable extends Movable {
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
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.origin = {
            el: this.view.el.parentNode,
            index: this.view.index()
        };
    }

    preview(e){
        if (this.list === this.drop_target_draggable.list)
            return;

        this.drop_target_draggable.view.children.append(this.view);
        this.previewing = true;
        this.view.el.style.transform = "";
    }

    move(e){
        if (!this.previewing)
            this.view.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
        
        this.target(e);

        if (this.drop_check(e) && this.drop_target_draggable){
            if (this.drop_target_draggable.list === this.list){
                return;
            } else if (this.drop_target_draggable !== this.last_drop_target){
                this.last_drop_target = this.drop_target_draggable; 
                if (this.drop_target_draggable.list === this.list.parent){
                    if (this.previewing){
                        this.release();
                    }
                } else {
                    this.preview(e);
                }
            }
        }
    }
    
    target(e){
        if (e.target === this.last_target)
            return;
        
        Draggable.lookup(this.last_target)?.view?.rc("dragover");
        Draggable.lookup(e.target)?.view?.ac("dragover");
        
        e.target.classList.add("dragtarget");
        this.last_target?.classList.remove("dragtarget");
        this.last_target = e.target;
    }

    destroy(){
        this.handle.off("pointerdown", this.pointerdown);
        Draggable.unregister(this.view.el);
    }
}

Previewable.List = class PreviewableList extends List {}
Previewable.List.View = class PreviewableListView extends Previewable.List.View {
    render(){
        super.render();
        this.draggable = new Previewable({
            view: this,
            handle: this.bar,
            list: this.list
        });
    }
}
