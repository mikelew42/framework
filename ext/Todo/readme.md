# Todo — Demo App

A working todo app that demonstrates the full framework stack: **Item7 + List4 + CollectionSaver**.

## What it shows

- `TodoItem extends Item7` — persistent reactive item with computed `label` field
- `TodoList extends List4` — reactive collection with filter/sort derived views
- `CollectionSaver` — persists the whole list to `/data/todos.json` as a JSON array via WebSocket
- `Test1.View` — renders the full test suite below the app

## Architecture

```
TodoItem (ext/Todo/TodoItem.js)
  extends Item7
  computed: label ← ['title', 'done']
  method:   toggle() → set('done', !done)

TodoList (ext/Todo/TodoList.js)
  extends List4
  derived:  active      = filter(t => !t.done)
  derived:  done_items  = filter(t => t.done)
  derived:  by_priority = sort(by rank: high > normal > low)
```

## Known limitation

Derived lists (`active`, `done_items`, `by_priority`) update when items are added/removed from the source list. They do NOT re-filter when an item's properties mutate (e.g., `todo.toggle()` doesn't move it between active and done views). To update the view after mutation, remove and re-add the item.

This is documented in the List2 readme and TodoItem.test.js. Reactive re-filter requires either:
- Item5 'change' events wired into the filter predicate (needs a new list level)
- Or manual remove/re-add by the caller

## Tests

`TodoItem.test.js` is Node-runnable:
```sh
node --import ./scripts/register.mjs public/framework/ext/Todo/TodoItem.test.js
```

It inherits the full Item0→Item7 contract (60+ tests) plus TodoItem-specific and TodoList-specific tests.
