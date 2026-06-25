# List4 — Reactive Transform

Extends List3 with `transform(fn)` — a reactive mapped derived list.

## What it adds over List3

```js
const items = new List4();
const labels = items.transform(item => `Item #${item.id}`);

items.append({ id: 1 }, { id: 2 });
// labels.children = ['Item #1', 'Item #2']

items.append({ id: 3 });
// labels.children = ['Item #1', 'Item #2', 'Item #3']  ← auto-updated

items.remove(items.children[1]);
// labels.children = ['Item #1', 'Item #3']
```

## Chain with filter and sort

```js
const sorted_labels = items
    .filter(item => item.active)
    .transform(item => item.label)
    .sort((a, b) => a.localeCompare(b));
```

Each step in the chain returns a `List4`, so all operators are always available.

## API

```js
list.transform(fn)  // → new List4; each item mapped through fn, reactively maintained
```

## Notes

- Transform memoizes `source item → transformed item` via a `Map`. Removal works correctly even if `fn` returns the same primitive value for multiple items (uses object identity for memoization, not value equality).
- **Primitives:** if the source contains primitives (strings, numbers) and `fn` is identity (`n => n`), removal by value still works because `Map.get` uses `===`.
- **Mutation not reactive:** transform calls `fn` once at `add` time. If the source item's properties change later, the transformed item does NOT update. Re-add the item to trigger re-transform.
- **1:1 mapping:** every source item produces exactly one transformed item. For filtering, compose with `.filter()`.
