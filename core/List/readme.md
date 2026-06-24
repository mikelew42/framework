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
  readme.md        ← this file
  0/
    List0.js       ← MVP: append/remove/each/walk/map/clone, parent chain, Symbol.iterator
    List0.View.js  ← default view: bar + scrollable children
    List.css
    page.js
  1/               ← (planned) filtered/sorted views, lazy rendering
  2/               ← (planned) persistence via Item/Saver
```

**`List0` is the stable base.** Higher levels extend it without breaking the `List0` contract.

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
- `filter()` is stubbed out — useful enough to add at List0 level?
