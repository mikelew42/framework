# Notification

Notification center with bell button, unread count badge, and popover panel. Singleton.

## Usage

```js
import { ux } from '/app.js';

// 1. Mount the bell button somewhere (e.g. app header)
header.appendChild(ux.notification.bell());

// 2. Add notifications from anywhere in the app
ux.notification.add({
    title:    'File saved',
    body:     'document.txt was saved.',
    type:     'success',   // '' | 'success' | 'error' | 'warning'
    icon:     'save',      // Material Icons name (auto-chosen by type if omitted)
    toast:    true,        // also fire a Toast (default true)
    on_click: () => {},    // called when user clicks the notification in the panel
});

// Query / clear
ux.notification.unread_count();   // → number
ux.notification.clear();          // remove all
```

## bell()

Returns an `HTMLElement` (a `<div>` wrapping the button + badge). Place it in the DOM wherever the bell should appear.

The bell opens a `Popover` (lazy-loaded on first click) showing all notifications in a scrollable list. When the panel opens, all notifications are marked as read after 600ms.

## Notes

- Notifications accumulate in memory (no persistence). Clear them on page load if starting fresh.
- The unread badge animates in/out; shows `9+` for large counts.
- CSS classes: `.notif-bell-wrap`, `.notif-bell`, `.notif-badge`, `.notif-panel`, `.notif-list`, `.notif-item`, `.notif-item.unread`.
