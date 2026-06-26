# Keys

Global keyboard shortcut manager singleton.

## Usage

```js
import Keys from '/framework/ext/Keys/Keys.js';
// or: import { Keys } from '/app.js';

Keys.bind('ctrl+z',       () => tree.undo());
Keys.bind('ctrl+shift+z', () => tree.redo());
Keys.bind('ctrl+s',       e => { e.preventDefault(); save(); });
Keys.bind('delete',       () => delete_selected());
Keys.bind('escape',       close_modal, { id: 'modal-1' });

Keys.unbind('ctrl+z');          // remove combo
Keys.unbind_id('modal-1');      // remove all bindings with that id (for teardown)
Keys.clear();                   // remove everything

console.log(Keys.debug());      // { 'ctrl+z': ['(anon)'], ... }
```

## Combo format

`'ctrl+z'` · `'ctrl+shift+z'` · `'meta+s'` · `'delete'` · `'escape'` · `'space'` · `'arrowleft'`

- `ctrl` and `meta` are treated as the same modifier (works on Mac and Windows)
- `backspace` normalizes to `delete`
- Order of modifier keys doesn't matter: `'shift+ctrl+z'` === `'ctrl+shift+z'`

## Options

```js
Keys.bind('enter', fn, {
    id: 'my-modal',          // for unbind_id() teardown
    allow_in_input: true,    // fire even when focus is in input/textarea
});
```

By default, bindings are **suppressed** when focus is inside `input`, `textarea`, `select`, or `contenteditable`.
