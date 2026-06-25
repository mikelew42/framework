# ext/File

File-persistence classes for the framework.

---

## File0 (`0/File0.js`)

Original approach. Mixes path/identity resolution, HTTP fetch, and socket
transport all into one class. The class owns its own URL construction (using
`util.url`) and drives its own `ready` promise. Still works; kept for
backwards compat. New code should use `FileSaver` instead.

## File (`File.js`)

An earlier iteration in the same spirit as File0 — path building, fetch, and
save all in one class. Also kept for backwards compat.

---

## FileSaver (`FileSaver.js`)

Clean Saver-pattern implementation. Implements the three-method interface that
`Item1+` expects:

```
saver.load(item)        // fetches JSON, sets item.data; inits to {} if file absent
saver.save(item, patch) // writes item.data as a full JSON snapshot
saver.delete(item)      // deletes the file via socket rm
```

Takes a single config object: `{ path }` (e.g. `"/data/thing.json"`).

**Phase 1 — full snapshot writes.** `save(item, patch)` receives only dirty
keys in `patch` but ignores them and writes the full `item.data` to disk.
This is intentional: simple, correct, easy to reason about. Phase 2 will
send only the dirty delta to reduce write amplification.

**Debounce.** If a write is already in flight when `save()` is called again,
the new call sets a `_pending` flag and returns the same promise. When the
in-flight write finishes, one additional write is triggered to flush any
changes that arrived during the flight. All callers beyond the first collapse
into that single queued write.

### Usage

```js
import Item1 from "/framework/core/Item/1/Item1.js";
import FileSaver from "/framework/ext/File/FileSaver.js";

const item = new Item1({ saver: new FileSaver({ path: "/data/thing.json" }) });
await item.ready;     // data loaded from file (or empty {} if file is new)
item.set("name", "Alice");
item.save();          // writes /data/thing.json
```

### Testing

FileSaver depends on `Socket` (WebSocket) so it cannot run in Node. There is
no `.test.js` for it. Browser coverage lives at
`/framework/core/Item/1/page.js`.

---

## Open Questions

- **Error handling on load**: when the file is not found, `load()` silently
  initialises `item.data` to `{}`. Should it emit an event or set a flag so
  callers can distinguish "loaded from disk" from "started fresh"?
- **Retry logic**: `_write` does not retry on socket failure. A transient
  disconnect could silently lose a save. Consider surfacing the rejection or
  retrying with backoff.
- **Patch writes (Phase 2)**: once `Item` tracks a delta shape, `FileSaver`
  can send only the dirty keys (or append to a log) instead of rewriting the
  whole file.
