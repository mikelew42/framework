# List

`List` is the framework's fundamental ordered-collection primitive. Anywhere you have a group of things — test cases, children of a UI node, domain object collections, nav items — use a List rather than a raw array.

## Why List over Array

- Participates in the parent/child hierarchy (`child.parent` set on adopt)
- Has a paired `List.View` for automatic rendering — subclass `List` and assign a custom `View` to get UI for free
- `changed()` / `update()` hooks enable reactive rendering without a framework
- Traversal methods (`each`, `walk`, `find`, `deduce`, `dig`) are OO-style and chainable
- Extensible by subclassing — `Test.List`, `Nav.List`, `Sortable.List` all get the full API

## Lean Into This Class

When in doubt, use `List`. If you find yourself reaching for a plain array to hold domain objects, ask whether a `List` subclass would give you rendering or hierarchy for free. The goal is that everything in the framework that feels like a sequence is visibly built on `List`.

## Class Progression

```
core/List/
  List.js          ← stable re-export (currently → List8)
  readme.md        ← this file
  0/  List0.js     ← MVP: append/remove/each/walk/map/clone, parent chain, Symbol.iterator
  1/  List1.js     ← adds: on/off/emit, 'add' + 'remove' events on mutation
  2/  List2.js     ← adds: derive(fn) / filter(fn) — reactive derived lists
  3/  List3.js     ← adds: sort(compareFn) — sorted derived list
  4/  List4.js     ← adds: transform(fn) — mapped derived list (source→transformed memo)
  5/  List5.js     ← adds: derive_reactive(fn, keys?) / filter_reactive — re-evaluates on Item5 change events
  6/  List6.js     ← adds: group_by(fn) / group_by_reactive(fn, keys?) — partitioned derived Maps
  7/  List7.js     ← adds: sort_reactive(compareFn, keys?) — re-sorts when item's sort key changes
  8/  List8.js     ← adds: index_by(keyFn, keys?) — live Map<key, item> for O(1) lookup
```

Each level has a paired `*.test.js` (Node-runnable) and `page.js` (browser). All 9 levels (0–8) pass their inherited contracts. **`List.js` → List8** is the current stable default.

**`List0` is the stable base.** All higher levels extend without breaking lower contracts — a class that imports `List2` will never break when `List3`, `List4` etc. are added.

### Resolved questions

- `changed()` / events — List1 adds `on/off/emit` as the explicit event layer. `changed()` from List0 still exists for view updates; they're complementary, not competing.

## Extending List0

```js
import List0 from "/framework/core/List/0/List0.js";

class MyList extends List0 { ... }
MyList.View = class extends List0View { ... };
```

Assign a custom `View` class and `render()` just works.

## History

Originally lived at `ext/List/List.js`. Moved to `core/List/0/` because List is a foundational primitive, not an extension. The `ext/List/` files remain for backwards compatibility with existing importers (`ext/Draggable`, `dum/list`, etc.).

## Open Questions

- Should `List0` fire a `changed` event on a proper event bus instead of calling `update()` directly?
- `empty()` calls `set_children([])` which doesn't exist — needs fixing before being depended on.
- `group_by_reactive` (List6) returns a plain `Map`. Should there be an observable Map primitive so UIs can react to groups appearing/disappearing? A `List9` with reactive group membership would enable `for group of groups.each` + live group rows.
- `List9`: persist derived list memberships across reload? Or just re-derive from source on load?
