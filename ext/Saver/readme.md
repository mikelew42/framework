# Saver

The Saver contract: an object with `load`, `save`, and `delete` that a class (`Item`, `List`) delegates persistence to. The class calls these methods without knowing which backend is in play.

## Contract

```js
// target is Item for item-savers, List for list-savers
load(target)           // populate target from storage → may be async
save(target, patch)    // persist; patch is the dirty delta (may be ignored)
delete(target)         // remove from storage
```

## Current Implementations

| Saver | Target | Backend |
|---|---|---|
| `MemorySaver` | Item | In-memory Map (testing) |
| `FileSaver` | Item | JSON file via WebSocket RPC |
| `LocalStorageSaver` | Item | `window.localStorage` |
| `CollectionSaver` | List | JSON array file via WebSocket RPC |

All live in `ext/` as peer modules. They are **word-named variants**, not a numbered progression — each is a distinct backend, not an incremental capability build.

## Base Class — `Saver.js`

`ext/Saver/Saver.js` defines a minimal no-op base class. Useful for:
- Makes the contract explicit in one place
- Default no-ops let subclasses implement only what they need (e.g. a read-only saver skips `save`)
- `instanceof Saver` checks if we ever need to assert "this is a saver"

Not useful for: shared logic. The implementations are too different (sync vs async, Item vs List, browser vs Node) to extract much.

## Open Questions

**CollectionSaver → ListSaver?**  
`CollectionSaver` saves a whole `List` to one JSON array file. "ListSaver" is more precise. It was named before `List` was the canonical name for ordered collections. Worth renaming — no external code should be pinned to it yet.

**Item-saver vs List-saver split**  
`CollectionSaver` has a different `save(list)` signature vs `save(item, patch)` — it takes a `List`, not an `Item`. If we add more List-level savers this split will be more pronounced. Could have `Saver` (item interface) and `ListSaver` (list interface) as separate base classes.

**Debounce as shared utility**  
`FileSaver` and `CollectionSaver` both implement the same debounce pattern (`_saving`, `_pending`, `_promise`). This could live in `Saver` as a `_debounce(fn)` helper, or as a standalone utility. Not urgent.
