// WebApp1 — extends WebApp0 with:
//   • Draggable resize handles between panels
//   • Optional bottom status bar
//   • Panel min/max width constraints

import WebApp0 from '../0/WebApp0.js';
import { style } from '/framework/core/View/View.js';

style(`
/* Resize handle between panels */
.wa-resize-handle {
    width: 5px;
    flex: none;
    background: transparent;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    transition: background 0.1s;
}
.wa-resize-handle::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: 1px; right: 1px;
    background: transparent;
    transition: background 0.15s;
}
.wa-resize-handle:hover::after,
.wa-resize-handle.dragging::after {
    background: #5b57d6;
}

/* Status bar */
.wa-status-bar {
    height: 26px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 14px;
    background: #f4f4f3;
    border-top: 1px solid #ececea;
    font-size: 11.5px;
    color: #9a9a94;
    overflow: hidden;
    user-select: none;
}
.wa-status-item { display: flex; align-items: center; gap: 4px; }
.wa-status-sep { width: 1px; height: 12px; background: #e0e0de; flex: none; }
.wa-status-spacer { flex: 1; }
`);

export default class WebApp1 extends WebApp0 {
    constructor(opts = {}) {
        super(opts);
        this._min_panel_w = opts.min_panel_w ?? 140;
        this._max_panel_w = opts.max_panel_w ?? 700;
        this._add_resize_handles();
        if (opts.status_bar) this._add_status_bar();
    }

    _add_resize_handles() {
        const panels = this.root.el.querySelector('.wa-panels');
        if (!panels) return;

        // Insert handle after left panel (before main)
        if (this.left.el.offsetWidth > 0 || this.left.el.style.display !== 'none') {
            this._handle_l = this._make_handle('left');
            this.left.el.insertAdjacentElement('afterend', this._handle_l);
        }

        // Insert handle before right panel (after main)
        if (this.right.el.offsetWidth > 0 || this.right.el.style.display !== 'none') {
            this._handle_r = this._make_handle('right');
            this.right.el.insertAdjacentElement('beforebegin', this._handle_r);
        }
    }

    _make_handle(side) {
        const handle = document.createElement('div');
        handle.className = 'wa-resize-handle';
        let start_x = null, start_w = null;

        handle.addEventListener('pointerdown', e => {
            start_x = e.clientX;
            start_w = side === 'left'
                ? this.left.el.getBoundingClientRect().width
                : this.right.el.getBoundingClientRect().width;
            handle.setPointerCapture(e.pointerId);
            handle.classList.add('dragging');
            e.preventDefault();
        });

        handle.addEventListener('pointermove', e => {
            if (start_x === null) return;
            const dx = e.clientX - start_x;
            const delta = side === 'left' ? dx : -dx;
            const new_w = Math.min(this._max_panel_w, Math.max(this._min_panel_w, start_w + delta));
            const target = side === 'left' ? this.left : this.right;
            target.el.style.width = new_w + 'px';
        });

        handle.addEventListener('pointerup', () => {
            start_x = null;
            handle.classList.remove('dragging');
        });

        return handle;
    }

    _add_status_bar() {
        this.status_bar = Object.assign(document.createElement('div'), { className: 'wa-status-bar' });
        this.root.el.appendChild(this.status_bar);

        // Helper: append a status item
        this.status = {
            add: (text, key) => {
                const item = document.createElement('span');
                item.className = 'wa-status-item';
                item.textContent = text;
                if (key) item.dataset.key = key;
                this.status_bar.appendChild(item);
                return item;
            },
            set: (key, text) => {
                const item = this.status_bar.querySelector(`[data-key="${key}"]`);
                if (item) item.textContent = text;
            },
            sep: () => {
                const s = document.createElement('span');
                s.className = 'wa-status-sep';
                this.status_bar.appendChild(s);
                return s;
            },
            spacer: () => {
                const s = document.createElement('span');
                s.className = 'wa-status-spacer';
                this.status_bar.appendChild(s);
                return s;
            },
        };
    }
}
