# WebApp1

Extends WebApp0 with resizable panels and optional status bar.

## What's new over v0

- **Draggable resize handles** between left/main and main/right panels
- **Optional status bar** at the bottom (`.wa-status-bar`)
- **Panel min/max width** constraints (`min_panel_w`, `max_panel_w` options)

## Usage

```js
import WebApp1 from '/framework/ext/WebApp/1/WebApp1.js';

const webapp = new WebApp1({
    icon:         'palette',
    title:        'My App',
    left_width:   260,
    right_width:  280,
    status_bar:   true,     // enables the bottom status bar
    min_panel_w:  140,      // min panel width when dragging (default 140)
    max_panel_w:  700,      // max panel width when dragging (default 700)
});

// Status bar helpers
webapp.status.add('W 100', 'width');   // add item with optional key
webapp.status.set('width', 'W 240');   // update by key
webapp.status.sep();                    // vertical separator
webapp.status.spacer();                 // flex spacer
```

## Files

| File | Role |
|------|------|
| `WebApp1.js` | Extends WebApp0: resize handles + status bar |
| `page.js`    | Full demo: accordion, toggle_group, all ux patterns, context menu, Keys |
