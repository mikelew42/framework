// WebApp0 demo — 3-panel shell with all ui controls
import app from '/app.js';
import ui from '/framework/ui/ui.js';
import ux from '/framework/ux/ux.js';
import WebApp0 from './WebApp0.js';
import View, { div } from '/framework/core/View/View.js';

// Hide framework chrome so WebApp fills the viewport
app.$header.hide();
app.$sidenav.hide();
if (app.$footer) app.$footer.hide();

// Helper: bare View div without captor
function mk(cls = '') {
    const v = new View({ capture: false });
    if (cls) v.ac(cls);
    return v;
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const webapp = new WebApp0({
    icon:        'widgets',
    title:       'WebApp',
    left_width:  260,
    right_width: 280,
});

// ── Header ─────────────────────────────────────────────────────────────────────

webapp.header.el.insertBefore(
    webapp.btn('undo', 'Undo'),
    webapp.header.el.querySelector('.wa-spacer'),
);
webapp.header.el.insertBefore(
    webapp.btn('redo', 'Redo'),
    webapp.header.el.querySelector('.wa-spacer'),
);

const status = document.createElement('span');
status.style.cssText = 'font-size:12px;color:#9a9a94;';
status.textContent = 'Ready';

const save_btn = ui.button({ label: 'Save', variant: 'primary', on_click: () => {
    status.textContent = 'Saved ✓';
    setTimeout(() => { status.textContent = 'Ready'; }, 1500);
}});

webapp.header_right.el.appendChild(status);
webapp.header_right.append(save_btn);

// ── Left sidebar — tabbed: Tools | Layers ────────────────────────────────────

const tools_panel = mk();
tools_panel.el.style.cssText = 'overflow-y: auto; flex: 1;';
tools_panel.append(
    ui.section('Shapes',
        ui.item({ icon: 'crop_square',           label: 'Frame',   hint: 'F',
                  draggable: true, drag_type: 'wa-kind', drag_data: 'frame' }),
        ui.item({ icon: 'radio_button_unchecked', label: 'Circle',  hint: 'O',
                  draggable: true, drag_type: 'wa-kind', drag_data: 'circle' }),
    ),
    ui.divider(),
    ui.section('Text',
        ui.item({ icon: 'title',       label: 'Heading', hint: 'H' }),
        ui.item({ icon: 'text_fields', label: 'Text',    hint: 'T' }),
    ),
    ui.divider(),
    ui.section('Media',
        ui.item({ icon: 'image',           label: 'Image'   }),
        ui.item({ icon: 'horizontal_rule', label: 'Divider' }),
        ui.item({ icon: 'smart_button',    label: 'Button'  }),
    ),
);

const layers_panel = mk();
layers_panel.el.style.cssText = 'padding: 12px; color: #9a9a94; font-size: 13px; flex: 1;';
layers_panel.el.textContent = 'No layers yet.';

const sidebar_tabs = ux.tabs([
    { label: 'Tools',  content: tools_panel },
    { label: 'Layers', content: layers_panel },
]);
sidebar_tabs.el.style.height = '100%';
webapp.left.append(sidebar_tabs);

// ── Right sidebar — properties ─────────────────────────────────────────────────

// Demo every control type
webapp.right.append(
    ui.section('Typography',
        ui.row('Size',    ui.scrub({ value: 16, min: 1, max: 200 })),
        ui.row('Weight',  ui.select({ value: '400', options: [
            '100', '200', '300', '400', '500', '600', '700', '800', '900',
        ]})),
        ui.row('Color',   ui.color({ value: '#1b1b19' })),
        ui.row('Leading', ui.slider({ value: 140, min: 80, max: 300, step: 5 })),
    ),

    ui.section('Layout',
        ui.row('Dir',
            ui.button({ label: 'Row', variant: '' }),
            ui.button({ label: 'Col', variant: '' }),
        ),
        ui.row('Gap',  ui.scrub({ value: 16, min: 0, max: 200 })),
        ui.row('Pad',  ui.scrub({ value: 16, min: 0, max: 200 })),
    ),

    ui.section('Style',
        ui.row('BG',      ui.color({ value: '#ffffff' })),
        ui.row('Radius',  ui.scrub({ value: 8, min: 0, max: 100 })),
        ui.row('Shadow',  ui.toggle({ value: false })),
        ui.row('Opacity', ui.slider({ value: 100, min: 0, max: 100 })),
    ),

    ui.section('All Controls',
        ui.row('Input',   ui.input({ placeholder: 'Type here…' })),
        ui.row('Area',    ui.textarea({ placeholder: 'Multi-line…' })),
        ui.row('Check',   ui.checkbox({ label: 'Enabled', value: true })),
        ui.row('Toggle',  ui.toggle({ value: true })),
        ui.row('Scrub',   ui.scrub({ value: 42, min: 0, max: 100, step: 0.5, decimals: 1 })),
        ui.row('Select',  ui.select({ value: 'sans-serif', options: [
            { value: 'inherit',    label: 'Default' },
            { value: 'sans-serif', label: 'Sans-serif' },
            { value: 'serif',      label: 'Serif' },
            { value: 'monospace',  label: 'Mono' },
        ]})),
        ui.row('Buttons',
            ui.button({ label: 'Cancel' }),
            ui.button({ label: 'Apply', variant: 'primary' }),
        ),
    ),
);

// ── Main canvas ───────────────────────────────────────────────────────────────

const canvas = mk();
Object.assign(canvas.el.style, {
    width: '600px', height: '400px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    color: '#9a9a94',
    flexDirection: 'column',
    gap: '8px',
});
canvas.el.innerHTML = `
    <span class="material-icons" style="font-size:40px;opacity:0.3">layers</span>
    <span>Drop elements here</span>
`;
webapp.main.el.appendChild(canvas.el);

// ── Mount ─────────────────────────────────────────────────────────────────────

app.$root.append(webapp.root);
