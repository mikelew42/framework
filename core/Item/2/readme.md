# Item2 — Children + Parent Chain

Extends Item1 with an ordered children array, add/remove operations, and nested serialization.

---

## What Item2 Adds

- **`this.items`** — plain array of child Item2 instances, initialized in constructor.
- **`add(...children)`** — appends children, sets `child.parent = this` so saver is inherited down the tree. Chainable.
- **`remove(child)`** — splices child out of `this.items`, clears `child.parent` if it points to this node.
- **`toJSON()`** — returns `{ ...this.data, items: this.items }`. `JSON.stringify` calls `.toJSON()` recursively on each child, so the whole tree serializes in one call with no extra logic.

---

## Decisions

**`this.items` is a plain array, not List0.**
List integration is planned for a future level (Item3 or a parallel variant). Plain array is the smallest addition that works and keeps Item2 easy to reason about.

**`add()` does NOT auto-save.**
The caller controls when to persist. Auto-saving on every `add()` would cause multiple writes when building a tree programmatically. Instead, call `root.save()` once after building the tree. This is consistent with `set()` also being pure in-memory unless followed by `save()`.

**`toJSON()` returns `{ ...this.data, items: this.items }` — items live alongside data fields.**
The alternative (nesting items inside `data`) would require callers to write `item.data.items` everywhere, which is awkward. Spreading `this.data` and appending `items` keeps the serialized shape flat and natural.

**Saver inheritance unchanged.**
`get saver()` is inherited from Item0/Item1: `this._saver ?? this.parent?.saver ?? null`. Setting a saver on the root propagates to all descendants automatically, with no changes needed at this level.

---

## Open Questions

1. **Reconstructing children on load** — when a root item loads from JSON, `item.data` will contain a raw `items` array of plain objects, not Item2 instances. How do children get re-instantiated? A type registry or factory pattern is needed. Deferred to a future level.

2. **`add()` and `ready`** — if a child was constructed with a saver (and thus has its own `ready` promise), does the parent need to await that before the tree is usable? Currently no — children manage their own `ready`. `root.ready` means root data is loaded, not children.

3. **`remove()` and saver** — after removal, `child.parent` is cleared, so `child.saver` falls back to `child._saver` (possibly null). Should `remove()` call `child.delete()` on the saver? Not currently — caller decides.

4. **Items field collision** — if `this.data` already has an `items` key, `toJSON()` will produce `{ ...this.data, items: this.items }` where `this.items` (the children array) silently overwrites `data.items`. Considered low-risk for now; document as a reserved key if it becomes an issue.
