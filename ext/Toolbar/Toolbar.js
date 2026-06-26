// Toolbar — horizontal or vertical icon toolbar.
//
// Usage:
//   import Toolbar from '/framework/ext/Toolbar/Toolbar.js';
//
//   const bar = new Toolbar({ direction: 'horizontal' });
//
//   bar.btn({ icon: 'undo',  label: 'Undo',  on_click: undo  });
//   bar.btn({ icon: 'redo',  label: 'Redo',  on_click: redo  });
//   bar.sep();
//   bar.btn({ icon: 'save',  label: 'Save',  on_click: save, variant: 'primary' });
//
//   bar.group([
//       { icon: 'near_me',    label: 'Select', value: 'select' },
//       { icon: 'crop_square',label: 'Frame',  value: 'frame' },
//   ], { value: 'select', on_change: v => set_tool(v) });
//
//   document.body.appendChild(bar.el);

import View, { style } from '../../core/View/View.js';
import Tooltip from '../../ux/Tooltip/Tooltip.js';

style(`
.tb-wrap {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.tb-wrap.vertical { flex-direction: column; }

.tb-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border: none; background: transparent; border-radius: 7px;
    cursor: pointer; color: #1b1b19; font-size: 20px;
    transition: background 0.1s, color 0.1s;
    flex-shrink: 0;
}
.tb-btn .material-icons { font-size: 18px; }
.tb-btn:hover   { background: #f0f0ee; }
.tb-btn:active  { background: #e6e6e3; }
.tb-btn.active  { background: #ededf9; color: #5b57d6; }
.tb-btn.primary { background: #5b57d6; color: #fff; }
.tb-btn.primary:hover { background: #4a47c2; }
.tb-btn.danger  { color: #b52a1e; }
.tb-btn.danger:hover { background: #fce8e7; }
.tb-btn:disabled, .tb-btn[disabled] { opacity: 0.35; cursor: not-allowed; pointer-events: none; }

.tb-sep {
    width: 1px; height: 20px; background: #e6e6e3; margin: 0 2px; flex-shrink: 0;
}
.tb-wrap.vertical .tb-sep { width: 20px; height: 1px; margin: 2px 0; }

.tb-spacer { flex: 1; }

.tb-group { display: flex; gap: 1px; }
.tb-wrap.vertical .tb-group { flex-direction: column; }
.tb-group .tb-btn { border-radius: 5px; }
`);

export default class Toolbar {
    constructor({ direction = 'horizontal' } = {}) {
        this._dir = direction;
        this._el = document.createElement('div');
        this._el.className = direction === 'vertical' ? 'tb-wrap vertical' : 'tb-wrap';
    }

    get el() { return this._el; }

    // Icon button
    // opts: { icon, label, on_click, variant, active, disabled }
    btn({ icon, label, on_click, variant, active, disabled } = {}) {
        const btn = document.createElement('button');
        btn.className = 'tb-btn' + (variant ? ` ${variant}` : '') + (active ? ' active' : '');
        if (disabled) btn.disabled = true;

        if (icon) {
            const ic = document.createElement('span');
            ic.className = 'material-icons';
            ic.textContent = icon;
            btn.appendChild(ic);
        }

        if (on_click) btn.addEventListener('click', on_click);
        if (label)    Tooltip.bind(btn, label, { placement: this._dir === 'vertical' ? 'right' : 'bottom' });

        this._el.appendChild(btn);
        return btn;
    }

    // Exclusive toggle group (like a tool picker)
    // items: [{ icon, label, value }]
    // opts: { value, on_change }
    group(items = [], { value, on_change } = {}) {
        const wrap = document.createElement('div');
        wrap.className = 'tb-group';

        let cur = value;
        const btns = [];

        const select = (v) => {
            cur = v;
            btns.forEach(([btn, item]) => {
                btn.classList.toggle('active', item.value === cur);
            });
            if (on_change) on_change(v);
        };

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'tb-btn' + (item.value === cur ? ' active' : '');
            btn.title = item.label || '';

            if (item.icon) {
                const ic = document.createElement('span');
                ic.className = 'material-icons';
                ic.textContent = item.icon;
                btn.appendChild(ic);
            } else if (item.label) {
                btn.textContent = item.label;
            }

            btn.addEventListener('click', () => select(item.value));
            if (item.label) Tooltip.bind(btn, item.label, { placement: this._dir === 'vertical' ? 'right' : 'bottom' });

            btns.push([btn, item]);
            wrap.appendChild(btn);
        });

        this._el.appendChild(wrap);

        return {
            val: (v) => v === undefined ? cur : select(v),
            el: wrap,
        };
    }

    // Vertical separator
    sep() {
        const s = document.createElement('div');
        s.className = 'tb-sep';
        this._el.appendChild(s);
        return s;
    }

    // Flex spacer (pushes remaining items to end)
    spacer() {
        const s = document.createElement('div');
        s.className = 'tb-spacer';
        this._el.appendChild(s);
        return s;
    }
}
