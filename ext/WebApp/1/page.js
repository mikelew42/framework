// WebApp1 demo — resizable panels + all new ux components
import app from '/app.js';
import ui from '/framework/ui/ui.js';
import ux from '/framework/ux/ux.js';
import Keys from '/framework/ext/Keys/Keys.js';
import WebApp1 from './WebApp1.js';
import View from '/framework/core/View/View.js';

const { tooltip } = ux;

app.$header.hide();
app.$sidenav.hide();
if (app.$footer) app.$footer.hide();

function mk(cls = '') {
    const v = new View({ capture: false });
    if (cls) v.ac(cls);
    return v;
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const webapp = new WebApp1({
    icon:        'dashboard',
    title:       'WebApp1',
    left_width:  260,
    right_width: 280,
    status_bar:  true,
});

// ── Header ─────────────────────────────────────────────────────────────────────

const undo_btn = webapp.btn('undo', 'Undo (Ctrl+Z)');
const redo_btn = webapp.btn('redo', 'Redo (Ctrl+Shift+Z)');
tooltip.bind(undo_btn, 'Undo', { placement: 'bottom' });
tooltip.bind(redo_btn, 'Redo', { placement: 'bottom' });
webapp.header.el.insertBefore(undo_btn, webapp.header.el.querySelector('.wa-spacer'));
webapp.header.el.insertBefore(redo_btn, webapp.header.el.querySelector('.wa-spacer'));
webapp.header.el.insertBefore(webapp.sep().el, webapp.header.el.querySelector('.wa-spacer'));

// Right header: badge + save button
const saved_badge = ui.badge('Saved', 'success');
webapp.header_right.append(saved_badge);

const save_btn = ui.button({ label: 'Save', variant: 'primary', on_click: async () => {
    ux.toast('Saved!', { type: 'success' });
    saved_badge.el.textContent = 'Saved';
    saved_badge.el.className = 'ui-badge success';
}});
webapp.header_right.append(save_btn);

// ── Keyboard shortcuts ─────────────────────────────────────────────────────────

Keys.bind('ctrl+s', e => { e.preventDefault(); save_btn.el.click(); });
Keys.bind('ctrl+z', e => { e.preventDefault(); ux.toast('Undo'); });
Keys.bind('ctrl+shift+z', e => { e.preventDefault(); ux.toast('Redo'); });

// ── Left sidebar — Accordion ──────────────────────────────────────────────────

const toolbar = ui.section('',
    ui.item({ icon: 'near_me',   label: 'Select',    hint: 'V', active: true }),
    ui.item({ icon: 'crop_square', label: 'Frame',   hint: 'F' }),
    ui.item({ icon: 'title',     label: 'Text',      hint: 'T' }),
    ui.item({ icon: 'image',     label: 'Image',     hint: 'I' }),
    ui.item({ icon: 'smart_button', label: 'Button', hint: 'B' }),
);

const snap_section = ui.section('Snapping',
    ui.row('Grid',  ui.toggle({ value: true  })),
    ui.row('Snap',  ui.toggle({ value: true  })),
    ui.row('Pixel', ui.toggle({ value: false })),
    ui.row('Size',  ui.scrub({ value: 8, min: 1, max: 64 })),
);

const view_section = ui.section('View',
    ui.row('Zoom',  ui.toggle_group({ value: '100', options: ['50', '100', '200'] })),
    ui.row('Theme', ui.toggle_group({ value: 'light', options: ['light', 'dark'] })),
);

webapp.left.append(toolbar, ui.divider(), snap_section, view_section);

// ── Right sidebar — Tabs with Accordion inside ────────────────────────────────

const style_accordion = ux.accordion([
    {
        label: 'Typography',
        open: true,
        content: mk().append(
            ui.row('Family', ui.select({ value: 'inherit', options: [
                { value: 'inherit',    label: 'Default' },
                { value: 'sans-serif', label: 'Sans-serif' },
                { value: 'serif',      label: 'Serif' },
                { value: 'monospace',  label: 'Mono' },
            ]})),
            ui.row('Size',   ui.scrub({ value: 16, min: 1, max: 200 })),
            ui.row('Weight', ui.toggle_group({ value: '400', options: [
                { value: '400', label: 'Rg' },
                { value: '500', label: 'Md' },
                { value: '600', label: 'Sb' },
                { value: '700', label: 'Bd' },
            ]})),
            ui.row('Align', ui.toggle_group({ value: 'left', options: [
                { value: 'left',    icon: 'format_align_left',   title: 'Left' },
                { value: 'center',  icon: 'format_align_center', title: 'Center' },
                { value: 'right',   icon: 'format_align_right',  title: 'Right' },
            ]})),
            ui.row('Color', ui.color({ value: '#1b1b19' })),
        ),
    },
    {
        label: 'Layout',
        open: true,
        content: mk().append(
            ui.row('Direction', ui.toggle_group({ value: 'row', options: [
                { value: 'row', icon: 'more_horiz', title: 'Row' },
                { value: 'col', icon: 'more_vert',  title: 'Column' },
            ]})),
            ui.row('Gap',  ui.scrub({ value: 16, min: 0, max: 200 })),
            ui.row('Pad',  ui.scrub({ value: 16, min: 0, max: 200 })),
            ui.row('Align', ui.toggle_group({ value: 'flex-start', options: [
                { value: 'flex-start', label: 'Start' },
                { value: 'center',     label: 'Ctr'   },
                { value: 'flex-end',   label: 'End'   },
                { value: 'stretch',    label: 'Fill'  },
            ]})),
        ),
    },
    {
        label: 'Style',
        open: true,
        content: mk().append(
            ui.row('BG',      ui.color({ value: '#ffffff' })),
            ui.row('Radius',  ui.scrub({ value: 8, min: 0, max: 100 })),
            ui.row('Shadow',  ui.toggle({ value: false })),
            ui.row('Opacity', ui.slider({ value: 100, min: 0, max: 100 })),
            ui.row('Border',  ui.scrub({ value: 0, min: 0, max: 20 })),
        ),
    },
    {
        label: 'Effects',
        content: mk().append(
            ui.row('Blur',     ui.slider({ value: 0, min: 0, max: 40 })),
            ui.row('Overflow', ui.toggle_group({ value: 'visible', options: ['visible', 'hidden'] })),
        ),
    },
]);

const props_tabs = ux.tabs([
    { label: 'Design', content: style_accordion },
    { label: 'Inspect', content: mk('').append(
        (() => {
            const v = mk();
            v.el.style.cssText = 'padding:16px;font-size:12px;font-family:monospace;color:#6b6b66;line-height:1.8;';
            v.el.innerHTML = `<b>frame</b> #main-card<br>
width: 600px<br>height: auto<br>
background: #ffffff<br>
border-radius: 8px<br>
box-shadow: 0 4px 16px rgba(0,0,0,.08)`;
            return v;
        })()
    )},
], { active_index: 0 });
props_tabs.el.style.height = '100%';
webapp.right.append(props_tabs);

// ── Main canvas — context menu demo ──────────────────────────────────────────

const canvas = mk();
Object.assign(canvas.el.style, {
    position: 'absolute', inset: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '12px',
});

const card = mk();
Object.assign(card.el.style, {
    width: '500px', background: '#fff',
    borderRadius: '12px', boxShadow: '0 4px 32px rgba(0,0,0,.08)',
    padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px',
});

// Demo buttons that trigger the new ux features
const demo_row = mk();
demo_row.el.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';

demo_row.el.appendChild(
    ui.button({ label: 'Toast info', on_click: () => ux.toast('This is an info toast') }).el
);
demo_row.el.appendChild(
    ui.button({ label: 'Toast success', on_click: () => ux.toast('File saved!', { type: 'success' }) }).el
);
demo_row.el.appendChild(
    ui.button({ label: 'Toast error', on_click: () => ux.toast('Connection failed', { type: 'error' }) }).el
);
demo_row.el.appendChild(
    ui.button({ label: 'Toast + Undo', on_click: () => ux.toast('3 items deleted', {
        type: 'warning', duration: 5000,
        action: { label: 'Undo', on_click: () => ux.toast('Undone!', { type: 'success' }) },
    })}).el
);

const modal_row = mk();
modal_row.el.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
modal_row.el.appendChild(
    ui.button({ label: 'Confirm dialog', on_click: async () => {
        const ok = await ux.modal.confirm({ title: 'Delete item?', body: 'This action cannot be undone.', ok: 'Delete', danger: true });
        ux.toast(ok ? 'Deleted!' : 'Cancelled', { type: ok ? 'error' : '' });
    }}).el
);
modal_row.el.appendChild(
    ui.button({ label: 'Alert dialog', on_click: async () => {
        await ux.modal.alert('Your file was saved successfully.', { title: 'Saved' });
    }}).el
);
modal_row.el.appendChild(
    ui.button({ label: 'Prompt dialog', on_click: async () => {
        const name = await ux.modal.prompt('Rename layer:', 'Frame 1');
        if (name !== null) ux.toast(`Renamed to "${name}"`, { type: 'success' });
    }}).el
);

const label = mk('p');
label.el.style.cssText = 'color:#9a9a94;font-size:13px;margin:0;';
label.el.textContent = 'Right-click anywhere on the canvas for context menu. Drag panel edges to resize.';

card.append(demo_row, modal_row, label);
canvas.append(card);
webapp.main.append(canvas);

// Context menu on main area
ux.context_menu.bind(webapp.main.el, () => [
    { label: 'Paste',       icon: 'content_paste', on_click: () => ux.toast('Pasted') },
    'divider',
    { label: 'Select all',  icon: 'select_all',    on_click: () => ux.toast('Selected all') },
    { label: 'Deselect',    icon: 'deselect',      on_click: () => ux.toast('Deselected'), disabled: true },
    'divider',
    { label: 'Zoom in',     icon: 'zoom_in',       on_click: () => ux.toast('Zoomed in'), hint: 'Ctrl+=' },
    { label: 'Zoom out',    icon: 'zoom_out',      on_click: () => ux.toast('Zoomed out'), hint: 'Ctrl+-' },
    { label: 'Reset zoom',  icon: 'zoom_out_map',  on_click: () => ux.toast('Zoom reset'), hint: 'Ctrl+0' },
]);

// ── Status bar ────────────────────────────────────────────────────────────────

webapp.status.add('W 500', 'width');
webapp.status.add('H 400', 'height');
webapp.status.sep();
webapp.status.add('x 0, y 0', 'pos');
webapp.status.sep();
webapp.status.add('100%', 'zoom');
webapp.status.spacer();
webapp.status.add('WebApp1 Demo');

// Track mouse position in status bar
webapp.main.el.addEventListener('mousemove', e => {
    const r = webapp.main.el.getBoundingClientRect();
    webapp.status.set('pos', `x ${Math.round(e.clientX - r.left)}, y ${Math.round(e.clientY - r.top)}`);
});

// ── Mount ─────────────────────────────────────────────────────────────────────

app.$root.append(webapp.root);
