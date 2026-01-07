import Draggable from "./Draggable.js";

/**
 * Previewable plugin
 *
 * Provides a simple preview of where an item will be dropped.
 * Intended to be used together with Sortable.
 *
 * Usage:
 *   const drag = new Draggable({ view, container, list });
 *   drag.addPlugin(Sortable());
 *   drag.addPlugin(Previewable());
 */

export default function Previewable(options = {}){
    const config = Object.assign({}, options || {});

    return {
        name: "Previewable",

        init(draggable){
            this.draggable = draggable;
            this.previewing = false;
        },

        drop_check(e){
            // rely on Sortable (or other) to decide if drop is valid
            // this plugin only affects visuals
            return false;
        },

        move(e){
            // When combined with Sortable, Sortable will be moving the node.
            // Here we just ensure proper classes for styling.
            if (!this.draggable.dragging) return;

            const target = Draggable.lookup(e.target);
            if (target && target !== this.last_drop_target){
                this.last_drop_target?.view?.rc("drag3-preview-target");
                target.view?.ac("drag3-preview-target");
                this.last_drop_target = target;
            }
        },

        drop(e){
            this.last_drop_target?.view?.rc("drag3-preview-target");
            this.last_drop_target = null;
        },

        cleanup(){
            this.last_drop_target?.view?.rc("drag3-preview-target");
            this.last_drop_target = null;
        },

        destroy(){
            this.cleanup();
        }
    };
}

