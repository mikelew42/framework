# LocalStorageSaver

Browser `localStorage` backend for `Item1+`. Implements `load/save/delete`.

## Usage

```js
import Item from "/framework/core/Item/Item.js";
import LocalStorageSaver from "/framework/ext/LocalStorageSaver/LocalStorageSaver.js";

const prefs = new Item({ saver: new LocalStorageSaver({ key: "user-prefs" }) });
await prefs.ready;       // data loaded from localStorage (or {} if new)
prefs.set("theme", "dark");
prefs.save();            // writes to localStorage
```

## Interface

```js
saver.load(item)         // reads key from localStorage, sets item.data
saver.save(item, patch)  // writes full item.data as JSON (ignores patch, full snapshot)
saver.delete(item)       // removes the key from localStorage
```

`save()` is synchronous (localStorage is sync). Returns `undefined`. Item1's `save()` wraps it in `Promise.resolve()`.

## Notes

- Browser-only — `localStorage` doesn't exist in Node. No Node test file.
- Key must be provided at construction time. Collisions between pages are the caller's responsibility.
- Quota: localStorage is typically 5–10 MB. Fine for preferences and small documents.
- **Not** suited for large JSON blobs or high-frequency saves. Use `FileSaver` for those.

## Open Questions

- Should `load()` return a Promise to match the async saver contract? Currently it's synchronous, but Item1 awaits it. Returning undefined from an async function is fine — Item1's `if (this.saver?.load) await this.saver.load(this)` awaits undefined without error.
