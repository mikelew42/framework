import View, { el, div, style } from '/framework/core/View/View.js';

style(`
    .layers-wrap {
        padding: 8px 0;
    }
    .layer-item {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 28px;
        font-size: 12.5px;
        color: #1b1b19;
        cursor: pointer;
        border-radius: 6px;
        user-select: none;
        padding-right: 8px;
    }
    .layer-item:hover {
        background: #f4f4f3;
    }
    .layer-item.selected {
        background: #ededfc;
        color: #5b57d6;
    }
    .layer-toggle {
        width: 18px;
        height: 18px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        font-size: 10px;
        color: #9a9a94;
        transition: transform 0.12s;
        cursor: pointer;
    }
    .layer-toggle:hover {
        background: rgba(0,0,0,0.06);
    }
    .layer-toggle.collapsed {
        transform: rotate(-90deg);
    }
    .layer-toggle.leaf {
        visibility: hidden;
        cursor: default;
        pointer-events: none;
    }
    .layer-icon {
        font-size: 14px;
        color: #9a9a94;
        flex: none;
        line-height: 1;
    }
    .layer-item.selected .layer-icon {
        color: #5b57d6;
    }
    .layer-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`);

// Returns array of ancestor node ids from root down to (but not including) the target.
function _ancestor_ids(root, target_id) {
    if (root.id === target_id) return [];
    if (root.children) {
        for (const c of root.children) {
            const sub = _ancestor_ids(c, target_id);
            if (sub !== null) return [root.id, ...sub];
        }
    }
    return null; // not found
}

const KIND_ICON = {
    frame:   'crop_square',
    text:    'text_fields',
    image:   'image',
    heading: 'title',
    button:  'smart_button',
    divider: 'horizontal_rule',
    input:   'input',
};

export default class Layers1 extends View {
    constructor(...args) {
        super(...args);
        this._collapsed = new Set(); // node ids that the user has closed
    }

    render() {
        const wrap = div.c('layers-wrap');
        this._wrap = wrap;
        this.append(wrap);

        this.tree.ready.then(() => this._render_layers());
        this.tree.on('change', () => this._render_layers());
    }

    _render_layers() {
        View.set_captor(null);
        try {
            this._wrap.el.innerHTML = '';
            const root = this.tree.data.tree;
            if (!root) return;

            // Auto-expand all ancestors of the selected node so it's always visible
            const sel = this.tree.data.selected;
            if (sel) {
                const ancestors = _ancestor_ids(root, sel);
                if (ancestors) ancestors.forEach(id => this._collapsed.delete(id));
            }

            this._render_node(root, 0);

            // Scroll selected item into view
            const sel_el = this._wrap.el.querySelector('.layer-item.selected');
            if (sel_el) sel_el.scrollIntoView({ block: 'nearest' });
        } finally {
            View.restore_captor();
        }
    }

    _render_node(node, depth) {
        const sel_id = this.tree.data.selected;
        const is_sel = node.id === sel_id;
        const is_col = this._collapsed.has(node.id);
        const has_kids = node.children && node.children.length > 0;

        const row = document.createElement('div');
        row.className = 'layer-item' + (is_sel ? ' selected' : '');
        row.style.paddingLeft = (depth * 16 + 4) + 'px';

        // expand/collapse triangle
        const tog = document.createElement('span');
        tog.className = 'layer-toggle'
            + (has_kids ? '' : ' leaf')
            + (is_col && has_kids ? ' collapsed' : '');
        tog.textContent = '▾';
        tog.addEventListener('click', e => {
            e.stopPropagation();
            if (!has_kids) return;
            if (this._collapsed.has(node.id)) this._collapsed.delete(node.id);
            else this._collapsed.add(node.id);
            this._render_layers();
        });

        // node-kind icon using the material-icons font loaded by the app
        const ico = document.createElement('span');
        ico.className = 'layer-icon material-icons';
        ico.textContent = KIND_ICON[node.kind] || 'widgets';

        const lbl = document.createElement('span');
        lbl.className = 'layer-label';
        lbl.textContent = node.label || node.kind;

        row.appendChild(tog);
        row.appendChild(ico);
        row.appendChild(lbl);
        row.addEventListener('click', () => this.tree.select(node.id));

        this._wrap.el.appendChild(row);

        if (node.children && !is_col) {
            node.children.forEach(c => this._render_node(c, depth + 1));
        }
    }
}
