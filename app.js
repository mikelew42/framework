import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "/framework/App/App.js";
import Socket from "./Socket/Socket.js";

const app = window.app = new App();

if (window.location.hostname == "localhost"){
    const socket = new Socket();
    app.ready = Promise.all([app.ready, socket.ready]);
}

await app.ready;

export default app;

export { app, View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };