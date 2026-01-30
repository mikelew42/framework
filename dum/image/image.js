import { View } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "../dum.css");

/**
 * Placeholder image
 * Usage:
 *   image()                    - basic placeholder
 *   image.c("ar-16-9")         - with aspect ratio class
 *   image.c("ar-1 featured")   - multiple classes
 */
function image(...args) {
	return new View()
		.ac("dum dum-img")
		.append(svg())
		.append(...args);
}

image.c = function(classes, ...args) {
	return image(...args).ac(classes);
};

function svg() {
	const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	el.setAttribute("viewBox", "0 0 100 100");
	el.setAttribute("preserveAspectRatio", "none");
	el.innerHTML = `
		<rect width="100" height="100" fill="#ccc"/>
		<line x1="0" y1="0" x2="100" y2="100" stroke="#bbb" stroke-width="0.5"/>
		<line x1="100" y1="0" x2="0" y2="100" stroke="#bbb" stroke-width="0.5"/>
	`;
	return el;
}

export { image };
export default image;
