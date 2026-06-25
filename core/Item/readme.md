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

`core/Item/Item.js` re-exports the current blessed level (`→ Item9`). Consumers can import the stable default or pin to a specific level:

```js
import Item from "/framework/core/Item/Item.js";           // stable default (Item9)
import Item3 from "/framework/core/Item/3/Item3.js";       // pinned version
```

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

### Item1 — Async load + saver lifecycle
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
saver.load(item)            // → Promise; populates item.data (replaces, not merges)
saver.save(item, patch)     // persist patch; Item1.save() always returns a Promise
saver.delete(item)          // → Promise; remove from storage
```

**Decisions made:**
- `load()` replaces `item.data` (not merge) — simpler and predictable.
- `save()` always returns a Promise (Item0 returned void).

---

### Item2 — Children + parent chain
`core/Item/2/Item2.js`

Adds `item.items` (children array) and `item.add(child)` / `item.remove(child)`.
Children inherit `saver` from parent automatically.

```js
const root = new Item2({ saver: new FileSaver({ path: "/data/project.json" }) });
const child = new Item2();
root.add(child);            // sets child.parent = root; child.saver === root.saver
root.save();                // saves full tree: root.data includes children via toJSON
```

**Decisions made:**
- `add()` does NOT auto-save. Caller controls when to save.
- `toJSON()` returns `{ ...this.data, items: this.items }` — JSON.stringify recurses naturally.
- `this.items` is a plain array (not List0). List integration is a future concern.

---

### Item3 — jspath, server delta, delta shape
`core/Item/3/Item3.js`

Adds path computation, server echo protection (Notion fix), and the delta shape builder.

```js
const root = new Item3({ data: { name: "project" } });
const child = new Item3();
root.add(child);

root.path;           // "project"
child.path;          // "project.0"

child.set("title", "Step one");
child.apply_server_delta({ title: "stale" }); // skipped — title is dirty
child.apply_server_delta({ note: "from server" }); // applied — not dirty

child.delta({ title: "Step one" });
// → { jspath: "project.0", patch: { title: "Step one" }, ts: 1234567890 }
```

**Decisions made:**
- `path` uses list index (not item name) — always unique, no collision with data keys.
- `saver.save()` signature unchanged from Item1/2 — patch is still `{ key: value }`.
- `delta()` is an inspector/builder only — no I/O, no state change.

---

### Item4 — Reactive children (List1)
`core/Item/4/Item4.js`

Upgrades `this.items` from a plain array to a `List1` subclass — all List0 traversal methods plus `on('add')` / `on('remove')` events.

```js
const tree = new Item4();
const node = new Item4({ data: { label: "chapter 1" } });

tree.items.on('add', (child, idx) => updateNav(child, idx));
tree.items.on('remove', (child, idx) => removeNav(idx));

tree.add(node);    // fires items 'add' event
node.remove();     // fires items 'remove' event on tree.items
```

**Decisions made:**
- `child.parent` is set to the Item4 (not the List). `Item4.List` overrides `adopt()` as a no-op so List1 doesn't stomp the parent.
- Saver inheritance still walks `child.parent.saver` — the parent is the Item4, not the List, so the chain is unbroken.
- `child.remove()` (no-arg) routes through `child.parent.remove(child)` — Item4.remove() handles the `undefined` arg case.
- `toJSON()` returns `{ ...this.data, items: this.items.children }` — plain array, not the List wrapper.

---

### Item5 — Reactive field events
`core/Item/5/Item5.js`

Adds `on/off/emit` and reactive `'change'` events. `set(key, val)` emits `('change', key, val, old)` when the value actually changes.

```js
item.on('change', (key, val, old) => updateUI(key, val));
item.set('title', 'Hello'); // → change fires
item.set('title', 'Hello'); // → no-op, no event
```

---

### Item6 — Once, save events, batch
`core/Item/6/Item6.js`

- `once(event, fn)` — auto-removes after first call
- `on('save', fn)` — fires after every `save()` completes (even no-op saves)
- `batch(fn)` — defers `'change'` events; fires net change (start→end) for each key

```js
item.batch(() => { item.set('x', 1); item.set('x', 2); });
// 'change' fires once for x with final value 2
```

---

### Item7 — Computed fields
`core/Item/7/Item7.js`

`compute(key, deps, fn)` registers a derived field. Recomputes on each `set()` that changes a dep, fires `'change'`, respects `batch()`.

```js
item.compute('total', ['price', 'qty'], (p, q) => p * q);
item.set('qty', 5); // total recomputed, 'change' fires for 'total'
```

---

### Item8 — Schema / Type Coercion
`core/Item/8/Item8.js`

`schema(def)` declares field types. `set(key, val)` auto-coerces the value before storing. Invalid coercions emit `'error'` and leave the field unchanged.

```js
item.schema({ price: Number, qty: Number, label: String, active: Boolean });
item.schema({ percent: v => Math.min(100, Math.max(0, Number(v))) }); // custom coercer

item.set('price', '9.99');   // → 9.99 (number)
item.set('active', 'true'); // → true (boolean)
item.set('price', 'oops');  // → 'error' fires, field unchanged

item.on('error', (key, val, err) => showValidation(key, err.message));
```

Composes with `compute()` (Item7) and `batch()` (Item6) — coercion runs at `set()` time and integrates naturally.

---

### Item9 — History / Undo / Redo
`core/Item/9/Item9.js`

Adds a linear undo stack with `checkpoint()` / `undo()` / `redo()`. Snapshots are deep-cloned via `JSON.parse(JSON.stringify(data))`. `_restore()` uses `batch()` to emit all changed keys atomically.

```js
item.set('text', 'Hello');
item.checkpoint();
item.set('text', 'Hello world');
item.checkpoint();

item.undo();      // text = 'Hello'
item.redo();      // text = 'Hello world'
item.can_undo     // boolean
item.can_redo     // boolean
```

`save()` calls `checkpoint()` automatically — undo() returns to the last-saved state.

---

### Savers (implemented, in ext/)

- **FileSaver** — `save(item, patch)` over WebSocket RPC. Debounces internally. `load(item)` fetches JSON from server. Node-testable via Socket stub.
- **LocalStorageSaver** — same interface, browser `localStorage`. Node-testable via localStorage stub.
- **MemorySaver** — in-memory saver for tests. Tracks `save_count` and `deleted`.
- **SQLiteSaver** — rows, not blobs. `save` maps patch keys to UPDATE columns. *(future)*

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

Fix (Item3): skip server deltas for keys that are in `this._dirty`:

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
   Or just the root item? (Probably just root; children have their own `ready`.) — Decision deferred to Item2.
2. **`save()` return value** — should it return a Promise? Decided: yes for Item1+, void for Item0.
3. **Snapshot vs delta** — for FileSaver, send full file on every save (simple) or send
   patch and reconstruct server-side? Full snapshot is fine for Phase 1.
4. **Op vocabulary** — for delta log: minimal (`set`/`delete`) or rich (`push`/`splice`)?
5. **Conflict resolution** — last-write-wins for now. Revisit when multi-device sync is needed.
6. **`Dir` role** — does `Dir` (the old class) become `DirSaver`? Or does `FileSaver` handle
   path construction and Dir goes away?
