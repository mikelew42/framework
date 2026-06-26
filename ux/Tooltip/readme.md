# Tooltip

Lightweight hover tooltip. Singleton — one shared DOM node for the whole page, so binding hundreds of elements has no DOM overhead.

## Usage

```js
import { ux } from '/app.js';
// or: import Tooltip from '/framework/ux/Tooltip/Tooltip.js';

// Bind to any element — returns an unbind function
const unbind = ux.tooltip.bind(btn.el, 'Save file (Ctrl+S)');
ux.tooltip.bind(icon.el, 'Bold', { placement: 'bottom' });
ux.tooltip.bind(handle.el, 'Drag to resize', { delay: 600 });

// Programmatic control
ux.tooltip.show('Hello', triggerEl, { placement: 'top' });
ux.tooltip.hide();

// Cleanup
unbind();
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | string | `'top'` | `'top'` · `'bottom'` · `'left'` · `'right'` |
| `delay` | number | `400` | Show delay in ms |

## Notes

- All tooltips share one `.ux-tooltip` element appended to `document.body`.
- Tooltip dismisses immediately on `mouseleave` / `blur`.
- Tooltip text is clamped to 240px max-width (wraps to multiple lines).
- `bind()` also listens to `focus`/`blur` for keyboard accessibility.
