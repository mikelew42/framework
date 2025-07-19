import { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test } from "./core/App/App.js";
import Socket from "./ext/Socket/Socket.js";
import Directory from "./ext/Directory/Directory.js";

View.stylesheet("/framework/framework.css");

const app = window.app = new App({
    initialize(){
		this.initialize_google_icon_font();
        this.initialize_socket();
        this.initialize_directory();
		this.initialize_ready();
	},

    initialize_directory() {
        this.directory = new Directory({
            app: this,
            url: "/framework/directory.json",
            ignore: ["framework.page.js"]
        });
    },

    initialize_socket(){
        if (window.location.hostname == "localhost"){
            this.socket = new Socket();
        } else {
            this.socket = { ready: Promise.resolve() };
        }
    },

    initialize_ready(){
		this.ready = Promise.all([
            this.socket.ready, 
            new Promise(resolve => {
                if (document.readyState === "complete"){
                    this.initialize_body();
                    resolve(this);
                } else {
                    window.addEventListener("load", () => {
                        // console.log("window.load");
                        this.initialize_body();
                        resolve(this);
                    });
                }
		})]);
	},

    initialize_body(){
		this.$body = View.body().init().ac("page-framework");
	},
    
	initialize_google_icon_font(){
		View.stylesheet("https://fonts.googleapis.com/icon?family=Material+Icons");
	},

    sidenav(){
        const app = this;

        const title = window.location.pathname.length > 1 ? window.location.pathname : "Lew42.com";
        
        var navstate = JSON.parse(localStorage.getItem("navstate"));

        if (navstate === null){
            navstate = true;
            localStorage.setItem("navstate", "true");
        }

        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '\\') {
                localStorage.setItem("navstate", JSON.stringify(!navstate));
                app.$sidenav.toggle();
            }
        });
        this.$sidenav = div.c("sidenav", {
            logobar: div({
                logo: el.c("img", "logo").attr("src", "/assets/img/mlogo.png").click(() => {
                    window.location = "/";
                }),
                title: div(title).click(() => window.location = "/framework/"),
                // close: icon("close").click(() => {
                //     this.$sidenav.remove();
                //     this.$sidenav = null;
                // })
            }),
            content: () =>{
                this.directory.render();
            }
        });

        if (navstate === false){
            this.$sidenav.hide();
        }

        return this.$sidenav;
    }
});

// you might not always want to do this (wait for window.load and socket), 
// and if you don't do it here, you probably want to await app.ready once imported.
await app.ready;

export default app;

export { app, View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };