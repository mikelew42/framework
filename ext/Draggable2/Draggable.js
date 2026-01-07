import Events from "../../core/Events/Events.js";
import View from "../../core/View/View.js";
import App from "../../core/App/App.js";

App.stylesheet(import.meta, "styles.css");

export default class Draggable extends Events {

    instantiate(...args){
        this.assign(...args);
        this.instantiate_draggable();
        this.initialize();
    }

    initialize(){}
    
    instantiate_draggable(){
        if (!this.view)
            console.error("Nothing to drag.");

        if (!this.handle)
            this.handle = this.view;

        if (!this.container && this.view.children){
            this.container = this.view.children;
        }

        this.pointerdown = this.pointerdown.bind(this);
        this.pointerup = this.pointerup.bind(this);
        this.pointermove = this.pointermove.bind(this);

        this.handle.on("pointerdown", this.pointerdown);
        this.handle.ac("drag-handle");
    }

    pointerdown(e){
        document.addEventListener("pointermove", this.pointermove);
        document.addEventListener("pointerup", this.pointerup);

        this.view?.ac("dragging").style("pointer-events", "none");
        this.dragging = true;

        View.body().ac("drag-in-progress");

        if (this.start)
            this.start(e);
    }

    pointermove(e){
        if (this.move)
            this.move(e);
    }

    cleanup(){
        document.removeEventListener("pointermove", this.pointermove);
        document.removeEventListener("pointerup", this.pointerup);
    
        this.view?.rc("dragging").style("pointer-events", "");
        this.dragging = false;
        this.previewing = false;

        this.last_raw_target?.classList.remove("drag-raw-target");
        this.last_target?.view?.rc("drag-target");
        this.last_index?.classList?.remove("drag-index");
        this.index?.classList?.remove("drag-index");
        
        View.body().rc("drag-in-progress");
    }

    pointerup(e){
        this.cleanup();

        if (this.drop_check(e))
            this.drop(e);

        if (this.stop)
            this.stop(e);
    }

    drop_check(e){
        return false;
    }

    drop(e){}
    
    static lookup(el){
        while (el) {
            const draggable = Draggable.registry.get(el);
            if (draggable) {
                return draggable;
            }
            el = el.parentElement;
        }
        return undefined;
    }

    static lookdown(el){
        const draggable = Draggable.registry.get(el);
        
        if (draggable) {
            return draggable;
        }
        
        for (let i = 0; i < el.children.length; i++){
            const result = Draggable.lookdown(el.children[i]);
            if (result) return result;
        }
        
        return undefined;
    }

    static register(el, draggable){
        Draggable.registry.set(el, draggable);
    }

    static unregister(el){
        Draggable.registry.delete(el);
    }
}

Draggable.registry = new WeakMap();
