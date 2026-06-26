import app, { el, div, h1, p, style } from '/app.js';
import Toolbar from './Toolbar.js';
import ux from '/framework/ux/ux.js';

app.$root.ac('page');
style(`
.page { padding: 32px; max-width: 800px; display: flex; flex-direction: column; gap: 32px; }
.demo-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9a9a94; margin-bottom: 10px; }
.demo-box { display: flex; flex-direction: column; gap: 12px; }
.demo-row { display: flex; align-items: flex-start; gap: 16px; }
`);

h1('Toolbar');
p('Icon toolbar component. Horizontal or vertical, with button groups, separators, and spacers.');

// ── Horizontal toolbar ────────────────────────────────────────────────────────

div.c('demo-box', () => {
    el.c('div', 'demo-label', 'Horizontal toolbar');

    const bar = new Toolbar({ direction: 'horizontal' });

    bar.btn({ icon: 'undo', label: 'Undo', on_click: () => ux.toast('Undo') });
    bar.btn({ icon: 'redo', label: 'Redo', on_click: () => ux.toast('Redo') });
    bar.sep();
    bar.btn({ icon: 'content_cut',   label: 'Cut',   on_click: () => ux.toast('Cut') });
    bar.btn({ icon: 'content_copy',  label: 'Copy',  on_click: () => ux.toast('Copy') });
    bar.btn({ icon: 'content_paste', label: 'Paste', on_click: () => ux.toast('Paste') });
    bar.sep();
    bar.btn({ icon: 'save', label: 'Save', on_click: () => ux.toast('Saved!', { type: 'success' }), variant: 'primary' });
    bar.spacer();
    bar.btn({ icon: 'help_outline', label: 'Help',     on_click: () => ux.toast('Help') });
    bar.btn({ icon: 'settings',     label: 'Settings', on_click: () => ux.toast('Settings') });

    div.c('').el.appendChild(bar.el);
});

// ── Tool picker (group) ───────────────────────────────────────────────────────

div.c('demo-box', () => {
    el.c('div', 'demo-label', 'Tool picker group');

    const bar = new Toolbar({ direction: 'horizontal' });
    const tool = bar.group([
        { icon: 'near_me',     label: 'Select',    value: 'select' },
        { icon: 'crop_square', label: 'Frame',     value: 'frame'  },
        { icon: 'title',       label: 'Text',      value: 'text'   },
        { icon: 'image',       label: 'Image',     value: 'image'  },
        { icon: 'smart_button',label: 'Button',    value: 'button' },
        { icon: 'link',        label: 'Link',      value: 'link'   },
    ], { value: 'select', on_change: v => ux.toast(`Tool: ${v}`) });

    bar.sep();
    bar.btn({ icon: 'zoom_in',    label: 'Zoom in',    on_click: () => ux.toast('Zoom in') });
    bar.btn({ icon: 'zoom_out',   label: 'Zoom out',   on_click: () => ux.toast('Zoom out') });
    bar.btn({ icon: 'zoom_out_map', label: 'Fit',      on_click: () => ux.toast('Fit to screen') });

    div.c('').el.appendChild(bar.el);
});

// ── Vertical toolbar ──────────────────────────────────────────────────────────

div.c('demo-box', () => {
    el.c('div', 'demo-label', 'Vertical toolbar');

    div.c('demo-row', () => {
        const bar = new Toolbar({ direction: 'vertical' });
        bar.group([
            { icon: 'near_me',     label: 'Select V',  value: 'select' },
            { icon: 'crop_square', label: 'Frame V',   value: 'frame'  },
            { icon: 'title',       label: 'Text V',    value: 'text'   },
        ], { value: 'select', on_change: v => ux.toast(v) });
        bar.sep();
        bar.btn({ icon: 'undo', label: 'Undo', on_click: () => ux.toast('Undo') });
        bar.btn({ icon: 'redo', label: 'Redo', on_click: () => ux.toast('Redo') });
        bar.spacer();
        bar.btn({ icon: 'settings', label: 'Settings', on_click: () => ux.toast('Settings') });

        bar.el.style.height = '240px';
        div.c('').el.appendChild(bar.el);
    });
});
