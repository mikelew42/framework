import View, { el, div, style } from '/framework/core/View/View.js';
import icon from '/framework/ui/icon/icon.js';
import WebTree0 from './WebTree0.js';
import Canvas0 from './Canvas0.js';
import Sidebar0 from './Sidebar0.js';
import Props0 from './Props0.js';
import FileSaver from '/framework/ext/Saver/FileSaver/FileSaver.js';

style(`
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; }
    body {
        font-family: "Geist", system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        color: #1b1b19;
        overflow: hidden;
    }

    .we-root {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: #f4f4f3;
    }

    .lew42 .root:has(.we-root) {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }

    .lew42 .background:has(.we-root) {
        overflow: hidden;
    }

    .we-header {
        height: 53px;
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 16px;
        background: #ffffff;
        border-bottom: 1px solid #ececea;
        z-index: 10;
    }

    .we-logo {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .we-logo-icon {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: #5b57d6;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.9);
        font-size: 14px;
    }

    .we-logo-icon .icon {
        font-size: 15px;
        line-height: 1;
    }

    .we-title {
        font-weight: 600;
        font-size: 14.5px;
        letter-spacing: -0.01em;
    }

    .we-sep {
        width: 1px;
        height: 20px;
        background: #ececea;
        margin: 0 4px;
    }

    .we-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 7px;
        border: 1px solid #e6e6e3;
        background: #fff;
        cursor: pointer;
        color: #6b6b66;
        transition: background 0.1s, color 0.1s;
    }

    .we-btn:hover:not(:disabled) {
        background: #f4f4f3;
        color: #1b1b19;
    }

    .we-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .we-btn .icon {
        font-size: 18px;
        line-height: 1;
    }

    .we-spacer {
        flex: 1;
    }

    .we-save-btn {
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        padding: 6px 14px;
        border-radius: 8px;
        border: 1px solid #e6e6e3;
        background: #fff;
        cursor: pointer;
        color: #1b1b19;
        transition: background 0.1s;
    }

    .we-save-btn:hover {
        background: #f4f4f3;
    }

    .we-save-btn.saved {
        color: #5b57d6;
        border-color: #5b57d6;
    }

    .we-panels {
        flex: 1;
        display: flex;
        min-height: 0;
    }

    .we-sidebar {
        width: 268px;
        flex: none;
        background: #ffffff;
        border-right: 1px solid #ececea;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .we-canvas {
        flex: 1;
        min-width: 0;
        background: #f4f4f3;
        overflow: auto;
        position: relative;
    }

    .we-props {
        width: 288px;
        flex: none;
        background: #ffffff;
        border-left: 1px solid #ececea;
        overflow-y: auto;
        overflow-x: hidden;
    }
`);

// Makes a View without participating in the captor system
function mk(classes) {
    return new View({ capture: false }).ac(classes);
}


export default class WebEditor0 {
    constructor() {
        this.tree = new WebTree0({
            saver: new FileSaver({ path: '/framework/ext/WebEditor/0/save.json' }),
        });

        // Suppress auto-capture during build; we manage the DOM tree explicitly
        View.set_captor(null);
        this.root = mk('we-root');
        this.root.append(this._build_header(), this._build_panels());
        View.restore_captor();

        this.tree.ready.then(() => {
            this._update_undo_redo();
        });

        this.tree.on('change', () => this._update_undo_redo());
        this.tree.on('undo',   () => this._update_undo_redo());
        this.tree.on('redo',   () => this._update_undo_redo());

        // Expose for debugging / testing
        window.__we_editor = this;
    }

    _build_header() {
        const header = mk('we-header');

        const logo = mk('we-logo');
        const logo_icon = mk('we-logo-icon');
        logo_icon.append(icon('widgets'));
        const title = mk('we-title');
        title.el.textContent = 'WebEditor';
        logo.append(logo_icon, title);
        header.append(logo, mk('we-sep'));

        this._undo_btn = document.createElement('button');
        this._undo_btn.className = 'we-btn';
        this._undo_btn.title = 'Undo';
        this._undo_btn.appendChild(icon('undo').el);
        this._undo_btn.disabled = true;
        this._undo_btn.addEventListener('click', () => this.tree.undo());
        header.el.appendChild(this._undo_btn);

        this._redo_btn = document.createElement('button');
        this._redo_btn.className = 'we-btn';
        this._redo_btn.title = 'Redo';
        this._redo_btn.appendChild(icon('redo').el);
        this._redo_btn.disabled = true;
        this._redo_btn.addEventListener('click', () => this.tree.redo());
        header.el.appendChild(this._redo_btn);

        header.append(mk('we-spacer'));

        this._save_btn = document.createElement('button');
        this._save_btn.className = 'we-save-btn';
        this._save_btn.textContent = 'Save';
        this._save_btn.addEventListener('click', async () => {
            this._save_btn.disabled = true;
            await this.tree.save();
            this._save_btn.disabled = false;
            this._save_btn.textContent = 'Saved';
            this._save_btn.classList.add('saved');
            setTimeout(() => {
                this._save_btn.textContent = 'Save';
                this._save_btn.classList.remove('saved');
            }, 1500);
        });
        header.el.appendChild(this._save_btn);

        return header;
    }

    _build_panels() {
        const panels = mk('we-panels');

        const sidebar_wrap = mk('we-sidebar');
        const sidebar = new Sidebar0({ capture: false });
        sidebar_wrap.append(sidebar);

        const canvas_wrap = mk('we-canvas');
        const canvas = new Canvas0({ tree: this.tree, capture: false });
        canvas_wrap.append(canvas);

        const props_wrap = mk('we-props');
        const props = new Props0({ tree: this.tree, capture: false });
        props_wrap.append(props);

        panels.append(sidebar_wrap, canvas_wrap, props_wrap);
        return panels;
    }

    _update_undo_redo() {
        if (this._undo_btn) this._undo_btn.disabled = !this.tree.can_undo;
        if (this._redo_btn) this._redo_btn.disabled = !this.tree.can_redo;
    }
}
