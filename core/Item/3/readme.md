# Item3 — Delta Streaming + Server Echo Protection

Extends Item2. Adds jspath computation, the Notion bug fix, and a delta builder.

---

## What Item3 Adds

### `get path()` — jspath computation

Walks the `parent` chain to compute a dot-separated address from the root. Used as the `jspath` field in delta objects so savers and logs know which item changed.

- Root items with no parent return `this.get('name') ?? 'root'`.
- Children use `parent.path + '.' + index` where index is `parent.items.indexOf(this)`.

**Decision: index, not name.** Using the array index keeps paths always unique and always computable without depending on `data.name` being set. The tradeoff is that paths are positional — if an item moves, its path changes. That's acceptable for now; conflict resolution is a later concern.

### `apply_server_delta(patch)` — the Notion fix

When the server broadcasts a delta back to all clients, the originating client must not let the echo overwrite keys the user is actively editing. This method applies a server-sent patch while skipping any key that is currently in `this._dirty`.

```
user types → item.set('text', 'foo') → auto_save → delta sent to server
server echoes delta back to all clients including sender
client calls apply_server_delta({ text: 'foo' })
→ 'text' is in _dirty → skip → local value preserved
```

Without this fix, the echo arrives after the next keystroke has already moved the local value forward, and the round-trip clobbers it.

### `delta(patch)` — delta shape builder

Returns the canonical delta object:

```js
{ jspath: "root.0.1", patch: { title: "Step One" }, ts: 1234567890 }
```

Pass an explicit `patch` or omit it to snapshot the current `_dirty`. This is an inspector/builder — it does not send anything or change state.

---

## Saver Interface: Unchanged

`saver.save(item, patch)` still receives `patch` as `{ key: value }` — same as Item0/1/2. The delta shape is exposed via `delta()` for callers who want to log or send it. Full delta-format saving (where the saver receives the `{ jspath, patch, ts }` object) is deferred to a future level or a new Saver variant.

---

## Open Questions

- **Name vs index in `path`?** Index is simpler and always unique, but not stable across reordering. If items need stable addresses (e.g., for a delta log replay), they'll need an `id` field. Revisit when DOSaver or conflict resolution lands.
- **What if an item has no parent and no name?** Currently returns `'root'`. Should there be a warning or a generated id?
- **Should `delta()` without args snapshot `_dirty` or return an empty patch?** Currently snapshots `_dirty` — which may be empty. Callers should check.
- **When does `apply_server_delta` get called?** The Item doesn't know about the socket. The socket layer (or a future reactive system) is responsible for calling this. Item3 just provides the method.
