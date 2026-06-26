# UX — Higher-Level Patterns

Higher-level UX components built on core primitives. All importable via `/app.js`:

```js
import { ux } from '/app.js';
```

## Modules

| Module | Import | Description |
|--------|--------|-------------|
| [Tabs](Tabs/) | `ux.tabs(defs)` | Tabbed panel switcher |
| [Accordion](Accordion/) | `ux.accordion(sections)` | Collapsible sections |
| [Toast](Toast/) | `ux.toast(msg, opts)` | Global notification toasts |
| [Modal](Modal/) | `ux.modal.confirm/alert/prompt/open` | Promise-based dialogs |
| [ContextMenu](ContextMenu/) | `ux.context_menu.bind/show` | Right-click menus |
| [Popover](Popover/) | `ux.popover({ trigger, content })` | Positioned overlays |
| [Tooltip](Tooltip/) | `ux.tooltip.bind(el, text)` | Hover tooltips (singleton) |
| [CommandPalette](CommandPalette/) | `ux.command_palette.register(cmds)` | Ctrl+K fuzzy command launcher |
| [Sheet](Sheet/) | `ux.sheet({ content, side })` | Slide-in drawer from any side |
| [Notification](Notification/) | `ux.notification.bell() / .add(n)` | Bell button, badge, notification panel |

## Quick reference

```js
// Tabs
const t = ux.tabs([{ label: 'A', content: viewA }, { label: 'B', content: viewB }]);

// Accordion
const acc = ux.accordion([{ label: 'Section', open: true, content: view }]);

// Toast
ux.toast('Saved!', { type: 'success', duration: 3500 });
ux.toast('Deleted', { type: 'error', action: { label: 'Undo', on_click: undo } });

// Modal
const ok = await ux.modal.confirm({ title: 'Delete?', ok: 'Delete', danger: true });
const name = await ux.modal.prompt('Rename to:', 'Untitled');

// Context menu
ux.context_menu.bind(el, () => [
    { label: 'Copy', icon: 'content_copy', on_click: copy },
    'divider',
    { label: 'Delete', danger: true, on_click: del },
]);

// Popover
const pop = ux.popover({ trigger: btn.el, content: menuView, placement: 'bottom-start' });
btn.el.addEventListener('click', () => pop.toggle());
```

## Demo page

`/framework/ux/` — live demo of all patterns.
