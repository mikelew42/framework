import View, { el, div, style } from '/framework/core/View/View.js';
import Props0 from '../0/Props0.js';
import WebTree0 from '../0/WebTree0.js';

style(`
    .props-bg-none-btn {
        font-family: inherit;
        font-size: 10px;
        font-weight: 500;
        border: 1px solid #e6e6e3;
        border-radius: 5px;
        padding: 3px 7px;
        cursor: pointer;
        background: #fff;
        color: #6b6b66;
        flex: none;
    }
    .props-bg-none-btn.active {
        background: #5b57d6;
        color: #fff;
        border-color: #5b57d6;
    }
    .props-breadcrumb {
        padding: 8px 16px 6px;
        font-size: 11px;
        color: #b0b0a8;
        border-bottom: 1px solid #f0f0ee;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
        line-height: 1.6;
    }
    .props-breadcrumb-crumb {
        cursor: pointer;
        color: #9a9a94;
    }
    .props-breadcrumb-crumb:hover {
        color: #5b57d6;
    }
    .props-breadcrumb-crumb.current {
        color: #1b1b19;
        font-weight: 600;
        cursor: default;
    }
    .props-breadcrumb-sep {
        color: #d0d0ce;
        user-select: none;
    }
    .props-toggle-row {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }
    .props-toggle-btn {
        font-family: inherit;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid #e6e6e3;
        border-radius: 5px;
        padding: 4px 10px;
        cursor: pointer;
        background: #fff;
        color: #6b6b66;
    }
    .props-toggle-btn.active {
        background: #5b57d6;
        color: #fff;
        border-color: #5b57d6;
    }
    .props-fit-row {
        display: flex;
        gap: 4px;
    }
`);

// Returns the path (array of nodes) from root down to the node with target_id.
function _get_path(root, target_id) {
    if (root.id === target_id) return [root];
    if (root.children) {
        for (const c of root.children) {
            const sub = _get_path(c, target_id);
            if (sub.length) return [root, ...sub];
        }
    }
    return [];
}

export default class Props1 extends Props0 {

    // Override to add handlers for new node kinds
    _render_contents() {
        View.set_captor(null);
        try {
            this.el.innerHTML = '';
            const sel_id = this.tree.data.selected;
            if (!sel_id) {
                this.el.appendChild(div.c('props-empty', 'Select an element').el);
                return;
            }
            const node = WebTree0.find(this.tree.data.tree, sel_id);
            if (!node) {
                this.el.appendChild(div.c('props-empty', 'Select an element').el);
                return;
            }

            this._render_breadcrumb(node);
            this._render_label_section(node);

            if (node.kind === 'divider') {
                this._render_divider_section(node);
                return;
            }

            this._render_size_section(node);

            if (node.kind === 'frame')   { this._render_layout_section(node); this._render_align_section(node); }
            if (node.kind === 'image')   { this._render_style_section(node); this._render_image_section(node); }
            if (node.kind === 'heading') { this._render_heading_section(node); this._render_font_section(node); this._render_typography_section(node); }
            if (node.kind === 'text')    { this._render_text_section(node); this._render_font_section(node); this._render_typography_section(node); }
            if (node.kind === 'button')  this._render_button_section(node);
            if (node.kind === 'input')   this._render_input_section(node);
            if (node.kind === 'frame')   { this._render_style_section_v1(node); this._render_frame_extra_section(node); }
        } finally {
            View.restore_captor();
        }
    }

    // Path breadcrumb: Page › Frame › selected node
    _render_breadcrumb(node) {
        const root = this.tree.data.tree;
        const path = _get_path(root, node.id);
        if (path.length < 2) return; // root-only, not useful

        const bar = div.c('props-breadcrumb');
        path.forEach((n, i) => {
            if (i > 0) {
                const sep = document.createElement('span');
                sep.className = 'props-breadcrumb-sep';
                sep.textContent = '›';
                bar.el.appendChild(sep);
            }
            const crumb = document.createElement('span');
            crumb.className = 'props-breadcrumb-crumb' + (n.id === node.id ? ' current' : '');
            crumb.textContent = n.label || n.kind;
            if (n.id !== node.id) {
                crumb.addEventListener('click', () => this.tree.select(n.id));
            }
            bar.el.appendChild(crumb);
        });
        this.el.appendChild(bar.el);
    }

    // Heading section: level selector + text + font properties
    _render_heading_section(node) {
        const sec = this._section('Heading');

        // level: H1 / H2 / H3
        const level_row = div.c('props-row');
        const level_lbl = div.c('props-row-label', 'Level');
        const btns = div.c('props-toggle-row');
        [1, 2, 3].forEach(n => {
            const btn = document.createElement('button');
            btn.className = 'props-toggle-btn' + ((node.level || 1) === n ? ' active' : '');
            btn.textContent = 'H' + n;
            btn.addEventListener('click', () => {
                const defaults = [
                    { size: 32, weight: 700 },
                    { size: 24, weight: 600 },
                    { size: 18, weight: 600 },
                ][n - 1];
                this.tree.update(node.id, { level: n, ...defaults });
            });
            btns.el.appendChild(btn);
        });
        level_row.append(level_lbl, btns);
        sec.el.appendChild(level_row.el);

        // Text content
        const ta = document.createElement('textarea');
        ta.className = 'props-textarea';
        ta.value = node.text || '';
        ta.placeholder = 'Heading text…';
        ta.addEventListener('input', e => this.tree.update(node.id, { text: e.target.value }));
        sec.el.appendChild(ta);

        // Font size
        const size_row = div.c('props-row');
        const size_lbl = div.c('props-row-label', 'Size');
        const size_inp = this._input(node.size ?? 32, val => {
            this.tree.update(node.id, { size: Number(val) });
        });
        size_inp.type = 'number';
        size_inp.min = '1';
        size_row.append(size_lbl);
        size_row.el.appendChild(size_inp);
        sec.el.appendChild(size_row.el);

        // Font weight
        const weight_row = div.c('props-row');
        const weight_lbl = div.c('props-row-label', 'Wt');
        const weight_sel = document.createElement('select');
        weight_sel.className = 'props-select';
        [400, 500, 600, 700].forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            if ((node.weight ?? 700) === w) opt.selected = true;
            weight_sel.appendChild(opt);
        });
        weight_sel.addEventListener('change', e => this.tree.update(node.id, { weight: Number(e.target.value) }));
        weight_row.append(weight_lbl);
        weight_row.el.appendChild(weight_sel);
        sec.el.appendChild(weight_row.el);

        // Text color
        const color_row = div.c('props-row');
        const color_lbl = div.c('props-row-label', 'Color');
        const color_wrap = div.c('props-color-row');
        const text_color = node.color || '#1b1b19';
        const tc_inp = document.createElement('input');
        tc_inp.type = 'color';
        tc_inp.className = 'props-input-color';
        tc_inp.value = text_color;
        const tc_hex = this._input(text_color, val => {
            tc_inp.value = val;
            this.tree.update(node.id, { color: val });
        });
        tc_hex.classList.add('props-color-hex');
        tc_inp.addEventListener('input', e => {
            tc_hex.value = e.target.value;
            this.tree.update(node.id, { color: e.target.value });
        });
        color_wrap.el.appendChild(tc_inp);
        color_wrap.el.appendChild(tc_hex);
        color_row.append(color_lbl, color_wrap);
        sec.el.appendChild(color_row.el);
    }

    // Image section: upload + fit toggle (radius handled by Style section above)
    _render_image_section(node) {
        const sec = this._section('Image');

        // Upload / replace
        const upload_row = div.c('props-row');
        const upload_lbl = div.c('props-row-label', 'Src');
        const btn_wrap = div.c('props-toggle-row');

        const file_inp = document.createElement('input');
        file_inp.type = 'file';
        file_inp.accept = 'image/*';
        file_inp.style.display = 'none';
        file_inp.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => this.tree.update(node.id, { src: ev.target.result });
            reader.readAsDataURL(file);
        });

        const upload_btn = document.createElement('button');
        upload_btn.className = 'props-toggle-btn';
        upload_btn.textContent = node.src ? 'Replace' : 'Upload';
        upload_btn.addEventListener('click', () => file_inp.click());

        btn_wrap.el.appendChild(file_inp);
        btn_wrap.el.appendChild(upload_btn);

        if (node.src) {
            const clear_btn = document.createElement('button');
            clear_btn.className = 'props-toggle-btn';
            clear_btn.textContent = 'Clear';
            clear_btn.addEventListener('click', () => this.tree.update(node.id, { src: null }));
            btn_wrap.el.appendChild(clear_btn);
        }

        upload_row.append(upload_lbl, btn_wrap);
        sec.el.appendChild(upload_row.el);

        // Fit: cover / contain (only meaningful when src is set)
        const fit_row = div.c('props-row');
        const fit_lbl = div.c('props-row-label', 'Fit');
        const fit_wrap = div.c('props-fit-row');
        ['cover', 'contain'].forEach(fit => {
            const btn = document.createElement('button');
            btn.className = 'size-btn' + ((node.fit || 'cover') === fit ? ' active' : '');
            btn.textContent = fit.charAt(0).toUpperCase() + fit.slice(1);
            btn.addEventListener('click', () => this.tree.update(node.id, { fit }));
            fit_wrap.el.appendChild(btn);
        });
        fit_row.append(fit_lbl, fit_wrap);
        sec.el.appendChild(fit_row.el);
    }

    // Button section: text + variant + radius
    _render_button_section(node) {
        const sec = this._section('Button');

        // Text
        const text_row = div.c('props-row');
        const text_lbl = div.c('props-row-label', 'Label');
        const text_inp = this._input(node.text ?? 'Button', val => {
            this.tree.update(node.id, { text: val });
        });
        text_row.append(text_lbl);
        text_row.el.appendChild(text_inp);
        sec.el.appendChild(text_row.el);

        // Variant: primary / secondary / ghost
        const var_row = div.c('props-row');
        const var_lbl = div.c('props-row-label', 'Style');
        const var_wrap = div.c('props-toggle-row');
        ['primary', 'secondary', 'ghost'].forEach(v => {
            const btn = document.createElement('button');
            btn.className = 'props-toggle-btn' + ((node.variant || 'primary') === v ? ' active' : '');
            btn.textContent = v.charAt(0).toUpperCase() + v.slice(1);
            btn.addEventListener('click', () => this.tree.update(node.id, { variant: v }));
            var_wrap.el.appendChild(btn);
        });
        var_row.append(var_lbl, var_wrap);
        sec.el.appendChild(var_row.el);

        // Border radius
        const rad_row = div.c('props-row');
        const rad_lbl = div.c('props-row-label', 'Rad');
        const rad_inp = this._input(node.radius ?? 8, val => {
            this.tree.update(node.id, { radius: Number(val) });
        });
        rad_inp.type = 'number';
        rad_inp.min = '0';
        rad_row.append(rad_lbl);
        rad_row.el.appendChild(rad_inp);
        sec.el.appendChild(rad_row.el);
    }

    // Divider section: color + thickness (w/h already excluded at top level)
    _render_divider_section(node) {
        const sec = this._section('Divider');

        // Color
        const color_row = div.c('props-row');
        const color_lbl = div.c('props-row-label', 'Color');
        const color_wrap = div.c('props-color-row');
        const color_val = node.color || '#ececea';
        const c_inp = document.createElement('input');
        c_inp.type = 'color';
        c_inp.className = 'props-input-color';
        c_inp.value = color_val;
        const c_hex = this._input(color_val, val => {
            c_inp.value = val;
            this.tree.update(node.id, { color: val });
        });
        c_hex.classList.add('props-color-hex');
        c_inp.addEventListener('input', e => {
            c_hex.value = e.target.value;
            this.tree.update(node.id, { color: e.target.value });
        });
        color_wrap.el.appendChild(c_inp);
        color_wrap.el.appendChild(c_hex);
        color_row.append(color_lbl, color_wrap);
        sec.el.appendChild(color_row.el);

        // Height (thickness)
        const h_row = div.c('props-row');
        const h_lbl = div.c('props-row-label', 'Size');
        const h_inp = this._input(node.h?.px ?? 1, val => {
            this.tree.update(node.id, { h: { mode: 'fixed', px: Number(val) } });
        });
        h_inp.type = 'number';
        h_inp.min = '1';
        h_row.append(h_lbl);
        h_row.el.appendChild(h_inp);
        sec.el.appendChild(h_row.el);
    }

    // Line height + letter spacing for text/heading nodes
    _render_typography_section(node) {
        const sec = this._section('Typography');

        // Line height (unitless ratio, e.g. 1.5)
        const lh_row = div.c('props-row');
        const lh_lbl = div.c('props-row-label', 'Leading');
        const lh_inp = this._input(node.line_height ?? 1.4, val => {
            this.tree.update(node.id, { line_height: parseFloat(val) || 1.4 });
        });
        lh_inp.type = 'number';
        lh_inp.min = '0.5';
        lh_inp.max = '4';
        lh_inp.step = '0.1';
        lh_row.append(lh_lbl);
        lh_row.el.appendChild(lh_inp);
        sec.el.appendChild(lh_row.el);

        // Letter spacing (em units)
        const ls_row = div.c('props-row');
        const ls_lbl = div.c('props-row-label', 'Tracking');
        const ls_inp = this._input(node.letter_spacing ?? 0, val => {
            this.tree.update(node.id, { letter_spacing: parseFloat(val) || 0 });
        });
        ls_inp.type = 'number';
        ls_inp.min = '-0.1';
        ls_inp.max = '1';
        ls_inp.step = '0.01';
        ls_row.append(ls_lbl);
        ls_row.el.appendChild(ls_inp);
        sec.el.appendChild(ls_row.el);
    }

    // Alignment section for frame nodes: align-items + justify-content
    _render_align_section(node) {
        const sec = this._section('Align');

        // align-items (cross-axis)
        const ai_row = div.c('props-row');
        const ai_lbl = div.c('props-row-label', 'Items');
        const ai_wrap = div.c('props-toggle-row');
        const ai_cur = node.align_items || 'flex-start';
        [['flex-start', 'Start'], ['center', 'Center'], ['flex-end', 'End'], ['stretch', 'Stretch']].forEach(([v, lbl]) => {
            const btn = document.createElement('button');
            btn.className = 'props-toggle-btn' + (ai_cur === v ? ' active' : '');
            btn.textContent = lbl;
            btn.addEventListener('click', () => this.tree.update(node.id, { align_items: v }));
            ai_wrap.el.appendChild(btn);
        });
        ai_row.append(ai_lbl, ai_wrap);
        sec.el.appendChild(ai_row.el);

        // justify-content (main-axis)
        const jc_row = div.c('props-row');
        const jc_lbl = div.c('props-row-label', 'Justify');
        const jc_wrap = div.c('props-toggle-row');
        const jc_cur = node.justify_content || 'flex-start';
        [['flex-start', 'Start'], ['center', 'Center'], ['flex-end', 'End'], ['space-between', '÷']].forEach(([v, lbl]) => {
            const btn = document.createElement('button');
            btn.className = 'props-toggle-btn' + (jc_cur === v ? ' active' : '');
            btn.textContent = lbl;
            btn.title = v; // tooltip for the abbreviated labels
            btn.addEventListener('click', () => this.tree.update(node.id, { justify_content: v }));
            jc_wrap.el.appendChild(btn);
        });
        jc_row.append(jc_lbl, jc_wrap);
        sec.el.appendChild(jc_row.el);
    }

    // Input section: placeholder text, input type, border radius
    _render_input_section(node) {
        const sec = this._section('Input');

        // Placeholder
        const ph_row = div.c('props-row');
        const ph_lbl = div.c('props-row-label', 'Label');
        const ph_inp = this._input(node.placeholder ?? '', val => {
            this.tree.update(node.id, { placeholder: val });
        });
        ph_row.append(ph_lbl);
        ph_row.el.appendChild(ph_inp);
        sec.el.appendChild(ph_row.el);

        // Input type: text / email / number / password
        const type_row = div.c('props-row');
        const type_lbl = div.c('props-row-label', 'Type');
        const type_sel = document.createElement('select');
        type_sel.className = 'props-select';
        ['text', 'email', 'number', 'password'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            if ((node.input_type || 'text') === t) opt.selected = true;
            type_sel.appendChild(opt);
        });
        type_sel.addEventListener('change', e => this.tree.update(node.id, { input_type: e.target.value }));
        type_row.append(type_lbl);
        type_row.el.appendChild(type_sel);
        sec.el.appendChild(type_row.el);

        // Border radius
        const rad_row = div.c('props-row');
        const rad_lbl = div.c('props-row-label', 'Rad');
        const rad_inp = this._input(node.radius ?? 6, val => {
            this.tree.update(node.id, { radius: Number(val) });
        });
        rad_inp.type = 'number';
        rad_inp.min = '0';
        rad_row.append(rad_lbl);
        rad_row.el.appendChild(rad_inp);
        sec.el.appendChild(rad_row.el);
    }

    // Font family picker for text and heading nodes
    _render_font_section(node) {
        const sec = this._section('Font');
        const row = div.c('props-row');
        const lbl = div.c('props-row-label', 'Family');
        const sel = document.createElement('select');
        sel.className = 'props-select';
        [
            { value: 'inherit',              label: 'Default' },
            { value: 'sans-serif',           label: 'Sans-serif' },
            { value: 'serif',                label: 'Serif' },
            { value: 'monospace',            label: 'Monospace' },
            { value: "'Georgia', serif",     label: 'Georgia' },
            { value: "'Arial', sans-serif",  label: 'Arial' },
        ].forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.value;
            opt.textContent = f.label;
            if ((node.font || 'inherit') === f.value) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', e => this.tree.update(node.id, { font: e.target.value }));
        row.append(lbl);
        row.el.appendChild(sel);
        sec.el.appendChild(row.el);
    }

    // Override style section to clarify transparent BG
    _render_style_section_v1(node) {
        const sec = this._section('Style');
        const is_none = !node.bg || node.bg === 'transparent';
        const color_val = is_none ? '#ffffff' : node.bg;

        // Background row: None button + color picker
        const bg_row = div.c('props-row');
        const bg_lbl = div.c('props-row-label', 'BG');
        const bg_wrap = div.c('props-color-row');

        const none_btn = document.createElement('button');
        none_btn.className = 'props-bg-none-btn' + (is_none ? ' active' : '');
        none_btn.textContent = 'None';
        none_btn.title = 'Transparent background';
        none_btn.addEventListener('click', () => this.tree.update(node.id, { bg: 'transparent' }));

        const color_inp = document.createElement('input');
        color_inp.type = 'color';
        color_inp.className = 'props-input-color';
        color_inp.value = color_val;
        if (is_none) color_inp.style.opacity = '0.35';

        const hex_inp = this._input(color_val, val => {
            if (val.startsWith('#') && val.length === 7) {
                color_inp.value = val;
                this.tree.update(node.id, { bg: val });
            }
        });
        hex_inp.classList.add('props-color-hex');
        if (is_none) hex_inp.style.opacity = '0.35';

        color_inp.addEventListener('input', e => {
            hex_inp.value = e.target.value;
            this.tree.update(node.id, { bg: e.target.value });
        });

        bg_wrap.el.appendChild(none_btn);
        bg_wrap.el.appendChild(color_inp);
        bg_wrap.el.appendChild(hex_inp);
        bg_row.append(bg_lbl, bg_wrap);
        sec.el.appendChild(bg_row.el);

        // Border radius row
        const radius_row = div.c('props-row');
        const radius_lbl = div.c('props-row-label', 'Rad');
        const radius_inp = this._input(node.radius ?? 0, val => {
            this.tree.update(node.id, { radius: Number(val) });
        });
        radius_inp.type = 'number';
        radius_inp.min = '0';
        radius_row.append(radius_lbl);
        radius_row.el.appendChild(radius_inp);
        sec.el.appendChild(radius_row.el);
    }

    // Extra frame options: shadow toggle + border
    _render_frame_extra_section(node) {
        const sec = this._section('Effects');

        // Shadow toggle
        const shadow_row = div.c('props-row');
        const shadow_lbl = div.c('props-row-label', 'Shadow');
        const shadow_wrap = div.c('props-toggle-row');
        ['On', 'Off'].forEach((label, i) => {
            const btn = document.createElement('button');
            const is_active = i === 0 ? !!node.shadow : !node.shadow;
            btn.className = 'props-toggle-btn' + (is_active ? ' active' : '');
            btn.textContent = label;
            btn.addEventListener('click', () => this.tree.update(node.id, { shadow: i === 0 }));
            shadow_wrap.el.appendChild(btn);
        });
        shadow_row.append(shadow_lbl, shadow_wrap);
        sec.el.appendChild(shadow_row.el);

        // Overflow: visible / hidden (useful with border-radius to clip children)
        const ov_row = div.c('props-row');
        const ov_lbl = div.c('props-row-label', 'Overflow');
        const ov_wrap = div.c('props-toggle-row');
        [['hidden', 'Clip'], ['visible', 'Show']].forEach(([v, lbl]) => {
            const btn = document.createElement('button');
            const is_active = (node.overflow || 'visible') === v;
            btn.className = 'props-toggle-btn' + (is_active ? ' active' : '');
            btn.textContent = lbl;
            btn.addEventListener('click', () => this.tree.update(node.id, { overflow: v }));
            ov_wrap.el.appendChild(btn);
        });
        ov_row.append(ov_lbl, ov_wrap);
        sec.el.appendChild(ov_row.el);

        // Border: width + color
        const border_row = div.c('props-row');
        const border_lbl = div.c('props-row-label', 'Border');
        const bw_inp = this._input(node.border_width ?? 0, val => {
            this.tree.update(node.id, { border_width: Number(val) });
        });
        bw_inp.type = 'number';
        bw_inp.min = '0';
        bw_inp.style.width = '52px';
        bw_inp.style.flex = 'none';

        const bc_inp = document.createElement('input');
        bc_inp.type = 'color';
        bc_inp.className = 'props-input-color';
        bc_inp.value = node.border_color || '#d0d0ce';
        bc_inp.style.marginLeft = '6px';
        bc_inp.addEventListener('input', e => this.tree.update(node.id, { border_color: e.target.value }));

        border_row.append(border_lbl);
        border_row.el.appendChild(bw_inp);
        border_row.el.appendChild(bc_inp);
        sec.el.appendChild(border_row.el);
    }
}
