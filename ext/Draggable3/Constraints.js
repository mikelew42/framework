/**
 * Constraints plugin
 *
 * Adds simple movement constraints:
 *   - axis: 'x' | 'y' | 'both'
 *   - bounds: HTMLElement or View (keep within rect) [TODO: basic support]
 *   - grid: number (snap to grid size)
 *
 * Usage:
 *   drag.addPlugin(Constraints({ axis: 'y', grid: 20 }));
 *
 * This plugin expects that some other plugin (e.g. Movable) is responsible
 * for actually applying the transform. Constraints only computes and
 * exposes constrained dx/dy on `draggable._constraints`.
 */

export default function Constraints(options = {}){
    const config = Object.assign({
        axis: "both",
        bounds: null,
        grid: null
    }, options || {});

    return {
        name: "Constraints",

        init(draggable){
            this.draggable = draggable;
        },

        start(e){
            const view = this.draggable.view;
            if (!view || !view.el) return;

            this.startX = e.clientX;
            this.startY = e.clientY;

            if (config.bounds){
                const el = config.bounds.el || config.bounds;
                this.boundsRect = el.getBoundingClientRect();
            } else {
                this.boundsRect = null;
            }
        },

        move(e){
            if (!this.draggable.dragging) return;

            let dx = e.clientX - this.startX;
            let dy = e.clientY - this.startY;

            // axis locking
            if (config.axis === "x"){
                dy = 0;
            } else if (config.axis === "y"){
                dx = 0;
            }

            // snap to grid
            if (config.grid && config.grid > 0){
                const g = config.grid;
                dx = Math.round(dx / g) * g;
                dy = Math.round(dy / g) * g;
            }

            // basic bounds support: clamp dx/dy so that element stays roughly inside
            if (this.boundsRect && this.draggable.view && this.draggable.view.el){
                const viewRect = this.draggable.view.el.getBoundingClientRect();
                const width = viewRect.width;
                const height = viewRect.height;

                const minX = this.boundsRect.left - viewRect.left;
                const maxX = this.boundsRect.right - (viewRect.left + width);
                const minY = this.boundsRect.top - viewRect.top;
                const maxY = this.boundsRect.bottom - (viewRect.top + height);

                dx = Math.min(Math.max(dx, minX), maxX);
                dy = Math.min(Math.max(dy, minY), maxY);
            }

            this.draggable._constraints = { dx, dy };
        },

        cleanup(){
            delete this.draggable._constraints;
        },

        destroy(){
            this.cleanup();
        }
    };
}

