# Draggable0

Minimal pointer-drag lifecycle. The "learning" variant — small enough to read in two minutes, does exactly one thing.

## What it does

- Listens for `pointerdown` on a `handle` element
- Uses **Pointer Capture** so `pointermove`/`pointerup` fire on the handle regardless of where the pointer travels — no document listeners, no leaks
- Computes `dx`/`dy` from the drag start on every move
- Fires three hooks: `on_start(e)`, `on_move(dx, dy, e)`, `on_stop(dx, dy, e)`
- Adds/removes `.dragging` on `el` (the "moving" element, if provided)
- Adds `.drag-handle` class on the handle

## API

```js
new Draggable0({
    view:   myView,     // element being dragged — gets .dragging class
    handle: myHandle,   // element to grab (defaults to view)
    start(e)         {},
    move(dx, dy, e)  {},    // dx/dy relative to drag start
    stop(dx, dy, e)  {},
})
```

Both `view` and `handle` are Views. The `handle` defaults to `view` if omitted.

Hook methods can be passed as constructor opts **or** overridden in a subclass. Either way, `this` inside the hook is the Draggable0 instance — handy for storing transient drag state (`this.start_width`, `this.start_val`, etc.).

```js
// opts style
new Draggable0({
    view: my_panel,
    handle: grip_view,
    start()  { this.start_width = my_panel.el.offsetWidth; },
    move(dx) { my_panel.el.style.width = (this.start_width + dx) + 'px'; },
});

// subclass style
class Resizer extends Draggable0 {
    start()  { this.start_width = this.panel.el.offsetWidth; }
    move(dx) { this.panel.el.style.width = (this.start_width + dx) + 'px'; }
}
new Resizer({ view: grip_view, panel: panel_view });
```

## Pointer Capture

`setPointerCapture` is called in `pointerdown`. After that, `pointermove` and `pointerup` for that pointer ID are routed to the handle element even if the pointer moves off it. No document listeners, no risk of pointer "slipping off" and losing track. Capture is automatically released on `pointerup`.

## What is NOT here

- **Drop targets** — no registry, no `elementFromPoint` lookup → Draggable1
- **Axis constraints / min-max** — do it in `on_move` or extend
- **Sortable list reordering** → Sortable (extends Draggable1)
- **Panel split resize** → `ext/Splitter/Splitter.js` (already great, stays separate)

## `destroy()`

Removes the `pointerdown` listener and `.drag-handle` class.  
Call when tearing down a view.

## Open questions

- Should `on_move` also receive `e.shiftKey` / `e.altKey` as convenience booleans, or is `e` enough?
- Does `destroy()` need to cancel an in-flight drag (mid-drag removal)?
