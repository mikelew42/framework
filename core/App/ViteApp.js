import { App } from "./App.js";
import { h1, pre } from "../View/View.js";

export class ViteApp extends App {
	constructor(options = {}) {
		super(options);
	}

	async load_page() {
		try {
			const pageUrl = App.path_to_page_url(window.location.pathname);
			// map e.g. "/page.js" to "/src/pages/page.js" or "/src/page.js"
			// check for raw path first (favors /framework or root paths), otherwise default to /src prefix
			const globKey = this.pages?.[pageUrl] ? pageUrl : `/src${pageUrl}`;
			const loader = this.pages?.[globKey];

			if (!loader) {
				this.$root.append(() => {
					h1("404 — Page Not Found");
					pre.c("error", `Could not find page for ${window.location.pathname}\nLooked for module: ${globKey} in provided pages.`);
				});
				return;
			}

			const mod = await loader();

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
}
