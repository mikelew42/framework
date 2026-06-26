# MemorySaver

In-memory `Saver` for testing and prototyping. Stores data in `this.data`; tracks `save_count` and `deleted` so tests can assert on behavior.

## Usage

```js
import MemorySaver from "/framework/ext/Saver/MemorySaver/MemorySaver.js";
import Item from "/framework/core/Item/Item.js";

const saver = new MemorySaver({ name: "Alice" }); // optional initial data
const item = new Item({ saver });
await item.ready;

item.set("name", "Bob");
await item.save();

saver.data;        // { name: "Bob" }
saver.save_count;  // 1
saver.deleted;     // false

await item.delete();
saver.deleted;     // true
saver.data;        // null
```

## Interface

| Member | Type | Description |
|---|---|---|
| `saver.data` | object or null | Last saved snapshot |
| `saver.save_count` | number | Number of times `save()` was called |
| `saver.deleted` | boolean | `true` if `delete()` was called since last save |
| `saver.load(item)` | void | Copies `saver.data` → `item.data` (if data exists) |
| `saver.save(item, patch)` | void | Snapshots `item.data` into `saver.data` |
| `saver.delete(item)` | void | Sets `saver.data = null`, `saver.deleted = true` |

## Notes

- Synchronous. All methods return `undefined`. Item1's save/load wrap this in Promise.resolve / await.
- `new MemorySaver(initial)` pre-populates `saver.data` — the item loads that data on `ready`.
- Use in tests instead of inline anonymous savers when you need to inspect save state.
