# CollectionSaver — Persist a List to One JSON File

Persists an entire List of Items as a JSON array in a single file. Complementary to FileSaver (which saves one Item per file).

## When to use

| Pattern | Use |
|---|---|
| Each item has its own file | `FileSaver` per item |
| All items in one file | `CollectionSaver` on the List |
| Named independent Items | `Store` |

`CollectionSaver` is for collections that are always loaded and saved together: a todo list, a set of settings entries, a small database table.

## Usage

```js
import { List, CollectionSaver } from "/app.js";
import MyItem from "./MyItem.js";

const todos = new List();
const saver = new CollectionSaver({ path: '/data/todos.json', item_class: MyItem });

// Load existing items on startup
await saver.load(todos);       // populates list from file

// Auto-save on structural changes
todos.on('add',    () => saver.save(todos));
todos.on('remove', () => saver.save(todos));

// Add a new item
const todo = new MyItem({ data: { title: 'Buy milk', done: false } });
todos.append(todo);            // triggers auto-save
todo.on('save', () => saver.save(todos)); // save when item saves itself
```

## API

```js
const saver = new CollectionSaver({ path, item_class? });

saver.load(list)    // → Promise — fetch file, create items, append to list
saver.save(list)    // → Promise — write all items as JSON array (debounced)
saver.delete()      // → Promise — delete the file
```

- `path` — required: e.g. `/data/todos.json`
- `item_class` — optional: class to use when creating items during `load()`. Defaults to `Item9`.
- `save()` is debounced: rapid calls collapse to one write

## File format

A JSON array of plain item data objects:
```json
[
  { "title": "Buy milk", "done": false },
  { "title": "Write tests", "done": true }
]
```

## Notes

- `load()` APPENDS to the list (doesn't clear first). Call before appending any items.
- `load()` for a missing file is a silent no-op — list stays empty.
- `save()` uses `item.toJSON()` if available (so nested children serialize correctly).
- Unlike `FileSaver`, `CollectionSaver` is not a Saver-contract implementation — it takes a `list`, not an `item`. Attach it directly to the list rather than via `item.saver`.
