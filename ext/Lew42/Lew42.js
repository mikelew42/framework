import { App, div, el, View, icon, code } from "../../core/App/App.js";

import Socket from "../Socket/Socket.js";
import Directory from "../Directory/Directory.js";

import "../Lorem/Lorem.js";

export default class Lew42 extends App {
    config(){
        this.assign(this.settings);

        this.config_framework();
        this.config_base();
        this.config_favicon();

        this.font("Montserrat");
        this.font("Material Icons");
        this.stylesheet(import.meta, "Lew42.css");

        this.instantiate_directory();
        this.instantiate_socket();

        this.render();
    }

    config_favicon(){
        el("link").attr("rel", "icon").attr("type", "image/png")
            .attr("href", App.meta_to_url(import.meta, "favicon.png"))
            .prepend_to(document.head);
    }

    config_base(){
        if (this.base){
            this.base = "/" + this.base + "/";
        } else {
            this.base = "/";
        }
    }

    instantiate_socket(){
        // what if the socket fails to ready? the page won't inject...
        if (window.location.hostname == "localhost"){
            this.socket = Socket.singleton();
            this.loaders.push(this.socket.ready);
        }
    }
    
    instantiate_directory() {
        this.directory = new Directory({ app: this });
        this.loaders.push(this.directory.ready);
    }

    initialize_navstate(){
        this.navstate = JSON.parse(localStorage.getItem("navstate"));

        if (this.navstate === null){
            this.navstate = true;
            localStorage.setItem("navstate", "true");
            console.log("navstate was null, now = true");
        }

        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '\\') {
                e.preventDefault();
                e.stopPropagation();
                this.navstate = !this.navstate;
                localStorage.setItem("navstate", JSON.stringify(this.navstate));
                this.$header.toggle();
                this.$sidenav.toggle();
                this?.$footer.toggle();
            }
        });

        if (this.navstate === false){
            this.$header.hide();
            this.$sidenav.hide();
            this?.$footer.toggle();
            console.log("navstate === false");
        }
    }

    render(){
        this.$body = View.body();
        this.$app = div.c("app", $app => {
            $app.header = this.header();
            $app.main = div.c("main", (main) => {
                main.left = div.c("left shadow", this.sidenav());
                main.background = div.c("background", () => {
                    this.$root = div.c("root");
                    $app.footer = this.footer();
                });
                // main.right = div.c("right");
            });
            // $app.footer = div.c("footer");
        });

        this.initialize_navstate();
        View.set_captor(this.$root);
    }

    logo(){
        return el("a", 
            el.c("img", "logo-img").attr("src", App.meta_to_url(import.meta, "mlogo.png"))
        ).attr("href", "/");
    }

    header(){
        return this.$header = div.c("header shadow", {
            logo: this.logo(),
            breadcrumbs: this.breadcrumbs(),
            btns: div(() => {
                icon("menu").ac("menu");
                icon("close").ac("close");
            }).click(() => {
                View.body().tc("menu-open");
            })
        });
    }

    footer(){
        return this.$footer = div.c("footer bg flex", {
            logo: this.logo(),
        });
    }

    checkbox(){
        return div.c("checkbox").html(`<svg width="31" height="25" viewBox="0 0 31 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.07812 13.4771L10.0525 21.4514L29.2032 2.30078" stroke="white" stroke-width="3.9293"/>
            </svg>`);
    }

    checklist(...args){
        return div.c("checklist", checklist => {
            for (const arg of args){
                div.c("checklist-item", {
                    checkbox: this.checkbox(),
                    bar: div(arg)
                });
            }
        });
    }

    breadcrumbs(){
        const parts = window.location.pathname.split('/').filter(Boolean);
        let path = "/";

        return div.c("breadcrumbs", () => {
            parts.forEach((part, i) => {
                path += part;

                // /no/trailing slash?
                if ( (i < (parts.length - 1)) || window.location.pathname.endsWith("/") )
                    path += "/";

                div.c("crumb" + (i === (parts.length - 1) ? " active-node" : ""), el("a", part).attr("href", path) );
            });
        });

    }

    sidenav(){
        return this.$sidenav = div.c("sidenav", () => {
            this.directory.render();
        });
    }
}

export * from "../../core/App/App.js";