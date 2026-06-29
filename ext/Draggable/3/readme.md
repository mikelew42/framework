# Draggable3

Extends Draggable2. Adds 2D insertion-index for `flex-wrap` grid layouts.

---

## What's new over Draggable2

Everything in Draggable2 stays the same (ghost, placeholder, `commit_sort`, data-layer ops). The only override is `find_insert_before`, which needs to reason in two axes for wrapped layouts.

### 2D insertion-index

For a `flex-wrap` container:

```
[A][B][C]
[D][E][F]
[G]
```

1. Group siblings into rows by overlapping Y ranges
2. Compare cursor Y to each row's midpoint to find which row
3. Within that row, compare cursor X to each item's midpoint to find the column

```
cursor above row 1 midpoint    → insert before A (row 1, first)
cursor in row 2, left of E     → insert before E
cursor below all rows          → append to end
```

Row-grouping starts with `Math.round(rect.top)` bucketing — works for uniform-height items (most card/chip grids). Non-uniform heights need overlap detection, addable later.

---

## What stays the same

- Ghost, placeholder, `cleanup_drag` — unchanged
- `commit_sort` — unchanged (placeholder position drives the DOM + data ops)
- All Draggable1/2 hooks (`start`, `move`, `stop`, `enter`, `leave`, `drop_check`, `drop`)
- `horizontal` opt — not applicable here (auto 2D), likely removed or ignored

---

## Open questions

- **Row tolerance:** use exact `rect.top` matching or overlap ranges? Overlap ranges handle mixed-height rows but add complexity.
- **Placeholder shape:** for wrapping grids the placeholder should probably match the item's exact width (not stretch to full container width). Current Draggable2 sets explicit `width` — should carry over fine.
- **Gap-aware:** flex `gap` creates visual space between items and rows. `getBoundingClientRect()` doesn't include gap, so midpoint math should still work without adjustment.

---

## Separate: Resizable (not in this progression)

Bi-directional container resize (drag corner/edge to resize both X and Y) is a different interaction pattern — no targets, no sorting. Lives at `ext/Resizable/` or `ext/Draggable/Resizable.js`, extends Draggable0.

- Constructor takes container + axis (`x` | `y` | `both`) + optional handle element
- `start()` snapshots width/height
- `move(dx, dy)` applies deltas with min/max clamping
- One instance per handle; a corner handle covers both axes in one drag
