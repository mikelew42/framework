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
    // identical
    start(e){
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.origin = {
            el: this.view.el.parentNode,
            index: this.view.index()
        };
    }

    // indentical
    // pointerup(e){
    //     document.removeEventListener("pointermove", this.pointermove);
	// 	document.removeEventListener("pointerup", this.pointerup);
        
    //     this.view?.rc("dragging");
        
    //     View.body().rc("drag-in-progress");
        
    //     if (this.drop_check(e))
    //         this.drop(e);
        
    //     if (this.stop)
    //         this.stop(e);
    // }

    // identical
    // drop_check(e){
    //     this.drop_target_draggable = Draggable.lookup(e.target);
        
    //     if (this.drop_target_draggable){
    //         return true;
    //     } else {
    //         delete this.drop_target_draggable;
    //         return false;
    //     }
        
    // }
    preview(e){
        // this.list.remove();
        // this.drop_target_draggable.list.append(this.list);
        // delete this.drop_target_draggable;
            console.log("preview", this.list.name + " OVER " + this.drop_target_draggable.list.name);


        // console.group("removing...");
        // this.cleanup();
        // this.destroy();
        // this.list.remove();
        // debugger;
        if (this.list === this.drop_target_draggable.list)
            debugger;
        // this.drop_target_draggable.list.append(this.list);

        this.drop_target_draggable.view.children.append(this.view);
        this.previewing = true;
        this.view.el.style.transform = "";

        // console.groupEnd();
        // delete this.drop_target_draggable; //??? I don't think we want to do this here...
    }
    move(e){
        if (!this.previewing)
            this.view.el.style.transform = `translate(${e.clientX - this.startX}px, ${e.clientY - this.startY}px)`;
        
        this.target(e);

        if (this.drop_check(e) && this.drop_target_draggable){
           if (this.drop_target_draggable.list === this.list){
                // ignore self
                return;
            } else if (this.drop_target_draggable !== this.last_drop_target){
                this.last_drop_target = this.drop_target_draggable; 
                if ((this.drop_target_draggable.list === this.list.parent) ){
                    if (this.previewing){
                        console.log("drag over origin, release");
                        this.release();
                    }
                } else {
                    this.preview(e);
                }
            }
        }
        
        // if (this.drop_check(e) && 
        //     (this.drop_target_draggable?.list !== this.list) && 
        //     (this.drop_target_draggable.list !== this.list.parent) && 
        //     (this.drop_target_draggable !== this.last_drop_target)){
        //         this.preview(e);
        //         this.last_drop_target = this.drop_target_draggable;
        // } else {}
    }
    
    // identical
    target(e){
        if (e.target === this.last_target)
            return;
        
        Draggable.lookup(this.last_target)?.view?.rc("dragover");
        Draggable.lookup(e.target)?.view?.ac("dragover");
        
        let draggable;
        if (draggable = Draggable.lookup(e.target)){
            if (draggable === this)
                console.error("uh oh");
        }
        
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