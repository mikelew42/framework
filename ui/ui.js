import View, { el, div, style } from '../core/View/View.js';

// ─── Styles ──────────────────────────────────────────────────────────────────
// Uses em units throughout so controls scale with their container font-size.
// Override any class to restyle a control without touching JS.

style(`
.ui-input, .ui-textarea, .ui-select {
    font-family: inherit;
    font-size: 1em;
    border: 1px solid #e6e6e3;
    border-radius: 6px;
    padding: 0.35em 0.65em;
    background: #fafafa;
    color: #1b1b19;
    outline: none;
    width: 100%;
    box-sizing: border-box;
}
.ui-input:focus, .ui-textarea:focus, .ui-select:focus {
    border-color: #5b57d6;
    background: #fff;
}
.ui-textarea {
    resize: vertical;
    min-height: 4em;
    line-height: 1.4;
}
.ui-select { cursor: pointer; }

/* Slider */
.ui-slider-wrap { display: flex; align-items: center; gap: 0.5em; width: 100%; }
.ui-slider { flex: 1; accent-color: #5b57d6; cursor: pointer; }
.ui-slider-val {
    font-size: 0.85em;
    color: #6b6b66;
    min-width: 2.5em;
    text-align: right;
    user-select: none;
}

/* Scrub — drag left/right to change a number; click to type */
.ui-scrub {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.2em;
    cursor: ew-resize;
    border: 1px solid #e6e6e3;
    border-radius: 6px;
    padding: 0.3em 0.6em;
    background: #fafafa;
    color: #1b1b19;
    user-select: none;
    min-width: 3.5em;
    font-size: 1em;
    box-sizing: border-box;
}
.ui-scrub:hover { border-color: #5b57d6; }
.ui-scrub.editing { cursor: text; }
.ui-scrub-inner { width: 100%; text-align: center; }
.ui-scrub.editing input {
    border: none; background: transparent;
    font-family: inherit; font-size: inherit; color: inherit;
    outline: none; width: 100%; padding: 0; text-align: center;
}

/* Toggle switch */
.ui-toggle {
    position: relative;
    display: inline-block;
    width: 2.2em; height: 1.2em;
    flex: none;
    cursor: pointer;
}
.ui-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.ui-toggle-track {
    position: absolute; inset: 0;
    border-radius: 0.6em;
    background: #d0d0ce;
    transition: background 0.15s;
}
.ui-toggle input:checked + .ui-toggle-track { background: #5b57d6; }
.ui-toggle-thumb {
    position: absolute;
    top: 0.15em; left: 0.15em;
    width: 0.9em; height: 0.9em;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
    pointer-events: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.ui-toggle input:checked ~ .ui-toggle-thumb { left: calc(100% - 1.05em); }

/* Checkbox */
.ui-checkbox-wrap {
    display: flex; align-items: center; gap: 0.4em;
    cursor: pointer; font-size: 1em; color: #1b1b19;
}
.ui-checkbox-wrap input[type=checkbox] {
    width: 1em; height: 1em;
    accent-color: #5b57d6; cursor: pointer; flex: none;
}

/* Color picker */
.ui-color-wrap { display: flex; align-items: center; gap: 0.5em; }
.ui-color-swatch {
    width: 1.8em; height: 1.8em;
    border: 1px solid #e6e6e3; border-radius: 6px;
    cursor: pointer; flex: none;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
    transition: box-shadow 0.1s;
}
.ui-color-swatch:hover { box-shadow: inset 0 0 0 2px rgba(0,0,0,0.15); }
.ui-color-hex { flex: 1; font-family: monospace; font-size: 0.85em; }

/* Combobox */
.ui-combobox { position: relative; display: inline-block; min-width: 140px; }
.ui-combobox-trigger {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.4em;
    padding: 0.3em 0.6em; border: 1px solid #e6e6e3; border-radius: 7px;
    background: #fff; font-size: 1em; color: #1b1b19;
    cursor: pointer; user-select: none;
    transition: border-color 0.1s;
}
.ui-combobox-trigger:hover, .ui-combobox-trigger.open { border-color: #5b57d6; }
.ui-combobox-trigger:focus { outline: none; box-shadow: 0 0 0 2px #ded9fd; border-color: #5b57d6; }
.ui-combobox-value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-combobox-arrow { font-size: 1.1em; color: #9a9a94; transition: transform 0.15s; flex-shrink: 0; }
.ui-combobox-trigger.open .ui-combobox-arrow { transform: rotate(180deg); }

.ui-combobox-dropdown {
    display: none; position: absolute; z-index: 9000;
    top: calc(100% + 4px); left: 0; right: 0;
    background: #fff; border: 1px solid #e6e6e3;
    border-radius: 9px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.1);
    overflow: hidden;
}
.ui-combobox-dropdown.open { display: block; }
.ui-combobox-search {
    width: 100%; box-sizing: border-box;
    border: none; border-bottom: 1px solid #f0f0ee;
    padding: 0.45em 0.7em; font-size: 0.9em; color: #1b1b19;
    outline: none; background: #fafaf9;
}
.ui-combobox-list { max-height: 200px; overflow-y: auto; }
.ui-combobox-option {
    padding: 0.4em 0.7em; font-size: 0.9em; cursor: pointer;
    color: #1b1b19; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: background 0.06s;
}
.ui-combobox-option em { font-style: normal; background: #ffe566; border-radius: 2px; }
.ui-combobox-option:hover, .ui-combobox-option.focused { background: #f4f4f3; }
.ui-combobox-option.selected { color: #5b57d6; font-weight: 500; }
.ui-combobox-empty { padding: 0.6em 0.7em; font-size: 0.9em; color: #9a9a94; font-style: italic; }

/* Button */
.ui-btn {
    font-family: inherit; font-size: 1em; font-weight: 500;
    padding: 0.35em 0.9em;
    border-radius: 6px; border: 1px solid #e6e6e3;
    background: #fff; color: #1b1b19;
    cursor: pointer; white-space: nowrap;
    transition: background 0.1s;
}
.ui-btn:hover { background: #f4f4f3; }
.ui-btn.primary { background: #5b57d6; color: #fff; border-color: #5b57d6; }
.ui-btn.primary:hover { background: #4b47c6; }
.ui-btn.ghost { background: transparent; border-color: transparent; color: #5b57d6; }
.ui-btn.ghost:hover { background: #f0f0ff; }
.ui-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Icon item — sidebar nav row with icon + label + hint */
.ui-item {
    display: flex; align-items: center; gap: 0.6em;
    padding: 0.4em 0.75em;
    border-radius: 6px; cursor: pointer;
    font-size: 0.9em; color: #1b1b19;
    user-select: none; margin: 0 0.25em;
}
.ui-item:hover { background: #f4f4f3; }
.ui-item.active { background: #ededfc; color: #5b57d6; }
.ui-item-icon { font-size: 1.1em; color: #6b6b66; flex: none; }
.ui-item.active .ui-item-icon { color: #5b57d6; }
.ui-item-label { flex: 1; }
.ui-item-hint { font-size: 0.8em; color: #b0b0a8; }

/* Row: label + controls */
.ui-row { display: flex; align-items: center; gap: 0.5em; margin-bottom: 0.4em; }
.ui-row-label { font-size: 0.8em; color: #6b6b66; min-width: 2.5em; flex: none; }
.ui-row-controls { flex: 1; display: flex; align-items: center; gap: 0.4em; min-width: 0; }

/* Section block */
.ui-section { padding: 0.75em 0.9em; border-bottom: 1px solid #f0f0ee; }
.ui-section-label {
    font-size: 0.7em; font-weight: 600; color: #9a9a94;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5em;
}

/* Divider */
.ui-divider { height: 1px; background: #ececea; margin: 0.35em 0.75em; }

/* Toggle group — exclusive button set */
.ui-toggle-group { display: flex; gap: 3px; flex-wrap: wrap; }
.ui-tg-btn {
    font-family: inherit; font-size: 0.8em; font-weight: 500;
    border: 1px solid #e6e6e3; border-radius: 5px;
    padding: 0.3em 0.7em; cursor: pointer;
    background: #fff; color: #6b6b66;
    display: flex; align-items: center; gap: 0.2em;
    white-space: nowrap; transition: background 0.1s;
}
.ui-tg-btn:hover { background: #f4f4f3; color: #1b1b19; }
.ui-tg-btn.active { background: #5b57d6; color: #fff; border-color: #5b57d6; }
.ui-tg-btn .material-icons { font-size: 1.2em; line-height: 1; }

/* Badge / pill label */
.ui-badge {
    display: inline-flex; align-items: center;
    font-size: 0.75em; font-weight: 600;
    padding: 0.15em 0.55em; border-radius: 99px;
    background: #ededfc; color: #5b57d6;
}
.ui-badge.success { background: #d4f5e5; color: #2d8a5a; }
.ui-badge.warning { background: #fef3cd; color: #b77a00; }
.ui-badge.error   { background: #fde8e6; color: #c0392b; }
.ui-badge.neutral { background: #f0f0ee; color: #6b6b66; }
`);

// ─── Internal helpers ─────────────────────────────────────────────────────────

// Create a View without auto-capturing into a captor
function mk(tag = 'div', cls = '') {
    const v = new View({ capture: false, tag });
    if (cls) v.ac(cls);
    return v;
}

// Add .c() as a class-chaining shorthand (.ac() already exists; .c() matches el/div proxy style)
function ctrl(v) {
    v.c = (...a) => { v.ac(...a); return v; };
    return v;
}

// ─── Controls ────────────────────────────────────────────────────────────────

// Text input.
// opts: { value, placeholder, type, on_change }
// Returns View with .val(x?) get/set
function input({ value = '', placeholder = '', type = 'text', on_change } = {}) {
    const v = mk('input', 'ui-input');
    v.el.type = type;
    v.el.value = value;
    if (placeholder) v.el.placeholder = placeholder;
    if (on_change) {
        v.el.addEventListener('input',  e => on_change(e.target.value, v));
        v.el.addEventListener('change', e => on_change(e.target.value, v));
    }
    v.val = x => x === undefined ? v.el.value : (v.el.value = x, v);
    return ctrl(v);
}

// Multi-line textarea.
// opts: { value, placeholder, on_change }
function textarea({ value = '', placeholder = '', on_change } = {}) {
    const v = mk('textarea', 'ui-textarea');
    v.el.value = value;
    if (placeholder) v.el.placeholder = placeholder;
    if (on_change) v.el.addEventListener('input', e => on_change(e.target.value, v));
    v.val = x => x === undefined ? v.el.value : (v.el.value = x, v);
    return ctrl(v);
}

// <select> dropdown.
// opts: { value, options: ['str'] | [{value, label}], on_change }
function select({ value, options = [], on_change } = {}) {
    const v = mk('select', 'ui-select');
    options.forEach(opt => {
        const o = document.createElement('option');
        const is_obj = typeof opt === 'object' && opt !== null;
        o.value = is_obj ? String(opt.value ?? opt.label) : String(opt);
        o.textContent = is_obj ? String(opt.label ?? opt.value) : String(opt);
        if (o.value === String(value)) o.selected = true;
        v.el.appendChild(o);
    });
    if (on_change) v.el.addEventListener('change', e => on_change(e.target.value, v));
    v.val = x => x === undefined ? v.el.value : (v.el.value = x, v);
    return ctrl(v);
}

// Range slider with live value label.
// opts: { value, min, max, step, on_change }
function slider({ value = 0, min = 0, max = 100, step = 1, on_change } = {}) {
    const wrap = mk('div', 'ui-slider-wrap');
    const range = mk('input', 'ui-slider');
    Object.assign(range.el, { type: 'range', min, max, step, value });
    const lbl = mk('span', 'ui-slider-val');
    lbl.el.textContent = value;
    range.el.addEventListener('input', e => {
        const v = Number(e.target.value);
        lbl.el.textContent = v;
        on_change && on_change(v, wrap);
    });
    wrap.append(range, lbl);
    wrap.val = x => {
        if (x === undefined) return Number(range.el.value);
        range.el.value = x;
        lbl.el.textContent = x;
        return wrap;
    };
    return ctrl(wrap);
}

// Scrubbable number — drag left/right to change; click to type directly.
// opts: { value, min, max, step, decimals, on_change }
// Shift-drag for fine control (10x slower).
function scrub({ value = 0, min = -Infinity, max = Infinity, step = 1, decimals, on_change } = {}) {
    const wrap = mk('div', 'ui-scrub');
    const inner = mk('span', 'ui-scrub-inner');
    wrap.append(inner);

    const dec = decimals ?? (step < 1 ? String(step).split('.')[1]?.length ?? 2 : 0);
    const fmt = v => Number.isFinite(v) ? v.toFixed(dec) : String(v);
    let cur = value;

    function set_val(v) {
        cur = Math.min(max, Math.max(min, v));
        if (!wrap.el.querySelector('input')) inner.el.textContent = fmt(cur);
        on_change && on_change(cur, wrap);
    }

    function enter_edit() {
        inner.el.textContent = '';
        const inp = document.createElement('input');
        inp.value = fmt(cur);
        inner.el.appendChild(inp);
        wrap.ac('editing');
        inp.focus(); inp.select();
        const commit = () => {
            const v = parseFloat(inp.value);
            if (!isNaN(v)) set_val(v);
            inner.el.textContent = fmt(cur);
            wrap.rc('editing');
        };
        inp.addEventListener('blur', commit);
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
            else if (e.key === 'Escape') { inp.value = fmt(cur); inp.blur(); }
            e.stopPropagation();
        });
    }

    inner.el.textContent = fmt(cur);
    let drag_x = null, drag_val = null;

    wrap.el.addEventListener('pointerdown', e => {
        if (wrap.has_class('editing')) return;
        drag_x = e.clientX; drag_val = cur;
        wrap.el.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    wrap.el.addEventListener('pointermove', e => {
        if (drag_x === null) return;
        const dx = e.clientX - drag_x;
        const sens = e.shiftKey ? step * 0.1 : step;
        set_val(drag_val + dx * sens);
    });
    wrap.el.addEventListener('pointerup', e => {
        if (drag_x !== null && Math.abs(e.clientX - drag_x) < 3) enter_edit();
        drag_x = null;
    });

    wrap.val = x => {
        if (x === undefined) return cur;
        set_val(x); return wrap;
    };
    return ctrl(wrap);
}

// On/off toggle switch.
// opts: { value, on_change }
function toggle({ value = false, on_change } = {}) {
    const wrap = mk('label', 'ui-toggle');
    const inp = document.createElement('input');
    inp.type = 'checkbox'; inp.checked = value;
    const track = document.createElement('span');
    track.className = 'ui-toggle-track';
    const thumb = document.createElement('span');
    thumb.className = 'ui-toggle-thumb';
    wrap.el.append(inp, track, thumb);
    if (on_change) inp.addEventListener('change', e => on_change(e.target.checked, wrap));
    wrap.val = x => x === undefined ? inp.checked : (inp.checked = x, wrap);
    return ctrl(wrap);
}

// Checkbox with optional inline label.
// opts: { value, label, on_change }
function checkbox({ value = false, label: lbl = '', on_change } = {}) {
    const wrap = mk('label', 'ui-checkbox-wrap');
    const inp = document.createElement('input');
    inp.type = 'checkbox'; inp.checked = value;
    wrap.el.appendChild(inp);
    if (lbl) wrap.el.appendChild(document.createTextNode(lbl));
    if (on_change) inp.addEventListener('change', e => on_change(e.target.checked, wrap));
    wrap.val = x => x === undefined ? inp.checked : (inp.checked = x, wrap);
    return ctrl(wrap);
}

// Color picker — styled swatch + hex text field.
// Clicking the swatch opens the full ColorPicker (HSV) in a Popover.
// opts: { value, on_change }
function color({ value = '#ffffff', on_change } = {}) {
    const wrap = mk('div', 'ui-color-wrap');
    let cur = value;

    const swatch = document.createElement('div');
    swatch.className = 'ui-color-swatch';
    swatch.style.background = cur;

    const hex_inp = mk('input', 'ui-input ui-color-hex');
    hex_inp.el.type = 'text'; hex_inp.el.value = cur; hex_inp.el.placeholder = '#000000';

    const set_val = v => {
        if (!/^#[0-9a-fA-F]{6}$/i.test(v)) return;
        cur = v.toLowerCase();
        swatch.style.background = cur;
        hex_inp.el.value = cur;
        if (on_change) on_change(cur, wrap);
    };

    hex_inp.el.addEventListener('change', e => set_val(e.target.value));

    // Lazy-open ColorPicker popover on swatch click
    let _pop = null;
    let _picker = null;
    swatch.addEventListener('click', async () => {
        if (!_pop) {
            const [{ default: ColorPicker }, { default: Popover }] = await Promise.all([
                import('./ColorPicker/ColorPicker.js'),
                import('../ux/Popover/Popover.js'),
            ]);
            _picker = new ColorPicker({ value: cur, on_change: v => set_val(v) });
            _pop = new Popover({ trigger: swatch, content: _picker.el, placement: 'bottom-start', offset: 6 });
        } else {
            _picker.val(cur);
        }
        _pop.toggle();
    });

    wrap.el.append(swatch);
    wrap.append(hex_inp);
    wrap.val = x => {
        if (x === undefined) return cur;
        set_val(x); return wrap;
    };
    return ctrl(wrap);
}

// Button.
// opts: { label, on_click, variant: 'primary'|'ghost'|'' }
function button({ label: lbl = 'Button', on_click, variant = '' } = {}) {
    const v = mk('button', 'ui-btn');
    v.el.textContent = lbl;
    if (variant) v.ac(variant);
    if (on_click) v.el.addEventListener('click', () => on_click(v));
    return ctrl(v);
}

// Icon sidebar item — icon + label + optional hint text.
// opts: { icon, label, hint, on_click, active, draggable, drag_type, drag_data }
function item({ icon: icon_name = '', label: lbl = '', hint = '', on_click, active = false, draggable: drag = false, drag_type = 'text/plain', drag_data = '' } = {}) {
    const wrap = mk('div', 'ui-item');
    if (active) wrap.ac('active');
    if (icon_name) {
        const ic = document.createElement('span');
        ic.className = 'material-icons ui-item-icon';
        ic.textContent = icon_name;
        wrap.el.appendChild(ic);
    }
    const lbl_el = mk('span', 'ui-item-label');
    lbl_el.el.textContent = lbl;
    wrap.append(lbl_el);
    if (hint) {
        const hint_el = mk('span', 'ui-item-hint');
        hint_el.el.textContent = hint;
        wrap.append(hint_el);
    }
    if (on_click) wrap.el.addEventListener('click', () => on_click(wrap));
    if (drag) {
        wrap.el.setAttribute('draggable', 'true');
        wrap.el.addEventListener('dragstart', e => {
            e.dataTransfer.setData(drag_type, drag_data || lbl);
            e.dataTransfer.effectAllowed = 'copy';
        });
    }
    return ctrl(wrap);
}

// Label + controls row (for use inside sections).
// row('Size', ui.slider({...})) → label | control(s)
function row(label_text, ...controls) {
    const wrap = mk('div', 'ui-row');
    if (label_text) {
        const lbl = mk('span', 'ui-row-label');
        lbl.el.textContent = label_text;
        wrap.append(lbl);
    }
    const ctl = mk('div', 'ui-row-controls');
    controls.forEach(c => {
        if (!c) return;
        if (c.el) ctl.append(c);
        else ctl.el.appendChild(c);
    });
    wrap.append(ctl);
    return ctrl(wrap);
}

// Section block with an uppercase label and optional children.
// section('Layout', row(...), row(...))
function section(title, ...children) {
    const wrap = mk('div', 'ui-section');
    if (title) {
        const lbl = mk('div', 'ui-section-label');
        lbl.el.textContent = title;
        wrap.append(lbl);
    }
    children.forEach(c => {
        if (!c) return;
        if (c.el) wrap.append(c);
        else wrap.el.appendChild(c);
    });
    return ctrl(wrap);
}

// Thin horizontal rule.
function divider() {
    return ctrl(mk('div', 'ui-divider'));
}

// Exclusive button group — one option active at a time.
// opts: { options, value, on_change }
// options: ['Row','Col'] | [{value, label, icon, title}]
function toggle_group({ options = [], value, on_change } = {}) {
    const wrap = mk('div', 'ui-toggle-group');
    let cur = value;
    const btns = [];

    function set(v) {
        cur = v;
        btns.forEach((btn, i) => {
            const o = options[i];
            const ov = typeof o === 'object' ? o.value : o;
            btn.classList.toggle('active', ov === cur);
        });
        on_change && on_change(cur, wrap);
    }

    options.forEach(opt => {
        const is_obj = typeof opt === 'object' && opt !== null;
        const ov    = is_obj ? opt.value : opt;
        const lbl   = is_obj ? (opt.label ?? opt.value) : opt;
        const ic    = is_obj ? opt.icon  : null;
        const title = is_obj ? opt.title : null;

        const btn = document.createElement('button');
        btn.className = 'ui-tg-btn' + (ov === cur ? ' active' : '');
        if (title) btn.title = title;
        if (ic) {
            const span = document.createElement('span');
            span.className = 'material-icons';
            span.textContent = ic;
            btn.appendChild(span);
        } else {
            btn.textContent = lbl;
        }
        btn.addEventListener('click', () => set(ov));
        wrap.el.appendChild(btn);
        btns.push(btn);
    });

    wrap.val = x => x === undefined ? cur : (set(x), wrap);
    return ctrl(wrap);
}

// Pill/badge label.
// badge('Draft', 'neutral') | badge('Saved', 'success') | badge('Error', 'error')
function badge(text, variant = '') {
    const v = mk('span', 'ui-badge');
    if (variant) v.ac(variant);
    v.el.textContent = text;
    return ctrl(v);
}

// Bind a control factory to an Item property.
// bound(item, 'size', ui.scrub, { min: 1, max: 200 })
// → Creates the control with value from item.get(key).
//   Writes back via item.set(key, v) on change.
//   Stays in sync when item emits 'change' with the key in the patch.
function bound(item, key, factory_fn, opts = {}) {
    const cur = item.get ? item.get(key) : item[key];
    const control = factory_fn({
        ...opts,
        value: cur,
        on_change: v => item.set ? item.set(key, v) : (item[key] = v),
    });
    // Re-sync when item changes externally (undo, bulk-set, etc.)
    if (item.on) {
        item.on('change', patch => {
            if (patch && key in patch) control.val(patch[key]);
        });
    }
    return control;
}

// Form builder — builds a section of label+control rows from a schema array.
// Each entry: { key, type, label, ...control_opts }  |  'divider'  |  { type:'section', label }
//
// bound(item, 'size', ui.scrub, { min: 1, max: 200 })
// form(item, [
//   { key: 'name',   type: 'input',        label: 'Name' },
//   { key: 'size',   type: 'scrub',        label: 'Size', min: 1, max: 200 },
//   { key: 'color',  type: 'color',        label: 'Color' },
//   { key: 'dir',    type: 'toggle_group', label: 'Dir', options: ['row', 'col'] },
//   'divider',
//   { key: 'notes',  type: 'textarea',     label: 'Notes' },
// ])
const _form_factories = {
    input, textarea, select, slider, scrub,
    toggle, checkbox, color, toggle_group,
};

function form(item, schema = []) {
    const wrap = mk('div', 'ui-form');
    schema.forEach(def => {
        if (!def) return;
        if (def === 'divider' || def.type === 'divider') {
            wrap.append(divider()); return;
        }
        if (def.type === 'section') {
            wrap.append(section(def.label)); return;
        }
        const { key, type = 'input', label: lbl = key, ...opts } = def;
        const factory = _form_factories[type];
        if (!factory) { console.warn('ui.form: unknown type', type); return; }
        const control = bound(item, key, factory, opts);
        wrap.append(row(lbl, control));
    });
    return ctrl(wrap);
}

// Number input with +/- stepper buttons and hold-to-repeat.
// number({ value, min, max, step, decimals, on_change })
function number({ value = 0, min = -Infinity, max = Infinity, step = 1, decimals = 0, on_change } = {}) {
    let cur = value;
    const fmt = v => decimals > 0 ? (+v).toFixed(decimals) : String(v);

    const wrap = mk('div', 'ui-number');
    wrap.el.style.cssText = 'display:inline-flex;align-items:center;border:1px solid #e6e6e3;border-radius:7px;overflow:hidden;background:#fff;height:28px;';

    const dec_btn = document.createElement('button');
    dec_btn.style.cssText = 'border:none;background:transparent;padding:0 8px;cursor:pointer;color:#6b6b66;font-size:15px;height:100%;line-height:1;border-right:1px solid #f0f0ee;flex-shrink:0;';
    dec_btn.textContent = '−';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = fmt(cur);
    inp.style.cssText = 'border:none;outline:none;width:52px;text-align:center;font-size:12px;background:transparent;padding:0 2px;color:#1b1b19;';

    const inc_btn = document.createElement('button');
    inc_btn.style.cssText = 'border:none;background:transparent;padding:0 8px;cursor:pointer;color:#6b6b66;font-size:15px;height:100%;line-height:1;border-left:1px solid #f0f0ee;flex-shrink:0;';
    inc_btn.textContent = '+';

    const set_val = v => {
        cur = Math.min(max, Math.max(min, +v));
        if (isNaN(cur)) cur = value;
        inp.value = fmt(cur);
        if (on_change) on_change(cur);
    };

    dec_btn.addEventListener('click', () => set_val(cur - step));
    inc_btn.addEventListener('click', () => set_val(cur + step));
    inp.addEventListener('change', () => set_val(parseFloat(inp.value)));
    inp.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp')   { e.preventDefault(); set_val(cur + step); }
        if (e.key === 'ArrowDown') { e.preventDefault(); set_val(cur - step); }
    });

    // Hold to repeat
    [dec_btn, inc_btn].forEach(btn => {
        let hold = null;
        btn.addEventListener('mousedown', () => {
            hold = setTimeout(() => { hold = setInterval(() => btn.click(), 80); }, 400);
        });
        const stop = () => { clearTimeout(hold); clearInterval(hold); };
        btn.addEventListener('mouseup',    stop);
        btn.addEventListener('mouseleave', stop);
    });

    wrap.el.append(dec_btn, inp, inc_btn);
    wrap.val = (v) => { if (v === undefined) return cur; set_val(v); return wrap; };
    wrap.c   = (...a) => { wrap.ac(...a); return wrap; };
    return wrap;
}

// Combobox — searchable dropdown with keyboard nav.
// combobox({ value, options, placeholder, on_change })
// options: string[] | { value, label }[]
function combobox({ value, options = [], placeholder = 'Search…', on_change } = {}) {
    const all = options.map(o => typeof o === 'object' ? o : { value: String(o), label: String(o) });
    let cur_val = value !== undefined ? String(value) : (all[0]?.value ?? '');
    let cur_label = all.find(o => o.value === cur_val)?.label ?? cur_val;
    let focused = -1;
    let visible = [];
    let open = false;

    const wrap = mk('div', 'ui-combobox');

    const trigger = document.createElement('div');
    trigger.className = 'ui-combobox-trigger';
    trigger.tabIndex = 0;

    const trigger_text = document.createElement('span');
    trigger_text.className = 'ui-combobox-value';
    trigger_text.textContent = cur_label || placeholder;

    const arrow = document.createElement('span');
    arrow.className = 'material-icons ui-combobox-arrow';
    arrow.textContent = 'expand_more';
    trigger.append(trigger_text, arrow);

    const dropdown = document.createElement('div');
    dropdown.className = 'ui-combobox-dropdown';

    const search_inp = document.createElement('input');
    search_inp.className = 'ui-combobox-search';
    search_inp.placeholder = placeholder;
    search_inp.type = 'text';

    const list_el = document.createElement('div');
    list_el.className = 'ui-combobox-list';

    dropdown.append(search_inp, list_el);
    wrap.el.append(trigger, dropdown);

    const close = () => {
        open = false;
        dropdown.classList.remove('open');
        trigger.classList.remove('open');
        search_inp.value = '';
        render_list('');
    };

    const pick = (val, label) => {
        cur_val = val; cur_label = label;
        trigger_text.textContent = label;
        close();
        if (on_change) on_change(val, wrap);
    };

    const render_list = (query = '') => {
        const q = query.toLowerCase();
        visible = q ? all.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : all;
        list_el.innerHTML = '';
        focused = -1;
        visible.forEach((o, i) => {
            const row = document.createElement('div');
            row.className = 'ui-combobox-option' + (o.value === cur_val ? ' selected' : '');
            if (query) {
                const idx = o.label.toLowerCase().indexOf(q);
                if (idx >= 0) {
                    row.innerHTML = o.label.slice(0, idx) + '<em>' + o.label.slice(idx, idx + q.length) + '</em>' + o.label.slice(idx + q.length);
                } else {
                    row.textContent = o.label;
                }
            } else {
                row.textContent = o.label;
            }
            row.addEventListener('mousedown', e => { e.preventDefault(); pick(o.value, o.label); });
            list_el.appendChild(row);
        });
        if (!visible.length) {
            const empty = document.createElement('div');
            empty.className = 'ui-combobox-empty';
            empty.textContent = 'No results';
            list_el.appendChild(empty);
        }
    };

    const set_focused = n => {
        const rows = list_el.querySelectorAll('.ui-combobox-option');
        rows.forEach(r => r.classList.remove('focused'));
        focused = Math.max(0, Math.min(n, visible.length - 1));
        if (rows[focused]) { rows[focused].classList.add('focused'); rows[focused].scrollIntoView({ block: 'nearest' }); }
    };

    const open_dropdown = () => {
        open = true;
        dropdown.classList.add('open');
        trigger.classList.add('open');
        render_list('');
        // Scroll to selected
        const sel = list_el.querySelector('.selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
        setTimeout(() => search_inp.focus(), 0);
    };

    trigger.addEventListener('click', () => open ? close() : open_dropdown());
    trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open_dropdown(); }
    });

    search_inp.addEventListener('input', e => render_list(e.target.value));
    search_inp.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); set_focused(focused + 1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); set_focused(focused - 1); }
        if (e.key === 'Enter') {
            if (focused >= 0 && visible[focused]) pick(visible[focused].value, visible[focused].label);
        }
        if (e.key === 'Escape') close();
    });

    // Close on outside click
    document.addEventListener('mousedown', e => {
        if (open && !wrap.el.contains(e.target)) close();
    });

    wrap.val = x => {
        if (x === undefined) return cur_val;
        const found = all.find(o => o.value === String(x));
        if (found) { cur_val = found.value; cur_label = found.label; trigger_text.textContent = found.label; }
        return wrap;
    };
    wrap.c = (...a) => { wrap.ac(...a); return wrap; };
    return wrap;
}

// ─── Export ───────────────────────────────────────────────────────────────────

const ui = { input, textarea, select, combobox, slider, scrub, toggle, checkbox, color, button, item, row, section, divider, toggle_group, badge, bound, form, number };
export default ui;
export { input, textarea, select, combobox, slider, scrub, toggle, checkbox, color, button, item, row, section, divider, toggle_group, badge, bound, form, number };
