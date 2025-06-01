import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "/framework/App/App.js";
import Socket from "./Socket/Socket.js";

const app = window.app = new App({
    initialize(){
		this.initialize_google_icon_font();
		this.initialize_ready();
        this.initialize_socket();
	},

    // initialize_router() {}

    initialize_socket(){
        if (window.location.hostname == "localhost"){
            this.socket = new Socket();
            this.ready = Promise.all([this.ready, this.socket.ready]);
        }
    },
    
	initialize_google_icon_font(){
		View.stylesheet("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0");
	}
});

// you might not always want to do this (wait for window.load and socket), 
// and if you don't do it here, you probably want to await app.ready once imported.
await app.ready;

export default app;

export { app, View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };