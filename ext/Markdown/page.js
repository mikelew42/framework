import app, { section, h1, h2, p, div } from "/app.js";
import md from "./Markdown.js"; // importing also installs View.prototype.md()

app.$root.ac("page markdown-demo");

section.c("hero", () => {
	h1("Markdown");
	p("Key takeaways: importing `Markdown.js` installs `View.prototype.md()` — inline md into any view. The `md()` helper renders block markdown into a captured `div.md`, or fetches a file via `md({ file })`.");
});

section.c("demo-method", () => {
	h2("view.md() — inline, on any element");
	p().md("A `p()` with **bold**, *italic*, and a [link](/framework/).");
	h2().md("A heading with `code` in it");
});

section.c("demo-helper", () => {
	h2("md() helper — you get the element you wrote");
	md("Single paragraph → a real `<p>`, chainable.").ac("note");
	md.c("note", "And `md.c()` — classes first, like `div.c()`.");
	md("### Single heading → a real `<h3>`");
	md("Multiple blocks get wrapped in a `div.md`:\n\n- with a list\n- of items\n\n> and a quote");
});

section.c("demo-file", () => {
	h2("md({ file }) — from a file");
	md({ file: "example.md" });
});
