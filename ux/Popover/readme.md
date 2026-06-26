# Popover

Positioned overlay anchored to a trigger element. Animates in/out, dismisses on outside click or Escape.

## Usage

```js
import { ux } from '/app.js';

const pop = ux.popover({
    trigger:          myBtn.el,         // anchor element
    content:          myView,           // View | HTMLElement | string
    placement:        'bottom-start',   // see placements below
    offset:           6,                // px gap from trigger
    close_on_outside: true,             // default true
});

pop.open();
pop.close();
pop.toggle();

pop.set_content(newView);   // swap content at runtime

pop.destroy();              // remove from DOM, clean up listeners
```

## Placements

```
top-start   top         top-end
left                        right
bottom-start  bottom  bottom-end
```

Each is clamped to the viewport so it never clips off-screen.

## Example: dropdown button

```js
const btn = ui.button({ label: 'Options' });
const menu = build_menu_view();

const pop = ux.popover({ trigger: btn.el, content: menu, placement: 'bottom-start' });
btn.el.addEventListener('click', () => pop.toggle());
```

## Notes

- The popover element is appended to `document.body` to avoid stacking context issues.
- `trigger.contains()` is used to prevent the outside-click handler from closing on the trigger itself — so the trigger's own click handler can call `toggle()` safely.
- CSS class: `.ux-popover`, `.ux-popover.open`, `.ux-popover.placement-{side}`.
