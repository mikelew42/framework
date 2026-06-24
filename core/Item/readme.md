# Item — Persistent Domain Objects

Active Record for the framework. An `Item` wraps a plain data object, exposes
`get`/`set`, tracks dirty keys, and delegates writes to a swappable `Saver`.

---

## Design Principles

1. **Item stays ignorant** — it calls `this.save()`, never knows where data goes.
2. **Saver is swappable** — swap backends without touching domain code.
3. **Dirty tracking, not event soup** — `_dirty` is a map, not a log. Multiple sets on
   the same key just overwrite. Only the latest value per key travels over the wire.
4. **Clear dirty BEFORE the async send** — any `.set()` calls that arrive while the
   request is in flight must not be silently dropped.
5. **`save()` is explicit; `auto_save()` is opt-in** — `.set()` is always pure in-memory.
   Keystroke-level inputs must not auto-persist on every character.
6. **Saver inherits from parent** — `item.saver` resolves as `this._saver ?? this.parent?.saver`.
   Set one saver at the root; the whole tree picks it up.
7. **`toJSON()` returns `this.data`** — nested Items serialize naturally through
   `JSON.stringify` without custom logic at the call site.

---

## Class Progression

Each level is independently usable and testable. Higher levels extend lower ones
and never break contracts already established.

### Item0 — Pure in-memory
`core/Item/0/Item0.js`

The simplest useful thing: data wrapper with get/set, dirty tracking, and a save
hook that delegates to an injected saver.

```js
const item = new Item0({ data: { name: "Alice" } });
item.get("name");           // "Alice"
item.set("name", "Bob");    // marks "name" dirty, returns this
item.save();                // sends patch to saver, clears dirty
item.auto_save(500);        // opt-in debounce, resets on repeat calls
```

No file I/O. No socket. No `ready` promise. Fully testable with a `MemorySaver`.

**Saver contract (minimal):**
```js
saver.save(item, patch)   // patch = { key: value, ... } — only the dirty keys
```

---

### Item1 — Async load + saver lifecycle  *(planned)*
`core/Item/1/Item1.js`

Adds a `ready` promise and an async `load()` hook. The saver gains `load(item)` and
`delete(item)`. A `FileSaver` can now be plugged in.

```js
const item = new Item1({ saver: new FileSaver({ path: "/data/thing.json" }) });
await item.ready;           // saver has loaded data into item.data
item.set("x", 1);
item.save();
```

**Saver contract (full):**
```js
saver.load(item)            // → Promise; populates item.data
saver.save(item, patch)     // persist patch (or full snapshot)
saver.delete(item)          // remove from storage
```

**open questions:**
- Does `load()` always replace `item.data`, or merge? (Replace is simpler and predictable.)
- Should `save()` also accept a full snapshot option for backends that prefer it?

---

### Item2 — Children + parent chain  *(planned)*
`core/Item/2/Item2.js`

Adds `item.items` (children array) and `item.add(child)` / `item.remove(child)`.
Children inherit `saver` from parent automatically.

```js
const root = new Item2({ saver: new FileSaver({ path: "/data/project.json" }) });
const child = new Item2({ parent: root });
child.saver === root.saver; // true — inherited
root.add(child);
root.save();                // saves full tree: root.data includes children via toJSON
```

For JSON-backed trees, the whole tree serializes in one write (root owns the file).
For SQL-backed trees, children save individually to their own rows.

**open questions:**
- Does `add(child)` call `child.save()` immediately, or defer to the next `root.save()`?
- `toJSON()` for Item2: return `{ ...this.data, items: this.items }` or keep items
  inside data as a named key?

---

### Future levels *(not yet planned)*

- **Item3** — delta streaming: sends deltas instead of full snapshots. Adds `apply_delta()`.
- **Item4** — conflict resolution: `_dirty` skip for keys being actively edited locally
  (the Notion bug fix — skip server echoes for keys in `_dirty`).
- **FileSaver** — `save(item, patch)` over WebSocket RPC. Debounces internally.
  `load(item)` fetches JSON from server.
- **LocalStorageSaver** — same interface, browser `localStorage`.
- **SQLiteSaver** — rows, not blobs. `save` maps patch keys to UPDATE columns.

---

## Saver Pattern

```js
// Root item with explicit saver
const doc = new Item1({ saver: new FileSaver({ path: "/design/abc.json" }) });
await doc.ready;

// Child inherits from parent — no explicit saver needed
const child = new Item1({ parent: doc });
child.saver === doc.saver; // true

// Explicit override
const child2 = new Item1({ parent: doc, saver: new LocalStorageSaver("child2") });
```

---

## Delta Shape (Phase 2)

When we move from full-snapshot saves to delta sends:

```js
// unified shape for JSON and SQL:
{ jspath: "app.project.steps.0", patch: { title: "Step One" }, ts: 1234567890 }
```

`jspath` is computed by walking the `.parent` chain. The saver interprets:
- `FileSaver` → patch `data[key]`, rewrite file
- `SQLiteSaver` → `UPDATE table SET key = ? WHERE id = ?`
- `DOSaver` → append to delta log, flush periodically to R2 snapshot

---

## The Notion Bug (to avoid)

Server-echoed deltas can overwrite local in-progress edits:

```
user types "foo" → item.set("text", "foo") → auto_save → delta sent
server broadcasts delta back to all clients including sender
client receives echo → applies server delta → "foo" replaced with server value
```

Fix (Item4): skip server deltas for keys that are in `this._dirty`:

```js
apply_server_delta(patch) {
    for (const [key, val] of Object.entries(patch)) {
        if (key in this._dirty) continue; // user is editing this key locally
        this.data[key] = val;
    }
}
```

---

## What NOT to Put in Item

- **Views / rendering** — that's `View`'s job. Items are headless.
- **Transport** — belongs in the Saver, not in Item.
- **Schema validation** — defer until needed. Trust dev for MVP.
- **Type registries** — if a child's type needs to be deserialized, that's the parent's
  or Saver's concern, not Item's.

---

## Open Questions

1. **`ready` contract** — does `await item.ready` guarantee children are also loaded?
   Or just the root item? (Probably just root; children have their own `ready`.)
2. **`save()` return value** — should it return a Promise? (Yes for Item1+, no for Item0.)
3. **Snapshot vs delta** — for FileSaver, send full file on every save (simple) or send
   patch and reconstruct server-side? Full snapshot is fine for Phase 1.
4. **Op vocabulary** — for delta log: minimal (`set`/`delete`) or rich (`push`/`splice`)?
5. **Conflict resolution** — last-write-wins for now. Revisit when multi-device sync is needed.
6. **`Dir` role** — does `Dir` (the old class) become `DirSaver`? Or does `FileSaver` handle
   path construction and Dir goes away?
