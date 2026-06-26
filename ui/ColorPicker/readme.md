# ColorPicker

Full HSL color picker widget. Saturation/lightness box, hue slider, optional alpha slider, hex input.

## Usage

```js
import ColorPicker from '/framework/ui/ColorPicker/ColorPicker.js';

// Standalone
const picker = new ColorPicker({
    value:     '#5b57d6',
    alpha:     false,        // enable alpha slider + 8-digit hex output
    on_change: v => apply_color(v),
});
document.body.appendChild(picker.el);

picker.val()           // → '#5b57d6' (or '#5b57d6ff' with alpha)
picker.val('#ff0000')  // set programmatically

// Inside a popover (typical usage)
import { ux } from '/app.js';

const pop = ux.popover({
    trigger:   swatch_el,
    content:   picker,
    placement: 'bottom-start',
    offset:    8,
});
swatch_el.addEventListener('click', () => pop.toggle());
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | `'#5b57d6'` | Initial hex color |
| `alpha` | boolean | `false` | Show alpha slider; output is 8-digit hex |
| `on_change` | fn | — | Called with hex string on every change |

## Notes

- Color state is stored as HSV internally to avoid hue/saturation loss at lightness extremes.
- Dragging uses the Pointer Capture API — works even when leaving the element.
- Width is fixed at 220px; place inside a Popover to float it over content.
