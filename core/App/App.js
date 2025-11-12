import Base from "../Base/Base.js";
import Events from "../Events/Events.js";
import { el, div, View, h1, h2, h3, p, is, icon } from "../View/View.js";
import Test, { test } from "../Test/Test.js";

// App.stylesheet() in class definitions
// Maybe this should be View.stylesheet()?
// We might not want to import App for all the things...

export default class App {
	constructor(...args){
		Object.assign(this, ...args);
		this.instantiate();
	}

	async instantiate(){ // 4
        // request additional assets first
        this.load();

		// perform pre-render config
		this.config();
        
        // render before requesting the page.js
        this.render();
        
        // await page.js completion before awaiting dynamic this.loaders
        await this.load_page();

        // wait for all the loaders before injecting
        await this.loaded;

        // put the app in the dom
        this.inject();

        // app.ready!
        this.ready.resolve();
    }

	config(){}
	
	load(){
		this.load_framework();
	}
	
	load_framework(){
		this.stylesheet(import.meta, "../../framework.css");
	}

	render(){
		this.$body = View.body();
		this.$app = div.c("app", $app => {
			$app.header = div.c("header", () => {});
			$app.main = div.c("main", (main) => {
				main.left = div.c("left");
				main.bg = div.c("bg", () => {
					this.$root = div.c("root");
					// $app.footer = div.c("footer");
				});
				// main.right = div.c("right");
			});
			// $app.footer = div.c("footer");
		});

		View.set_captor(this.$root);
	}
	
	async load_page(){ // 3
		// "/" -> "/page.js"
		// "/path/" -> "/path/page.js"
		// "/path/sub" -> "/path/sub.page.js"

		const mod = await import(App.path_to_page_url(window.location.pathname));
		
		// the page.js can, but doesn't need to export a default
		this.page = mod.default;
		
		// render the page
		if (this.page){
			this.$root.append(this.page);
			// this.$root is not in the body yet
		}
	}

	inject(){
        this.$body.append(this.$app);
	}

	// loads a predefined font (see Font class below)
	font(name){
		if (!Font.fonts[name])
			throw "Unknown font";

		if (Font.fonts[name].font){
			console.warn("font already loaded");	
			return;
		}

		const font = new Font(Font.fonts[name]);
		const loaded = font.load(); // promise
		this.loaders.push(loaded); // save the promise
		Font.fonts[name].font = font; // cache the font
		return loaded; // allow await app.font(...)
	}

	stylesheet(meta, url){
		return this.constructor.stylesheet(meta, url);
	}

	get ready(){
		if (!this._ready){
			let resolve;
			this._ready = new Promise((res) => {
				resolve = res;
			});
			this._ready.resolve = resolve;
		}
		return this._ready;
	}

	get loaded(){
		return Promise.all(this.constructor.stylesheets.concat(this.loaders));
	}

	/**
	 * App.stylesheet("path/file.css")
	 * or
	 * App.stylesheet(import.meta, "path/file.css")
	 */
	static stylesheet(meta, url){
		if (is.str(meta)){ // stylesheet("/styles.css");
			url = meta;
		} else { // stylesheet(import.meta, "file.css");
			url = new URL(url, meta.url).pathname;
		}

		const prom = new Promise((res, rej) => {
			View.stylesheet(url).on("load", () => {
				res(); // if a stylesheet fails to load, the app won't render?  should probably render an error message
			});
		});
		
		this.stylesheets.push(prom);

		return prom;
	}

	static path_to_page_url(path){
		// "/" -> "/page.js"
		// "/path/" -> "/path/page.js"
		if (path.endsWith("/")){
			return path + "page.js";
		
		// "/sub" -> "/sub.page.js" or
		// "/path/sub" -> "/path/sub.page.js"
		} else {
			return path + ".page.js";
		}
	}
}

App.stylesheets = [];
App.prototype.loaders = [];

class Font extends Base {
	initialize(){
		this.fontface = new FontFace(this.name, `url(${this.url})`, this.options);
	}
	async load(){
		await this.fontface.load();
		document.fonts.add(this.fontface);
	}
}

Font.fonts = {
	Montserrat: {
		name: "Montserrat",
		url: "https://fonts.gstatic.com/s/montserrat/v30/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
		options: {
			weight: '100 900'
		}
	},
	"Material Icons": {
		name: "Material Icons",
		url: "https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
		options: {
			style: "normal",
			weight: "400"
		}
	}
};

// this needs to be import.meta.resolve("framework.css") for it to work on a CDN
// App.stylesheet(import.meta, "../../framework.css");

export { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };
export * from "../View/View.js";