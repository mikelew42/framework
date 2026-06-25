# List5 — Reactive Filter (Item-aware)

Extends List4 with `derive_reactive(fn, watch_keys?)` — a derived list that re-evaluates items when they emit `'change'` events (requires Item5+).

## The problem it solves

`List2.derive(fn)` (and `.filter()`) only update when items are structurally added/removed. If an item's properties change (e.g., `todo.set('done', true)`), the derived list doesn't know.

List5 fixes this by subscribing to each item's `on('change')` and re-evaluating the predicate.

## Usage

```js
const todos = new List5();
const active = todos.filter_reactive(t => !t.data.done, ['done']);

const task = new Item5({ data: { done: false } });
todos.append(task);
// active.children.length === 1

task.set('done', true);
// active.children.length === 0  ← reactive re-evaluation!

task.set('done', false);
// active.children.length === 1  ← restored!
```

## API

```js
list.derive_reactive(fn, watch_keys?)
list.filter_reactive(fn, watch_keys?)   // alias for derive_reactive
```

- `fn` — predicate function; `fn(item)` → boolean
- `watch_keys` — optional array of field names to watch. If omitted, ANY `'change'` event triggers re-evaluation. Pass `['done']` to only react when `done` changes.

## How it works

1. At creation, populates the derived list with matching items.
2. Registers `item.on('change', handler)` for each item in the source list.
3. When `'change'` fires (and the key matches `watch_keys` if provided), re-evaluates `fn(item)` and adds/removes from derived list as needed.
4. Insertion order matches the source list.
5. When items are removed from source, `item.off()` is called to prevent memory leaks.

## Notes

- Works only with items that have `on/off` (Item5+). Plain values (numbers, strings) are filtered initially but won't react to changes — this is safe (no error).
- `filter()` (from List2) is still available and doesn't watch. Use it when items are immutable or when you only care about structural changes.
- `filter_reactive()` is strictly more powerful than `filter()` — use it for Item5+ collections, use `filter()` for immutable data.
