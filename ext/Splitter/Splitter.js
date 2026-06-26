// Splitter — drag-to-resize handle between two panels.
//
// Usage:
//   import Splitter from '/framework/ext/Splitter/Splitter.js';
//
//   // Resize a left panel by dragging a vertical handle
//   const sp = new Splitter({
//       target:    left_panel_el,     // element whose size changes
//       direction: 'horizontal',      // 'horizontal' (resize width) | 'vertical' (resize height)
//       side:      'right',           // which edge of target to drag: 'right'|'left'|'top'|'bottom'
//       min:       140,               // min size in px (default 0)
//       max:       700,               // max size in px (default Infinity)
//       on_resize: (size) => {},      // callback with new size
//   });
//
//   container.appendChild(sp.el);    // insert handle between the two panels
//
// The Splitter element is a thin draggable bar. Place it in the DOM between the panels
// that should resize. It uses the Pointer Capture API so dragging outside the handle works.

import { style } from '../../core/View/View.js';

style(`
.splitter {
    flex-shrink: 0;
    background: transparent;
    position: relative;
    z-index: 10;
    transition: background 0.15s;
    user-select: none;
}
.splitter.horizontal {
    width: 5px;
    cursor: ew-resize;
}
.splitter.vertical {
    height: 5px;
    cursor: ns-resize;
}
.splitter::after {
    content: '';
    position: absolute;
    background: transparent;
    transition: background 0.15s;
}
.splitter.horizontal::after { inset: 0 -2px; }  /* wider hit area */
.splitter.vertical::after   { inset: -2px 0; }
.splitter:hover, .splitter.dragging {
    background: #5b57d6;
}
.splitter:hover::after, .splitter.dragging::after {
    background: inherit;
}
`);

export default class Splitter {
    constructor({
        target,
        direction = 'horizontal',
        side = 'right',
        min = 0,
        max = Infinity,
        on_resize,
    } = {}) {
        this._target    = target;
        this._direction = direction;
        this._side      = side;
        this._min       = min;
        this._max       = max;
        this._on_resize = on_resize;

        this._el = document.createElement('div');
        this._el.className = `splitter ${direction}`;

        this._bind();
    }

    get el() { return this._el; }

    _bind() {
        let start_pos  = null;
        let start_size = null;

        const is_horiz = this._direction === 'horizontal';

        this._el.addEventListener('pointerdown', e => {
            e.preventDefault();
            this._el.setPointerCapture(e.pointerId);
            this._el.classList.add('dragging');

            start_pos  = is_horiz ? e.clientX : e.clientY;
            start_size = is_horiz
                ? this._target.offsetWidth
                : this._target.offsetHeight;
        });

        this._el.addEventListener('pointermove', e => {
            if (start_pos === null) return;

            const delta = (is_horiz ? e.clientX : e.clientY) - start_pos;

            // Invert delta for handles on the far side (left/top panels shrink when dragging inward)
            const sign = (this._side === 'right' || this._side === 'bottom') ? 1 : -1;
            const new_size = Math.min(this._max, Math.max(this._min, start_size + sign * delta));

            if (is_horiz) this._target.style.width  = new_size + 'px';
            else          this._target.style.height = new_size + 'px';

            if (this._on_resize) this._on_resize(new_size);
        });

        this._el.addEventListener('pointerup', () => {
            start_pos = null;
            this._el.classList.remove('dragging');
        });

        // Double-click to reset to default size (if set)
        this._el.addEventListener('dblclick', () => {
            if (this._default_size !== undefined) {
                if (is_horiz) this._target.style.width  = this._default_size + 'px';
                else          this._target.style.height = this._default_size + 'px';
                if (this._on_resize) this._on_resize(this._default_size);
            }
        });
    }

    // Set a default size that double-click restores
    default_size(size) {
        this._default_size = size;
        return this;
    }

    // Update constraints after creation
    set_min(v) { this._min = v; return this; }
    set_max(v) { this._max = v; return this; }
}
