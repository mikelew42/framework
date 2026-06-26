// DragDrop — sortable list reordering via drag-and-drop.
//
// Usage:
//   import DragDrop from '/framework/ext/DragDrop/DragDrop.js';
//
//   // Make items in a container sortable
//   const dd = new DragDrop({
//       container: list_el,          // parent element
//       selector:  '.dd-item',       // child selector (default: direct children)
//       handle:    '.dd-handle',     // optional drag handle selector within item
//       on_reorder: (items, from, to) => {
//           // items: ordered array of HTMLElements after drag
//           // from: original index, to: new index
//       },
//   });
//
//   dd.destroy();    // remove listeners
//
// Items need no special markup. DragDrop adds a drag cursor to the handle
// (or the whole item if no handle is given). A placeholder shows where the
// item will be dropped.

import { style } from '../../core/View/View.js';

style(`
.dd-dragging {
    opacity: 0.4;
    pointer-events: none;
}
.dd-ghost {
    position: fixed; z-index: 9900;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-radius: 8px;
    opacity: 0.95;
    transform: rotate(1.5deg) scale(1.02);
    transition: transform 0.05s;
}
.dd-placeholder {
    background: #ededf9;
    border: 2px dashed #5b57d6;
    border-radius: 8px;
    pointer-events: none;
    box-sizing: border-box;
}
[data-dd-handle] { cursor: grab; }
[data-dd-handle]:active { cursor: grabbing; }
`);

export default class DragDrop {
    constructor({ container, selector, handle, on_reorder } = {}) {
        this._container  = container;
        this._selector   = selector || null;
        this._handle_sel = handle   || null;
        this._on_reorder = on_reorder;

        this._ghost       = null;
        this._dragging    = null;
        this._placeholder = null;
        this._offset_x    = 0;
        this._offset_y    = 0;

        this._bind();
    }

    _items() {
        if (this._selector) {
            return [...this._container.querySelectorAll(this._selector)]
                .filter(el => el.parentElement === this._container);
        }
        return [...this._container.children];
    }

    _bind() {
        this._on_down = e => this._start(e);
        this._on_move = e => this._move(e);
        this._on_up   = e => this._end(e);

        this._container.addEventListener('pointerdown', this._on_down);
        document.addEventListener('pointermove', this._on_move);
        document.addEventListener('pointerup',   this._on_up);
    }

    _find_item(el) {
        // Walk up to find the draggable item that is a direct child of container
        let cur = el;
        while (cur && cur !== this._container) {
            if (!this._selector || cur.matches(this._selector)) {
                if (cur.parentElement === this._container) return cur;
            }
            cur = cur.parentElement;
        }
        return null;
    }

    _is_handle(el) {
        if (!this._handle_sel) return true;
        let cur = el;
        while (cur) {
            if (cur.matches(this._handle_sel)) return true;
            if (cur === this._container) break;
            cur = cur.parentElement;
        }
        return false;
    }

    _start(e) {
        if (e.button !== 0) return;
        if (!this._is_handle(e.target)) return;

        const item = this._find_item(e.target);
        if (!item) return;

        e.preventDefault();
        this._container.setPointerCapture(e.pointerId);

        const rect = item.getBoundingClientRect();
        this._offset_x = e.clientX - rect.left;
        this._offset_y = e.clientY - rect.top;

        // Clone to ghost
        this._ghost = item.cloneNode(true);
        this._ghost.className = item.className + ' dd-ghost';
        this._ghost.style.width  = rect.width  + 'px';
        this._ghost.style.height = rect.height + 'px';
        this._ghost.style.left   = rect.left   + 'px';
        this._ghost.style.top    = rect.top    + 'px';
        document.body.appendChild(this._ghost);

        // Placeholder (same size as item)
        this._placeholder = document.createElement('div');
        this._placeholder.className = 'dd-placeholder';
        this._placeholder.style.width  = rect.width  + 'px';
        this._placeholder.style.height = rect.height + 'px';

        // Mark original as dragging
        this._dragging = item;
        item.classList.add('dd-dragging');
        item.replaceWith(this._placeholder);
    }

    _move(e) {
        if (!this._dragging) return;

        const x = e.clientX - this._offset_x;
        const y = e.clientY - this._offset_y;
        this._ghost.style.left = x + 'px';
        this._ghost.style.top  = y + 'px';

        // Find insertion point
        const items = this._items();
        const mid_y = e.clientY;

        let target = null, before = true;
        for (const item of items) {
            if (item === this._placeholder) continue;
            const r = item.getBoundingClientRect();
            const center = r.top + r.height / 2;
            if (mid_y < center) { target = item; before = true;  break; }
            else                  { target = item; before = false; }
        }

        if (!target) {
            this._container.appendChild(this._placeholder);
        } else if (before) {
            this._container.insertBefore(this._placeholder, target);
        } else {
            target.insertAdjacentElement('afterend', this._placeholder);
        }
    }

    _end(e) {
        if (!this._dragging) return;

        // Record from/to index
        const all_before = this._items();
        const from = all_before.indexOf(this._dragging);

        // Replace placeholder with item
        this._placeholder.replaceWith(this._dragging);
        this._dragging.classList.remove('dd-dragging');

        const all_after = this._items();
        const to = all_after.indexOf(this._dragging);

        this._ghost.remove();
        this._placeholder.remove();
        this._ghost       = null;
        this._placeholder = null;
        this._dragging    = null;

        if (this._on_reorder && from !== to) {
            this._on_reorder(all_after, from, to);
        }
    }

    destroy() {
        this._container.removeEventListener('pointerdown', this._on_down);
        document.removeEventListener('pointermove', this._on_move);
        document.removeEventListener('pointerup',   this._on_up);
    }
}
