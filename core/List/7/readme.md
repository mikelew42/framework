# List7 — Reactive Sort

Extends List6 with `sort_reactive(compareFn, watch_keys?)` — a sorted derived list that re-sorts when an item's sort key changes via `set()`.

## The problem it solves

`List3.sort(compareFn)` creates a sorted derived list that stays sorted when NEW items are added, but does NOT re-sort if an existing item's sort field mutates. If a task's priority changes, the sorted list goes stale.

`sort_reactive` fixes this by watching each item's `'change'` events. When a watched key changes, the item is removed and re-inserted at the correct position.

## Usage

```js
const tasks = new List7();
const by_priority = { high: 0, normal: 1, low: 2 };
const sorted = tasks.sort_reactive(
    (a, b) => by_priority[a.data.priority] - by_priority[b.data.priority],
    ['priority']   // only re-sort when 'priority' changes
);

tasks.append(item);      // inserted at correct position immediately
item.set('priority', 'high');  // re-sorts! item moves to front
```

## API

```js
list.sort_reactive(compareFn, watch_keys?)
```

- `compareFn(a, b)` — standard compare function (same as `Array.sort`): negative = a first, positive = b first, 0 = equal
- `watch_keys` — optional array of field names to watch. If omitted, ANY `'change'` event triggers re-sort. Passing specific keys avoids unnecessary re-sorts.

## How it works

1. At creation, sorts the source items and populates the derived list.
2. Registers `item.on('change', handler)` for each item.
3. When `'change'` fires (and the key matches `watch_keys`):
   - Removes the item from the sorted list
   - Finds the correct new insertion point via `findIndex`
   - Re-inserts at the correct position
4. When items are added to source: inserted at the correct sorted position immediately.
5. When items are removed from source: cleaned up with `item.off()`.

## Notes

- Works only with items that have `on/off` (Item5+). Plain values sort at creation but don't react to mutations.
- `sort()` (from List3) is still available — use it for immutable data or when you only care about structural changes.
- Equal compareFn results (returns 0) are stable: items with the same sort key maintain their relative order.
