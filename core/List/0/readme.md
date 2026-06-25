# List0 — Ordered Collection Primitive

The foundational List: an ordered array of children with traversal, parent adoption, depth-first walk, insert/remove, and a paired View for rendering.

## What it is

`List0` is the framework's collection primitive. Where you'd reach for an array of domain objects or renderable children, use a List subclass. Lists are nestable (each child can itself be a List), traversable (each/walk), and renderable (paired `List0View`).

## API

```js
const list = new List0();

list.append(item)            // add one or more items, set item.parent = list
list.insert(item, index)     // insert at position
list.remove(item)            // remove by reference; clears item.parent
list.each(fn)                // iterate; return false to break
list.walk(fn)                // depth-first recursive iteration
list.find(fn)                // → first matching child
list.index_of(child)         // → numeric index
list.clone(depth?)           // shallow or deep clone
list.map(fn)                 // → new List with mapped children
list.dig(depth, fn)          // depth-first iteration stopping at given depth
list.deduce(fn)              // → first non-undefined value returned by fn over children
list.log()                   // console.log all children

for (const item of list) {}  // Symbol.iterator support
```

## Rendering

```js
// List0View is paired for rendering. Subclasses typically override:
list.render()                // creates a view and appends it to `list.views`
list.update()                // re-renders all views
list.changed()               // schedules update() via setTimeout(0)
```

## Key behaviors

- `append()` sets `child.parent = this` and calls `changed()` → triggers `update()` on next tick
- `remove(item)` removes from array and clears `child.parent`; `remove()` (no arg) removes `this` from parent
- `deduce(fn)` scans children, returning the first non-undefined value — useful for "find first match and return a computed result"

## What List1+ adds

- **List1** — `on('add', ...)` / `on('remove', ...)` events
- **List2** — `derive(fn)` / `filter(fn)` — snapshot derived lists
- **List3** — `sort(compareFn)` — sorted derived list
- **List4** — `transform(fn)` — mapped derived list
- **List5** — `filter_reactive()` / `derive_reactive()` — live views that re-evaluate on Item5 change events
- **List6** — `group_by()` / `group_by_reactive()` — live Map of sub-lists by group key
- **List7** — `sort_reactive()` — live sorted view that re-sorts on item mutation
- **List8** — `index_by()` — live `Map<key, item>` for O(1) lookup

## Design note

List0 comes from the old `ext/List/List.js` (still there for backwards compat). The `core/List/0/List0.js` version is the cleaner re-expression. Higher levels (List1-8) extend this one.
