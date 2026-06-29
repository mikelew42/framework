# Draggable2

Extends Draggable1. Adds sortable list reordering: ghost, placeholder, insertion-index tracking, and auto-commit to a data-layer `list`.

---

## What's new over Draggable1

### Ghost element

On `pointerdown`, `view.el` is cloned into a `position: fixed` ghost that follows the cursor. The grab-offset is tracked (`grab_dx`/`grab_dy`) so the ghost follows naturally from where the user clicked. The ghost is appended to `document.body` and removed on `pointerup`.

### Placeholder

A plain `<div>` matching the dragged item's dimensions, inserted at the current insertion position. Moves on every `pointermove` to show where the item will land. Not registered in Draggable1's WeakMap — it's invisible to the target system.

### Insertion-index tracking

`find_insert_before(e)` scans the list container's children (excluding the hidden original and the placeholder), comparing cursor position to each sibling's midpoint. Returns the element to insert before, or `null` for end-of-list. Default axis: `clientY`. Set `horizontal: true` to use `clientX`.

### Commit on pointerup

`commit_sort()` inserts `view.el` at the placeholder's exact position, then updates the data layer:

```js
list.remove(item);
list.insert(item, new_index);
```

`list` and `item` are optional — without them, only the DOM is updated.

---

## Drag flow

```
pointerdown  →  measure drag_rect, grab_dx/grab_dy
                super.pointerdown (pointer-events: none, start hook)
                create ghost at cursor position
                insert placeholder before view.el; hide view.el

pointermove  →  move ghost (every frame, never skipped)
                find_insert_before → move placeholder if changed
                Draggable1 target detection (enter/leave hooks)

pointerup    →  super.pointerup (stop hook, drop hook, cleanup)
                commit_sort: restore view.el at placeholder position
                             + list.remove/insert if list+item set
                cleanup: remove ghost and placeholder
```

---

## API

```js
new Draggable2({
    view,             // required — the element to sort
    handle,           // optional — drag handle (defaults to view)
    item,             // optional — domain object for data-layer commit
    list,             // optional — {remove(item), insert(item, i)} (defaults to item.parent)

    // axis
    horizontal: false,               // compare clientX instead of clientY

    // CSS classes
    ghost_class:       'drag-ghost',
    placeholder_class: 'drag-placeholder',

    // Draggable1 hooks still work
    start(e)          {},
    move(dx, dy, e)   {},
    stop(dx, dy, e)   {},
    enter(d, e)       {},
    leave(d, e)       {},
    drop_check(t, e)  {},
    drop(t, e)        {},            // override for cross-list behavior
})
```

---

## DOM-only sort (no data model)

```js
new Draggable2({ view: my_view });
```

Just moves DOM elements. No `list` or `item` needed.

---

## With data model

```js
new Draggable2({ view: row_view, list: my_list, item: my_item });
```

On drop: `my_list.remove(my_item)` + `my_list.insert(my_item, new_index)`. Works with any object that has those two methods — full `List` instance, plain object, whatever.

---

## CSS you need

```css
/* ghost: the dragged clone */
.drag-ghost {
    opacity: 0.9;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

/* placeholder: the landing-slot indicator */
.drag-placeholder {
    border: 2px dashed #aaa;
    background: #f5f5f5;
}
```

---

## Cross-list dragging

Draggable1's `drop` / `drop_check` / `enter` / `leave` hooks still work. Override `drop` for cross-list behavior:

```js
drop(target, e) {
    // commit_sort already ran for same-list; this handles moving to another list
    other_list.insert(this.item, target_index);
}
```

---

## Open questions resolved

- **Ghost grab offset:** implemented — ghost follows from where the pointer touched the element.
- **Horizontal support:** implemented via `horizontal: true` opt.
- **Pre-implemented drop:** yes — `commit_sort` runs unconditionally; `drop` hook is for cross-list extension.
- **Location:** stays in `ext/Draggable/2/`; consider `ext/Sortable/Sortable.js` re-export once stable.
