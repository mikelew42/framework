# List1 — Reactive List

Extends List0 with an event system: `on/off/emit`. Fires `'add'` and `'remove'` events when children change.

## What it adds over List0

```js
list.on('add', (item, index) => ...)    // fires after append or insert
list.on('remove', (item, index) => ...) // fires after remove
list.off('add', fn)                     // unregister listener
list.emit('custom', ...args)            // emit any event
```

Events fire after the mutation, with the item and its final index in the list.

## Usage

```js
import List1 from "/framework/core/List/1/List1.js";

const items = new List1();

items.on('add', (item, idx) => {
    console.log(`Added ${item} at ${idx}`);
    // could also: renderItem(item, idx)
});

items.append('a', 'b', 'c'); // fires add 3 times: idx 0, 1, 2
items.insert('x', 1);        // fires add: idx 1
items.remove('a');            // fires remove: idx 0
```

## Notes

- All `List0` methods (`append`, `insert`, `remove`, `each`, `walk`, etc.) are inherited unchanged.
- Listeners are per-instance — not shared between instances.
- Events are synchronous and run in registration order.
- `add` event fires once per item when `append('a', 'b', 'c')` is called (3 events, not 1).
- Self-remove (`child.remove()`) fires `'remove'` on the parent, not the child.
- `List.js` stable re-export now points to List1.

## Decisions

- Events are inline (no Events class mixin) to avoid multiple inheritance.
- `_listeners` is initialized in `instantiate()` (not `initialize()`) so subclasses that override `initialize()` don't break it.

## Future

- `on('change', ...)` — fires on any mutation (add or remove), for cases where you just want "list updated"
- `once(event, fn)` — fires once then auto-removes
- Ordered event batching (defer all events until end of a `batch()` call)
