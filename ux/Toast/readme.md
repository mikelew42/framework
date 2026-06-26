# Toast

Global notification toasts. Singleton — no instance needed.

## Usage

```js
import { ux } from '/app.js';
// or: import Toast from '/framework/ux/Toast/Toast.js';

ux.toast('File saved!', { type: 'success' });
ux.toast('Upload failed', { type: 'error' });
ux.toast('Low disk space', { type: 'warning' });
ux.toast('Hello');                          // default dark

// With action button
ux.toast('3 items deleted', {
    type: 'warning',
    duration: 5000,                          // ms; default 3500
    action: {
        label: 'Undo',
        on_click: () => ux.toast('Undone!', { type: 'success' }),
    },
});

// Programmatic dismiss
const t = ux.toast('Processing…');
t.dismiss();
```

## Types

| `type` | Color |
|--------|-------|
| `''` (default) | Dark (#1b1b19) |
| `'success'` | Green (#2d8a5a) |
| `'error'` | Red (#b52a1e) |
| `'warning'` | Amber |

## Notes

- Toasts stack vertically (bottom-right corner).
- Each auto-dismisses after `duration` ms.
- The container (`.toast-wrap`) is appended to `document.body` on first use.
