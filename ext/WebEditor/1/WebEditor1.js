import View, { el, div, style } from '/framework/core/View/View.js';
import icon from '/framework/ui/icon/icon.js';
import WebEditor0 from '../0/WebEditor0.js';
import WebTree1 from './WebTree1.js';
import Canvas1 from './Canvas1.js';
import Sidebar1 from './Sidebar1.js';
import Props1 from './Props1.js';
import FileSaver from '/framework/ext/Saver/FileSaver/FileSaver.js';

style(`
    .we-status {
        font-size: 12px;
        color: #9a9a94;
        white-space: nowrap;
    }
    .we-status.unsaved {
        color: #e07a2f;
    }
    .we-status.saved {
        color: #3aaa6d;
    }
`);

function mk(classes) {
    return new View({ capture: false }).ac(classes);
}

export default class WebEditor1 extends WebEditor0 {
    constructor() {
        // Skip super() call; we build everything ourselves so we can use WebTree1
        // (WebEditor0 hardcodes WebTree0 and WebEditor0 path)
        // Call Object.getPrototypeOf(WebEditor0.prototype).constructor — but that's
        // EventEmitter or similar. Instead we just build from scratch here.
        //
        // Actually we CAN call super() then replace this.tree, but super() already
        // calls _build_panels() which uses old classes. Cleanest: call super() after
        // replacing the "factory" methods — but JS doesn't allow that ordering.
        //
        // Practical solution: duplicate the constructor body from WebEditor0 here,
        // using the v1 classes. This is the accepted pattern for the class-progression
        // model: higher levels own their constructor.

        // Skip calling super's constructor; manually chain through EventEmitter etc.
        // We have to call super() to satisfy JS, so we do — then immediately rebuild.
        super();
        // super() ran _build_header() and _build_panels() using WebTree0/Canvas0/etc.
        // Tear everything down and rebuild with v1 classes.
        this.root.el.innerHTML = '';

        this.tree = new WebTree1({
            saver: new FileSaver({ path: '/framework/ext/WebEditor/1/save.json' }),
        });

        this._autosave_timer = null;
        this._status_text    = 'saved'; // 'saved' | 'unsaved'

        this.root.append(this._build_header1(), this._build_panels1());

        this.tree.ready.then(() => {
            this._update_toolbar();
        });

        this.tree.on('change', () => {
            this._update_toolbar();
            this._mark_unsaved();
            clearTimeout(this._autosave_timer);
            this._autosave_timer = setTimeout(() => this._save(), 1500);
        });
        this.tree.on('undo', () => this._update_toolbar());
        this.tree.on('redo', () => this._update_toolbar());

        // Keyboard shortcuts
        document.addEventListener('keydown', e => this._on_keydown(e));

        window.__we_editor = this;
    }

    _build_header1() {
        const header = mk('we-header');

        // Logo
        const logo = mk('we-logo');
        const logo_icon = mk('we-logo-icon');
        logo_icon.append(icon('widgets'));
        const title = mk('we-title');
        title.el.textContent = 'WebEditor';
        logo.append(logo_icon, title);
        header.append(logo, mk('we-sep'));

        // Undo / Redo
        this._undo_btn = document.createElement('button');
        this._undo_btn.className = 'we-btn';
        this._undo_btn.title = 'Undo (Ctrl+Z)';
        this._undo_btn.appendChild(icon('undo').el);
        this._undo_btn.disabled = true;
        this._undo_btn.addEventListener('click', () => { this.tree.undo(); this._update_toolbar(); });
        header.el.appendChild(this._undo_btn);

        this._redo_btn = document.createElement('button');
        this._redo_btn.className = 'we-btn';
        this._redo_btn.title = 'Redo (Ctrl+Shift+Z)';
        this._redo_btn.appendChild(icon('redo').el);
        this._redo_btn.disabled = true;
        this._redo_btn.addEventListener('click', () => { this.tree.redo(); this._update_toolbar(); });
        header.el.appendChild(this._redo_btn);

        // Duplicate
        this._dupe_btn = document.createElement('button');
        this._dupe_btn.className = 'we-btn';
        this._dupe_btn.title = 'Duplicate selected (Ctrl+D)';
        this._dupe_btn.appendChild(icon('content_copy').el);
        this._dupe_btn.disabled = true;
        this._dupe_btn.addEventListener('click', () => this._duplicate_selected());
        header.el.appendChild(this._dupe_btn);

        // Delete
        this._delete_btn = document.createElement('button');
        this._delete_btn.className = 'we-btn';
        this._delete_btn.title = 'Delete selected (Del)';
        this._delete_btn.appendChild(icon('delete').el);
        this._delete_btn.disabled = true;
        this._delete_btn.addEventListener('click', () => this._delete_selected());
        header.el.appendChild(this._delete_btn);

        header.append(mk('we-spacer'));

        // Auto-save status
        this._status_el = document.createElement('span');
        this._status_el.className = 'we-status saved';
        this._status_el.textContent = 'Saved';
        header.el.appendChild(this._status_el);

        // Manual save button
        this._save_btn = document.createElement('button');
        this._save_btn.className = 'we-save-btn';
        this._save_btn.textContent = 'Save';
        this._save_btn.addEventListener('click', () => this._save());
        header.el.appendChild(this._save_btn);

        return header;
    }

    _build_panels1() {
        const panels = mk('we-panels');

        const sidebar_wrap = mk('we-sidebar');
        const sidebar = new Sidebar1({ tree: this.tree, capture: false });
        sidebar_wrap.append(sidebar);

        const canvas_wrap = mk('we-canvas');
        const canvas = new Canvas1({ tree: this.tree, capture: false });
        canvas_wrap.append(canvas);

        const props_wrap = mk('we-props');
        const props = new Props1({ tree: this.tree, capture: false });
        props_wrap.append(props);

        panels.append(sidebar_wrap, canvas_wrap, props_wrap);
        return panels;
    }

    // Update all toolbar states: undo/redo/delete
    _update_toolbar() {
        if (this._undo_btn) this._undo_btn.disabled = !this.tree.can_undo;
        if (this._redo_btn) this._redo_btn.disabled = !this.tree.can_redo;
        const sel = this.tree.data.selected;
        const no_sel = !sel || sel === 'root';
        if (this._delete_btn) this._delete_btn.disabled = no_sel;
        if (this._dupe_btn)   this._dupe_btn.disabled   = no_sel;
    }

    // Keep v0's _update_undo_redo API working (harmless alias)
    _update_undo_redo() {
        this._update_toolbar();
    }

    _mark_unsaved() {
        if (this._status_el) {
            this._status_el.textContent = 'Unsaved changes';
            this._status_el.className = 'we-status unsaved';
        }
    }

    _mark_saved() {
        if (this._status_el) {
            this._status_el.textContent = 'Saved';
            this._status_el.className = 'we-status saved';
        }
    }

    async _save() {
        clearTimeout(this._autosave_timer);
        this._autosave_timer = null;
        if (this._save_btn) this._save_btn.disabled = true;
        await this.tree.save();
        if (this._save_btn) this._save_btn.disabled = false;
        this._mark_saved();
        this._update_toolbar();
    }

    _delete_selected() {
        const sel = this.tree.data.selected;
        if (!sel || sel === 'root') return;
        const parent = WebTree1.parent_of(this.tree.data.tree, sel);
        this.tree.remove(sel);
        if (parent) this.tree.select(parent.id);
    }

    _on_keydown(e) {
        const in_input = e.target.tagName === 'INPUT'
            || e.target.tagName === 'TEXTAREA'
            || e.target.isContentEditable;

        if (!in_input) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                this._delete_selected();
                return;
            }
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            if (e.shiftKey) {
                this.tree.redo();
            } else {
                this.tree.undo();
            }
            this._update_toolbar();
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            this.tree.redo();
            this._update_toolbar();
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            this._save();
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            this._duplicate_selected();
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
            e.preventDefault();
            this._wrap_selected();
        }

        // Arrow-key tree navigation (only when not in a text input)
        if (!in_input && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            this._navigate_tree(e.key);
        }
    }

    // Arrow-key traversal through the node tree
    // Up   → parent      Down  → first child
    // Left → prev sibling  Right → next sibling
    _navigate_tree(key) {
        const root = this.tree.data.tree;
        const sel  = this.tree.data.selected;
        if (!sel) { this.tree.select(root.id); return; }

        const node   = WebTree1.find(root, sel);
        const parent = WebTree1.parent_of(root, sel);

        if (key === 'ArrowUp') {
            if (parent) this.tree.select(parent.id);
        } else if (key === 'ArrowDown') {
            if (node && node.children && node.children.length > 0) {
                this.tree.select(node.children[0].id);
            }
        } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
            if (!parent) return;
            const sibs = parent.children;
            const idx  = sibs.findIndex(c => c.id === sel);
            if (key === 'ArrowLeft' && idx > 0) {
                this.tree.select(sibs[idx - 1].id);
            } else if (key === 'ArrowRight' && idx < sibs.length - 1) {
                this.tree.select(sibs[idx + 1].id);
            }
        }
    }

    _duplicate_selected() {
        const sel = this.tree.data.selected;
        if (!sel || sel === 'root') return;
        const copy = this.tree.duplicate(sel);
        if (copy) this.tree.select(copy.id);
    }

    _wrap_selected() {
        const sel = this.tree.data.selected;
        if (!sel || sel === 'root') return;
        const wrapper = this.tree.wrap_in_frame(sel);
        if (wrapper) this.tree.select(wrapper.id);
    }
}
