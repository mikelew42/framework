import util from "./util.js";
import app, { el, div, h1, test, assert } from "/app.js";

app.$root.ac("page");

h1("lib");

test("util.url", t => {
	assert(util.url("a", "b", "c").href);
	console.log(util.url("one", "two"));
	assert(util.url("a", "b", "c").href === "http://localhost/framework/lib/a/b/c");
	assert(util.url(import.meta, "one", "two", "three.ext").href === "http://localhost/framework/lib/one/two/three.ext");
	assert(util.url({url: "http://localhost/"}, "a", "b", "c").href === "http://localhost/a/b/c");
	assert(util.url("http://localhost/", "a", "b", "c").href === "http://localhost/a/b/c");
	assert(util.url("http://localhost/a/", "b", "c").href === "http://localhost/a/b/c");
	assert(util.url({url: "http://localhost/a/b/"}, "c").href === "http://localhost/a/b/c");

	// here, the import.meta-like {url} is treated differently
	// the trailing /c part is dropped...
	// import.meta.url includes the file.ext, and so the last part is naturally dropped
	assert(util.url({url: "http://localhost/a/b/c"}, "d").href === "http://localhost/a/b/d");

	// here, normal args get an auto-trailing-"/" so they don't disappear
	// this could backfire for my /sub.page.js pattern...
	assert(util.url("http://localhost/a/b/c", "d").href === "http://localhost/a/b/c/d");
});

test("util.slug", t => {
	assert(util.slug("testCase"));
	assert(util.slug("TestCase"));
	assert(util.slug("TestCase2"));
	assert(util.slug("TestCase22"));
});