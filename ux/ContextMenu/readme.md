# ContextMenu

Right-click context menu. Singleton — one menu at a time.

## Usage

```js
import { ux } from '/app.js';
// or: import ContextMenu from '/framework/ux/ContextMenu/ContextMenu.js';

// Bind to an element's contextmenu event
ux.context_menu.bind(myElement, (event) => [
    { label: 'Cut',    icon: 'content_cut',  on_click: () => cut() },
    { label: 'Copy',   icon: 'content_copy', on_click: () => copy() },
    { label: 'Paste',  icon: 'content_paste', on_click: () => paste() },
    'divider',
    { label: 'Delete', icon: 'delete', danger: true, on_click: () => del() },
    { label: 'Locked', icon: 'lock',   disabled: true },
]);

// Show programmatically
ux.context_menu.show({
    x: event.clientX,
    y: event.clientY,
    items: [ /* same format */ ],
});

// Close
ux.context_menu.hide();
```

## Item format

```js
{
    label:    'Copy',         // text
    icon:     'content_copy', // Material Icons name (optional)
    hint:     'Ctrl+C',       // keyboard hint label (optional)
    on_click: () => {},       // handler
    danger:   false,          // red label
    disabled: false,          // greyed out, non-interactive
}
// or:
'divider'                     // horizontal separator line
```

## Notes

- Positions within viewport bounds automatically.
- Dismisses on outside click or `Escape`.
- Only one menu can be open at a time; opening a second closes the first.
- CSS classes: `.ux-ctx`, `.ux-ctx-item`, `.ux-ctx-icon`, `.ux-ctx-hint`, `.ux-ctx-divider`.
