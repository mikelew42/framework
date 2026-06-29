# Draggable todo

## ✅ Done

- `0/Draggable0.js` — clean base, Pointer Capture, on_start/on_move(dx,dy)/on_stop hooks

## Next up

- `1/Draggable1.js` — Target registry + drop detection
  - `Draggable1.Target` inner class (WeakMap registry)
  - `document.elementFromPoint(e.clientX, e.clientY)` during move (pointer capture means e.target is always the handle)
  - Hooks on Target: `on_enter(draggable)`, `on_leave(draggable)`, `on_drop(draggable)`
  - Replaces the messy `Draggable.lookup()` + `drop_check()` pattern in the old files

- `ext/Sortable/0/Sortable0.js` — extends Draggable1
  - Needs a `list` (core/List/List.js) and `container` (DOM el)
  - Calculates insertion index by scanning `container.children` vs `e.clientY`
  - DOM preview: `insertBefore(dragged_el, sibling)` during move
  - On drop: `old_list.remove(item)` + `new_list.insert(item, index)`
  - Open question: should this live in `ext/Sortable/` or stay in `ext/Draggable/`?

## Legacy files (keep, don't delete)

- `Draggable.js` — superseded by 0/Draggable0.js
- `Movable.js` — "follow cursor" is just Draggable0 `on_move` with transform
- `Sortable.js` — working but messy; will be replaced by ext/Sortable/
- `Previewable.js` — half-baked; preview concept absorbed into Sortable
- `Rewidth.js` — superseded by ext/Splitter and the Draggable0 resize subclass pattern
