# Store — Named Item Registry

`Store` is a lightweight registry that maps names to `Item9` instances, each backed by a `FileSaver` pointing to a predictable path.

## The problem it solves

A typical app has several persistent "slots" — settings, user profile, app state, etc. Without Store, each requires boilerplate:

```js
const settings = new Item9({ saver: new FileSaver({ path: '/data/settings.json' }) });
const profile  = new Item9({ saver: new FileSaver({ path: '/data/profile.json' }) });
await settings.load();
await profile.load();
```

With Store:

```js
const store = new Store({ dir: '/data/' });
const settings = store.item('settings');
const profile  = store.item('profile');
await store.load_all();
```

## API

```js
const store = new Store({ dir: '/data/', item_class: Item9 });

store.item(name)                 // → registered Item9 (creates on first call, same instance after)
store.item(name, MyItem)         // → registered MyItem subclass
store.load_all()                 // → Promise — loads all registered items in parallel
store.save_all()                 // → Promise — saves all registered items in parallel
store.names                      // → string[] of registered names
```

## Path convention

`dir` + name + `.json`:
- `store.item('settings')` with `dir: '/data/'` → `/data/settings.json`
- `dir` trailing slash is normalized — `/data` and `/data/` both work

## Item lifecycle

Items are lazy — they're only created when `item(name)` is first called. After that, the same instance is returned. This means you can call `item()` in multiple modules and always get the same object:

```js
// module-a.js
const settings = store.item('settings');

// module-b.js
const same_settings = store.item('settings');  // same object
```

## Example — settings page

```js
const store = new Store({ dir: '/data/' });
const settings = store.item('settings');
settings.schema({ theme: String, font_size: Number, show_tips: Boolean });
await store.load_all();

settings.on('change', () => apply_theme(settings.data));
```

## Notes

- Each item inherits the default `item_class` from the Store, overridable per-item.
- `load_all()` and `save_all()` run all in parallel via `Promise.all`.
- `load_all()` only loads items already registered at call time — call `item()` for all slots before `load_all()`, or call `item.ready` individually for items registered later.
- `load()` for a missing path is a no-op (item.data stays `{}`), not an error.
- For list-backed persistence (saving an array of items), see `ext/CollectionSaver/`.
