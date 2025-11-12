import { App } from "./core/App/App.js";

console.warn("Using /framework/app.js");

const app = window.app = new App();

export default app;

export * from "./core/App/App.js";