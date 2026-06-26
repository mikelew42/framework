import View, { el, div, style } from '/framework/core/View/View.js';
import WebTree0 from './WebTree0.js';

style(`
    .canvas-wrap {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #f4f4f3;
        position: relative;
    }
    .canvas-inner {
        min-width: 100%;
        min-height: 100%;
        padding: 40px;
        box-sizing: border-box;
    }
    [data-node-id] {
        box-sizing: border-box;
        outline: 2px solid transparent;
        outline-offset: 1px;
        transition: outline-color 0.1s;
        position: relative;
    }
    [data-node-id]:hover:not(.selected) {
        outline-color: rgba(91, 87, 214, 0.3);
    }
    [data-node-id].selected {
        outline-color: #5b57d6;
    }
    .drop-indicator {
        position: absolute;
        background: #5b57d6;
        border-radius: 2px;
        pointer-events: none;
        z-index: 100;
    }
    .drop-indicator.horiz {
        left: 0; right: 0; height: 2px;
    }
    .drop-indicator.vert {
        top: 0; bottom: 0; width: 2px;
    }
`);

function size_css(dim_obj, dim) {
    if (!dim_obj) return '';
    if (dim_obj.mode === 'fixed') return `${dim}: ${dim_obj.px || 100}px;`;
    if (dim_obj.mode === 'fill') {
        if (dim === 'width') return 'flex: 1; align-self: stretch;';
        return 'align-self: stretch;';
    }
    // hug
    if (dim === 'width') return 'width: max-content;';
    return 'height: auto;';
}

function node_css(node) {
    const parts = [];
    parts.push(size_css(node.w, 'width'));
    parts.push(size_css(node.h, 'height'));

    if (node.kind === 'frame') {
        parts.push(`display: flex;`);
        parts.push(`flex-direction: ${node.dir === 'row' ? 'row' : 'column'};`);
        if (node.gap) parts.push(`gap: ${node.gap}px;`);
        if (node.pad) parts.push(`padding: ${node.pad}px;`);
    }
    if (node.bg && node.bg !== 'transparent') parts.push(`background: ${node.bg};`);
    if (node.radius) parts.push(`border-radius: ${node.radius}px;`);
    if (node.kind === 'text') {
        parts.push(`font-size: ${node.size || 16}px;`);
        parts.push(`font-weight: ${node.weight || 400};`);
        parts.push(`color: ${node.color || '#1b1b19'};`);
        parts.push(`white-space: pre-wrap;`);
    }
    return parts.filter(Boolean).join(' ');
}

function build_node_el(node, selected_id, tree, on_click, on_dragstart) {
    const tag = node.kind === 'text' ? 'span' : 'div';
    const dom = document.createElement(tag);
    dom.setAttribute('data-node-id', node.id);
    dom.setAttribute('style', node_css(node));
    dom.setAttribute('draggable', 'true');
    if (node.id === selected_id) dom.classList.add('selected');

    if (node.kind === 'text') {
        dom.textContent = node.text || '';
    } else if (node.children) {
        node.children.forEach(child => {
            dom.appendChild(build_node_el(child, selected_id, tree, on_click, on_dragstart));
        });
    }

    dom.addEventListener('click', e => {
        e.stopPropagation();
        on_click(node.id);
    });

    dom.addEventListener('dragstart', e => {
        e.stopPropagation();
        on_dragstart(e, node.id);
    });

    return dom;
}

export default class Canvas0 extends View {
    constructor(...args) {
        super(...args);
    }

    render() {
        this._indicator = null;
        this._drag = null;

        const wrap = div.c('canvas-wrap');
        this._wrap = wrap;
        this._inner = div.c('canvas-inner');
        wrap.append(this._inner);
        this.append(wrap);

        this._render_tree();

        // Re-render after data loads from FileSaver (load doesn't emit 'change')
        this.tree.ready.then(() => this._render_tree());
        this.tree.on('change', () => this._render_tree());

        // canvas is also a drop zone for the outermost frame
        wrap.el.addEventListener('dragover', e => this._on_dragover(e));
        wrap.el.addEventListener('dragleave', e => this._on_dragleave(e));
        wrap.el.addEventListener('drop', e => this._on_drop(e));
        wrap.el.addEventListener('dragend', () => {
            this._hide_indicator();
            this._drag = null;
            this._pending_drop = null;
        });
    }

    _render_tree() {
        const sel = this.tree.data.selected;
        const root = this.tree.data.tree;
        this._inner.el.innerHTML = '';
        if (!root) return;
        const on_click = id => this.tree.select(id);
        const on_dragstart = (e, id) => {
            this._drag = { kind: 'move', id };
            e.dataTransfer.setData('web-editor-kind', 'move');
            e.dataTransfer.setData('web-editor-id', id);
            e.dataTransfer.effectAllowed = 'move';
        };
        const dom = build_node_el(root, sel, this.tree, on_click, on_dragstart);
        this._inner.el.appendChild(dom);
    }

    _compute_drop(e) {
        let target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return null;
        let node_el = target.closest('[data-node-id]');
        if (!node_el) return null;

        const drag_id = this._drag?.id;
        const tree = this.tree.data.tree;

        // walk up if dropping on own descendant
        while (node_el && drag_id) {
            const nid = node_el.getAttribute('data-node-id');
            if (nid === drag_id) {
                node_el = node_el.parentElement?.closest('[data-node-id]');
            } else {
                const moving = WebTree0.find(tree, drag_id);
                if (moving) {
                    let is_desc = false;
                    WebTree0.walk(moving, n => { if (n.id === nid) is_desc = true; });
                    if (is_desc) {
                        node_el = node_el.parentElement?.closest('[data-node-id]');
                        continue;
                    }
                }
                break;
            }
        }
        if (!node_el) return null;

        const nid = node_el.getAttribute('data-node-id');
        const node = WebTree0.find(tree, nid);
        if (!node) return null;

        if (node.kind === 'frame') {
            // drop into frame: compute child index
            const child_els = [...node_el.children].filter(c => c.getAttribute?.('data-node-id'));
            const is_row = node.dir === 'row';
            let idx = child_els.length;
            for (let i = 0; i < child_els.length; i++) {
                const r = child_els[i].getBoundingClientRect();
                const mid = is_row ? r.left + r.width / 2 : r.top + r.height / 2;
                const pos = is_row ? e.clientX : e.clientY;
                if (pos < mid) { idx = i; break; }
            }
            return { parent_id: nid, index: idx, parent_el: node_el, child_els, is_row };
        } else {
            // drop adjacent to this node
            const parent_el = node_el.parentElement?.closest('[data-node-id]');
            if (!parent_el) return null;
            const pid = parent_el.getAttribute('data-node-id');
            const pnode = WebTree0.find(tree, pid);
            if (!pnode || pnode.kind !== 'frame') return null;
            const sibs = [...parent_el.children].filter(c => c.getAttribute?.('data-node-id'));
            const pos_in_sibs = sibs.indexOf(node_el);
            const r = node_el.getBoundingClientRect();
            const is_row = pnode.dir === 'row';
            const after = is_row ? (e.clientX > r.left + r.width / 2) : (e.clientY > r.top + r.height / 2);
            return { parent_id: pid, index: pos_in_sibs + (after ? 1 : 0), parent_el, child_els: sibs, is_row };
        }
    }

    _show_indicator(drop_info) {
        this._hide_indicator();
        if (!drop_info) return;
        const { parent_el, child_els, index, is_row } = drop_info;
        const ind = document.createElement('div');
        ind.className = 'drop-indicator ' + (is_row ? 'vert' : 'horiz');

        const parent_rect = parent_el.getBoundingClientRect();
        const inner_rect = this._inner.el.getBoundingClientRect();

        if (child_els.length === 0 || index === 0) {
            // before first child or empty
            if (is_row) {
                const pad = parseInt(getComputedStyle(parent_el).paddingLeft) || 0;
                ind.style.left = pad + 'px';
                ind.style.top = '4px';
                ind.style.bottom = '4px';
                ind.style.width = '2px';
            } else {
                const pad = parseInt(getComputedStyle(parent_el).paddingTop) || 0;
                ind.style.top = pad + 'px';
                ind.style.left = '4px';
                ind.style.right = '4px';
                ind.style.height = '2px';
            }
        } else if (index >= child_els.length) {
            const last = child_els[child_els.length - 1];
            const r = last.getBoundingClientRect();
            if (is_row) {
                ind.style.left = (r.right - parent_rect.left) + 'px';
                ind.style.top = '4px';
                ind.style.bottom = '4px';
                ind.style.width = '2px';
            } else {
                ind.style.top = (r.bottom - parent_rect.top) + 'px';
                ind.style.left = '4px';
                ind.style.right = '4px';
                ind.style.height = '2px';
            }
        } else {
            const before = child_els[index];
            const r = before.getBoundingClientRect();
            if (is_row) {
                ind.style.left = (r.left - parent_rect.left) + 'px';
                ind.style.top = '4px';
                ind.style.bottom = '4px';
                ind.style.width = '2px';
            } else {
                ind.style.top = (r.top - parent_rect.top) + 'px';
                ind.style.left = '4px';
                ind.style.right = '4px';
                ind.style.height = '2px';
            }
        }

        parent_el.style.position = 'relative';
        parent_el.appendChild(ind);
        this._indicator = ind;
    }

    _hide_indicator() {
        if (this._indicator) {
            this._indicator.remove();
            this._indicator = null;
        }
    }

    _on_dragover(e) {
        e.preventDefault();
        const kind = e.dataTransfer.types.includes('web-editor-kind') ? 'dnd' : null;
        if (!kind) return;
        e.dataTransfer.dropEffect = e.dataTransfer.types.includes('web-editor-id') ? 'move' : 'copy';
        const drop_info = this._compute_drop(e);
        this._pending_drop = drop_info;
        this._show_indicator(drop_info);
    }

    _on_dragleave(e) {
        if (!this._wrap.el.contains(e.relatedTarget)) {
            this._hide_indicator();
            this._pending_drop = null;
        }
    }

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
        } else if (kind === 'frame') {
            const node = WebTree0.new_frame();
            this.tree.insert(node, drop.parent_id, drop.index);
            this.tree.select(node.id);
        } else if (kind === 'text') {
            const node = WebTree0.new_text();
            this.tree.insert(node, drop.parent_id, drop.index);
            this.tree.select(node.id);
        }

        this._drag = null;
    }
}
