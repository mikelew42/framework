# Item1 — Async load + saver lifecycle

Extends Item0 with a `ready` promise and the full saver lifecycle: `load`, `save`, `delete`.

---

## What Item1 Adds Over Item0

| Feature | Item0 | Item1 |
|---|---|---|
| `get` / `set` / dirty tracking | yes | yes (inherited) |
| `save()` return value | void | Promise |
| `this.ready` | no | yes — resolves when load() finishes |
| `load()` | no | yes — calls `saver.load(item)` |
| `delete()` | no | yes — calls `saver.delete(item)` |

---

## Saver Contract

Item1 expects savers to implement the full lifecycle:

```js
saver.load(item)         // → Promise; sets item.data, resolves when done
saver.save(item, patch)  // persist dirty patch only (same as Item0)
saver.delete(item)       // → Promise; remove from storage
```

All three methods are optional at the call site — Item1 guards with optional chaining
(`this.saver?.load`, `this.saver?.delete`) and degrades gracefully when they are absent.

---

## Constructor Flow

```js
constructor(...args) {
    super(...args);       // Item0 sets up data, parent, saver, _dirty
    this.ready = this.load();  // kick off async load immediately
}
```

`this.ready` is a Promise that resolves to `this` once the saver has populated `item.data`.
Consumers `await item.ready` before calling `get()`.

---

## load() — Replace, Not Merge

`saver.load(item)` is expected to **replace** `item.data` entirely (e.g. `item.data = { ...loaded }`).
Merge semantics would be surprising when a key was deleted remotely. Replace is simpler and predictable.

Decided: **replace**. Not up for debate until a concrete merge use-case arises.

---

## save() Returns a Promise

Item0's `save()` returned void. Item1 overrides it to always return a Promise, making it
safe to `await item.save()`. The saver's `save(item, patch)` method does not need to
return a Promise itself — `Promise.resolve(saver.save(...))` wraps any return value.

---

## Async Tests and Test0 Limitation

Test0's `run()` is synchronous. Async test functions added to `Item1.test` register as
passing (no failures recorded) but their assertion bodies do not complete before `run()`
moves on. The browser `page.js` re-runs the async tests via the `test()` helper which
does support async. Full async support in the Node test runner is planned for Test1
(see `core/Test/readme.md`).

---

## Open Questions

1. **`ready` and children** — when Item2 adds children, does `await item.ready` guarantee
   children are also loaded? Probably not — each child has its own `ready`. Needs a
   decision in Item2's design.

2. **`save()` full snapshot option** — some backends (e.g. a single-file JSON store) prefer
   a full snapshot over patch-only saves. Should `save()` accept a flag or should that
   be a saver-level concern? Leaning toward saver-level.

3. **Error handling in load()** — what if `saver.load(item)` rejects? Currently propagates
   to `item.ready`. Caller must handle. Should Item1 catch and set an error state?

---

## Next Up: Item2

Item2 adds `item.items` (children list) and `item.add(child)` / `item.remove(child)`.
Children inherit `saver` from parent automatically via the existing `parent?.saver` chain.
