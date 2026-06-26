import app from '/app.js';
import WebEditor1 from './WebEditor1.js';

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

// Hide Lew42 chrome so the editor fills the viewport
app.$header.hide();
app.$sidenav.hide();
if (app.$footer) app.$footer.hide();

const editor = new WebEditor1();
app.$root.append(editor.root);
