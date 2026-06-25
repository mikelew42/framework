# Item6 — Once, Save Events, Batch

Adds three quality-of-life features to Item5: `once()`, `'save'` event, and `batch()`.

## What it adds over Item5

### `once(event, fn)`

Like `on()`, but auto-removes after first call.

```js
item.once('save', () => statusEl.textContent = 'Saved!');
// fires once, then listener is removed
```

### `'save'` event

Fires after every `save()` call completes (even if there was nothing to save).

```js
item.on('save', () => console.log('saved'));
item.set('title', 'Hello');
await item.save(); // → 'saved'
await item.save(); // → 'saved' (even though nothing dirty)
```

Use `once('save', fn)` for one-shot "show spinner → hide spinner" patterns.

### `batch(fn)`

Defers all `'change'` events until `fn()` completes. Events still fire, but only after all sets are done. No-op sets are not queued.

```js
item.on('change', (key) => console.log('changed:', key));

item.batch(() => {
    item.set('x', 1);
    item.set('y', 2);
    item.set('z', 3);
});
// console: changed: x, changed: y, changed: z (all three, in order, after batch)
```

Nested `batch()` calls are no-ops — only the outermost batch controls the defer window.

## Notes

- `'save'` fires after `super.save()` resolves — it's safe to call `await item.save()` and `on('save')` is guaranteed to have fired before the next await.
- `batch()` is synchronous. Async batching (combining with async savers) is a future concern.
- `batch()` only defers `'change'` events — `'save'` events are unaffected.
