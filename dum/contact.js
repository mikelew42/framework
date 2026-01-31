import { div, el, button } from "/framework/core/View/View.js";

function contact(...args) {
	const view = div.c("dum dum-contact flex column gap", () => {
		el("input").attr("type", "text").attr("placeholder", "Name");
		el("input").attr("type", "email").attr("placeholder", "Email");
		el("textarea").attr("placeholder", "Message").ac("auto");
		button("Send").ac("prim");
	});

	if (args.length) view.append(...args);
	return view;
}

contact.c = function(classes, ...args) {
	return contact(...args).ac(classes);
};

export { contact };
export default contact;
