import { View, is } from "/framework/core/View/View.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// tags that can hold block-level children — these get the full marked.parse()
// (which wraps paragraphs in <p>). Everything else (p, h1, span, li...) gets
// parseInline(), so p().md("**hi**") doesn't nest a <p> inside a <p>.
const block_tags = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "BLOCKQUOTE", "BODY", "FIGURE", "DETAILS", "TD"]);

// View addon: p().md("Some **md**"), div().md("# Full\n\ndocument")
View.prototype.md = function(content){
	const parse = block_tags.has(this.el.tagName) ? marked.parse : marked.parseInline;
	return this.html(parse(content));
};

// md("Hi.")                      → a real <p>, chainable: md("Hi.").ac("note")
// md("# Title")                  → a real <h1> — you get the element you wrote
// md("Multi\n\nblock")           → captured <div class="md"> wrapping the blocks
// md({ file: "example.md" })     → fetches the file, then parses into a div.md
export default function md(content){
	if (is.obj(content) && content.file){
		const view = new View().ac("md");
		fetch(content.file)
			.then(resp => resp.text())
			.then(text => view.html(marked.parse(text)))
			.catch(e => view.text("Error loading markdown: " + e.message));
		return view;
	}

	const html = marked.parse(content).trim();
	const template = document.createElement("template");
	template.innerHTML = html;

	// single root block → adopt its element directly (View captures it as usual)
	if (template.content.children.length === 1){
		return new View({ el: template.content.firstElementChild });
	}

	// multiple blocks → wrap in a div.md
	return new View().ac("md").html(html);
}

// md.c("note", "Some **md**") — classes first, like div.c() / p.c()
md.c = function(classes, content){
	return md(content).ac(classes);
};

export { marked };
