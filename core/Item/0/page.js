import app, { el, div, h1 } from "/app.js";
import Item0 from "./Item0.test.js";

app.$root.ac("page");

el("style", `
    .t0-suite { margin: 0.5em 0 0.5em 1em; font-family: monospace; }
    .t0-name { font-weight: bold; padding: 0.2em 0; }
    .t0-name::before { content: "▸ "; }
    .t0-assert { padding: 0.1em 0 0.1em 1.2em; font-size: 0.9em; }
    .t0-assert.pass::before { content: "✓ "; color: green; }
    .t0-assert.fail::before { content: "✗ "; color: red; }
    .t0-suite.fail > .t0-name { color: red; }
    .t0-suite.pass > .t0-name { color: green; }
`);

h1("Item0");

Item0.test.run();

function render_suite(suite) {
    div.c("t0-suite " + (suite.passed ? "pass" : "fail"), () => {
        div.c("t0-name", suite.name || "");
        suite.results.forEach(r => div.c("t0-assert " + (r.pass ? "pass" : "fail"), r.message));
        suite.tests.each(child => render_suite(child));
    });
}

render_suite(Item0.test);

// auto_save is async — tested manually for now.
// Remove once Test1 adds async run() support.
import { test, assert } from "/app.js";

test("auto_save debounces", async t => {
    const saves = [];
    const saver = { save(item, patch) { saves.push(patch); } };
    const item = new Item0({ saver });
    item.set("a", 1);
    item.auto_save(50);
    item.set("b", 2);
    item.auto_save(50);
    assert(saves.length === 0);
    await new Promise(r => setTimeout(r, 100));
    assert(saves.length === 1);
    assert(saves[0].b === 2);
});
