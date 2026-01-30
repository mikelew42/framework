import app, { div, h1, h2, p } from "/app.js";
import { image } from "./image.js";

app.$root.ac("page");

h1("Placeholder Images");

// h2("Default");
// image();

h2("Aspect Ratios");
div.c("examples flex auto gap-2em", () => {
	div.c("example", () => {
		p("default");
		image();
	});	
	div.c("example", () => {
		p("ar-1 (square)");
		image.c("ar-1");
	});
	
	div.c("example", () => {
		p("ar-16-9");
		image.c("ar-16-9");
	});
	
	div.c("example", () => {
		p("ar-4-3");
		image.c("ar-4-3");
	});
	
	div.c("example", () => {
		p("ar-21-9 (ultrawide)");
		image.c("ar-21-9");
	});
});

h2("Fixed Width");
image().attr("width", "200");
