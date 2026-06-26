import View, { el, div, style } from '/framework/core/View/View.js';
import icon from '/framework/ui/icon/icon.js';
import Layers1 from './Layers1.js';

style(`
    .sb1-wrap {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    /* Tab bar */
    .sb1-tabs {
        display: flex;
        border-bottom: 1px solid #ececea;
        flex: none;
    }
    .sb1-tab {
        flex: 1;
        padding: 9px 0;
        font-size: 12.5px;
        font-weight: 500;
        color: #9a9a94;
        text-align: center;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        user-select: none;
        transition: color 0.1s;
    }
    .sb1-tab:hover {
        color: #1b1b19;
    }
    .sb1-tab.active {
        color: #5b57d6;
        border-bottom-color: #5b57d6;
    }

    /* Content area */
    .sb1-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Elements tab */
    .sb1-section-label {
        font-size: 11px;
        font-weight: 600;
        color: #9a9a94;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 12px 6px;
    }
    .sb1-lib-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 12px;
        border-radius: 7px;
        cursor: grab;
        font-size: 13px;
        color: #1b1b19;
        user-select: none;
        margin: 0 4px;
    }
    .sb1-lib-item:hover {
        background: #f4f4f3;
    }
    .sb1-lib-item:active {
        cursor: grabbing;
    }
    .sb1-lib-item .icon {
        font-size: 17px;
        color: #6b6b66;
    }
    .sb1-lib-item-label {
        flex: 1;
        font-size: 12.5px;
    }
    .sb1-lib-item-hint {
        font-size: 11px;
        color: #b0b0a8;
    }
    .sb1-divider {
        height: 1px;
        background: #f0f0ee;
        margin: 6px 12px;
    }
`);

// --- library item definitions ---

const ELEMENTS = [
    {
        section: 'Layout',
        items: [
            { kind: 'frame',   icon_name: 'crop_square',      label: 'Frame',    hint: 'flex container' },
            { kind: 'columns', icon_name: 'view_column',      label: 'Columns',  hint: '2-col row' },
        ],
    },
    {
        section: 'Content',
        items: [
            { kind: 'heading', icon_name: 'title',            label: 'Heading',  hint: 'H1 / H2 / H3' },
            { kind: 'text',    icon_name: 'text_fields',      label: 'Text',     hint: 'paragraph' },
            { kind: 'image',   icon_name: 'image',            label: 'Image',    hint: 'placeholder' },
            { kind: 'divider', icon_name: 'horizontal_rule',  label: 'Divider',  hint: 'separator' },
        ],
    },
    {
        section: 'Interactive',
        items: [
            { kind: 'button',  icon_name: 'smart_button',     label: 'Button',   hint: 'primary / ghost' },
            { kind: 'input',   icon_name: 'input',            label: 'Input',    hint: 'text field' },
        ],
    },
];

function make_lib_item(def) {
    const row = div.c('sb1-lib-item');
    row.append(icon(def.icon_name));
    const lbl = el.c('span', 'sb1-lib-item-label', def.label);
    const hint = el.c('span', 'sb1-lib-item-hint', def.hint);
    row.append(lbl, hint);
    row.el.setAttribute('draggable', 'true');
    row.el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('web-editor-kind', def.kind);
        e.dataTransfer.effectAllowed = 'copy';
    });
    return row;
}

export default class Sidebar1 extends View {
    constructor(...args) {
        super(...args);
        this._active_tab = 'elements';
    }

    render() {
        const wrap = div.c('sb1-wrap');
        this.append(wrap);

        // --- tabs ---
        const tabs = div.c('sb1-tabs');
        this._tab_el = el.c('span', 'sb1-tab active', 'Elements');
        this._tab_lay = el.c('span', 'sb1-tab', 'Layers');
        this._tab_el.el.addEventListener('click', () => this._set_tab('elements'));
        this._tab_lay.el.addEventListener('click', () => this._set_tab('layers'));
        tabs.append(this._tab_el, this._tab_lay);
        wrap.append(tabs);

        // --- content area ---
        const content = div.c('sb1-content');
        this._content = content;
        wrap.append(content);

        this._render_tab();
    }

    _set_tab(name) {
        this._active_tab = name;
        this._tab_el.el.classList.toggle('active', name === 'elements');
        this._tab_lay.el.classList.toggle('active', name === 'layers');
        this._render_tab();
    }

    _render_tab() {
        this._content.el.innerHTML = '';
        View.set_captor(null);
        try {
            if (this._active_tab === 'elements') {
                this._render_elements();
            } else {
                this._render_layers();
            }
        } finally {
            View.restore_captor();
        }
    }

    _render_elements() {
        ELEMENTS.forEach((group, gi) => {
            if (gi > 0) {
                const divider = div.c('sb1-divider');
                this._content.el.appendChild(divider.el);
            }
            const sec_lbl = div.c('sb1-section-label', group.section);
            this._content.el.appendChild(sec_lbl.el);
            group.items.forEach(def => {
                const item = make_lib_item(def);
                this._content.el.appendChild(item.el);
            });
        });
    }

    _render_layers() {
        if (!this.tree) {
            const msg = div.c('sb1-section-label', 'No tree');
            this._content.el.appendChild(msg.el);
            return;
        }
        // Create (or reuse) the Layers1 view
        if (!this._layers_view) {
            this._layers_view = new Layers1({ tree: this.tree, capture: false });
        }
        this._content.el.appendChild(this._layers_view.el);
    }
}
