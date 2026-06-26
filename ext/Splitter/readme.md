# Splitter

Drag-to-resize handle for splitting panels. Thin element placed between two panels. Uses Pointer Capture API so dragging outside the handle still works.

## Usage

```js
import Splitter from '/framework/ext/Splitter/Splitter.js';

// Horizontal: resize a left panel
const sp = new Splitter({
    target:    left_panel_el,
    direction: 'horizontal',       // 'horizontal' | 'vertical'
    side:      'right',            // which edge moves: 'right'|'left'|'top'|'bottom'
    min:       140,                // minimum size in px
    max:       700,                // maximum size in px
    on_resize: w => console.log(w),
});
sp.default_size(260);              // double-click resets to this size

// Place between panels in a flex container
container.appendChild(left_panel_el);
container.appendChild(sp.el);
container.appendChild(main_panel_el);
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | HTMLElement | — | Panel whose size changes |
| `direction` | string | `'horizontal'` | `'horizontal'` (width) or `'vertical'` (height) |
| `side` | string | `'right'` | Which edge is being dragged. `'right'`/`'bottom'` = target grows when dragging inward. `'left'`/`'top'` = inverts delta. |
| `min` | number | `0` | Minimum size in px |
| `max` | number | `Infinity` | Maximum size in px |
| `on_resize` | fn | — | Called with new size on every frame |

## Methods

| Method | Description |
|--------|-------------|
| `.default_size(n)` | Set reset size for double-click |
| `.set_min(n)` | Update minimum constraint |
| `.set_max(n)` | Update maximum constraint |

## Notes

- CSS class `.splitter` (`horizontal` or `vertical`) — override styles by targeting `.splitter`.
- The handle turns purple (`.dragging`) while being dragged.
- A wider invisible hit area (`::after`, ±2px) makes it easier to grab.
- `WebApp1` uses this internally for its left/right panel resize handles.
