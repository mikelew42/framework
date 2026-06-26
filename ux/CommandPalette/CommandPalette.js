// CommandPalette — Cmd+K style fuzzy command launcher.
//
// Usage:
//   import CommandPalette from '/framework/ux/CommandPalette/CommandPalette.js';
//
//   CommandPalette.register([
//       { label: 'Save',       icon: 'save',        hint: 'Ctrl+S', on_click: save },
//       { label: 'Open File',  icon: 'folder_open', section: 'File', on_click: open },
//       { label: 'Dark Mode',  icon: 'dark_mode',   section: 'View', on_click: toggle },
//   ]);
//
//   CommandPalette.open();     // open programmatically
//   CommandPalette.close();
//   CommandPalette.toggle();
//
// Auto-installs Ctrl+K shortcut to open/close.
//
// Commands can be added/removed dynamically:
//   const id = CommandPalette.register_one({ label: 'My command', on_click: fn });
//   CommandPalette.unregister(id);

import { style } from '../../core/View/View.js';
import Keys from '../../ext/Keys/Keys.js';

style(`
.cp-backdrop {
    position: fixed; inset: 0; z-index: 9500;
    background: rgba(0,0,0,0.35);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 15vh;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
}
.cp-backdrop.open {
    opacity: 1;
    pointer-events: auto;
}

.cp-panel {
    width: 520px;
    max-width: calc(100vw - 32px);
    background: #fff;
    border: 1px solid #e6e6e3;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    overflow: hidden;
    transform: scale(0.97) translateY(-8px);
    transition: transform 0.15s;
    display: flex;
    flex-direction: column;
    max-height: 60vh;
}
.cp-backdrop.open .cp-panel {
    transform: scale(1) translateY(0);
}

.cp-search-wrap {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid #f0f0ee;
    flex-shrink: 0;
}
.cp-search-icon { color: #9a9a94; font-size: 18px; }
.cp-search-input {
    flex: 1;
    border: none; outline: none;
    font-size: 15px; color: #1b1b19;
    background: transparent;
    caret-color: #5b57d6;
}
.cp-search-input::placeholder { color: #c0c0ba; }
.cp-search-esc {
    font-size: 11px; color: #9a9a94;
    background: #f4f4f3; border: 1px solid #e6e6e3;
    border-radius: 4px; padding: 2px 6px;
    cursor: pointer;
    flex-shrink: 0;
}

.cp-results {
    overflow-y: auto;
    flex: 1;
    padding: 6px 0;
}
.cp-results:empty::after {
    content: 'No results';
    display: block; padding: 20px; text-align: center;
    font-size: 13px; color: #9a9a94;
}

.cp-section-label {
    font-size: 10.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: #b0b0aa;
    padding: 8px 14px 4px;
}
.cp-section-label:not(:first-child) { border-top: 1px solid #f4f4f3; margin-top: 4px; }

.cp-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px;
    cursor: pointer;
    border: none; background: transparent;
    width: 100%; text-align: left;
    border-radius: 0;
    transition: background 0.07s;
}
.cp-item:hover, .cp-item.focused {
    background: #f4f4f3;
}
.cp-item.focused { background: #ededf9; }

.cp-item-icon {
    color: #9a9a94; font-size: 18px; flex-shrink: 0;
    width: 24px; min-width: 24px; text-align: center;
    overflow: hidden; white-space: nowrap; line-height: 1;
}
.cp-item-body { flex: 1; min-width: 0; }
.cp-item-label { font-size: 13.5px; color: #1b1b19; }
.cp-item-desc  { font-size: 11.5px; color: #9a9a94; margin-top: 1px; }
.cp-item-hint  {
    font-size: 11px; color: #9a9a94;
    background: #f4f4f3; border: 1px solid #e6e6e3;
    border-radius: 4px; padding: 2px 6px;
    font-family: monospace;
    flex-shrink: 0;
}

.cp-item-label em {
    color: #5b57d6; font-style: normal; font-weight: 600;
}
`);

// ── Fuzzy match (returns score + highlighted html) ────────────────────────────

function fuzzy(query, text) {
    if (!query) return { match: true, score: 0, html: text };
    const lq = query.toLowerCase();
    const lt = text.toLowerCase();
    let qi = 0, parts = [], last = 0, score = 0, bonus = 0;
    for (let i = 0; i < lt.length && qi < lq.length; i++) {
        if (lt[i] === lq[qi]) {
            if (i === last + 1 || i === 0) bonus++;  // consecutive bonus
            parts.push({ start: last, end: i, match: false });
            parts.push({ start: i, end: i + 1, match: true });
            score += 1 + bonus;
            last = i + 1;
            qi++;
        } else {
            bonus = 0;
        }
    }
    if (qi < lq.length) return { match: false };
    // Remainder
    parts.push({ start: last, end: text.length, match: false });
    const html = parts
        .filter(p => p.start < p.end)
        .map(p => p.match
            ? `<em>${text.slice(p.start, p.end)}</em>`
            : text.slice(p.start, p.end))
        .join('');
    return { match: true, score, html };
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _commands = [];  // { id, label, description, icon, hint, section, on_click }
let _next_id  = 1;
let _el       = null;
let _input    = null;
let _results  = null;
let _focused  = 0;
let _open     = false;

function _ensure_dom() {
    if (_el) return;

    _el = document.createElement('div');
    _el.className = 'cp-backdrop';
    _el.addEventListener('click', e => { if (e.target === _el) CommandPalette.close(); });

    const panel = document.createElement('div');
    panel.className = 'cp-panel';

    // Search bar
    const search_wrap = document.createElement('div');
    search_wrap.className = 'cp-search-wrap';
    const ic = document.createElement('span');
    ic.className = 'material-icons cp-search-icon';
    ic.textContent = 'search';
    _input = document.createElement('input');
    _input.className = 'cp-search-input';
    _input.placeholder = 'Search commands…';
    const esc = document.createElement('span');
    esc.className = 'cp-search-esc';
    esc.textContent = 'Esc';
    esc.addEventListener('click', () => CommandPalette.close());
    search_wrap.append(ic, _input, esc);

    _results = document.createElement('div');
    _results.className = 'cp-results';

    panel.append(search_wrap, _results);
    _el.appendChild(panel);
    document.body.appendChild(_el);

    // Input events
    _input.addEventListener('input', () => _render());
    _input.addEventListener('keydown', e => {
        const items = _results.querySelectorAll('.cp-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _focused = Math.min(_focused + 1, items.length - 1);
            _update_focus(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _focused = Math.max(_focused - 1, 0);
            _update_focus(items);
        } else if (e.key === 'Enter') {
            const item = items[_focused];
            if (item) item.click();
        } else if (e.key === 'Escape') {
            CommandPalette.close();
        }
    });
}

function _update_focus(items) {
    items.forEach((el, i) => el.classList.toggle('focused', i === _focused));
    if (items[_focused]) items[_focused].scrollIntoView({ block: 'nearest' });
}

function _render() {
    const q = _input.value.trim();
    _focused = 0;
    _results.innerHTML = '';

    // Filter + score
    let scored = _commands.map(cmd => {
        const r = fuzzy(q, cmd.label);
        return r.match ? { cmd, score: r.score, html: r.html } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score);

    if (!scored.length) {
        // empty → CSS :empty will show "No results"
        return;
    }

    // Group by section
    const sections = {};
    const no_section = [];
    scored.forEach(({ cmd, html }) => {
        if (cmd.section) {
            (sections[cmd.section] = sections[cmd.section] || []).push({ cmd, html });
        } else {
            no_section.push({ cmd, html });
        }
    });

    function add_item({ cmd, html }) {
        const btn = document.createElement('button');
        btn.className = 'cp-item';

        if (cmd.icon) {
            const ic = document.createElement('span');
            ic.className = 'material-icons cp-item-icon';
            ic.textContent = cmd.icon;
            btn.appendChild(ic);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'cp-item-icon';
            btn.appendChild(spacer);
        }

        const body = document.createElement('div');
        body.className = 'cp-item-body';
        const lbl = document.createElement('div');
        lbl.className = 'cp-item-label';
        lbl.innerHTML = html;
        body.appendChild(lbl);
        if (cmd.description) {
            const desc = document.createElement('div');
            desc.className = 'cp-item-desc';
            desc.textContent = cmd.description;
            body.appendChild(desc);
        }
        btn.appendChild(body);

        if (cmd.hint) {
            const hint = document.createElement('span');
            hint.className = 'cp-item-hint';
            hint.textContent = cmd.hint;
            btn.appendChild(hint);
        }

        btn.addEventListener('click', () => {
            CommandPalette.close();
            if (cmd.on_click) cmd.on_click();
        });
        btn.addEventListener('mouseenter', () => {
            const items = _results.querySelectorAll('.cp-item');
            items.forEach((el, i) => { if (el === btn) _focused = i; });
            _update_focus(items);
        });

        _results.appendChild(btn);
    }

    no_section.forEach(add_item);

    Object.entries(sections).forEach(([name, items]) => {
        const lbl = document.createElement('div');
        lbl.className = 'cp-section-label';
        lbl.textContent = name;
        _results.appendChild(lbl);
        items.forEach(add_item);
    });

    _update_focus(_results.querySelectorAll('.cp-item'));
}

// ── Public API ────────────────────────────────────────────────────────────────

const CommandPalette = {
    // Register an array of commands. Returns array of IDs.
    register(cmds = []) {
        return cmds.map(cmd => this.register_one(cmd));
    },

    // Register a single command. Returns its id.
    register_one(cmd) {
        const id = _next_id++;
        _commands.push({ id, ...cmd });
        return id;
    },

    unregister(id) {
        _commands = _commands.filter(c => c.id !== id);
    },

    clear() {
        _commands = [];
    },

    open() {
        _ensure_dom();
        _input.value = '';
        _render();
        _open = true;
        requestAnimationFrame(() => {
            _el.classList.add('open');
            _input.focus();
        });
    },

    close() {
        if (_el) _el.classList.remove('open');
        _open = false;
    },

    toggle() {
        return _open ? this.close() : this.open();
    },
};

// Install global Ctrl+K shortcut
Keys.bind('ctrl+k', e => { e.preventDefault(); CommandPalette.toggle(); });

export default CommandPalette;
