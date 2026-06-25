# Item5 — Reactive Fields

Adds `on/off/emit` and reactive `'change'` events to Item. When `set(key, val)` is called with a new value, `'change'` fires with `(key, val, old)`.

## What it adds over Item4

```js
const note = new Item5({ saver: new LocalStorageSaver({ key: 'note' }) });
await note.ready;

// Bind UI to specific fields
note.on('change', (key, val, old) => {
    document.getElementById(key).textContent = val;
});

note.set('title', 'Hello'); // emits: ('change', 'title', 'Hello', undefined)
note.set('title', 'World'); // emits: ('change', 'title', 'World', 'Hello')
note.set('title', 'World'); // no-op — same value, no event
```

## Event signature

```js
item.on('change', (key, val, old) => { ... })
//   key — the field name that changed
//   val — the new value
//   old — the previous value (undefined if key was new)
```

## API

```js
item.on(event, fn)      // register listener
item.off(event, fn)     // unregister
item.emit(event, ...args) // fire any event

// 'change' fires automatically when set() changes a value
```

## Notes

- `emit` / `on` / `off` are inline (same pattern as List1) — no Events class mixin needed.
- Listeners are per-instance, not shared.
- `'change'` does NOT fire for no-op sets (same value as current).
- `'change'` fires immediately and synchronously inside `set()`.
- No `'change'` event fires during `load()` (saver sets `item.data` directly, bypassing `set()`). Reactive load needs explicit listener setup after `await item.ready`.

## Future

- `item.on('save', fn)` — fires after save completes (useful for showing save status)
- `item.once(event, fn)` — fires once then removes itself
- Batched change events: defer all `'change'` emissions until end of a transaction
