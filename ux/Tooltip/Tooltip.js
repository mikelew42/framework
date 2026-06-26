// Tooltip — lightweight hover tooltip anchored to any element.
//
// Usage:
//   import Tooltip from '/framework/ux/Tooltip/Tooltip.js';
//
//   Tooltip.bind(el, 'Save file');
//   Tooltip.bind(el, 'Save file', { placement: 'bottom' });
//
//   // Manual control
//   Tooltip.show('Hello', el, { placement: 'top' });
//   Tooltip.hide();
//
// Placement: 'top' (default) | 'bottom' | 'left' | 'right'
//
// All elements share one singleton tooltip DOM node — no per-element overhead.

import { style } from '../../core/View/View.js';

style(`
.ux-tooltip {
    position: fixed;
    z-index: 9999;
    background: #1b1b19;
    color: #fff;
    font-size: 11.5px;
    line-height: 1.4;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(2px);
    transition: opacity 0.1s, transform 0.1s;
    max-width: 240px;
    white-space: normal;
    text-align: center;
}
.ux-tooltip.visible {
    opacity: 1;
    transform: translateY(0);
}
.ux-tooltip.placement-top    { transform-origin: bottom center; }
.ux-tooltip.placement-bottom { transform: translateY(-2px); }
.ux-tooltip.placement-bottom.visible { transform: translateY(0); }
.ux-tooltip.placement-left   { transform: translateX(2px); }
.ux-tooltip.placement-left.visible  { transform: translateX(0); }
.ux-tooltip.placement-right  { transform: translateX(-2px); }
.ux-tooltip.placement-right.visible { transform: translateX(0); }
`);

let _el = null;
let _show_timer = null;
let _hide_timer = null;

function _ensure_el() {
    if (!_el) {
        _el = document.createElement('div');
        _el.className = 'ux-tooltip';
        document.body.appendChild(_el);
    }
    return _el;
}

function _position(trigger, placement = 'top') {
    const t  = trigger.getBoundingClientRect();
    const el = _ensure_el();
    const ew = el.offsetWidth, eh = el.offsetHeight;
    const GAP = 6;
    let x, y;

    if (placement === 'top')    { x = t.left + t.width / 2 - ew / 2; y = t.top - eh - GAP; }
    if (placement === 'bottom') { x = t.left + t.width / 2 - ew / 2; y = t.bottom + GAP; }
    if (placement === 'left')   { x = t.left - ew - GAP; y = t.top + t.height / 2 - eh / 2; }
    if (placement === 'right')  { x = t.right + GAP;      y = t.top + t.height / 2 - eh / 2; }

    const vw = window.innerWidth, vh = window.innerHeight;
    x = Math.min(Math.max(x, 6), vw - ew - 6);
    y = Math.min(Math.max(y, 6), vh - eh - 6);

    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.className  = `ux-tooltip placement-${placement}`;
}

const Tooltip = {
    // Show a tooltip for a trigger element (with optional delay)
    show(text, trigger, { placement = 'top', delay = 400 } = {}) {
        clearTimeout(_show_timer);
        clearTimeout(_hide_timer);

        _show_timer = setTimeout(() => {
            const el = _ensure_el();
            el.textContent = text;
            el.className = `ux-tooltip placement-${placement}`;
            // Position before making visible so size is known
            el.style.opacity = '0';
            el.style.display = 'block';
            _position(trigger, placement);
            requestAnimationFrame(() => el.classList.add('visible'));
        }, delay);
    },

    hide(delay = 100) {
        clearTimeout(_show_timer);
        clearTimeout(_hide_timer);

        _hide_timer = setTimeout(() => {
            if (_el) _el.classList.remove('visible');
        }, delay);
    },

    // Bind tooltip to an element via mouseenter/mouseleave
    // Returns an unbind function.
    bind(el, text, { placement = 'top', delay = 400 } = {}) {
        const on_enter = () => Tooltip.show(text, el, { placement, delay });
        const on_leave = () => Tooltip.hide();

        el.addEventListener('mouseenter', on_enter);
        el.addEventListener('mouseleave', on_leave);
        el.addEventListener('focus',      on_enter);
        el.addEventListener('blur',       on_leave);

        // Return cleanup fn
        return () => {
            el.removeEventListener('mouseenter', on_enter);
            el.removeEventListener('mouseleave', on_leave);
            el.removeEventListener('focus',      on_enter);
            el.removeEventListener('blur',       on_leave);
        };
    },
};

export default Tooltip;
