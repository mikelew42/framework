# Bind — Two-Way DOM Bindings for Item Fields

Thin utility layer between Item5+ reactive fields and DOM elements. Replaces manual `addEventListener` + `item.on('change', ...)` boilerplate.

## API

```js
import { bind, bind_checked, bind_text, bind_number, bind_select } from "/framework/ext/Bind/bind.js";

// Two-way bind <input> text value ↔ item field
const unbind = bind(input_el, item, 'title');

// Two-way bind <input type=checkbox> ↔ boolean field
const unbind = bind_checked(checkbox_el, item, 'done');

// One-way bind: item field → element textContent (item changes update DOM; not editable)
const unbind = bind_text(span_el, item, 'word_count');

// Two-way bind <input type=number> (value coerced to Number on input)
const unbind = bind_number(input_el, item, 'price');

// Two-way bind <select> ↔ item field
const unbind = bind_select(select_el, item, 'priority');
```

Each function returns a **cleanup function**. Call it before switching to a different item or removing the element to prevent stale listeners.

## Pattern: switchable item binding

The main use case is an editor that switches between items (like a notes list):

```js
let unbind_title, unbind_body;

function select_note(note) {
    unbind_title?.();
    unbind_body?.();
    current_note = note;
    unbind_title = bind(title_el, note, 'title');
    unbind_body  = bind(body_el,  note, 'body');
}
```

After `select_note(note2)`:
- `title_el.value` shows note2's title immediately
- Typing in `title_el` updates note2's 'title' field
- Calling `note2.undo()` restores the old title and `title_el` reflects it (via 'change' event)
- note1's listeners are cleaned up

## Requirements

- `item` must extend Item5+ (`on`/`off`/`emit` + `'change'` events)
- `el` must be a real DOM element (not a View wrapper)
- For View wrappers, use `.el` to get the underlying DOM element: `bind(view.el, item, key)`

## Why not a class?

Bindings are ephemeral glue, not domain objects. A function returning a cleanup function is the right shape: composable, minimal, works anywhere.
