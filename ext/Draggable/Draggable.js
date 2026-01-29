import Events from "../../core/Events/Events.js";
import View from "../../core/View/View.js";
import App from "../../core/App/App.js";
import is from "../../lib/is.js";

App.stylesheet(import.meta, "styles.css");
/**
 * 		draggable({ 
				handle: this.bar,
				view: this,
                container: this.children,
				start: this.dragstart.bind(this),
				move: this.drag.bind(this), // dragmove?
				end: this.dragend.bind(this),
				drop: this.drop.bind(this),
				targets: ".selector" || [views]
 */

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

        if (!this.container){
            if (this.view.children){
                this.container = this.view.children;
            } else {
                // console.error("No container?") // no need for a container
            }
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
        // console.warn("TODO: drop_check()");
        // if this.targets is ".selector" string, test e.target?
        // if this.targets is [view, arr], e.target -> view and then this.targets.includes? 
    }

    drop(e){
        console.warn("TODO: drop()");
        // if e.target is a zone
            // potentially this.sort()?
    }
    
    // we need to climb the dom tree, so child dom elements don't have
    // to all be registered...
    static lookup(el){
        const log = false;
        log && console.group("lookup", el);
        while (el) {
            const draggable = Draggable.registry.get(el);
            if (draggable) {
                log && console.log("draggable found:", draggable); 
                log && console.groupEnd();
                return draggable;
            } else {
                el = el.parentElement;
                log && console.log("draggable not found, climbing, parent:", el)
            }
        }
        log && console.warn("lookup failed");
        log && console.groupEnd();
        return undefined;
    }

    // finds the first draggable in the container?
    // what if there are multiple draggables within?
    // is this the right logic to treat the views as sort-indexed?
    static lookdown(el){
        const log = false;
        log && console.group("lookdown", el);

        const draggable = Draggable.registry.get(el);
        
        if (draggable) {
            log && console.log("draggable found:", draggable); 
            log && console.groupEnd();
            return draggable;
        } else if (el.children.length) {
            log && console.log("todo: iterate children");
        }

        log && console.warn("lookup failed");
        log && console.groupEnd();
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