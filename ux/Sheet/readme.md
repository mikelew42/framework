# Sheet

Slide-in drawer from any side. Backdrop closes on click; Escape closes via keyboard.

## Usage

```js
import { ux } from '/app.js';

const s = ux.sheet({
    content:  settingsView,     // View | HTMLElement | string
    side:     'right',          // 'left' | 'right' | 'bottom' | 'top'
    size:     320,              // width (left/right) or height (top/bottom) in px
    title:    'Settings',       // optional header with title + close button
    on_close: () => {},         // optional close callback
});

s.open();
s.close();
s.toggle();

s.set_content(newView);   // swap content at runtime
s.destroy();              // remove from DOM and clean up
```

## Notes

- Each `Sheet` instance is an independent DOM element — create as many as needed.
- `bottom` and `top` sheets get a drag grip indicator.
- The close button in the header calls `close()` — no extra wiring needed.
- If you don't need a title bar, omit `title` and build your own header in `content`.
- CSS classes: `.ux-sheet-backdrop`, `.ux-sheet.{side}`, `.ux-sheet.open`, `.ux-sheet-header`, `.ux-sheet-body`, `.ux-sheet-grip`.
