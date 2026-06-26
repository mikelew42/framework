import app, { el, div, h1, p, style } from '/app.js';
import Keys from './Keys.js';
import ux from '/framework/ux/ux.js';
import ui from '/framework/ui/ui.js';

app.$root.ac('page');
style(`
.page { padding: 32px; }
.keys-demo { max-width: 600px; display: flex; flex-direction: column; gap: 24px; }
.keys-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.keys-table th { text-align: left; padding: 6px 12px; color: #9a9a94; font-weight: 600; font-size: 11px; text-transform: uppercase; }
.keys-table td { padding: 7px 12px; border-top: 1px solid #f4f4f3; color: #1b1b19; }
.keys-table td:first-child { font-family: monospace; color: #5b57d6; }
.keys-table tr:hover td { background: #fafafa; }
kbd {
    display: inline-block;
    padding: 2px 7px;
    background: #f4f4f3;
    border: 1px solid #e6e6e3;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    color: #1b1b19;
}
`);

h1('Keys — Keyboard Shortcuts');
p('Global shortcut manager. Binds combos, normalizes ctrl/meta, skips inputs by default.');

div.c('keys-demo', () => {

    // ── Registered shortcuts for this page ────────────────────────────────────

    div.c('', () => {
        el.c('h2', '', 'Active shortcuts on this page');
        el.c('p', '', 'Try them — a toast appears for each.').el.style.cssText = 'font-size:13px;color:#9a9a94;margin:4px 0 12px;';

        const log_and_toast = (msg) => (e) => {
            e.preventDefault();
            ux.toast(msg);
            // Rebuild debug table
            render_debug();
        };

        Keys.bind('ctrl+z',       log_and_toast('Undo (Ctrl+Z)'));
        Keys.bind('ctrl+shift+z', log_and_toast('Redo (Ctrl+Shift+Z)'));
        Keys.bind('ctrl+s',       log_and_toast('Save (Ctrl+S)'));
        Keys.bind('ctrl+d',       log_and_toast('Duplicate (Ctrl+D)'));
        Keys.bind('delete',       log_and_toast('Delete key'));
        Keys.bind('escape',       log_and_toast('Escape key'));
        Keys.bind('space',        log_and_toast('Space key'));
        Keys.bind('arrowleft',    log_and_toast('← Arrow left'));
        Keys.bind('arrowright',   log_and_toast('→ Arrow right'));

        const rows = [
            ['ctrl+z',       'Undo'],
            ['ctrl+shift+z', 'Redo'],
            ['ctrl+s',       'Save'],
            ['ctrl+d',       'Duplicate'],
            ['delete',       'Delete'],
            ['escape',       'Escape / cancel'],
            ['space',        'Spacebar'],
            ['arrowleft',    'Arrow left'],
            ['arrowright',   'Arrow right'],
        ];

        const table = el.c('table', 'keys-table');
        table.el.innerHTML = `<thead><tr><th>Combo</th><th>Action</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        rows.forEach(([combo, desc]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${combo}</td><td>${desc}</td>`;
            tbody.appendChild(tr);
        });
        table.el.appendChild(tbody);
    });

    // ── Combo format reference ─────────────────────────────────────────────────

    div.c('', () => {
        el.c('h2', '', 'Combo format');
        el.c('p', '', 'Keys are lowercased. Modifiers: ctrl · shift · alt. ctrl and meta are treated identically (works cross-platform).').el.style.cssText = 'font-size:13px;color:#6b6b66;margin:4px 0 12px;';

        const examples = [
            ['ctrl+z',       'Undo'],
            ['ctrl+shift+z', 'Redo'],
            ['escape',       'Close / cancel'],
            ['delete',       'Delete (normalizes backspace)'],
            ['arrowleft',    'Left arrow key'],
            ['f2',           'F-key'],
            ['ctrl+enter',   'Confirm in dialog'],
        ];

        const wrap = div.c('');
        wrap.el.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
        examples.forEach(([combo, desc]) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:13px;';
            row.innerHTML = `<kbd>${combo}</kbd><span style="color:#6b6b66">${desc}</span>`;
            wrap.el.appendChild(row);
        });
    });

    // ── API demo ──────────────────────────────────────────────────────────────

    div.c('', () => {
        el.c('h2', '', 'API');

        const code_lines = [
            "Keys.bind('ctrl+z', () => undo());",
            "Keys.bind('escape', close, { id: 'modal', allow_in_input: true });",
            "Keys.unbind('ctrl+z');",
            "Keys.unbind_id('modal');   // remove all bindings with that id",
            "Keys.clear();              // remove all",
            "Keys.debug();             // → { 'ctrl+z': ['(anon)'], ... }",
        ];

        const pre = el.c('pre', '');
        Object.assign(pre.el.style, {
            background: '#f4f4f3', border: '1px solid #ececea',
            borderRadius: '8px', padding: '14px 16px',
            fontSize: '12px', fontFamily: 'monospace',
            color: '#1b1b19', lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
        });
        pre.el.textContent = code_lines.join('\n');
    });

    // ── Live debug table ──────────────────────────────────────────────────────

    const debug_wrap = div.c('');
    function render_debug() {
        debug_wrap.el.innerHTML = '';
        const h = document.createElement('h2');
        h.textContent = 'Currently bound combos';
        debug_wrap.el.appendChild(h);

        const info = Keys.debug();
        const table = document.createElement('table');
        table.className = 'keys-table';
        table.innerHTML = '<thead><tr><th>Combo</th><th>Handlers</th></tr></thead>';
        const tbody = document.createElement('tbody');
        Object.entries(info).forEach(([combo, names]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${combo}</td><td>${names.join(', ')}</td>`;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        debug_wrap.el.appendChild(table);
    }
    render_debug();

});
