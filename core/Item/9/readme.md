# Item9 — History / Undo / Redo

Adds `checkpoint()`, `undo()`, and `redo()` — a linear undo stack with fire-on-restore change events.

## API

```js
item.checkpoint()     // snapshot current data → push to history, clear future
item.undo()           // restore previous snapshot, emit 'undo'
item.redo()           // move forward if undone, emit 'redo'
item.can_undo         // boolean — is there history to undo?
item.can_redo         // boolean — is there a future to redo?
item.save()           // auto-checkpoints before saving (inherited + checkpoint)
```

## Example

```js
const note = new Item9({ data: { text: '' } });
note.on('change', (key, val) => textarea.value = val);

note.set('text', 'Hello');
note.checkpoint();             // save this state
note.set('text', 'Hello world');
note.checkpoint();             // save this state

note.undo();  // text = 'Hello'
note.undo();  // text = ''
note.redo();  // text = 'Hello'
note.redo();  // text = 'Hello world'

// undo/redo fire 'change' for each restored key — UI stays in sync
```

## Interaction with save()

`save()` calls `checkpoint()` automatically. This means undo() returns to the last-saved state when `save()` is the checkpoint:

```js
item.set('x', 1);
await item.save();   // checkpoint, write to disk
item.set('x', 2);
item.undo();         // x = 1 (the saved state)
```

If you want undo points within a session (without saving), call `checkpoint()` explicitly.

## Known limitations

- **Snapshots are JSON deep-cloned** — `checkpoint()` uses `JSON.parse(JSON.stringify(data))`. All JSON-serializable values (strings, numbers, booleans, plain objects, arrays) are preserved correctly across undo/redo. Non-JSON values (functions, undefined, Date objects, class instances) will be dropped or coerced — store plain data in item.data.

- **Computed fields don't recompute on undo** — `_restore()` sets `item.data[key]` directly (bypassing `set()`) to avoid schema re-coercion on restore. This means `compute()` callbacks (Item7) are not triggered. The 'change' event IS fired for each restored key, so UI bindings update. But computed fields show stale values until the next `set()` on one of their deps. To work around: call `item.checkpoint()` with deep-cloned data, or re-trigger computes manually.

- **Redo stack cleared on new checkpoint** — any `set()` + `checkpoint()` after an undo creates a new branch, discarding the redo stack. This is standard "linear undo" behavior.

## Design decisions

- `_restore()` uses `batch()` + direct `emit('change', ...)` so the UI gets atomic updates (one batch per undo/redo, not one event per key individually).
- The 'undo' and 'redo' events fire AFTER the data is restored and change events are emitted — safe to call `item.get()` in those handlers.
- `_history` and `_future` are plain arrays of plain objects — no memory overhead from wrapping, easy to serialize for crash recovery.
