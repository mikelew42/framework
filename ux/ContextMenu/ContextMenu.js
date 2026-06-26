// ContextMenu — lightweight right-click / programmatic context menu.
//
// Usage:
//   import ContextMenu from '/framework/ux/ContextMenu/ContextMenu.js';
//
//   // Programmatic
//   canvas.addEventListener('contextmenu', e => {
//       e.preventDefault();
//       ContextMenu.show({
//           x: e.clientX, y: e.clientY,
//           items: [
//               { label: 'Cut',    icon: 'content_cut',   on_click: () => cut() },
//               { label: 'Copy',   icon: 'content_copy',  on_click: () => copy() },
//               'divider',
//               { label: 'Paste',  icon: 'content_paste', on_click: () => paste(), disabled: !clipboard },
//               'divider',
//               { label: 'Delete', icon: 'delete',        on_click: () => del(), danger: true },
//           ]
//       });
//   });
//
//   // Bind to an element
//   ContextMenu.bind(my_el, e => [
//       { label: 'Open', on_click: () => ... },
//   ]);
//
//   ContextMenu.hide(); // dismiss

import { style } from '../../core/View/View.js';

style(`
.ctx-menu {
    position: fixed;
    z-index: 10001;
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 9px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    padding: 4px;
    min-width: 160px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    color: #1b1b19;
    opacity: 0;
    transform: scale(0.97) translateY(-4px);
    transform-origin: top left;
    transition: opacity 0.1s, transform 0.1s;
}
.ctx-menu.in { opacity: 1; transform: scale(1) translateY(0); }

.ctx-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}
.ctx-item:hover { background: #f4f4f3; }
.ctx-item.danger { color: #c0392b; }
.ctx-item.danger:hover { background: #fde8e6; }
.ctx-item.disabled { opacity: 0.4; pointer-events: none; cursor: default; }

.ctx-icon {
    font-size: 16px;
    color: #6b6b66;
    flex: none;
    line-height: 1;
}
.ctx-item.danger .ctx-icon { color: #c0392b; }

.ctx-label { flex: 1; }
.ctx-hint { font-size: 11px; color: #b0b0a8; }

.ctx-divider { height: 1px; background: #f0f0ee; margin: 3px 6px; }
`);

let _menu = null;

function _remove() {
    if (!_menu) return;
    _menu.classList.remove('in');
    const el = _menu;
    _menu = null;
    setTimeout(() => el.remove(), 110);
}

function show({ x, y, items = [] }) {
    _remove(); // dismiss any existing menu

    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    _menu = menu;

    items.forEach(def => {
        if (def === 'divider' || def?.type === 'divider') {
            const d = document.createElement('div');
            d.className = 'ctx-divider';
            menu.appendChild(d);
            return;
        }

        const row = document.createElement('div');
        row.className = 'ctx-item'
            + (def.danger   ? ' danger'   : '')
            + (def.disabled ? ' disabled' : '');

        if (def.icon) {
            const ic = document.createElement('span');
            ic.className = 'material-icons ctx-icon';
            ic.textContent = def.icon;
            row.appendChild(ic);
        }

        const lbl = document.createElement('span');
        lbl.className = 'ctx-label';
        lbl.textContent = def.label ?? '';
        row.appendChild(lbl);

        if (def.hint) {
            const h = document.createElement('span');
            h.className = 'ctx-hint';
            h.textContent = def.hint;
            row.appendChild(h);
        }

        if (def.on_click) {
            row.addEventListener('click', () => {
                _remove();
                def.on_click();
            });
        }

        menu.appendChild(row);
    });

    document.body.appendChild(menu);

    // Position — keep within viewport
    requestAnimationFrame(() => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const mw = menu.offsetWidth, mh = menu.offsetHeight;
        menu.style.left = Math.min(x, vw - mw - 8) + 'px';
        menu.style.top  = Math.min(y, vh - mh - 8) + 'px';
        requestAnimationFrame(() => menu.classList.add('in'));
    });
}

function hide() { _remove(); }

// Dismiss on outside click or Escape
document.addEventListener('click', e => {
    if (_menu && !_menu.contains(e.target)) _remove();
}, true);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') _remove();
});

// Bind a context menu to a DOM element.
// items_fn(e) → array of item defs
function bind(el, items_fn) {
    el.addEventListener('contextmenu', e => {
        e.preventDefault();
        show({ x: e.clientX, y: e.clientY, items: items_fn(e) });
    });
}

const ContextMenu = { show, hide, bind };
export default ContextMenu;
export { show, hide, bind };
