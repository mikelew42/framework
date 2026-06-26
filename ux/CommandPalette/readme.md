# CommandPalette

Cmd+K style fuzzy command launcher. Singleton. Auto-installs `Ctrl+K` shortcut.

## Usage

```js
import { ux } from '/app.js';
// or: import CommandPalette from '/framework/ux/CommandPalette/CommandPalette.js';

// Register commands (call from anywhere, any time)
ux.command_palette.register([
    // No section → top of list
    { label: 'Save',          icon: 'save',        hint: 'Ctrl+S', on_click: save },

    // Grouped by section
    { label: 'New File',      icon: 'add',         section: 'File', on_click: new_file },
    { label: 'Open…',         icon: 'folder_open', section: 'File', on_click: open_file },
    { label: 'Zoom In',       icon: 'zoom_in',     section: 'View', hint: 'Ctrl+=', on_click: zoom_in },
    { label: 'Dark Mode',     icon: 'dark_mode',   section: 'View',
      description: 'Toggle the dark colour scheme',
      on_click: toggle_dark },
]);

// Programmatic control
ux.command_palette.open();
ux.command_palette.close();
ux.command_palette.toggle();

// Dynamic registration
const id = ux.command_palette.register_one({ label: 'My command', on_click: fn });
ux.command_palette.unregister(id);  // clean up

ux.command_palette.clear();  // remove all
```

## Command schema

```js
{
    label:       'Zoom In',        // required — shown and matched against
    icon:        'zoom_in',        // Material Icons name (optional)
    description: 'Make it bigger', // subtitle under label (optional)
    hint:        'Ctrl+=',         // keyboard shortcut badge (optional)
    section:     'View',           // group heading (optional)
    on_click:    fn,               // called when selected
}
```

## Keyboard

| Key | Action |
|-----|--------|
| `Ctrl+K` | Open / close (global) |
| `↑` / `↓` | Navigate results |
| `Enter` | Execute focused command |
| `Escape` | Close |

## Fuzzy matching

- Matches characters in order (not substring).
- Consecutive matches score higher (so `zo` matches **Zo**om In better than Z**o**om **O**ut).
- Matched characters are highlighted with `<em>` styled in brand purple.
- Results sorted by score (best match first).
