import { View, div } from "/framework/core/View/View.js";
import "/framework/ext/Lorem/Lorem.js"; // adds .filler() to View.prototype
import { image } from "./image/image.js";
import { contact } from "./contact.js";

// Default filler amounts per tag
const fill_map = {
	h1: "2-4w",
	h2: "3-6w",
	h3: "3-5w",
	h4: "2-4w",
	p: "2-4s",
	button: "1-2w",
	a: "1-2w",
	span: "1-2w",
	li: "3-6w"
};

function fill(view) {
	const tag = view.tag || view.el?.tagName?.toLowerCase();
	const amount = fill_map[tag];
	if (amount) view.filler(amount);
	return view;
}

function dum(...args) {
	return div.c("dum", dum => {
		for (const view of args) {
			dum.append(fill(view));
		}
	});
}

dum.image = image;
dum.contact = contact;

dum.c = function(classes, ...args) {
	return dum(...args).ac(classes);
};

export { dum, fill, fill_map };
export default dum;
