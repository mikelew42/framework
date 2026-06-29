import Events from "../../../core/Events/Events.js";

/**
 * Minimal drag lifecycle.
 *
 * Usage (pass hooks as opts):
 *   new Draggable0({
 *       view:   myView,       // element being dragged — gets .dragging class
 *       handle: myHandle,     // element to grab (defaults to view)
 *       start(e)          { ... },
 *       move(dx, dy, e)   { ... },
 *       stop(dx, dy, e)   { ... },
 *   });
 *
 * Usage (subclass):
 *   class Resizer extends Draggable0 {
 *       start()      { this.start_width = this.panel.el.offsetWidth; }
 *       move(dx)     { this.panel.el.style.width = (this.start_width + dx) + 'px'; }
 *   }
 *   new Resizer({ view: handle_view, panel: panel_view });
 *
 * Pointer Capture is used instead of document listeners — after pointerdown,
 * all pointermove/pointerup for that pointer ID are routed to the handle element
 * even if the pointer moves off it. No leaks, no cleanup on document.
 */
export default class Draggable0 extends Events {

    instantiate() {
        this.events = {};
        this.instantiate_draggable();
        this.initialize();
    }

    instantiate_draggable() {
        if (!this.handle)
            this.handle = this.view;

        if (!this.handle)
            console.error("Draggable0: provide view or handle");

        // bind once so we can add/remove the same reference
        this.pointerdown = this.pointerdown.bind(this);
        this.pointermove = this.pointermove.bind(this);
        this.pointerup   = this.pointerup.bind(this);

        this.handle.on("pointerdown", this.pointerdown);
        this.handle.on("pointermove", this.pointermove);
        this.handle.on("pointerup",   this.pointerup);
        this.handle.ac("drag-handle");
    }

    initialize() {}

    pointerdown(e) {
        e.preventDefault();
        // pointer capture routes all future move/up to this element
        this.handle.el.setPointerCapture(e.pointerId);
        this.dragging = true;
        this.start_x = e.clientX;
        this.start_y = e.clientY;

        this.view?.ac("dragging");

        if (this.start) this.start(e);
    }

    pointermove(e) {
        if (!this.dragging) return;
        const dx = e.clientX - this.start_x;
        const dy = e.clientY - this.start_y;
        if (this.move) this.move(dx, dy, e);
    }

    pointerup(e) {
        if (!this.dragging) return;
        this.dragging = false;

        const dx = e.clientX - this.start_x;
        const dy = e.clientY - this.start_y;

        this.view?.rc("dragging");

        if (this.stop) this.stop(dx, dy, e);
    }

    destroy() {
        this.handle.off("pointerdown", this.pointerdown);
        this.handle.off("pointermove", this.pointermove);
        this.handle.off("pointerup",   this.pointerup);
        this.handle.rc("drag-handle");
    }
}

export function draggable(opts) { return new Draggable0(opts); }
