# List6 — group_by / group_by_reactive

Extends List5 with `group_by(fn)` and `group_by_reactive(fn, watch_keys?)` — partition items into named groups, returning a live `Map<key, List6>`.

## group_by(fn)

```js
const tasks = new List6();
tasks.append(
    new Item5({ data: { priority: 'high', title: 'Fix bug' } }),
    new Item5({ data: { priority: 'low',  title: 'Write docs' } }),
    new Item5({ data: { priority: 'high', title: 'Review PR' } }),
);

const by_priority = tasks.group_by(t => t.data.priority);
by_priority.get('high').children  // → [Fix bug, Review PR]
by_priority.get('low').children   // → [Write docs]
```

- Returns a `Map<string, List6>`
- Groups are created on first item with that key
- Empty groups are deleted from the Map automatically
- Stays in sync as items are added/removed from the source list
- Does NOT re-group when an item's grouping field is mutated — use `group_by_reactive` for that

## group_by_reactive(fn, watch_keys?)

```js
const by_status = tasks.group_by_reactive(t => t.data.priority, ['priority']);

// When an item's priority changes, it automatically moves to the correct group:
task.set('priority', 'low');  // task moves from 'high' group to 'low' group
```

- Like `group_by`, but also watches each item's `'change'` events
- When a change fires on a watched key, the item is moved to its new group
- Cleans up subscriptions when items are removed from source
- Items without `on/off` (not Item5+) are grouped at creation but won't react to mutations

## Map semantics

The returned `Map` uses the value of `fn(item)` as keys. Common patterns:

```js
list.group_by(t => t.data.status)           // by enum field
list.group_by(t => t.data.user_id)          // by foreign key
list.group_by(t => t.data.score > 50 ? 'pass' : 'fail')  // by predicate
list.group_by(t => new Date(t.data.created_at).getFullYear()) // by year
```

## Interaction with other List methods

The groups are themselves `List6` instances, so they support all the same methods:

```js
const by_priority = tasks.group_by(t => t.data.priority);
const high_tasks = by_priority.get('high');
const sorted_high = high_tasks?.sort((a, b) => a.data.created_at - b.data.created_at);
```
