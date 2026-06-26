import View, { el, div, style } from '/framework/core/View/View.js';
import WebTree0 from './WebTree0.js';

style(`
    .props-wrap {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }
    .props-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 13px;
        color: #9a9a94;
    }
    .props-section {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0ee;
    }
    .props-section-label {
        font-size: 11px;
        font-weight: 600;
        color: #9a9a94;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
    }
    .props-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }
    .props-row-label {
        font-size: 12px;
        color: #6b6b66;
        min-width: 36px;
        flex: none;
    }
    .props-input {
        font-family: inherit;
        font-size: 12px;
        border: 1px solid #e6e6e3;
        border-radius: 6px;
        padding: 5px 8px;
        background: #fafafa;
        color: #1b1b19;
        outline: none;
        width: 100%;
        box-sizing: border-box;
    }
    .props-input:focus {
        border-color: #5b57d6;
        background: #fff;
    }
    .props-input-color {
        width: 32px;
        height: 28px;
        border: 1px solid #e6e6e3;
        border-radius: 6px;
        padding: 2px;
        cursor: pointer;
        background: transparent;
    }
    .props-color-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .props-color-hex {
        flex: 1;
    }
    .size-btns {
        display: flex;
        gap: 4px;
    }
    .size-btn {
        font-family: inherit;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid #e6e6e3;
        border-radius: 5px;
        padding: 4px 8px;
        cursor: pointer;
        background: #fff;
        color: #6b6b66;
    }
    .size-btn.active {
        background: #5b57d6;
        color: #fff;
        border-color: #5b57d6;
    }
    .dir-btns {
        display: flex;
        gap: 4px;
    }
    .dir-btn {
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
    .dir-btn.active {
        background: #5b57d6;
        color: #fff;
        border-color: #5b57d6;
    }
    .props-select {
        font-family: inherit;
        font-size: 12px;
        border: 1px solid #e6e6e3;
        border-radius: 6px;
        padding: 5px 8px;
        background: #fafafa;
        color: #1b1b19;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
    }
    .props-select:focus {
        border-color: #5b57d6;
    }
    .props-textarea {
        font-family: inherit;
        font-size: 12px;
        border: 1px solid #e6e6e3;
        border-radius: 6px;
        padding: 6px 8px;
        background: #fafafa;
        color: #1b1b19;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
        min-height: 60px;
        line-height: 1.4;
    }
    .props-textarea:focus {
        border-color: #5b57d6;
        background: #fff;
    }
    .px-input {
        width: 52px;
        flex: none;
    }
`);

export default class Props0 extends View {
    constructor(...args) {
        super(...args);
    }

    render() {
        this.el.className = 'props-wrap';
        this._render_contents();
        // Re-render after data loads from FileSaver
        this.tree.ready.then(() => this._render_contents());
        this.tree.on('change', () => this._render_contents());
    }

    _render_contents() {
        // Suppress auto-capture to page captor during reactive re-renders
        View.set_captor(null);
        try {
            this.el.innerHTML = '';
            const sel_id = this.tree.data.selected;
            if (!sel_id) {
                const empty = div.c('props-empty', 'Select an element');
                this.el.appendChild(empty.el);
                return;
            }
            const node = WebTree0.find(this.tree.data.tree, sel_id);
            if (!node) {
                const empty = div.c('props-empty', 'Select an element');
                this.el.appendChild(empty.el);
                return;
            }
            this._render_label_section(node);
            this._render_size_section(node);
            if (node.kind === 'frame') this._render_layout_section(node);
            this._render_style_section(node);
            if (node.kind === 'text') this._render_text_section(node);
        } finally {
            View.restore_captor();
        }
    }

    _section(label_text) {
        const sec = div.c('props-section');
        const lbl = div.c('props-section-label', label_text);
        sec.append(lbl);
        this.el.appendChild(sec.el);
        return sec;
    }

    _input(value, on_change) {
        const inp = document.createElement('input');
        inp.className = 'props-input';
        inp.value = value ?? '';
        inp.addEventListener('change', e => on_change(e.target.value));
        inp.addEventListener('input', e => on_change(e.target.value));
        return inp;
    }

    _render_label_section(node) {
        const sec = this._section('Label');
        const inp = this._input(node.label, val => {
            this.tree.update(node.id, { label: val });
        });
        sec.el.appendChild(inp);
    }

    _size_row(label, dim, node) {
        const row = div.c('props-row');
        const lbl = div.c('props-row-label', label);
        const btns = div.c('size-btns');

        const modes = ['hug', 'fill', 'fixed'];
        const cur_mode = node[dim]?.mode || 'hug';

        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.className = 'size-btn' + (cur_mode === mode ? ' active' : '');
            btn.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            btn.addEventListener('click', () => {
                this.tree.set_mode(node.id, dim, mode, node[dim]?.px);
            });
            btns.el.appendChild(btn);
        });

        row.append(lbl, btns);

        if (cur_mode === 'fixed') {
            const px_inp = document.createElement('input');
            px_inp.className = 'props-input px-input';
            px_inp.type = 'number';
            px_inp.value = node[dim]?.px || 100;
            px_inp.addEventListener('change', e => {
                this.tree.set_mode(node.id, dim, 'fixed', Number(e.target.value));
            });
            row.el.appendChild(px_inp);
        }

        return row;
    }

    _render_size_section(node) {
        const sec = this._section('Size');
        sec.el.appendChild(this._size_row('W', 'w', node).el);
        sec.el.appendChild(this._size_row('H', 'h', node).el);
    }

    _render_layout_section(node) {
        const sec = this._section('Layout');

        // Direction row
        const dir_row = div.c('props-row');
        const dir_lbl = div.c('props-row-label', 'Dir');
        const dir_btns = div.c('dir-btns');
        ['row', 'col'].forEach(d => {
            const btn = document.createElement('button');
            btn.className = 'dir-btn' + (node.dir === d ? ' active' : '');
            btn.textContent = d === 'row' ? 'Row' : 'Col';
            btn.addEventListener('click', () => {
                this.tree.update(node.id, { dir: d });
            });
            dir_btns.el.appendChild(btn);
        });
        dir_row.append(dir_lbl, dir_btns);
        sec.el.appendChild(dir_row.el);

        // Gap row
        const gap_row = div.c('props-row');
        const gap_lbl = div.c('props-row-label', 'Gap');
        const gap_inp = this._input(node.gap ?? 0, val => {
            this.tree.update(node.id, { gap: Number(val) });
        });
        gap_inp.type = 'number';
        gap_inp.min = '0';
        gap_row.append(gap_lbl);
        gap_row.el.appendChild(gap_inp);
        sec.el.appendChild(gap_row.el);

        // Padding row
        const pad_row = div.c('props-row');
        const pad_lbl = div.c('props-row-label', 'Pad');
        const pad_inp = this._input(node.pad ?? 0, val => {
            this.tree.update(node.id, { pad: Number(val) });
        });
        pad_inp.type = 'number';
        pad_inp.min = '0';
        pad_row.append(pad_lbl);
        pad_row.el.appendChild(pad_inp);
        sec.el.appendChild(pad_row.el);
    }

    _render_style_section(node) {
        const sec = this._section('Style');

        // Background color
        const bg_row = div.c('props-row');
        const bg_lbl = div.c('props-row-label', 'BG');
        const bg_wrap = div.c('props-color-row');

        const color_val = (node.bg && node.bg !== 'transparent') ? node.bg : '#ffffff';
        const color_inp = document.createElement('input');
        color_inp.type = 'color';
        color_inp.className = 'props-input-color';
        color_inp.value = color_val;

        const hex_inp = this._input(color_val, val => {
            color_inp.value = val;
            this.tree.update(node.id, { bg: val });
        });
        hex_inp.classList.add('props-color-hex');

        color_inp.addEventListener('input', e => {
            hex_inp.value = e.target.value;
            this.tree.update(node.id, { bg: e.target.value });
        });

        bg_wrap.el.appendChild(color_inp);
        bg_wrap.el.appendChild(hex_inp);
        bg_row.append(bg_lbl, bg_wrap);
        sec.el.appendChild(bg_row.el);

        // Border radius
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

    _render_text_section(node) {
        const sec = this._section('Text');

        // Content textarea
        const ta = document.createElement('textarea');
        ta.className = 'props-textarea';
        ta.value = node.text || '';
        ta.placeholder = 'Text content…';
        ta.addEventListener('input', e => {
            this.tree.update(node.id, { text: e.target.value });
        });
        sec.el.appendChild(ta);

        // Font size row
        const size_row = div.c('props-row');
        const size_lbl = div.c('props-row-label', 'Size');
        const size_inp = this._input(node.size ?? 16, val => {
            this.tree.update(node.id, { size: Number(val) });
        });
        size_inp.type = 'number';
        size_inp.min = '1';
        size_row.append(size_lbl);
        size_row.el.appendChild(size_inp);
        sec.el.appendChild(size_row.el);

        // Font weight row
        const weight_row = div.c('props-row');
        const weight_lbl = div.c('props-row-label', 'Wt');
        const weight_sel = document.createElement('select');
        weight_sel.className = 'props-select';
        [400, 500, 600, 700].forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            if ((node.weight ?? 400) === w) opt.selected = true;
            weight_sel.appendChild(opt);
        });
        weight_sel.addEventListener('change', e => {
            this.tree.update(node.id, { weight: Number(e.target.value) });
        });
        weight_row.append(weight_lbl);
        weight_row.el.appendChild(weight_sel);
        sec.el.appendChild(weight_row.el);

        // Text color row
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
}
