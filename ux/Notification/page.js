import app, { el, div, h1, p, style } from '/app.js';
import { ux, ui } from '/app.js';

app.$root.ac('page');
style(`
.page { padding: 32px; max-width: 600px; display: flex; flex-direction: column; gap: 32px; }
.demo-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
`);

h1('Notification');
p('Notification center with bell button, unread badge, and panel popover.');

div.c('', () => {
    el.c('h2', '').el.textContent = 'Bell button (click to open panel)';
    el.c('p', '').el.style.cssText = 'font-size:13px;color:#6b6b66;margin:4px 0 12px;';
    el.c('p', '').el.textContent = 'The bell button goes in your app header. It shows an unread count badge and opens a panel when clicked.';

    // Wrap the bell in a styled container
    const wrap = div.c('');
    wrap.el.style.cssText = 'display:inline-flex;align-items:center;gap:12px;padding:10px 14px;background:#1b1b19;border-radius:10px;';

    const title = document.createElement('span');
    title.style.cssText = 'color:#fff;font-size:13px;font-weight:500;';
    title.textContent = 'My App';

    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    spacer.style.minWidth = '120px';

    const bell = ux.notification.bell();
    // Override bell icon color for dark header
    bell.querySelector('.notif-bell').style.color = '#fff';

    wrap.el.append(title, spacer, bell);
});

div.c('', () => {
    el.c('h2', '').el.textContent = 'Fire notifications';

    div.c('demo-row', () => {
        el.c('button', 'ui-btn', 'Info').el.onclick = () =>
            ux.notification.add({ title: 'Tip', body: 'Drag panel edges to resize.' });

        el.c('button', 'ui-btn', 'Success').el.onclick = () =>
            ux.notification.add({ title: 'File saved', body: 'document.txt was saved.', type: 'success', icon: 'save' });

        el.c('button', 'ui-btn', 'Warning').el.onclick = () =>
            ux.notification.add({ title: 'Low disk space', body: '2GB remaining on drive.', type: 'warning', icon: 'warning' });

        el.c('button', 'ui-btn', 'Error').el.onclick = () =>
            ux.notification.add({ title: 'Upload failed', body: 'Connection timed out.', type: 'error', icon: 'cloud_off' });

        el.c('button', 'ui-btn', 'Silent').el.onclick = () =>
            ux.notification.add({ title: 'Background sync', body: 'Synced 3 files.', type: 'success', toast: false });
    });

    el.c('p', '').el.style.cssText = 'font-size:12px;color:#9a9a94;margin-top:8px;';
    el.c('p', '').el.textContent = '"Silent" adds to panel without showing a toast. Click the bell above to see all notifications.';
});

div.c('', () => {
    el.c('h2', '').el.textContent = 'API';
    const pre = el.c('pre', '');
    pre.el.style.cssText = 'font-size:11.5px;font-family:monospace;color:#1b1b19;line-height:1.7;margin:0;white-space:pre-wrap;background:#f4f4f3;border:1px solid #ececea;border-radius:8px;padding:14px 16px;';
    pre.el.textContent = `// Mount bell in your header
header.appendChild(ux.notification.bell());

// Add notifications
ux.notification.add({
    title:    'File saved',
    body:     'document.txt saved successfully.',
    type:     'success',   // '' | 'success' | 'error' | 'warning'
    icon:     'save',      // Material Icons name
    toast:    true,        // also fire a Toast (default true)
    on_click: () => {},    // optional click handler
});

ux.notification.unread_count();   // → number of unread
ux.notification.clear();          // remove all`;
});
