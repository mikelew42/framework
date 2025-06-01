import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "./App/App.js";

const app = window.app = new App();

// you might not always want to do this (wait for window.load and socket), 
// and if you don't do it here, you probably want to await app.ready once imported.
await app.ready;

export default app;

export { app, View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };