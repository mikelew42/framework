# Toolbar

Horizontal or vertical icon toolbar with buttons, groups, separators, and spacers. Tooltips included automatically.

## Usage

```js
import Toolbar from '/framework/ext/Toolbar/Toolbar.js';

const bar = new Toolbar({ direction: 'horizontal' }); // or 'vertical'

// Icon buttons
bar.btn({ icon: 'undo',  label: 'Undo',  on_click: undo });
bar.btn({ icon: 'redo',  label: 'Redo',  on_click: redo });
bar.sep();
bar.btn({ icon: 'save',  label: 'Save',  on_click: save, variant: 'primary' });
bar.btn({ icon: 'delete', label: 'Delete', on_click: del, variant: 'danger' });
bar.spacer();
bar.btn({ icon: 'settings', label: 'Settings', on_click: open_settings });

// Exclusive tool group
const tool = bar.group([
    { icon: 'near_me',     label: 'Select',    value: 'select' },
    { icon: 'crop_square', label: 'Frame',     value: 'frame'  },
    { icon: 'title',       label: 'Text',      value: 'text'   },
    { icon: 'image',       label: 'Image',     value: 'image'  },
], { value: 'select', on_change: v => set_tool(v) });

tool.val();           // → current value
tool.val('frame');    // programmatic select

document.body.appendChild(bar.el);
```

## `btn()` options

| Option | Type | Description |
|--------|------|-------------|
| `icon` | string | Material Icons name |
| `label` | string | Tooltip text |
| `on_click` | fn | Click handler |
| `variant` | `'primary'` \| `'danger'` | Button style |
| `active` | boolean | Highlighted state |
| `disabled` | boolean | Non-interactive |

## Notes

- Tooltip placement auto-adjusts: `'bottom'` for horizontal, `'right'` for vertical bars.
- `.group()` returns `{ val, el }` — `val()` gets/sets the active value.
- `.spacer()` creates a flex spacer that pushes remaining items to the far end.
