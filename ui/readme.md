# UI — Reusable Controls

Primitive UI controls. All factory functions returning Views with a `.val()` getter/setter and `.c()` class helper. Import via `/app.js`:

```js
import { ui } from '/app.js';
```

## Controls

| Factory | Description |
|---------|-------------|
| `ui.input(opts)` | Text input |
| `ui.textarea(opts)` | Multi-line text |
| `ui.select(opts)` | Dropdown |
| `ui.slider(opts)` | Range slider |
| `ui.scrub(opts)` | Drag-to-adjust number (click to type) |
| `ui.toggle(opts)` | Boolean toggle switch |
| `ui.checkbox(opts)` | Labelled checkbox |
| `ui.color(opts)` | Color input (hex swatch + text) |
| `ui.button(opts)` | Button (default / primary / ghost) |
| `ui.toggle_group(opts)` | Exclusive button group |
| `ui.badge(text, variant)` | Pill label (success/error/warning/neutral) |
| `ui.number(opts)` | Numeric stepper with +/− buttons and hold-to-repeat |
| `ui.combobox(opts)` | Searchable dropdown with keyboard nav and fuzzy highlight |

## Layout helpers

| Helper | Description |
|--------|-------------|
| `ui.item(opts)` | Sidebar nav row (icon + label + hint) |
| `ui.row(label, ...controls)` | Label + control(s) in a horizontal row |
| `ui.section(title, ...children)` | Titled group of rows |
| `ui.divider()` | Horizontal rule |

## Item binding

```js
// Bind a control to an Item property (two-way sync)
ui.bound(item, 'font_size', ui.scrub, { min: 1, max: 200 })

// Build a full bound form from a schema array
ui.form(item, [
    { key: 'name',  type: 'input',        label: 'Name' },
    { key: 'size',  type: 'scrub',        label: 'Size', min: 1, max: 200 },
    { key: 'color', type: 'color',        label: 'Color' },
    { key: 'bold',  type: 'toggle',       label: 'Bold' },
    { key: 'align', type: 'toggle_group', label: 'Align', options: ['left', 'center', 'right'] },
    'divider',
    { key: 'notes', type: 'textarea',     label: 'Notes' },
])
```

`ui.bound` / `ui.form` work with any object that has `.get(key)` / `.set(key, val)` (e.g. `Item9`), or a plain object with matching properties.

## API contract

All controls expose:

```js
ctrl.val()       // → current value
ctrl.val(x)      // set value, returns ctrl
ctrl.c('cls')    // add CSS class, returns ctrl (alias for .ac())
ctrl.el          // the raw HTMLElement
```

## ColorPicker

`ui/ColorPicker/ColorPicker.js` — full HSV color picker (saturation/lightness box + hue slider + optional alpha + hex input). Uses HSV internally so hue is never lost when dragging to black/white. Designed to drop into a `ux.popover()`.

`ui.color` automatically opens a `ColorPicker` in a popover when the swatch is clicked. The hex text field still works standalone.

```js
import ColorPicker from '/framework/ui/ColorPicker/ColorPicker.js';
const picker = new ColorPicker({ value: '#5b57d6', alpha: true, on_change: v => console.log(v) });
popover_el.appendChild(picker.el);
picker.val('#ff0000');   // set programmatically
picker.val();            // → '#ff0000' (or '#ff0000ff' with alpha)
```

## Demo page

`/framework/ui/` — live demo of every control.
