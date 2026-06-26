# DragDrop

Sortable list reordering via pointer drag. No external dependencies. Pointer Capture API — smooth even when leaving the window.

## Usage

```js
import DragDrop from '/framework/ext/DragDrop/DragDrop.js';

// Make all direct children of a list sortable
const dd = new DragDrop({
    container:  list_el,
    on_reorder: (items, from, to) => {
        // items: ordered array of HTMLElements after drag
        // from/to: original and new index
    },
});

dd.destroy();   // clean up listeners
```

## With a drag handle

Only the handle element activates the drag (clicks elsewhere work normally):

```js
new DragDrop({
    container: list_el,
    selector:  '.my-item',        // only match these children (default: all direct children)
    handle:    '.my-item-handle', // drag handle selector within each item
    on_reorder: (items, from, to) => { ... },
});
```

## Visual states

| CSS class | When applied |
|-----------|-------------|
| `.dd-dragging` | On the item being dragged (fades it out) |
| `.dd-ghost` | Floating clone following the cursor |
| `.dd-placeholder` | Purple dashed box showing where item will drop |

Override these styles freely.

## Notes

- Uses `pointerdown`/`pointermove`/`pointerup` + `setPointerCapture` for smooth cross-device drag.
- Works with touch screens (pointer events unify mouse, touch, and pen).
- No `drag` API — avoids the browser's native drag ghost which is hard to style.
- The ghost is a cloned element with `position:fixed`, rotated slightly for visual feedback.
