import app, { el, div, h1, test, assert, util } from "/app.js";

import ListComponent from "/framework/ext/List/Component/ListComponent.js";
import FileComponent from "/framework/ext/Component/File/FileComponent.js";

FileComponent.types.push(ListComponent);

div.c("page", () => {
	h1("ListComponent");

	test("1", async t => {
		const fcomp = window.fcomp = new FileComponent({
			name: "test"
		});

		const lcomp = new ListComponent({
			name: "list"
		});

		
		await fcomp.ready;
		fcomp.set("list", lcomp);
		lcomp.add("something");
		// t.assert(fcomp.get("list") === lcomp);
		// debugger;
	});
});