// Popover — positioned overlay anchored to a trigger element.
//
// Usage:
//   import Popover from '/framework/ux/Popover/Popover.js';
//
//   const pop = new Popover({
//       trigger: btn.el,          // element to anchor to
//       content: myView,          // View or HTMLElement
//       placement: 'bottom-start', // see Placements below
//       offset: 6,                // gap from trigger (px)
//       close_on_outside: true,   // default true
//   });
//
//   pop.open();
//   pop.close();
//   pop.toggle();
//   pop.destroy();   // remove event listeners
//
//   // Shorthand via ux.popover()
//   const pop = ux.popover({ trigger: btn.el, content: myView });
//
// Placements: 'top' 'top-start' 'top-end'
//             'bottom' 'bottom-start' 'bottom-end'
//             'left' 'left-start' 'left-end'
//             'right' 'right-start' 'right-end'

import { style } from '../../core/View/View.js';

style(`
.ux-popover {
    position: fixed;
    z-index: 9000;
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 9px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    padding: 8px;
    min-width: 140px;
    opacity: 0;
    transform: scale(0.97) translateY(-4px);
    transform-origin: top left;
    transition: opacity 0.12s, transform 0.12s;
    pointer-events: none;
}
.ux-popover.open {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: auto;
}
.ux-popover.placement-top    { transform-origin: bottom center; }
.ux-popover.placement-bottom { transform-origin: top center; }
.ux-popover.placement-left   { transform-origin: right center; }
.ux-popover.placement-right  { transform-origin: left center; }
`);

function _get_rect(el) {
    return el.getBoundingClientRect();
}

function _position(pop_el, trigger_el, placement = 'bottom-start', offset = 6) {
    const t = _get_rect(trigger_el);
    const vw = window.innerWidth, vh = window.innerHeight;

    pop_el.style.visibility = 'hidden';
    pop_el.style.display = 'block';
    const pw = pop_el.offsetWidth, ph = pop_el.offsetHeight;
    pop_el.style.visibility = '';

    const [side, align = 'center'] = placement.split('-');
    let x, y;

    // Main axis
    if (side === 'bottom')      { y = t.bottom + offset; }
    else if (side === 'top')    { y = t.top - ph - offset; }
    else if (side === 'right')  { x = t.right + offset; }
    else /* left */             { x = t.left - pw - offset; }

    // Cross axis
    if (side === 'bottom' || side === 'top') {
        if (align === 'start')       x = t.left;
        else if (align === 'end')    x = t.right - pw;
        else                         x = t.left + t.width / 2 - pw / 2;
    } else {
        if (align === 'start')       y = t.top;
        else if (align === 'end')    y = t.bottom - ph;
        else                         y = t.top + t.height / 2 - ph / 2;
    }

    // Clamp within viewport
    x = Math.min(Math.max(x, 8), vw - pw - 8);
    y = Math.min(Math.max(y, 8), vh - ph - 8);

    pop_el.style.left = x + 'px';
    pop_el.style.top  = y + 'px';
    pop_el.className = `ux-popover placement-${side}`;
}

export default class Popover {
    constructor({ trigger, content, placement = 'bottom-start', offset = 6, close_on_outside = true } = {}) {
        this.trigger   = trigger;
        this.placement = placement;
        this.offset    = offset;
        this._open     = false;

        // Build DOM
        this._el = document.createElement('div');
        this._el.className = 'ux-popover';

        if (content) {
            if (content.el)                    this._el.appendChild(content.el);
            else if (content instanceof HTMLElement) this._el.appendChild(content);
            else                               this._el.textContent = content;
        }

        document.body.appendChild(this._el);

        // Outside click to close
        if (close_on_outside) {
            this._outside_handler = e => {
                if (this._open && !this._el.contains(e.target) && !trigger?.contains(e.target)) {
                    this.close();
                }
            };
            document.addEventListener('click', this._outside_handler, true);
        }

        this._escape_handler = e => { if (e.key === 'Escape') this.close(); };
        document.addEventListener('keydown', this._escape_handler);
    }

    open() {
        if (!this._open) {
            _position(this._el, this.trigger, this.placement, this.offset);
            requestAnimationFrame(() => this._el.classList.add('open'));
            this._open = true;
        }
        return this;
    }

    close() {
        if (this._open) {
            this._el.classList.remove('open');
            this._open = false;
        }
        return this;
    }

    toggle() {
        return this._open ? this.close() : this.open();
    }

    // Update content at runtime
    set_content(content) {
        this._el.innerHTML = '';
        if (content && content.el)             this._el.appendChild(content.el);
        else if (content instanceof HTMLElement) this._el.appendChild(content);
        else                                   this._el.textContent = content ?? '';
        return this;
    }

    destroy() {
        this.close();
        this._el.remove();
        if (this._outside_handler) document.removeEventListener('click', this._outside_handler, true);
        document.removeEventListener('keydown', this._escape_handler);
    }
}
