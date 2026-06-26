# Accordion

Collapsible sections. Smooth `max-height` CSS transition.

## Usage

```js
import { ux } from '/app.js';

const acc = ux.accordion([
    {
        label:   'Typography',
        open:    true,          // default: false
        content: myView,        // View | HTMLElement | function returning either
    },
    {
        label:   'Layout',
        content: () => build_layout_panel(),  // lazy: built on first open
    },
]);

document.body.appendChild(acc.el);

// Programmatic control
acc.open(0);       // open section at index
acc.close(1);
acc.toggle(2);
acc.open_all();
acc.close_all();
acc.add({ label: 'New Section', content: newView });
```

## Constructor

```js
ux.accordion(sections, opts?)
// same as: new Accordion({ sections, ...opts })
```

## Notes

- Uses Material Icons `chevron_right` that rotates 90° when open.
- Section headers are `<button>` elements for keyboard accessibility.
- Content can be a View, HTMLElement, or a function (lazy init — called on first expand).
- CSS classes: `.ux-acc`, `.ux-acc-item`, `.ux-acc-header`, `.ux-acc-body`, `.ux-acc-arrow`, `.open`.
