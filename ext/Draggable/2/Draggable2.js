import Draggable1 from "../1/Draggable1.js";

/**
 * Draggable2 — sortable list reordering.
 *
 * Extends Draggable1. Adds:
 *  - A ghost element that follows the cursor during drag
 *  - A placeholder showing the live insertion point
 *  - Insertion-index tracking via sibling midpoint comparison
 *  - Auto-commit: list.remove(item) + list.insert(item, index) on drop
 *
 * New opts (all Draggable1 opts still work):
 *   item              — domain object this view represents
 *   list              — object with remove(item)/insert(item,i) (defaults to item.parent)
 *   horizontal        — compare clientX instead of clientY (default: false)
 *   ghost_class       — CSS class on the ghost (default: 'drag-ghost')
 *   placeholder_class — CSS class on the placeholder (default: 'drag-placeholder')
 */
export default class Draggable2 extends Draggable1 {

    instantiate_draggable() {
        super.instantiate_draggable();
        this.ghost_class       ??= 'drag-ghost';
        this.placeholder_class ??= 'drag-placeholder';
        this.horizontal        ??= false;
    }

    pointerdown(e) {
        // measure before super sets pointer-events: none
        this.drag_rect = this.view.el.getBoundingClientRect();
        this.grab_dx   = e.clientX - this.drag_rect.left;
        this.grab_dy   = e.clientY - this.drag_rect.top;

        super.pointerdown(e);

        this.create_ghost(e);
        this.create_placeholder();
    }

    create_ghost(e) {
        const ghost = this.view.el.cloneNode(true);
        ghost.classList.add(...this.ghost_class.split(' '));
        Object.assign(ghost.style, {
            position:      'fixed',
            pointerEvents: 'none',
            zIndex:        '9999',
            margin:        '0',
            boxSizing:     'border-box',
            width:         this.drag_rect.width  + 'px',
            height:        this.drag_rect.height + 'px',
            left:          (e.clientX - this.grab_dx) + 'px',
            top:           (e.clientY - this.grab_dy) + 'px',
        });
        document.body.appendChild(ghost);
        this.ghost = ghost;
    }

    create_placeholder() {
        const ph = document.createElement('div');
        ph.className = this.placeholder_class;
        Object.assign(ph.style, {
            // force in-flow — old Draggable.css sets .drag-placeholder { position: absolute }
            position:      'relative',
            opacity:       '1',
            pointerEvents: 'none',
            boxSizing:     'border-box',
            width:         this.drag_rect.width  + 'px',
            height:        this.drag_rect.height + 'px',
        });
        const container = this.view.el.parentElement;
        if (container) container.insertBefore(ph, this.view.el);
        this.view.el.style.display = 'none';
        this.placeholder   = ph;
        this.insert_before = null; // tracks placeholder position for move dedup
    }

    // override fully — ghost must move on EVERY pointermove event, not just target changes
    pointermove(e) {
        if (!this.dragging) return;

        const dx = e.clientX - this.start_x;
        const dy = e.clientY - this.start_y;
        if (this.move) this.move(dx, dy, e);

        // move ghost on every event
        if (this.ghost) {
            this.ghost.style.left = (e.clientX - this.grab_dx) + 'px';
            this.ghost.style.top  = (e.clientY - this.grab_dy) + 'px';
        }

        // move placeholder to current insertion point
        const insert_before = this.find_insert_before(e);
        if (insert_before !== this.insert_before) {
            this.insert_before = insert_before;
            const container = this.view.el.parentElement;
            if (container) {
                if (insert_before) {
                    container.insertBefore(this.placeholder, insert_before);
                } else {
                    container.appendChild(this.placeholder);
                }
            }
        }

        // Draggable1 target detection — kept for cross-list enter/leave/drop hooks
        if (e.target === this.last_raw_target) return;
        this.last_raw_target = e.target;

        const target = Draggable1.lookup(e.target);
        if (target === this.last_target) return;

        this.last_target?.leave(this, e);
        this.last_target = target;
        target?.enter(this, e);
    }

    // find which sibling to insert before based on cursor position vs midpoints
    find_insert_before(e) {
        const container = this.view.el.parentElement;
        if (!container) return null;

        const pos      = this.horizontal ? e.clientX : e.clientY;
        const siblings = [...container.children].filter(
            el => el !== this.view.el && el !== this.placeholder
        );

        for (const sib of siblings) {
            const rect = sib.getBoundingClientRect();
            const mid  = this.horizontal
                ? rect.left + rect.width  / 2
                : rect.top  + rect.height / 2;
            if (pos < mid) return sib;
        }
        return null;
    }

    pointerup(e) {
        if (!this.dragging) return;
        super.pointerup(e);   // stop(), leave(), drop() hook, listener cleanup
        this.commit_sort();   // DOM restore + data-layer update
        this.cleanup_drag();  // remove ghost + placeholder
    }

    commit_sort() {
        if (!this.placeholder || !this.view) return;
        const container = this.view.el.parentElement;
        if (!container) return;

        // compute data-layer index from where placeholder currently sits
        const list = this.list ?? this.item?.parent;
        const item = this.item;
        let new_index = -1;

        if (list && item) {
            const all    = [...container.children];
            const ph_idx = all.indexOf(this.placeholder);
            // count real siblings before placeholder (exclude hidden view + placeholder)
            new_index = all.slice(0, ph_idx)
                .filter(el => el !== this.view.el && el !== this.placeholder)
                .length;
        }

        // restore view at placeholder's exact position, then placeholder removed in cleanup
        this.view.el.style.display = '';
        container.insertBefore(this.view.el, this.placeholder);

        // update data layer if available
        if (list && item && new_index >= 0) {
            list.remove(item);
            list.insert(item, new_index);
        }
    }

    cleanup_drag() {
        this.ghost?.remove();
        this.placeholder?.remove();
        this.ghost         = null;
        this.placeholder   = null;
        this.insert_before = null;
    }

    // override for cross-list behavior; commit_sort handles same-list sorting
    drop(target, e) {}

    destroy() {
        super.destroy();
        this.cleanup_drag();
    }
}

export function draggable2(opts) { return new Draggable2(opts); }
