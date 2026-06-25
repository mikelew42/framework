# Item0 — In-Memory Get/Set with Dirty Tracking

The foundational Item: a plain wrapper around a `data` object with `get(key)` / `set(key, val)`, dirty tracking, a swappable saver, and optional auto-save debouncing.

## What it is

`Item0` is the simplest useful domain object: a bag of key-value data with a clean path to persistence. No async, no children, no events — just the core shape the entire progression builds on.

## API

```js
const item = new Item0({ data: { title: 'Hello', count: 0 } });

item.get('title')          // → 'Hello'
item.set('count', 1)       // → item (chainable); marks 'count' dirty
item.save()                // flush dirty patch to saver
item.auto_save(500)        // debounced save — use after set() in event handlers
item.toJSON()              // → item.data (so JSON.stringify traverses naturally)
```

## Saver inheritance

`item.saver` resolves through the parent chain:

```js
item.saver          // → this._saver ?? this.parent?.saver ?? null
item.saver = s      // → sets this._saver
```

Set the saver at the root of a tree; all children inherit it automatically.

## What Item1+ adds

- **Item1** — async `load()` and `delete()` via saver; `item.ready` promise
- **Item2** — `children` list + parent chain saver inheritance
- **Item3** — `jspath` deep addressing and delta-only writes
- **Item4** — reactive List children
- **Item5** — `on('change', ...)` reactive events
- ...

## Design decisions

- `save()` clears `_dirty` **before** the async send so any `set()` calls that arrive mid-flight go into the next write, not lost in the current one.
- `auto_save()` uses `setTimeout` (clearTimeout + rescheduled) — simple debounce. Not per-key.
- Saver duck-typing: anything with a `.save(item, patch)` method works. No base class required.
