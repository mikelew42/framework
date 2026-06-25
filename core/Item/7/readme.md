# Item7 — Computed Fields

Adds `compute(key, deps, fn)` — derived fields that update reactively when their dependencies change.

## What it adds over Item6

```js
const order = new Item7({ data: { price: 10, qty: 3, discount: 2 } });

order.compute('total', ['price', 'qty', 'discount'],
    (price, qty, discount) => price * qty - discount);

order.get('total');  // 28 (set at registration time)

order.set('qty', 5);
order.get('total');  // 48 — recomputed automatically

// 'change' fires for 'total' too
order.on('change', (key, val) => console.log(key, val));
order.set('price', 20);
// → 'price' 20
// → 'total' 98  (20 * 5 - 2)
```

## API

```js
item.compute(key, deps, fn)
//   key  — name of the derived field (string)
//   deps — array of dependency field names
//   fn   — (...depValues) => derivedValue; called with current values of deps
```

- Multiple computes can share dependencies.
- Computed fields can depend on other computed fields (one-level at a time — dep order matters).
- `'change'` fires for computed fields, with the correct `old` value.

## Batch integration

`compute` respects `batch()`. When dependencies are set inside a batch, the computed field fires its `'change'` event exactly once after the batch (the net change from start → end of batch).

```js
item.batch(() => {
    item.set('a', 3);
    item.set('b', 4);
});
// 'sum' fires ONCE with final value 7, not twice for intermediate states
```

## Notes

- Computed values are stored in `item.data` — `get()`, `toJSON()`, and `save()` include them.
- Computed values participate in the `_dirty` set if a dep changes — they are saved to the server.
- `fn` is called eagerly at `compute()` registration time to set the initial value.
- No dependency on computed order yet — if `compute('c', ['b'], ...)` is registered before `compute('b', ['a'], ...)`, changing `a` will update `b` but not yet recompute `c`. Register in dependency order.

## Open Questions

- Should computed fields be excluded from `save()` (since they're derived)? Currently they're included. Depends on whether the server needs the derived value or can recompute it.
- Should chaining be automatic? (i.e., if `sum` depends on `a`, and `display` depends on `sum`, changing `a` should cascade to `display`.)
