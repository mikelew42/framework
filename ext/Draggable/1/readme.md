# Draggable1

Extends Draggable0. Adds a target system for drag-and-drop. All Draggable0 use cases (resize, scrub, free move) continue to work unchanged.

---

## What's new

### Auto-registration as a target

Every Draggable1 instance registers its `view.el` in a static WeakMap on construction. No explicit "create a target" step. Any Draggable1 can be found by the lookup during another item's drag.

### Document events instead of Pointer Capture

Draggable1 binds `pointermove` and `pointerup` on `document` (not the handle). During drag, `pointer-events: none` is set on `this.view` so events fall through to whatever is underneath. This means `e.target` in `pointermove` is the actual element under the cursor — the foundation for target detection.

Draggable0 uses Pointer Capture (right for no-target cases). Draggable1 gives that up in exchange for `e.target` reflecting the real DOM element.

### `drop_check(target, e)` — the dragging item decides

During `pointermove`, the lookup finds the Draggable1 instance registered under `e.target` (walking up the DOM tree). The **dragging item's** `drop_check` then decides if this is a valid drop target:

```js
// default — accept any target (except self)
drop_check(target, e) { return target !== this; }

// custom — only accept certain views
drop_check(target, e) { return target.view.hc('panel'); }

// no drops at all (resize handle, scrub knob)
drop_check(target, e) { return false; }
```

The target side has no `accepts` filter — the dragging item owns all the logic. This keeps constraint rules in one place and supports anything: type checks, capacity checks, key modifiers, etc.

### `drop(target, e)` — executed on pointerup

If `drop_check` returns true on pointerup, `drop` is called:

```js
drop(target, e) {
    target.view.append(this.view);
}
```

Default `drop` is a no-op — so if you don't define it, nothing happens even if `drop_check` passes.

### Hooks on the target

The target instance (the thing being hovered over) receives calls for visual feedback:

```js
enter(draggable, e) { this.view.ac('drag-over'); }
leave(draggable, e) { this.view.rc('drag-over'); }
```

These are empty by default. Override in a subclass or pass as constructor opts.

---

## Full drag flow

```
pointerdown  →  bind document pointermove/pointerup
                set pointer-events: none on this.view
                record start_x, start_y
                call start(e)

pointermove  →  call move(dx, dy, e)               ← Draggable0 behaviour, still works
                lookup(e.target) → find target
                if target changed:
                    last_target?.leave(this, e)
                    target.enter(this, e)
                    last_target = target

pointerup    →  unbind document listeners
                restore pointer-events on this.view
                call stop(dx, dy, e)
                if drop_check(last_target, e):
                    last_target.leave(this, e)
                    drop(last_target, e)
```

---

## API

```js
new Draggable1({
    view,
    handle,                          // defaults to view

    // Draggable0 hooks — still work
    start(e)         {},
    move(dx, dy, e)  {},
    stop(dx, dy, e)  {},

    // Target hooks (called ON this instance when others drag over it)
    enter(draggable, e) {},
    leave(draggable, e) {},

    // Drop hooks (called ON the dragging item)
    drop_check(target, e) { return target !== this; },
    drop(target, e)       {},
})
```

---

## The lookup

Static WeakMap on `Draggable1`. Walks the DOM tree up from `e.target` until it finds a registered element:

```js
static lookup(el) {
    while (el) {
        const found = Draggable1.registry.get(el);
        if (found) return found;
        el = el.parentElement;
    }
}
```

The tree walk is necessary because `e.target` may be a child element deep inside the registered view.

**Caching:** if `e.target === last_raw_target`, return the cached `last_target` immediately. `pointermove` fires constantly; skipping the walk when nothing has changed matters.

---

## Use cases covered

| Use case | How |
|---|---|
| Resize / scrub | `move(dx)` hook, `drop_check` returns false |
| Free move | `move(dx,dy)` → transform, `stop` commits |
| Card → column | `drop_check` checks column, `drop` moves card |
| Sortable list | Subclass adds insertion index + preview (see ext/Sortable) |
| Filtered drops | `drop_check(target)` inspects `target.view` or any property |
| Self-drop guard | `drop_check` returns `target !== this` |

---

## Implementation notes

- `leave` is always fired on `pointerup` (before calling `drop` if accepted) — this ensures visual state is cleaned up even when `drop_check` returns false. The readme spec only showed `leave` in the acceptance path, but always firing is cleaner.
- `drop_check` / `drop` / `enter` / `leave` are class methods with defaults (no-op or `target !== this`). Constructor opts override them as instance properties, which take precedence over prototype methods — same effective behavior as Draggable0's hook pattern.

## Open questions

- Should `drop_check` also be callable on the target side (`will_accept`)? Not needed yet — dragging item owns all constraint logic.
- Should `pointer-events: none` be skipped when `drop_check` always returns false? A `targets: false` flag would allow Draggable0-style usage inside Draggable1 without the overhead. Low priority.
- `destroy()` explicitly removes from the WeakMap but WeakMap would GC anyway when the el is collected.
