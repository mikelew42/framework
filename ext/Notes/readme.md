# Notes — Full-Stack Demo App

A note-taking app demonstrating the entire framework stack:

| Layer | Class | Why |
|---|---|---|
| Data | `NoteItem extends Item9` | schema, compute, undo/redo |
| Collection | `NoteList extends List7` | reactive filter, sort, group_by |
| Persistence | `CollectionSaver` | whole list as JSON array via WebSocket |
| UI | page.js | View primitives, reactive bindings |

## Architecture

```
/data/notes.json   ← all notes as a JSON array (one file, loaded together)

NoteItem extends Item9
  schema:  title (String), body (String), archived (Boolean)
  compute: word_count, preview
  fields:  title, body, tags[], archived, created_at, updated_at
  auto:    updated_at set on every title/body set()
  methods: archive(), unarchive(), add_tag(t), remove_tag(t)
  undo:    checkpoint() on save, undo/redo in editor toolbar

NoteList extends List7
  .active         → lazy getter: filter_reactive(n => !n.archived, ['archived'])
  .archived       → lazy getter: filter_reactive(n => n.archived, ['archived'])
  .by_date        → lazy getter: sort_reactive by updated_at desc
  .with_tag(tag)  → method: new filter_reactive each call (not memoized)
  .by_first_tag   → lazy getter: group_by_reactive(n => n.tags[0] ?? 'untagged', ['tags'])
```

## Why each level was needed

- **Item5** (on/off/emit) — change events for reactive UI bindings
- **Item6** (batch) — bulk updates without firing per-key events individually
- **Item7** (compute) — word_count and preview without manual bookkeeping
- **Item8** (schema) — title/body/archived are always the right type, even from UI inputs
- **Item9** (undo) — checkpoint on save, undo/redo in the editor
- **List5** (filter_reactive) — active/archived views update when notes are archived without remove/re-add
- **List6** (group_by_reactive) — by_first_tag groups move when tags change
- **List7** (sort_reactive) — by_date re-sorts when updated_at changes on edit

## Tests

`NoteItem.test.js` is Node-runnable and inherits the full Item0→Item9 contract:
```sh
node --import ./scripts/register.mjs public/framework/ext/Notes/NoteItem.test.js
```

