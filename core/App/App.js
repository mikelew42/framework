import Base from "../Base/Base.js";
import Events from "../Events/Events.js";
import { el, div, View, h1, h2, h3, p, is, icon } from "../View/View.js";
import Test, { test } from "../Test/Test.js";

// App.stylesheet() in class definitions
// Maybe this should be View.stylesheet()?
// We might not want to import App for all the things...

export default class App extends Base {

	async instantiate(...args){
		this.assign(...args);
		this.initialize_app(); // 1
	}
	
	async initialize_app(){ // 1
		this.initialize_root(); // 2
		this.initialize_page(); // 3
		this.initialize(); // 4
		await this.ready;
		this.inject(); // 6
	}

	initialize_root(){ // 2
		this.$body = View.body();
		this.$root = div().attr("id", "root"); //.append_to(this.$body);
		View.set_captor(this.$root);
	}
	
	async initialize_page(){ // 3
		// "/" -> "/home.page.js"
		// "/path/" -> "/path/page.js"
		// "/path/sub" -> "/path/sub.page.js"
		const mod = await import(App.path_to_page_url(window.location.pathname));
		
		// after page is requested, we initialize the app
		// this requests all the styles+fonts+sockets+files
		// in the imported page, we (probably) import the app, which has a delayed export when its ready
		// by this point in this method, we must be ready?
		
		// the page.js can, but doesn't need to export a default
		this.page = mod.default;
		
		// render the page
		if (this.page){
			this.$root.append(this.page);
			// this.$root is not in the body yet
		}
	}

	initialize(){ // 4
		this.render();
	}
	
	render(){}

	inject(){ // 6
        // inject root into body
        this.$body.append(this.$root);
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

	get ready() {
		return Promise.all(this.constructor.stylesheets.concat(this.loaders))
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
				res();
			});
		});
		
		this.stylesheets.push(prom);

		return prom;
	}

	static path_to_page_url(path){
		// "/" -> "/home.page.js"
		if (path === "/"){
			return "/home.page.js";

		// "/path/" -> "/path/page.js"
		} else if (path.endsWith("/")){
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

App.stylesheet("/framework/framework.css");

export { View, Base, Events, App, el, div, h1, h2, h3, p, is, icon, Test, test };