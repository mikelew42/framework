import app, { el, div, h1, h2, p, style } from '/app.js';
import ux from '/framework/ux/ux.js';
import ui from '/framework/ui/ui.js';

app.$root.ac('page');
style(`
.page { padding: 32px; }
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 28px;
    margin-bottom: 40px;
}
.demo-card {
    border: 1px solid #ececea; border-radius: 10px;
    padding: 0; overflow: hidden; background: #fff;
}
.demo-card-title {
    font-size: 11px; font-weight: 700; color: #9a9a94;
    text-transform: uppercase; letter-spacing: 0.06em;
    padding: 12px 16px 8px; border-bottom: 1px solid #f4f4f3;
}
.demo-card-body { padding: 12px 16px 16px; }
.demo-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
`);

h1('Framework UX');
p('Higher-level patterns. Import from `/framework/ux/ux.js` or `/app.js`.');

div.c('demo-grid', () => {

    // ── ux.tabs ──────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.tabs()');
        div.c('demo-card-body', () => {
            const tabs = ux.tabs([
                { label: 'Controls', content: (() => {
                    const v = div.c('', () => {
                        div.c('', ui.row('Size',   ui.scrub({ value: 16, min: 1, max: 200 })));
                        div.c('', ui.row('Color',  ui.color({ value: '#5b57d6' })));
                        div.c('', ui.row('Toggle', ui.toggle({ value: true })));
                    });
                    v.el.style.padding = '12px 0 4px';
                    return v;
                })() },
                { label: 'Text', content: (() => {
                    const v = div.c('');
                    v.el.style.cssText = 'padding:12px 0 4px;font-size:13px;color:#6b6b66;';
                    v.el.textContent = 'Each tab renders once and is shown/hidden with CSS.';
                    return v;
                })() },
                { label: 'Empty' },
            ]);
            tabs.el.style.cssText = 'border:1px solid #ececea;border-radius:8px;overflow:hidden;';
            div.c('', tabs);
        });
    });

    // ── ux.accordion ─────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.accordion()');
        div.c('demo-card-body', () => {
            const acc = ux.accordion([
                { label: 'Typography', open: true, content: (() => {
                    const v = div.c('');
                    v.append(
                        ui.row('Size',  ui.scrub({ value: 16, min: 1, max: 200 })),
                        ui.row('Color', ui.color({ value: '#1b1b19' })),
                    );
                    return v;
                })() },
                { label: 'Layout', content: (() => {
                    const v = div.c('');
                    v.append(
                        ui.row('Gap', ui.scrub({ value: 16, min: 0, max: 200 })),
                        ui.row('Pad', ui.scrub({ value: 8,  min: 0, max: 200 })),
                    );
                    return v;
                })() },
                { label: 'Style', content: (() => {
                    const v = div.c('');
                    v.append(
                        ui.row('BG',     ui.color({ value: '#ffffff' })),
                        ui.row('Radius', ui.scrub({ value: 8, min: 0, max: 100 })),
                        ui.row('Shadow', ui.toggle()),
                    );
                    return v;
                })() },
            ]);
            acc.el.style.cssText = 'border:1px solid #ececea;border-radius:8px;overflow:hidden;';
            div.c('', acc);
        });
    });

    // ── ux.toast ─────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.toast()');
        div.c('demo-card-body', () => {
            div.c('demo-row', () => {
                el.c('button', 'ui-btn', 'Default').el.onclick = () => ux.toast('This is a toast message');
                el.c('button', 'ui-btn', 'Success').el.onclick = () => ux.toast('File saved!', { type: 'success' });
                el.c('button', 'ui-btn', 'Error').el.onclick   = () => ux.toast('Upload failed', { type: 'error' });
                el.c('button', 'ui-btn', 'Warning').el.onclick = () => ux.toast('Low disk space', { type: 'warning' });
            });
            div.c('demo-row', () => {
                el.c('button', 'ui-btn', 'With action').el.onclick = () =>
                    ux.toast('3 items deleted', { type: 'warning', duration: 6000,
                        action: { label: 'Undo', on_click: () => ux.toast('Undone!', { type: 'success' }) }
                    });
            });
            el.c('p', '', 'Toasts stack, auto-dismiss, and support an action button.');
            el.c('p', '', '').el.style.cssText = 'font-size:11px;color:#9a9a94;margin:0;';
            el.c('p', '', 'ux.toast(msg, { type, duration, action })').el.style.cssText = 'font-size:11px;font-family:monospace;color:#5b57d6;margin-top:4px;';
        });
    });

    // ── ux.modal ─────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.modal');
        div.c('demo-card-body', () => {
            div.c('demo-row', () => {
                el.c('button', 'ui-btn', 'Confirm').el.onclick = async () => {
                    const ok = await ux.modal.confirm({ title: 'Delete 3 items?', body: 'This cannot be undone.', ok: 'Delete', danger: true });
                    ux.toast(ok ? 'Deleted' : 'Cancelled', { type: ok ? 'error' : '' });
                };
                el.c('button', 'ui-btn', 'Alert').el.onclick = async () => {
                    await ux.modal.alert('Your file was saved.', { title: 'Saved!' });
                };
                el.c('button', 'ui-btn', 'Prompt').el.onclick = async () => {
                    const name = await ux.modal.prompt('Rename to:', 'Untitled');
                    if (name !== null) ux.toast(`"${name}"`, { type: 'success' });
                };
            });
            el.c('p', '', 'All return Promises. Escape / Enter / backdrop click closes.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:4px 0 0;';
        });
    });

    // ── ux.context_menu ───────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.context_menu');
        div.c('demo-card-body', () => {
            const target = div.c('');
            Object.assign(target.el.style, {
                border: '2px dashed #ececea', borderRadius: '8px',
                padding: '20px', textAlign: 'center',
                fontSize: '13px', color: '#9a9a94', cursor: 'context-menu',
                userSelect: 'none',
            });
            target.el.textContent = 'Right-click here';
            ux.context_menu.bind(target.el, () => [
                { label: 'Cut',    icon: 'content_cut',   on_click: () => ux.toast('Cut') },
                { label: 'Copy',   icon: 'content_copy',  on_click: () => ux.toast('Copied') },
                { label: 'Paste',  icon: 'content_paste', on_click: () => ux.toast('Pasted') },
                'divider',
                { label: 'Select all', icon: 'select_all', on_click: () => ux.toast('All selected'), hint: 'Ctrl+A' },
                'divider',
                { label: 'Delete', icon: 'delete', danger: true, on_click: () => ux.toast('Deleted', { type: 'error' }) },
            ]);
            div.c('', target);
        });
    });

    // ── ux.popover ────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.popover()');
        div.c('demo-card-body', () => {
            const placements = ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'right', 'left'];
            div.c('demo-row', () => {
                placements.forEach(pl => {
                    const btn = el.c('button', 'ui-btn', pl);
                    // Lazy-create popover on first use
                    let pop = null;
                    btn.el.addEventListener('click', () => {
                        if (!pop) {
                            const content = document.createElement('div');
                            content.style.cssText = 'padding:4px 0;font-size:13px;min-width:160px;';
                            ['Option A', 'Option B', 'Option C'].forEach(label => {
                                const item = document.createElement('div');
                                item.style.cssText = 'padding:6px 12px;cursor:pointer;border-radius:5px;';
                                item.textContent = label;
                                item.addEventListener('mouseenter', () => item.style.background = '#f4f4f3');
                                item.addEventListener('mouseleave', () => item.style.background = '');
                                item.addEventListener('click', () => { ux.toast(label); pop.close(); });
                                content.appendChild(item);
                            });
                            pop = ux.popover({ trigger: btn.el, content, placement: pl });
                        }
                        pop.toggle();
                    });
                });
            });
            el.c('p', '', 'Each button shows a popover at a different placement.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:8px 0 0;';
        });
    });

    // ── ux.tooltip ───────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.tooltip');
        div.c('demo-card-body', () => {
            div.c('demo-row', () => {
                [
                    { label: 'Top',    placement: 'top'    },
                    { label: 'Bottom', placement: 'bottom' },
                    { label: 'Left',   placement: 'left'   },
                    { label: 'Right',  placement: 'right'  },
                ].forEach(({ label, placement }) => {
                    const btn = el.c('button', 'ui-btn', label);
                    ux.tooltip.bind(btn.el, `Tooltip on ${placement}`, { placement });
                });
            });
            div.c('demo-row', () => {
                const btn = el.c('button', 'ui-btn', 'Long tooltip');
                ux.tooltip.bind(btn.el, 'A longer tooltip that wraps to multiple lines when the content is over 240px wide.', { placement: 'top' });
            });
            el.c('p', '', 'Hover any button. Singleton node — zero DOM overhead per binding.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:8px 0 0;';
        });
    });

    // ── ux.sheet ─────────────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.sheet()');
        div.c('demo-card-body', () => {
            div.c('demo-row', () => {
                ['right', 'left', 'bottom', 'top'].forEach(side => {
                    const body_el = document.createElement('div');
                    body_el.style.cssText = 'padding:20px;font-size:13px;color:#6b6b66;';
                    body_el.textContent = `${side} sheet — click outside or press Escape to close.`;

                    const s = ux.sheet({ content: body_el, side, size: side === 'right' || side === 'left' ? 280 : 220, title: `${side.charAt(0).toUpperCase() + side.slice(1)} Sheet` });
                    const btn = el.c('button', 'ui-btn', side);
                    btn.el.addEventListener('click', () => s.open());
                });
            });
            el.c('p', '', 'Each button opens a sheet from a different side.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:8px 0 0;';
        });
    });

    // ── ux.notification ──────────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.notification');
        div.c('demo-card-body', () => {
            // Mini header to mount the bell in
            const header_wrap = div.c('');
            header_wrap.el.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1b1b19;border-radius:7px;margin-bottom:10px;';
            const lbl = document.createElement('span');
            lbl.style.cssText = 'color:#fff;font-size:12px;flex:1;';
            lbl.textContent = 'My App';
            const bell = ux.notification.bell();
            bell.querySelector('.notif-bell').style.color = '#fff';
            header_wrap.el.append(lbl, bell);

            div.c('demo-row', () => {
                el.c('button', 'ui-btn', 'Info').el.onclick    = () => ux.notification.add({ title: 'Tip', body: 'Hold +/− to repeat.', toast: false });
                el.c('button', 'ui-btn', 'Success').el.onclick = () => ux.notification.add({ title: 'Saved', body: 'file.txt saved.', type: 'success', icon: 'save', toast: false });
                el.c('button', 'ui-btn', 'Error').el.onclick   = () => ux.notification.add({ title: 'Failed', body: 'Upload timed out.', type: 'error', toast: false });
            });
            el.c('p', '', 'Bell shows unread count. Click to open panel.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:6px 0 0;';
        });
    });

    // ── ux.command_palette ───────────────────────────────────────────────────

    div.c('demo-card', () => {
        el.c('div', 'demo-card-title', 'ux.command_palette');
        div.c('demo-card-body', () => {
            // Register a small set of demo commands (page-scoped)
            ux.command_palette.register([
                { label: 'Save',         icon: 'save',         hint: 'Ctrl+S', on_click: () => ux.toast('Saved!', { type: 'success' }) },
                { label: 'Open File',    icon: 'folder_open',  section: 'File', on_click: () => ux.toast('Open file') },
                { label: 'Export PNG',   icon: 'image',        section: 'File', on_click: () => ux.toast('Exported') },
                { label: 'Zoom In',      icon: 'zoom_in',      section: 'View', hint: 'Ctrl+=', on_click: () => ux.toast('Zoomed in') },
                { label: 'Dark Mode',    icon: 'dark_mode',    section: 'View', on_click: () => ux.toast('Dark mode') },
                { label: 'Show Grid',    icon: 'grid_on',      section: 'View', on_click: () => ux.toast('Grid') },
                { label: 'Undo',         icon: 'undo',         hint: 'Ctrl+Z',  on_click: () => ux.toast('Undo') },
                { label: 'Redo',         icon: 'redo',         hint: 'Ctrl+Shift+Z', on_click: () => ux.toast('Redo') },
            ]);
            el.c('button', 'ui-btn', 'Open palette (Ctrl+K)').el.addEventListener('click', () => ux.command_palette.open());
            el.c('p', '', 'Fuzzy match, ↑/↓ to navigate, Enter to run, Escape to close.').el.style.cssText = 'font-size:12px;color:#9a9a94;margin:8px 0 0;';
        });
    });

});
