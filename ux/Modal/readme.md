# Modal

Promise-based dialogs. All methods return Promises so you can `await` the result inline.

## Usage

```js
import { ux } from '/app.js';
// or: import Modal from '/framework/ux/Modal/Modal.js';

// Confirm dialog → Promise<boolean>
const ok = await ux.modal.confirm({
    title:  'Delete layer?',
    body:   'This cannot be undone.',
    ok:     'Delete',   // button label (default 'OK')
    cancel: 'Cancel',   // default 'Cancel'
    danger: true,       // red OK button
});
if (ok) delete_it();

// Alert dialog → Promise<void>
await ux.modal.alert('File saved successfully.', { title: 'Saved' });

// Prompt dialog → Promise<string | null>  (null = cancelled)
const name = await ux.modal.prompt('Rename to:', 'Untitled');
if (name !== null) rename(name);

// Custom content → Promise<any>
const result = await ux.modal.open(myView, { title: 'Settings' });
// resolve with: ux.modal.resolve(value)  from inside the content
```

## Keyboard

| Key | Action |
|-----|--------|
| `Enter` | Confirm (OK) |
| `Escape` | Cancel |

Clicking the backdrop also cancels (unless `resolve_on_backdrop: false`).

## Notes

- One modal at a time; opening a second closes the first.
- The backdrop + dialog box are appended to `document.body`.
- Animates in/out with opacity + scale.
