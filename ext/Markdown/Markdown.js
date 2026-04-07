import { View } from "/framework/core/View/View.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export default class Markdown extends View {
	render() {
		if (this.file) {
			this.load_file(this.file);
		} else if (this.content) {
			this.update_content(this.content);
		}
	}

	async load_file(file) {
		try {
			const resp = await fetch(file);
			const text = await resp.text();
			this.update_content(text);
		} catch (e) {
			this.text("Error loading markdown: " + e.message);
		}
	}

	update_content(content) {
		const html = marked.parse(content);
		this.html(html);
	}
}
