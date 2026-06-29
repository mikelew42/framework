import app, { style } from '/app.js';
import Fal0 from '/framework/ext/Fal/0/Fal0.js';

// Full-bleed layout: workspace fills the viewport
style(`
    html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
    .fal-app   { height: 100vh; overflow: hidden; }
`);

app.$root.ac('fal-app');

// Workspace auto-captures to app.$root; load_data() fires async
new Fal0();
