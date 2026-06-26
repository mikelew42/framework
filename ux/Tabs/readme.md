# Tabs

Tabbed panel switcher. View subclass.

## Usage

```js
import { ux } from '/app.js';

const tabs = ux.tabs([
    { label: 'Design',  content: designView },
    { label: 'Inspect', content: inspectView },
    { label: 'Lazy',    content: () => build_panel() },  // lazy init
], { active_index: 0 });

container.appendChild(tabs.el);

// Programmatic control
tabs.select(1);            // switch to tab by index
tabs.active();             // → current tab def object
tabs.add({ label: 'New', content: newView });
```

## Content types

| Value | Behaviour |
|-------|-----------|
| `View` | Appended once; shown/hidden with CSS |
| `HTMLElement` | Same as View |
| `() => View\|HTMLElement` | Called once on first open (lazy) |
| `undefined` | Empty tab |

## Notes

- All tab panels are mounted on first visit; switching just toggles `display`.
- Tab headers are `<button>` elements — keyboard navigable.
- CSS classes: `.ux-tabs`, `.ux-tabs-header`, `.ux-tab-btn`, `.ux-tab-btn.active`, `.ux-tabs-body`, `.ux-tab-panel`.
