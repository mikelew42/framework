// Keys — keyboard shortcut manager singleton.
//
// Usage:
//   import Keys from '/framework/ext/Keys/Keys.js';
//
//   Keys.bind('ctrl+z',       () => tree.undo());
//   Keys.bind('ctrl+shift+z', () => tree.redo());
//   Keys.bind('delete',       e => { e.preventDefault(); tree.remove_selected(); });
//   Keys.bind('escape',       handler, { id: 'my-modal' });
//
//   Keys.unbind('ctrl+z');            // remove by combo
//   Keys.unbind_id('my-modal');       // remove all with that id
//
// A binding fires ONLY when the event target is NOT an editable field
// (input, textarea, contenteditable), unless { allow_in_input: true } is set.
//
// Combo format (case-insensitive, order doesn't matter within modifiers):
//   'ctrl+z'         'ctrl+shift+z'    'meta+s'
//   'ctrl+meta+z'    'delete'          'escape'
//   'arrowleft'      'ctrl+='          'space'

const _bindings = new Map(); // combo_key → [{fn, opts}]

function _combo_key(e) {
    const parts = [];
    if (e.ctrlKey  || e.metaKey)  parts.push('ctrl');
    if (e.shiftKey)                parts.push('shift');
    if (e.altKey)                  parts.push('alt');
    // Normalize key names
    let k = e.key.toLowerCase();
    if (k === ' ')        k = 'space';
    if (k === 'backspace') k = 'delete'; // treat same as delete
    parts.push(k);
    return parts.join('+');
}

function _parse_combo(str) {
    return str.toLowerCase()
        .split('+')
        .map(p => p.trim())
        .sort((a, b) => {
            // canonical order: ctrl, shift, alt, then the key
            const order = { ctrl: 0, meta: 0, shift: 1, alt: 2 };
            const oa = order[a] ?? 3;
            const ob = order[b] ?? 3;
            return oa - ob;
        })
        // merge ctrl+meta → ctrl
        .filter((p, i, arr) => !(p === 'meta' && arr.includes('ctrl')))
        .join('+');
}

function _is_editable(target) {
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
        || target.isContentEditable;
}

function _on_keydown(e) {
    const key = _combo_key(e);
    const list = _bindings.get(key);
    if (!list) return;
    for (const { fn, opts } of list) {
        if (_is_editable(e.target) && !opts.allow_in_input) continue;
        fn(e);
        if (opts.prevent_default !== false) {} // let fn call e.preventDefault() itself
    }
}

document.addEventListener('keydown', _on_keydown);

const Keys = {
    // Bind a keyboard shortcut.
    // opts: { id, allow_in_input }
    bind(combo, fn, opts = {}) {
        const key = _parse_combo(combo);
        if (!_bindings.has(key)) _bindings.set(key, []);
        _bindings.get(key).push({ fn, opts });
        return this;
    },

    // Remove all bindings for a combo.
    unbind(combo) {
        const key = _parse_combo(combo);
        _bindings.delete(key);
        return this;
    },

    // Remove all bindings with a given id.
    unbind_id(id) {
        for (const [key, list] of _bindings) {
            const filtered = list.filter(b => b.opts.id !== id);
            if (filtered.length === 0) _bindings.delete(key);
            else _bindings.set(key, filtered);
        }
        return this;
    },

    // Remove all bindings (call on teardown / modal close).
    clear() {
        _bindings.clear();
        return this;
    },

    // List all active bindings (for debug).
    debug() {
        const out = {};
        for (const [k, v] of _bindings) out[k] = v.map(b => b.opts.id ?? '(anon)');
        return out;
    },
};

export default Keys;
