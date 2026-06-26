import app, { el, div, h1, p, style } from '/app.js';
import { ux, ui } from '/app.js';

app.$root.ac('page');
style(`
.page { padding: 32px; max-width: 700px; display: flex; flex-direction: column; gap: 32px; }
.demo-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9a9a94; margin-bottom: 10px; }
kbd {
    display: inline-block; padding: 2px 7px;
    background: #f4f4f3; border: 1px solid #e6e6e3;
    border-radius: 5px; font-family: monospace; font-size: 12px;
}
`);

h1('CommandPalette');
p('Fuzzy command launcher. Press Ctrl+K anywhere on this page to open it.');

// Register demo commands
ux.command_palette.register([
    // File
    { label: 'New File',         icon: 'add',           section: 'File',   hint: 'Ctrl+N',  on_click: () => ux.toast('New file') },
    { label: 'Open File',        icon: 'folder_open',   section: 'File',   hint: 'Ctrl+O',  on_click: () => ux.toast('Open file') },
    { label: 'Save',             icon: 'save',          section: 'File',   hint: 'Ctrl+S',  on_click: () => ux.toast('Saved!', { type: 'success' }) },
    { label: 'Export as PNG',    icon: 'image',         section: 'File',   on_click: () => ux.toast('Exported') },
    { label: 'Export as SVG',    icon: 'svg_2',         section: 'File',   on_click: () => ux.toast('Exported') },

    // Edit
    { label: 'Undo',             icon: 'undo',          section: 'Edit',   hint: 'Ctrl+Z',        on_click: () => ux.toast('Undo') },
    { label: 'Redo',             icon: 'redo',          section: 'Edit',   hint: 'Ctrl+Shift+Z',  on_click: () => ux.toast('Redo') },
    { label: 'Cut',              icon: 'content_cut',   section: 'Edit',   hint: 'Ctrl+X',        on_click: () => ux.toast('Cut') },
    { label: 'Copy',             icon: 'content_copy',  section: 'Edit',   hint: 'Ctrl+C',        on_click: () => ux.toast('Copied') },
    { label: 'Paste',            icon: 'content_paste', section: 'Edit',   hint: 'Ctrl+V',        on_click: () => ux.toast('Pasted') },
    { label: 'Select All',       icon: 'select_all',    section: 'Edit',   hint: 'Ctrl+A',        on_click: () => ux.toast('All selected') },
    { label: 'Delete',           icon: 'delete',        section: 'Edit',   on_click: () => ux.toast('Deleted', { type: 'error' }) },

    // View
    { label: 'Zoom In',          icon: 'zoom_in',       section: 'View',   hint: 'Ctrl+=', on_click: () => ux.toast('Zoomed in') },
    { label: 'Zoom Out',         icon: 'zoom_out',      section: 'View',   hint: 'Ctrl+-', on_click: () => ux.toast('Zoomed out') },
    { label: 'Fit to Screen',    icon: 'zoom_out_map',  section: 'View',   hint: 'Ctrl+0', on_click: () => ux.toast('Fit to screen') },
    { label: 'Toggle Dark Mode', icon: 'dark_mode',     section: 'View',   on_click: () => ux.toast('Toggled dark mode') },
    { label: 'Show Grid',        icon: 'grid_on',       section: 'View',   on_click: () => ux.toast('Grid toggled') },
    { label: 'Toggle Sidebar',   icon: 'view_sidebar',  section: 'View',   hint: 'Ctrl+\\', on_click: () => ux.toast('Sidebar toggled') },

    // Help
    { label: 'Keyboard Shortcuts', icon: 'keyboard', section: 'Help', on_click: () => ux.toast('Opening shortcuts…') },
    { label: 'Documentation',      icon: 'menu_book', section: 'Help', on_click: () => ux.toast('Opening docs…') },
    { label: 'Report a Bug',       icon: 'bug_report', section: 'Help', on_click: () => ux.toast('Opening issue tracker…') },

    // Without section (top of list)
    { label: 'Command Palette',  icon: 'terminal',      hint: 'Ctrl+K', on_click: () => ux.command_palette.toggle(),
      description: 'Open this palette' },
]);

div.c('', () => {
    el.c('div', 'demo-label', 'Try it');
    div.c('', () => {
        const btn = ui.button({ label: 'Open palette', variant: 'primary', on_click: () => ux.command_palette.open() });
        div.c('').el.appendChild(btn.el);
    });
    el.c('p', '').el.innerHTML = 'Or press <kbd>Ctrl+K</kbd> anywhere on this page.';
    el.c('p', '').el.style.cssText = 'font-size:13px;color:#6b6b66;margin-top:4px;';
    el.c('p', '').el.innerHTML = 'Try typing <kbd>fi</kbd>, <kbd>ex</kbd>, <kbd>zo</kbd>, <kbd>da</kbd> to see fuzzy matching.';
});

div.c('', () => {
    el.c('div', 'demo-label', 'Features');
    const items = [
        '↑ / ↓  to navigate',
        'Enter to execute',
        'Escape to close',
        'Click backdrop to close',
        'Fuzzy match with highlighted chars',
        'Groups by section',
        'Keyboard hint display',
        'Commands registerable from anywhere',
    ];
    const ul = el.c('ul', '');
    ul.el.style.cssText = 'font-size:13px;color:#6b6b66;line-height:2;margin:0;padding-left:20px;';
    items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.el.appendChild(li); });
});
