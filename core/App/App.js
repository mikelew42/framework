import Events from "../Events/Events.js";
import { el, div, View, h1, h2, h3, p, is, icon, pre, a } from "../View/View.js";
import Test, { test } from "../Test/Test.js";

// this needs to load immediately, so the layers are properly defined
View.stylesheet(import.meta, "../../framework.css");

export default class App {

	constructor(...args) {
		this.loaders = [];
		this.assign(...args);
		this.instantiate();
	}

	async instantiate() {
		this.config();
		await this.load();
		this.initialize();
	}

	// initial setup, requests, render app
	config() {
		this.config_framework();

		// render *before* loading the page
		this.render();
	}

	// request and await the page, and then all the loaders
	async load() {
		// wait until page module has finished
		await this.load_page();

		// page module can add additional loaders
		await this.loaded;
	}

	initialize() {
		// put the app in the dom
		this.inject();

		// app.ready!
		this.ready.resolve();
	}

	config_framework() {
		// I think this should be done immediately (see above)
		// this.stylesheet(import.meta, "../../framework.css");
	}

	assign(...args) {
		return Object.assign(this, ...args);
	}

	render() {
		this.$body = View.body();
		this.$app = div.c("app", $app => {
			$app.header = div.c("header", () => { });
			$app.main = div.c("main", (main) => {
				main.left = div.c("left");
				main.background = div.c("background", () => {
					this.$root = div.c("root");
					// $app.footer = div.c("footer");
				});
				// main.right = div.c("right");
			});
			// $app.footer = div.c("footer");
		});

		View.set_captor(this.$root);
	}

	async load_page() { // 3
		// "/" -> "/page.js"
		// "/path/" -> "/path/page.js"
		// "/path/sub" -> "/path/sub.page.js"

		try {
			const mod = await import(App.path_to_page_url(window.location.pathname));

			// the page.js can, but doesn't need to export a default
			this.page = mod.default;

			// render the page
			if (this.page) {
				this.$root.append(this.page);
				// this.$root is not in the body yet
			}
		} catch (error) {
			// this runs on any page error...
			this.$root.append(() => {
				h1("Page Load Error");
				pre.c("error", error.message);
				console.error(error);
			});
		}
	}

	inject() {
		this.$body.append(this.$app);
	}

	// loads a predefined font (see Font class below)
	font(name) {
		if (!Font.fonts[name])
			throw "Unknown font";

		if (Font.fonts[name].font) {
			console.warn("font already loaded");
			return;
		}

		const font = new Font(Font.fonts[name]);
		const loaded = font.load(); // promise
		this.loaders.push(loaded); // save the promise
		Font.fonts[name].font = font; // cache the font
		return loaded; // allow await app.font(...)
	}

	stylesheet(meta, url) {
		return View.stylesheet(meta, url);
	}

	get ready() {
		if (!this._ready) {
			let resolve;
			this._ready = new Promise((res) => {
				resolve = res;
			});
			this._ready.resolve = resolve;
		}
		return this._ready;
	}

	get loaded() {
		return Promise.all(View.stylesheets.concat(this.loaders));
	}

	static stylesheet(meta, url) {
		return View.stylesheet(meta, url);
	}

	static path_to_page_url(path) {
		// "/" -> "/page.js"
		// "/path/" -> "/path/page.js"
		if (path.endsWith("/")) {
			return path + "page.js";

			// "/sub" -> "/sub.page.js" or
			// "/path/sub" -> "/path/sub.page.js"
		} else {
			return path + ".page.js";
		}
	}

	static meta_to_url(meta, url) {
		return new URL(url, meta.url).href;
	}
}

class Font {
	constructor(...args) {
		Object.assign(this, ...args);
		this.fontface = new FontFace(this.name, `url(${this.url})`, this.options);
	}
	async load() {
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

export { Events, App, Test, test };
export * from "../View/View.js";