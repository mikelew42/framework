import app from '/app.js';
import WebEditor1 from '../1/WebEditor1.js';
import WebTree1 from '../1/WebTree1.js';
import FileSaver from '/framework/ext/Saver/FileSaver/FileSaver.js';

const link1 = document.createElement('link');
link1.rel = 'preconnect';
link1.href = 'https://fonts.googleapis.com';
document.head.appendChild(link1);

const link2 = document.createElement('link');
link2.rel = 'preconnect';
link2.href = 'https://fonts.gstatic.com';
link2.crossOrigin = 'anonymous';
document.head.appendChild(link2);

const link3 = document.createElement('link');
link3.rel = 'stylesheet';
link3.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap';
document.head.appendChild(link3);

app.$header.hide();
app.$sidenav.hide();
if (app.$footer) app.$footer.hide();

// Pre-fetch demo data before creating the editor, so we can set it synchronously
// and avoid a race with the v1/save.json load that WebEditor1 starts in super().
const demo_res = await fetch('/framework/ext/WebEditor/demo/demo.json');
const demo_data = demo_res.ok ? await demo_res.json() : null;

const editor = new WebEditor1();

if (demo_data) {
    // Set demo data synchronously while v1/save.json fetch is still in flight.
    // The v1 fetch will resolve after this and call Object.assign on tree.data —
    // but since v1/save.json is an empty tree, it only overwrites 'tree' and 'selected'.
    // We emit('change') via tree.ready.then below, which runs AFTER the v1 load,
    // giving us the last word.
    editor.tree.saver = new FileSaver({ path: '/framework/ext/WebEditor/demo/demo.json' });
    // Chain off the existing tree.ready so we run AFTER the v1 load finishes
    editor.tree.ready = editor.tree.ready.then(() => {
        Object.assign(editor.tree.data, demo_data);
        editor.tree.emit('change');
    });
}

app.$root.append(editor.root);
