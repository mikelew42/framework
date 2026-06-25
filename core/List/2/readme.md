# List2 — Derived / Filtered Lists

Extends List1 with `derive(fn)` — creates a reactive derived list that stays in sync when the source list changes.

## What it adds over List1

```js
const source = new List2();
source.append(1, 2, 3, 4, 5);

const evens = source.filter(n => n % 2 === 0);
// evens.children = [2, 4]

source.append(6);     // evens auto-updates → [2, 4, 6]
source.remove(4);     // evens auto-updates → [2, 6]
```

## Chain derives

Since `derive()` returns a `List2`, you can chain:

```js
const bigEvens = source
    .filter(n => n % 2 === 0)   // → derived List2 of evens
    .filter(n => n > 10);        // → derived List2 of big evens

source.append(12); // propagates through both filters
```

## Reactive UI pattern

```js
const tasks = new List2();
const active = tasks.filter(t => !t.done);

active.on('add', task => renderTask(task));
active.on('remove', task => removeTask(task));

tasks.append({ label: "Write tests", done: false }); // active add event fires
```

## API

```js
list.derive(fn)   // → new List2 that mirrors list filtered by fn
list.filter(fn)   // alias for derive(fn)
```

## Notes

- Derived lists are populated once at creation, then kept in sync via List1 events.
- Insertion order is preserved: a new item inserted at source index `i` lands at the correct position in the derived list.
- Derived lists fire their own `add`/`remove` events — you can react to them normally.
- **Mutation not reactive**: if an item already in the list mutates (e.g., `task.done = true`), the derived list does NOT re-evaluate. Only structural changes (add/remove) trigger re-sync. Item-level reactivity requires a separate mechanism (e.g., Item events).
- **Don't append directly to a derived list** — it's meant to be managed by its source.

## Decisions

- `derive()` returns `new this.constructor()` so subclasses of List2 return their own type.
- `filter()` is just an alias — the more query-like name reads better in context.
- Uses `slice(0, idx).filter(fn).length` to compute insertion index — accurate because the `'add'` event fires after the item is already in `source.children`.
