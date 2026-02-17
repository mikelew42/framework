import app, { div, h1, p, test, assert } from "/app.js";
import File0 from "./File0.js";

app.$root.ac("page");

h1("File0");

p("To do: automatically put test code into rendered test?")

test("default data", async t => {
	const f = new File0({
		name: "default-data.json",
		data: {
			should: "write in initial write???"
		}
	});
	await f.ready;
	const f2 = new File0({
		name: "default-data.json"
	});
	await f2.ready;
	t.assert(f2.data.should === "write in initial write???");
	t.view.container.append(p("This correctly updates the default data on first write.  Subsequent loads will load from file, and completely ignore passed in data."));
});

test("test1 - `name: test1.json`", t => {
	const f1 = new File0({ name: "test1.json" });
	assert(f1.url === "http://localhost/framework/ext/File/0/test1.json");
	assert(f1.full === "/framework/ext/File/0/test1.json");
});

test("test1a - with default data", async t => {
	const f1a = new File0({ name: "test1a.json", data: { prop1: "one" } });
	assert(f1a.url === "http://localhost/framework/ext/File/0/test1a.json");
	assert(f1a.full === "/framework/ext/File/0/test1a.json");
	await f1a.ready;
	// debugger; // uncomment, and watch the file appear and then disappear after resuming
	t.assert(f1a.data.prop1 === "one");
	console.log((await f1a.delete()).response);
});

test("test2 - `path: sub, name: test2.json`", async t => {
	const f2 = new File0({ path: "sub", name: "test2.json" });
	assert(f2.url === "http://localhost/framework/ext/File/0/sub/test2.json");
	assert(f2.full === "/framework/ext/File/0/sub/test2.json");
	await f2.ready;
	t.assert(f2.data.prop1 !== "one");
	// debugger;
	f2.data.prop1 = "one";
	f2.save();
	f2.save();
	f2.save();
	f2.save();
	f2.save();
	await f2.ready;
	const f22 = new File0({ path: "sub", name: "test2.json" });
	await f22.ready;
	t.assert(f22.data.prop1 === "one");
	f2.data.prop1 = "two";
	f2.save();
});
// test("test3 - `path: /test-abs, name: test3.json`", t => {
// 	const f3 = new File0({ path: "/test-abs", name: "test3.json" });
// 	assert(f3.url);
// 	assert(f3.full);
// });
test("test4 - `meta: import.meta, name: test4.json`", t => {
	const f4 = new File0({ meta: import.meta, name: "test4.json" });
	assert(f4.url === "http://localhost/framework/ext/File/0/test4.json");
	assert(f4.full === "/framework/ext/File/0/test4.json");
});
test("test4a - `meta: import.meta, path: sub, name: test4a.json`", async t => {
	const f4a = new File0({ meta: import.meta, path: "sub", name: "test4a.json" });
	assert(f4a.url === "http://localhost/framework/ext/File/0/sub/test4a.json");
	assert(f4a.full === "/framework/ext/File/0/sub/test4a.json");
	await f4a.ready;
	t.assert(f4a.data.prop == 55)
	// await f4a.ready;
	// f4a.data.prop = 55;
	// await f4a.save();

});



// test("`new URL('two', new URL('path/', 'https://domain.com/'))`", t => {
// 	const url = new URL("two", new URL("path/", "https://domain.com/"));
// 	assert(url.href === "https://domain.com/path/two", `url: https://domain.com/path/two`);
// });

// p("When there's no trailing `/`, the base URL ignores the trailing `/part`.")

// test("`new URL('two', new URL('path', 'https://domain.com/'))`", t => {
// 	const url = new URL("two", new URL("path", "https://domain.com/"));
// 	assert(url.href === "https://domain.com/path/two", `url: https://domain.com/path/two`);
// 	assert(url.href === "https://domain.com/two", `url: ${url.href}`);
// });

// test("`new URL('path', 'https://domain.com')`", t => {
// 	const url = new URL("path", "https://domain.com");
// 	assert(url.href === "https://domain.com/path", `url: ${url.href}`);
// });
// test("`new URL('/path', 'https://domain.com')`", t => {
// 	const url = new URL("/path", "https://domain.com");
// 	assert(url.href === "https://domain.com/path", `url: ${url.href}`);
// });
// test("`new URL('path/', 'https://domain.com')`", t => {
// 	const url = new URL("path/", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/", `url: ${url.href}`);
// });
// test("`new URL('/path/', 'https://domain.com')`", t => {
// 	const url = new URL("/path/", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/", `url: ${url.href}`);
// });
// test("`new URL('/path/file.ext', 'https://domain.com')`", t => {
// 	const url = new URL("/path/file.ext", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/file.ext", `url: ${url.href}`);
// });
// test("`new URL('/path/sub/', 'https://domain.com')`", t => {
// 	const url = new URL("/path/sub/", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/sub/", `url: ${url.href}`);
// });
// test("`new URL('/path/sub', 'https://domain.com')`", t => {
// 	const url = new URL("/path/sub", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/sub", `url: ${url.href}`);
// });
// test("`new URL('path/file.ext', 'https://domain.com')`", t => {
// 	const url = new URL("path/file.ext", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/file.ext", `url: ${url.href}`);
// });
// test("`new URL('path/sub/', 'https://domain.com')`", t => {
// 	const url = new URL("path/sub/", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/sub/", `url: ${url.href}`);
// });
// test("`new URL('path/sub', 'https://domain.com')`", t => {
// 	const url = new URL("path/sub", "https://domain.com");
// 	assert(url.href === "https://domain.com/path/sub", `url: ${url.href}`);
// });

// async function test() {
// 	const log = (msg) => {
// 		console.log(msg);
// 		p(msg);
// 	};

// 	// Test 1: Relative Path (default to location)
// 	const f1 = await new File0({ name: "test1.json" }).ready;
// 	log("Test 1 URL: " + f1.url);
// 	log("Test 1 Full: " + f1.full);
// 	f1.data.val = (f1.data.val || 0) + 1;
// 	f1.save();
// 	log("Test 1 saved. Value: " + f1.data.val);

// 	// Test 2: Subfolder Path
// 	const f2 = await new File0({ path: "sub", name: "test2.json" }).ready;
// 	log("Test 2 URL: " + f2.url);
// 	log("Test 2 Full: " + f2.full);
// 	f2.data.val = (f2.data.val || 0) + 1;
// 	f2.save();
// 	log("Test 2 saved.");

// 	// Test 3: Absolute Path
// 	const f3 = await new File0({ path: "/test-abs", name: "test3.json" }).ready;
// 	log("Test 3 URL: " + f3.url);
// 	log("Test 3 Full: " + f3.full);
// 	f3.data.val = (f3.data.val || 0) + 1;
// 	f3.save();
// 	log("Test 3 saved.");

// 	// Test 4: meta support
// 	const f4 = await new File0({ meta: import.meta, name: "test4.json" }).ready;
// 	log("Test 4 URL: " + f4.url);
// }

// test();