import app, { el, div, style } from '/app.js';
import ui from '/framework/ui/ui.js';
import { workspace } from '/framework/ext/Workspace/0/Workspace0.js';
import { panel } from '/framework/ext/Workspace/0/Panel0.js';
import { card } from '/framework/ext/Workspace/0/Card0.js';

// ── Fullscreen layout ─────────────────────────────────────────────
style(`
    html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }

    .ws-app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    /* workspace override: no fixed height, just fill remaining */
    .ws-app .workspace { flex: 1; height: auto; min-height: 0; }

    /* Header */
    .ws-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 1em; height: 2.5em; flex-shrink: 0;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        background: #fff; font-size: 0.9em;
    }
    .ws-header-left  { display: flex; align-items: center; gap: 1.5em; }
    .ws-logo         { font-weight: 700; color: #5b57d6; letter-spacing: -0.01em; }
    .ws-menu         { display: flex; gap: 1em; color: #6b6b66; }
    .ws-menu span    { cursor: pointer; }
    .ws-menu span:hover { color: #1b1b19; }
    .ws-title        { font-weight: 500; color: #1b1b19; }
    .ws-header-right { display: flex; align-items: center; gap: 0.5em; }

    /* Canvas card body fills the card */
    .canvas-area {
        flex: 1; display: flex; align-items: center; justify-content: center;
        background: #f0f0ee; border-radius: 6px;
        color: #b0b0a8; font-size: 0.85em; min-height: 0;
    }

    /* Toolbar */
    .toolbar-row { display: flex; align-items: center; gap: 0.75em; }
`);

app.$root.ac('ws-app');

// ── Header ────────────────────────────────────────────────────────
div.c('ws-header', () => {
    div.c('ws-header-left', () => {
        div.c('ws-logo', 'frozen-helix');
        div.c('ws-menu', () => {
            el('span', 'File');
            el('span', 'Edit');
            el('span', 'View');
            el('span', 'Help');
        });
    });
    div.c('ws-title', 'Untitled Project');
    const right = div.c('ws-header-right');
    right.append(
        ui.button({ label: 'Preview', variant: 'ghost' }),
        ui.button({ label: 'Publish', variant: 'primary' }),
    );
});

// ── Workspace ─────────────────────────────────────────────────────
workspace(() => {

    // ── Left: Layers panel ──────────────────────────────────────
    panel({ title: 'Layers', width_mode: 'fixed', width: 14 }, () => {

        card({ title: 'Pages', content: () => {
            const list = div.c('page-list');
            ['Home', 'About', 'Portfolio', 'Contact'].forEach((label, i) => {
                list.append(ui.item({ icon: 'description', label, active: i === 0 }));
            });
        }});

        card({ title: 'Layers', content: () => {
            const list = div.c('layer-list');
            list.append(
                ui.item({ icon: 'layers',        label: 'Header',   hint: '3' }),
                ui.item({ icon: 'layers',        label: 'Hero',     hint: '5' }),
                ui.item({ icon: 'layers',        label: 'Features', hint: '12' }),
                ui.item({ icon: 'layers',        label: 'Footer',   hint: '4' }),
            );
        }});

        card({ title: 'Assets', content: () => {
            const list = div.c('asset-list');
            list.append(
                ui.item({ icon: 'image',          label: 'Images', hint: '12' }),
                ui.item({ icon: 'font_download',  label: 'Fonts',  hint: '3'  }),
                ui.item({ icon: 'palette',        label: 'Colors', hint: '8'  }),
                ui.item({ icon: 'animation',      label: 'Icons',  hint: '24' }),
            );
        }});

    });

    // ── Center: Canvas panel ─────────────────────────────────────
    panel({ title: 'Canvas', width_mode: 'fill' }, () => {

        card({ content: () => {
            const toolbar = div.c('toolbar-row');
            toolbar.append(
                ui.toggle_group({ value: 'select', options: [
                    { value: 'select', icon: 'near_me',    title: 'Select (V)' },
                    { value: 'hand',   icon: 'pan_tool',   title: 'Pan (H)'    },
                    { value: 'rect',   icon: 'crop_square',title: 'Rect (R)'   },
                    { value: 'text',   icon: 'title',      title: 'Text (T)'   },
                    { value: 'pen',    icon: 'edit',       title: 'Pen (P)'    },
                ]}),
                ui.divider(),
                ui.badge('100%', 'neutral'),
                ui.badge('Saved', 'success'),
            );
        }});

        card({ height_mode: 'fill', content: () => {
            div.c('canvas-area', 'Drop elements here');
        }});

    });

    // ── Right: Properties panel ──────────────────────────────────
    panel({ title: 'Properties', width_mode: 'fixed', width: 16 }, () => {

        card({ title: 'Transform', content: () => {
            const root = div.c('props');
            root.append(
                ui.section('Position',
                    ui.row('X', ui.scrub({ value: 120, step: 1 })),
                    ui.row('Y', ui.scrub({ value: 80,  step: 1 })),
                ),
                ui.section('Size',
                    ui.row('W', ui.scrub({ value: 320, step: 1 })),
                    ui.row('H', ui.scrub({ value: 180, step: 1 })),
                ),
            );
        }});

        card({ title: 'Fill & Stroke', content: () => {
            const root = div.c('props');
            root.append(
                ui.section('Fill',
                    ui.row('Color',   ui.color({ value: '#5b57d6' })),
                    ui.row('Opacity', ui.slider({ value: 100, min: 0, max: 100 })),
                ),
                ui.section('Border',
                    ui.row('Color', ui.color({ value: '#3e3ab0' })),
                    ui.row('Width', ui.scrub({ value: 1, min: 0, step: 0.5, decimals: 1 })),
                ),
            );
        }});

        card({ title: 'Typography', content: () => {
            const root = div.c('props');
            root.append(
                ui.section('',
                    ui.row('Font',   ui.combobox({ value: 'Inter', options: ['Inter', 'Roboto', 'Georgia', 'Helvetica', 'Courier'] })),
                    ui.row('Size',   ui.scrub({ value: 16, min: 6, max: 200, step: 1 })),
                    ui.row('Line',   ui.scrub({ value: 1.4, min: 0.5, max: 4, step: 0.1, decimals: 1 })),
                    ui.row('Align',  ui.toggle_group({ value: 'left', options: [
                        { value: 'left',   icon: 'format_align_left',   title: 'Left'   },
                        { value: 'center', icon: 'format_align_center', title: 'Center' },
                        { value: 'right',  icon: 'format_align_right',  title: 'Right'  },
                    ]})),
                ),
            );
        }});

        card({ title: 'Settings', content: () => {
            const root = div.c('props');
            root.append(
                ui.section('Display',
                    ui.row('Snap',   ui.toggle({ value: true  })),
                    ui.row('Grid',   ui.toggle({ value: false })),
                    ui.row('Rulers', ui.toggle({ value: true  })),
                ),
                ui.divider(),
                ui.section('Export',
                    ui.row('Format', ui.select({ value: 'svg', options: ['svg', 'png', 'pdf'] })),
                    ui.row('Scale',  ui.toggle_group({ value: '1x', options: ['1x', '2x', '3x'] })),
                ),
            );
        }});

    });

});
