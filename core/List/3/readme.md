# List3 — Sorted Derived Lists

Extends List2 with `sort(compareFn)` — a reactive sorted view of the list.

## What it adds over List2

```js
const source = new List3();
const sorted = source.sort((a, b) => a - b);  // ascending numeric

source.append(3, 1, 2);
// sorted.children = [1, 2, 3]

source.append(1.5);
// sorted.children = [1, 1.5, 2, 3]  — 1.5 inserted in the right place

source.remove(2);
// sorted.children = [1, 1.5, 3]
```

## Chain with filter

```js
// Sorted evens — filter, then sort
const sorted_evens = source
    .filter(n => n % 2 === 0)   // → List3 of evens
    .sort((a, b) => a - b);      // → List3 sorted ascending
```

Since `derive()` returns `new this.constructor()` and `this` is a List3, the filtered result is a List3, so `.sort()` is available on it.

## API

```js
list.sort(compareFn)  // → new List3 sorted by compareFn
//  compareFn(a, b): negative → a before b, positive → b before a, 0 → equal
```

Standard `Array.prototype.sort` convention: `(a, b) => a - b` for ascending, `(a, b) => b - a` for descending, `(a, b) => a.localeCompare(b)` for strings.

## Notes

- Sorted list maintains order on each `'add'` — uses `findIndex` with compareFn to find insertion point (O(n)).
- Sort is stable for equal items — new items are inserted AFTER existing equal items.
- **Mutation not reactive**: if an item's properties change, the sorted list does NOT re-sort. Only add/remove events trigger re-sync. For reactive re-sort, you'd need to remove+re-add the item after mutation.
- Returns `new this.constructor()` — so subclasses of List3 can chain sort and filter.

## Future

- `sort().filter()` vs `filter().sort()` — currently both work; docs should clarify trade-offs (filter-first is cheaper when filter eliminates many items)
- Binary search for insertion (O(log n)) instead of `findIndex` (O(n))
- Re-sort trigger: `list.re_sort()` — re-evaluates current compareFn after mutations
