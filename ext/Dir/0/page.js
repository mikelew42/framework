import app, { div, h1, p, test, assert } from "/app.js";
import Dir0 from "./Dir0.js";

app.$root.ac("page");

h1("Dir0");
test("test1 - `name: test1`",  async t => {
	const d1 = new Dir0({ name: "test1" });
	assert(d1.url === "http://localhost/framework/ext/Dir/0/test1");
	assert(d1.full === "/framework/ext/Dir/0/test1");
	await d1.ready;
	d1.sub = d1.dir("sub");
	t.assert(d1.sub.url === "http://localhost/framework/ext/Dir/0/test1/sub");
	t.assert(d1.sub.full === "/framework/ext/Dir/0/test1/sub");
	d1.filext = d1.file("file.ext");
	t.assert(d1.filext.url === "http://localhost/framework/ext/Dir/0/test1/file.ext")
	t.assert(d1.filext.full === "/framework/ext/Dir/0/test1/file.ext")
});