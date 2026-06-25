# List8 — Reactive Index (O(1) Lookup)

Extends List7 with `index_by(keyFn, watch_keys?)` — a live `Map<key, item>` for constant-time item lookups by any computed key.

## The problem it solves

Searching a list by ID or unique field requires O(n) `find()`. When you have hundreds of items and need fast access, an index is essential. `index_by` gives you a `Map` that stays in sync as items are added, removed, or mutated.

## Usage

```js
const users = new List8();
const by_id = users.index_by(u => u.data.id, ['id']);

users.append(new Item5({ data: { id: 'u1', name: 'Alice' } }));
users.append(new Item5({ data: { id: 'u2', name: 'Bob' } }));

by_id.get('u1')       // → Alice's item (O(1))
by_id.has('u3')       // → false

// When an item's key changes, the index re-keys automatically:
alice.set('id', 'u99');
by_id.has('u1')       // → false
by_id.get('u99')      // → Alice's item
```

## API

```js
list.index_by(keyFn, watch_keys?)
```

- `keyFn(item)` — returns the key for this item
- `watch_keys` — optional array of field names to watch for reactive re-keying
- Returns a plain `Map<key, item>` (live, stays in sync)

## Common patterns

```js
// Index by id
const by_id = list.index_by(item => item.data.id);

// Index by computed key
const by_slug = list.index_by(item => item.data.title.toLowerCase().replace(/\s+/g, '-'));

// Multiple indexes
const by_id    = notes.index_by(n => n.data.id);
const by_slug  = notes.index_by(n => n.data.slug, ['slug']);
```

## Notes

- **Last-write-wins**: if two items have the same key, the one appended later wins.
- **No-watch mode**: if `watch_keys` is omitted, items are indexed on add/remove only — no reactivity on mutation. Good for truly immutable keys (like numeric IDs that never change).
- **Null-safe key removal**: when an item is removed from the source list, its entry is only deleted from the index if the index still points to that item (prevents removing a "winner" in a duplicate-key scenario).
- The index `Map` is a plain JS `Map` — pass it to any code that needs a lookup table.
