import View, { el, div, style } from '/framework/core/View/View.js';
import Canvas0 from '../0/Canvas0.js';
import WebTree1 from './WebTree1.js';

style(`
    /* Fix v0 bug: make canvas-inner a flex column so fill-width root works */
    .canvas-inner {
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    /* Zoom bar */
    .we-zoom-bar {
        position: absolute;
        bottom: 16px;
        right: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.92);
        border: 1px solid #e6e6e3;
        border-radius: 8px;
        padding: 4px 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        z-index: 10;
        backdrop-filter: blur(4px);
    }
    .we-zoom-btn {
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: #6b6b66;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }
    .we-zoom-btn:hover {
        background: #f4f4f3;
    }
    .we-zoom-label {
        font-size: 12px;
        color: #6b6b66;
        min-width: 38px;
        text-align: center;
        cursor: pointer;
        border-radius: 4px;
        padding: 2px 4px;
    }
    .we-zoom-label:hover {
        background: #f4f4f3;
        color: #1b1b19;
    }
    .we-zoom-divider {
        width: 1px;
        height: 16px;
        background: #e6e6e3;
        margin: 0 2px;
    }
    .we-grid-btn {
        font-family: inherit;
        font-size: 11px;
        font-weight: 500;
        height: 24px;
        padding: 0 8px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: #9a9a94;
    }
    .we-grid-btn:hover, .we-grid-btn.active {
        background: #f4f4f3;
        color: #1b1b19;
    }
    .we-grid-btn.active {
        color: #5b57d6;
    }
    /* Grid background for canvas-inner */
    .we-canvas-inner-grid {
        background-image: radial-gradient(circle, #c4c4bc 1px, transparent 1px);
        background-size: 20px 20px;
    }

    /* Right-click context menu */
    .we-ctx-menu {
        position: fixed;
        display: none;
        background: #fff;
        border: 1px solid #e6e6e3;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.13);
        padding: 4px;
        z-index: 9999;
        min-width: 168px;
    }
    .we-ctx-item {
        padding: 7px 12px;
        font-size: 13px;
        color: #1b1b19;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;
    }
    .we-ctx-item:hover {
        background: #f4f4f3;
    }
    .we-ctx-item.danger {
        color: #d0362a;
    }
    .we-ctx-item.danger:hover {
        background: #fdf2f1;
    }
    .we-ctx-shortcut {
        float: right;
        font-size: 11px;
        color: #b0b0a8;
        margin-left: 12px;
    }
    .we-ctx-sep {
        height: 1px;
        background: #f0f0ee;
        margin: 4px 0;
    }

    /* Inline text editing */
    [data-node-id][contenteditable="true"] {
        outline: 2px solid #5b57d6 !important;
        outline-offset: 2px;
        cursor: text;
    }

    /* Image placeholder */
    .we-img-placeholder {
        background: #e8e8e5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #b0b0a8;
        font-size: 36px;
    }

    /* Button variants */
    .we-btn-primary {
        background: #5b57d6;
        color: #fff;
        border: none;
        font-family: inherit;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 18px;
    }
    .we-btn-secondary {
        background: #fff;
        color: #5b57d6;
        border: 1.5px solid #5b57d6;
        font-family: inherit;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 18px;
    }
    .we-btn-ghost {
        background: transparent;
        color: #ffffff;
        border: 1.5px solid rgba(255,255,255,0.4);
        font-family: inherit;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 18px;
    }
`);

// ----- CSS helpers -----

function size_css(dim_obj, dim) {
    if (!dim_obj) return '';
    if (dim_obj.mode === 'fixed') return `${dim}: ${dim_obj.px || 100}px;`;
    if (dim_obj.mode === 'fill') {
        if (dim === 'width') return 'flex: 1; align-self: stretch;';
        return 'align-self: stretch;';
    }
    if (dim === 'width') return 'width: max-content;';
    return 'height: auto;';
}

function node_css(node) {
    const p = [];
    p.push(size_css(node.w, 'width'));
    p.push(size_css(node.h, 'height'));
    if (node.kind === 'frame') {
        p.push(`display: flex;`);
        p.push(`flex-direction: ${node.dir === 'row' ? 'row' : 'column'};`);
        if (node.gap)             p.push(`gap: ${node.gap}px;`);
        if (node.pad)             p.push(`padding: ${node.pad}px;`);
        if (node.align_items)     p.push(`align-items: ${node.align_items};`);
        if (node.justify_content) p.push(`justify-content: ${node.justify_content};`);
        if (node.overflow)        p.push(`overflow: ${node.overflow};`);
        if (node.shadow)          p.push(`box-shadow: 0 4px 24px rgba(0,0,0,0.10);`);
        if (node.border_width)    p.push(`border: ${node.border_width}px solid ${node.border_color || '#d0d0ce'};`);
    }
    if (node.bg && node.bg !== 'transparent') p.push(`background: ${node.bg};`);
    if (node.radius) p.push(`border-radius: ${node.radius}px;`);
    return p.filter(Boolean).join(' ');
}

// Build a DOM element for a single node (and its descendants).
// on_click, on_dragstart, on_dblclick are callbacks from the Canvas.
function build_node_el(node, sel_id, on_click, on_dragstart, on_dblclick) {
    let dom;

    if (node.kind === 'text') {
        dom = document.createElement('span');
        dom.style.cssText = `font-size: ${node.size || 16}px; font-weight: ${node.weight || 400};`
            + ` color: ${node.color || '#1b1b19'}; white-space: pre-wrap;`
            + (node.font         ? ` font-family: ${node.font};`               : '')
            + (node.line_height   ? ` line-height: ${node.line_height};`        : '')
            + (node.letter_spacing ? ` letter-spacing: ${node.letter_spacing}em;` : '')
            + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`;
        dom.textContent = node.text || '';

    } else if (node.kind === 'heading') {
        const tag = ['h1', 'h2', 'h3'][Math.max(0, Math.min(2, (node.level || 1) - 1))];
        dom = document.createElement(tag);
        dom.style.cssText = `font-size: ${node.size || 32}px; font-weight: ${node.weight || 700};`
            + ` color: ${node.color || '#1b1b19'}; margin: 0; white-space: pre-wrap;`
            + (node.font         ? ` font-family: ${node.font};`               : '')
            + (node.line_height    ? ` line-height: ${node.line_height};`       : '')
            + (node.letter_spacing ? ` letter-spacing: ${node.letter_spacing}em;` : '')
            + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`;
        dom.textContent = node.text || '';

    } else if (node.kind === 'button') {
        dom = document.createElement('button');
        dom.className = `we-btn-${node.variant || 'primary'}`;
        dom.style.cssText = `border-radius: ${node.radius || 8}px;`
            + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`;
        dom.textContent = node.text || 'Button';

    } else if (node.kind === 'image') {
        if (node.src) {
            dom = document.createElement('img');
            dom.src = node.src;
            dom.alt = node.label || '';
            dom.style.cssText = `display: block; object-fit: ${node.fit || 'cover'};`
                + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`
                + (node.radius ? ` border-radius: ${node.radius}px;` : '');
        } else {
            dom = document.createElement('div');
            dom.className = 'we-img-placeholder';
            dom.style.cssText = node_css(node);
            const ico = document.createElement('span');
            ico.className = 'material-icons';
            ico.textContent = 'image';
            ico.style.fontSize = '48px';
            dom.appendChild(ico);
        }

    } else if (node.kind === 'divider') {
        dom = document.createElement('div');
        dom.style.cssText = `background: ${node.color || '#ececea'};`
            + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`;

    } else if (node.kind === 'input') {
        // Use a div that looks like an input so it doesn't steal focus on click
        dom = document.createElement('div');
        const placeholder_color = '#9a9a94';
        const text = node.placeholder || '';
        dom.textContent = text;
        dom.style.cssText = `border: 1.5px solid #d0d0ce; background: #fff;`
            + ` font-family: inherit; font-size: 14px; color: ${placeholder_color};`
            + ` padding: 8px 12px; box-sizing: border-box;`
            + ` border-radius: ${node.radius || 6}px; display: flex; align-items: center;`
            + ` ${size_css(node.w, 'width')} ${size_css(node.h, 'height')}`;

    } else {
        // frame (and any unknown future kinds)
        dom = document.createElement('div');
        dom.style.cssText = node_css(node);
        if (node.children) {
            node.children.forEach(child => {
                dom.appendChild(build_node_el(child, sel_id, on_click, on_dragstart, on_dblclick));
            });
        }
    }

    dom.setAttribute('data-node-id', node.id);
    dom.setAttribute('draggable', 'true');
    if (node.id === sel_id) dom.classList.add('selected');

    dom.addEventListener('click', e => { e.stopPropagation(); on_click(node.id); });
    dom.addEventListener('dragstart', e => { e.stopPropagation(); on_dragstart(e, node.id); });

    // inline editing for text-like nodes (not input — placeholder is edited in props)
    if (node.kind === 'text' || node.kind === 'heading' || node.kind === 'button') {
        dom.addEventListener('dblclick', e => { e.stopPropagation(); on_dblclick(node, dom); });
    }

    return dom;
}

export default class Canvas1 extends Canvas0 {

    render() {
        super.render();

        // Zoom state
        this._zoom = 1;
        this._zoom_steps = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];

        // Zoom bar overlay inside canvas-wrap
        const zbar = document.createElement('div');
        zbar.className = 'we-zoom-bar';

        this._zoom_out_btn = document.createElement('button');
        this._zoom_out_btn.className = 'we-zoom-btn';
        this._zoom_out_btn.textContent = '−';
        this._zoom_out_btn.title = 'Zoom out (Ctrl+−)';
        this._zoom_out_btn.addEventListener('click', () => this.zoom_out());

        this._zoom_label = document.createElement('span');
        this._zoom_label.className = 'we-zoom-label';
        this._zoom_label.title = 'Reset zoom (Ctrl+0)';
        this._zoom_label.textContent = '100%';
        this._zoom_label.addEventListener('click', () => this.zoom_reset());

        this._zoom_in_btn = document.createElement('button');
        this._zoom_in_btn.className = 'we-zoom-btn';
        this._zoom_in_btn.textContent = '+';
        this._zoom_in_btn.title = 'Zoom in (Ctrl+=)';
        this._zoom_in_btn.addEventListener('click', () => this.zoom_in());

        // Grid toggle
        this._grid_btn = document.createElement('button');
        this._grid_btn.className = 'we-grid-btn';
        this._grid_btn.textContent = 'Grid';
        this._grid_btn.title = 'Toggle alignment grid';
        this._grid_btn.addEventListener('click', () => {
            const on = this._inner.el.classList.toggle('we-canvas-inner-grid');
            this._grid_btn.classList.toggle('active', on);
        });

        const zdiv = document.createElement('div');
        zdiv.className = 'we-zoom-divider';

        zbar.appendChild(this._grid_btn);
        zbar.appendChild(zdiv);
        zbar.appendChild(this._zoom_out_btn);
        zbar.appendChild(this._zoom_label);
        zbar.appendChild(this._zoom_in_btn);
        this._wrap.el.appendChild(zbar);

        // Keyboard shortcuts for zoom
        document.addEventListener('keydown', e => {
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.key === '=' || e.key === '+') { e.preventDefault(); this.zoom_in(); }
            if (e.key === '-' || e.key === '_') { e.preventDefault(); this.zoom_out(); }
            if (e.key === '0') { e.preventDefault(); this.zoom_reset(); }
        });

        // Create a shared context menu element (appended to body, not the canvas)
        this._ctx_el = document.createElement('div');
        this._ctx_el.className = 'we-ctx-menu';
        document.body.appendChild(this._ctx_el);
        this._ctx_dismiss = () => this._ctx_el.style.display = 'none';

        // Event delegation: one contextmenu listener on the canvas wrap
        this._wrap.el.addEventListener('contextmenu', e => this._on_contextmenu(e));
    }

    zoom_in() {
        const idx = this._zoom_steps.findLastIndex(s => s <= this._zoom);
        const next = this._zoom_steps[idx + 1];
        if (next != null) this._apply_zoom(next);
    }

    zoom_out() {
        const idx = this._zoom_steps.findIndex(s => s >= this._zoom);
        const prev = this._zoom_steps[idx - 1];
        if (prev != null) this._apply_zoom(prev);
    }

    zoom_reset() {
        this._apply_zoom(1);
    }

    _apply_zoom(factor) {
        this._zoom = factor;
        this._inner.el.style.transform = `scale(${factor})`;
        this._inner.el.style.transformOrigin = 'top center';
        if (this._zoom_label) this._zoom_label.textContent = Math.round(factor * 100) + '%';
    }

    _on_contextmenu(e) {
        e.preventDefault();
        e.stopPropagation();
        const node_el = e.target.closest('[data-node-id]');
        if (!node_el) return;
        const id = node_el.getAttribute('data-node-id');
        this.tree.select(id);
        const is_root = id === 'root' || id === this.tree.data.tree?.id;
        this._show_ctx(e.clientX, e.clientY, id, is_root);
    }

    _show_ctx(x, y, id, is_root) {
        const ctx = this._ctx_el;
        ctx.innerHTML = '';
        const add = (label, shortcut, action, danger) => {
            const item = document.createElement('div');
            item.className = 'we-ctx-item' + (danger ? ' danger' : '');
            if (shortcut) {
                const sk = document.createElement('span');
                sk.className = 'we-ctx-shortcut';
                sk.textContent = shortcut;
                item.appendChild(sk);
            }
            item.appendChild(document.createTextNode(label));
            item.addEventListener('click', e => {
                e.stopPropagation();
                ctx.style.display = 'none';
                action();
            });
            ctx.appendChild(item);
        };
        const sep = () => {
            const s = document.createElement('div');
            s.className = 'we-ctx-sep';
            ctx.appendChild(s);
        };

        if (!is_root) {
            add('Duplicate', 'Ctrl+D', () => {
                const copy = this.tree.duplicate(id);
                if (copy) this.tree.select(copy.id);
            });
            add('Wrap in Frame', 'Ctrl+G', () => {
                const wrapper = this.tree.wrap_in_frame(id);
                if (wrapper) this.tree.select(wrapper.id);
            });
            sep();
            add('Delete', 'Del', () => {
                const parent = WebTree1.parent_of(this.tree.data.tree, id);
                this.tree.remove(id);
                if (parent) this.tree.select(parent.id);
            }, true);
        } else {
            const info = document.createElement('div');
            info.style.cssText = 'padding: 8px 12px; font-size: 12px; color: #9a9a94;';
            info.textContent = 'Root element';
            ctx.appendChild(info);
        }

        // Position: nudge left/up if near viewport edge
        ctx.style.display = 'block';
        const vw = window.innerWidth, vh = window.innerHeight;
        const mw = ctx.offsetWidth, mh = ctx.offsetHeight;
        ctx.style.left = Math.min(x, vw - mw - 8) + 'px';
        ctx.style.top  = Math.min(y, vh - mh - 8) + 'px';

        // Dismiss on next click anywhere
        setTimeout(() => document.addEventListener('click', this._ctx_dismiss, { once: true }), 0);
    }

    // Override _render_tree to use updated build_node_el with new kinds
    _render_tree() {
        if (this._editing) return; // preserve contenteditable state
        const sel = this.tree.data.selected;
        const root = this.tree.data.tree;
        this._inner.el.innerHTML = '';
        if (!root) return;
        const on_click      = id => this.tree.select(id);
        const on_dragstart  = (e, id) => {
            this._drag = { kind: 'move', id };
            e.dataTransfer.setData('web-editor-kind', 'move');
            e.dataTransfer.setData('web-editor-id', id);
            e.dataTransfer.effectAllowed = 'move';
        };
        const on_dblclick = (node, dom) => this._start_edit(node, dom);
        const dom = build_node_el(root, sel, on_click, on_dragstart, on_dblclick);
        this._inner.el.appendChild(dom);
    }

    // Inline text editor — makes the element contenteditable until blur
    _start_edit(node, dom) {
        this._editing = true;
        this.tree.select(node.id);
        dom.contentEditable = 'true';
        dom.focus();

        // select all
        const range = document.createRange();
        range.selectNodeContents(dom);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const finish = (revert) => {
            this._editing = false;
            dom.contentEditable = 'false';
            dom.removeEventListener('blur', on_blur);
            dom.removeEventListener('keydown', on_key);
            if (!revert) {
                this.tree.update(node.id, { text: dom.textContent || '' });
            } else {
                this._render_tree();
            }
        };

        const on_blur = () => finish(false);
        const on_key  = e => {
            e.stopPropagation(); // block Backspace/Delete/Ctrl+Z shortcuts while editing
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dom.blur(); }
            if (e.key === 'Escape') { dom.textContent = node.text || ''; finish(true); }
        };

        dom.addEventListener('blur', on_blur);
        dom.addEventListener('keydown', on_key);
    }

    // Override _on_drop to handle new node kinds
    _on_drop(e) {
        e.preventDefault();
        this._hide_indicator();
        const drop = this._pending_drop;
        this._pending_drop = null;
        if (!drop) return;

        const kind = e.dataTransfer.getData('web-editor-kind');
        if (!kind) return;

        if (kind === 'move') {
            const id = e.dataTransfer.getData('web-editor-id');
            if (!id) return;
            this.tree.move(id, drop.parent_id, drop.index);
            this.tree.select(id);
            this._drag = null;
            return;
        }

        let node;
        if      (kind === 'frame')   node = WebTree1.new_frame();
        else if (kind === 'text')    node = WebTree1.new_text();
        else if (kind === 'image')   node = WebTree1.new_image();
        else if (kind === 'heading') node = WebTree1.new_heading();
        else if (kind === 'button')  node = WebTree1.new_button();
        else if (kind === 'divider') node = WebTree1.new_divider();
        else if (kind === 'columns') node = WebTree1.new_columns();
        else if (kind === 'input')   node = WebTree1.new_input();

        if (node) {
            this.tree.insert(node, drop.parent_id, drop.index);
            this.tree.select(node.id);
        }
        this._drag = null;
    }
}
