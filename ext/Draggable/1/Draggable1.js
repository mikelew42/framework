import Draggable0 from "../0/Draggable0.js";

/**
 * Draggable1 — adds a drop-target system on top of Draggable0.
 *
 * Switches from Pointer Capture to document events so e.target reflects
 * the real element under the cursor. Every instance auto-registers its
 * view.el as a potential drop target in a static WeakMap.
 *
 * Hooks:
 *   start(e)              — pointerdown (same as Draggable0)
 *   move(dx, dy, e)       — pointermove (same as Draggable0)
 *   stop(dx, dy, e)       — pointerup   (same as Draggable0)
 *   enter(draggable, e)   — another item is dragged over this one
 *   leave(draggable, e)   — drag left (or pointerup)
 *   drop_check(target, e) — dragging item decides if drop is valid
 *   drop(target, e)       — called on pointerup if drop_check passes
 */
export default class Draggable1 extends Draggable0 {

    // override: don't bind move/up to handle; use document after pointerdown
    instantiate_draggable() {
        if (!this.handle) this.handle = this.view;
        if (!this.handle) console.error("Draggable1: provide view or handle");

        this.pointerdown = this.pointerdown.bind(this);
        this.pointermove = this.pointermove.bind(this);
        this.pointerup   = this.pointerup.bind(this);

        this.handle.on("pointerdown", this.pointerdown);
        this.handle.ac("drag-handle");

        // auto-register as a drop target
        if (this.view) Draggable1.registry.set(this.view.el, this);
    }

    pointerdown(e) {
        e.preventDefault();
        document.addEventListener("pointermove", this.pointermove);
        document.addEventListener("pointerup",   this.pointerup);

        // pointer-events: none so move events fall through to whatever is below
        this.view?.ac("dragging").style("pointer-events", "none");
        this.dragging = true;
        this.start_x = e.clientX;
        this.start_y = e.clientY;
        this.last_raw_target = null;
        this.last_target     = null;

        if (this.start) this.start(e);
    }

    pointermove(e) {
        if (!this.dragging) return;

        const dx = e.clientX - this.start_x;
        const dy = e.clientY - this.start_y;
        if (this.move) this.move(dx, dy, e);

        // skip lookup when cursor is still over the same DOM element
        if (e.target === this.last_raw_target) return;
        this.last_raw_target = e.target;

        const target = Draggable1.lookup(e.target);
        if (target === this.last_target) return;

        this.last_target?.leave(this, e);
        this.last_target = target;
        target?.enter(this, e);
    }

    pointerup(e) {
        if (!this.dragging) return;
        document.removeEventListener("pointermove", this.pointermove);
        document.removeEventListener("pointerup",   this.pointerup);

        this.dragging = false;
        this.view?.rc("dragging").style("pointer-events", "");

        const dx     = e.clientX - this.start_x;
        const dy     = e.clientY - this.start_y;
        const target = this.last_target;

        if (this.stop) this.stop(dx, dy, e);

        if (target) {
            // always fire leave to clean up visual state
            target.leave(this, e);
            if (this.drop_check(target, e)) this.drop(target, e);
        }

        this.last_raw_target = null;
        this.last_target     = null;
    }

    // default: accept any target except self
    drop_check(target, e) { return target !== this; }

    // default: no-op — override to do something on drop
    drop(target, e) {}

    // target-side hooks — override for visual feedback
    enter(draggable, e) {}
    leave(draggable, e) {}

    destroy() {
        this.handle.off("pointerdown", this.pointerdown);
        this.handle.rc("drag-handle");
        if (this.view) Draggable1.registry.delete(this.view.el);
    }

    // walk up the DOM tree from el until we find a registered Draggable1
    static lookup(el) {
        while (el) {
            const found = Draggable1.registry.get(el);
            if (found) return found;
            el = el.parentElement;
        }
    }
}

Draggable1.registry = new WeakMap();

export function draggable1(opts) { return new Draggable1(opts); }
