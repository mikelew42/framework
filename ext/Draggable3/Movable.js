import Draggable from "./Draggable.js";

/**
 * Movable plugin
 *
 * Adds basic visual movement via CSS transform.
 *
 * Usage:
 *   const drag = new Draggable({ view });
 *   drag.addPlugin(Movable());
 *
 * Options:
 *   { resetOnStop?: boolean }  // default true
 */

export default function Movable(options = {}){
    const config = Object.assign({
        resetOnStop: true
    }, options || {});

    return {
        name: "Movable",

        init(draggable){
            this.draggable = draggable;
        },

        start(e){
            const view = this.draggable.view;
            if (!view || !view.el) return;

            const rect = view.el.getBoundingClientRect();
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.offsetX = rect.left + window.scrollX;
            this.offsetY = rect.top + window.scrollY;

            // mark as movable
            view.ac("drag3-movable");
            view.el.style.willChange = "transform";
            view.el.style.cursor = this.draggable.config.cursor || "grab";
        },

        move(e){
            const view = this.draggable.view;
            if (!view || !view.el) return;

            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;

            view.el.style.transform = `translate(${dx}px, ${dy}px)`;
        },

        stop(){
            const view = this.draggable.view;
            if (!view || !view.el) return;

            if (config.resetOnStop){
                view.el.style.transform = "";
            }
            view.el.style.willChange = "";
            view.el.style.cursor = "";
            view.rc("drag3-movable");
        },

        cleanup(){
            // if drag is cancelled mid-way
            if (config.resetOnStop && this.draggable?.view?.el){
                this.draggable.view.el.style.transform = "";
            }
        },

        destroy(){
            // nothing special yet
            this.draggable?.view?.rc("drag3-movable");
        }
    };
}

