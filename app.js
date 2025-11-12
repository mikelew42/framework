import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "./core/App/App.js";

console.warn("Using /framework/app.js");

const app = window.app = new App();

// you might not always want to do this (wait for window.load and socket), 
// and if you don't do it here, you probably want to await app.ready once imported.


export default app;

export * from "./core/App/App.js";