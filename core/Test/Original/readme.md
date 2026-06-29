# Original Test.js — Legacy Browser REPL

> **Status:** Still works, still backward-compatible. Will eventually be superseded by the unified class (fixed Test3), which absorbs the same auto-render behavior with async support added. Two unique features worth preserving in the unified class: regex condition label extraction from `fn.toString()`, and `#hash` isolation.

The first test primitive in the framework. Exported via `Test/Test.js` as the default, and re-exported through `App.js` and `/app.js`. Backward-compatible forever.

## What It Does

```js
import app, { test, assert } from "/app.js";

test("my test", t => {
    assert(1 + 1 === 2);
    assert(typeof "foo" === "string", "string check");
});
```

Each `test(name, fn)` call:
1. Parses `fn.toString()` with a regex to extract assertion expressions as labels. `assert(x.value === 42)` shows `x.value === 42` as the label — no need to write a message string.
2. Renders a DOM block immediately (synchronous).
3. Wraps test output in a `rewidth()` viewport — drag handle on the right edge for responsive testing.
4. Clicking the test header sets `window.location.hash = name` and reloads the page. On reload, only the matching test runs (isolation mode).

## Unique Features (not in Test0/Test1)

- **Regex condition label extraction** — shows the actual source code of each `assert()` call. `assert(item.get('x') === 5)` shows `item.get('x') === 5` without needing a message.
- **`rewidth()` viewport** — every test output is in a drag-resizable container. Responsive testing built-in.
- **Hash isolation** — click any test header to run only that test in isolation.
- **`window.fails[]`** — accumulates all failed assertions across the page. Useful for checking at the end.
- **`Test.controls()`** — renders a global reset button. (Currently disabled by default.)

## Limitations

- **Browser-only.** Cannot run in Node.
- **Synchronous.** If a test callback `await`s anything, the assert runs before the promise resolves — the test silently passes. Do not use Original `test()` for async test fns. Use Test0/Test1 for anything async.
- Hash isolation requires a full page reload — loses all other test state.
- The regex condition parser can fail on complex expressions or multi-line asserts.

## When to Use

Use Original `test()` for:
- Quick inline scratchpad tests in a page.js file that isn't testing a class with a formal contract.
- Pages where you want to see test output and DOM output interspersed in one view.
- Any `test()` you want to run interactively with the rewidth handle.

Use Test0/Test1 for:
- Class contract tests. Any class with a `.test.js` file and a `Test0` suite.
- Tests that need to run in Node (`run-all.mjs`).
- Tests that need async/await.

## Files

- `Test.js` — main class. `render()`, `run()`, `assert()`, `activate()`, `should_run()`, `match()`.
- `Test.css` — minimal styles. `.test`, `.test-assert.passed`, `.test-assert.failed`.
- `page.js` — demo page showing the basic `test()` call.
- `ai-test-runner.md` — original design doc. Historical context.
- `refactor.md` — analysis that led to Test3's design. Useful context for understanding why Test3 was attempted.

## Relationship to Other Variants

`Test/Test.js` re-exports this as the default. App.js imports `Test` and `test` from there. All page.js files that do `import { test, assert } from "/app.js"` get this implementation.

Test1 does NOT extend this class. Test0 and Test1 are a separate lineage. The two tracks are independent.

## Open Questions

- Should the regex condition parser be extracted as a utility? It would be useful in other debug/REPL contexts.
- Should `Test.controls()` be called automatically? The global reset button is useful but currently has to be called manually.
- The `rewidth()` wrapper: should it be optional (`test("name", fn, { viewport: false })`)? For pure assertion tests (no DOM output), the drag handle is pointless overhead.
