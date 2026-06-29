# Test1 — Browser Renderer

> **Status:** Working, in use across all 26 framework page.js files. Will be superseded by the unified class (fixed Test3) once that's ready. The `<details>/<summary>` render pattern and the `Test1.View.of(suite)` static helper are worth adding before migrating.

Browser-only extension of Test0 that adds rendering and real List0 traversal.

## What It Adds Over Test0

- **`this.tests` is a real `List0` subclass** — all traversal methods (`each`, `walk`, `find`, `map`, `clone`, etc.) are available on the test tree.
- **`Test1.View`** — renders a single suite node: name + assertion results + child suites recursively. Uses `<details>/<summary>` elements.
  - Passed suites: collapsed by default.
  - Failed suites: open by default.
  - Pass/fail state drives CSS classes so styling is pure CSS.
- **`Test1.css`** — minimal monospace stylesheet for the rendered tree.

## Browser-only

Test1 imports `View`, `List0`, and `App` — it cannot run in Node. Use Test0 (`.test.js` files) for the Node track. Use Test1.View in `page.js` files for browser rendering.

## Status

**Viable. In active use by all 26 framework page.js files.**

The `<details>/<summary>` render pattern is the right choice: native collapse behavior, keyboard accessible, CSS-only pass/fail state.

## Usage

```js
// In a page.js:
import Test1 from "/framework/core/Test/1/Test1.js";
import MyClass from "../MyClass.test.js";

await MyClass.test.run();
new Test1.View({ suite: MyClass.test }).render();
```

The suite must be run before rendering — `run()` populates `results` on each node.

## Two-Step Boilerplate

The `run()` + `new Test1.View().render()` two-step is repetitive across page.js files. The right fix is a static helper on Test1.View — not a new class:

```js
// Near-term: add this to Test1.View
static async of(suite) {
    await suite.run();
    new this({ suite }).render();
}

// Usage in page.js
await Test1.View.of(Item9.test);
```

This is 4 lines added to Test1. Do this before creating Test2.

## No Responsive Viewport — By Design

Test1.View renders bare `<details>` with no viewport drag handle. This is intentional: Test1 suites test class behavior (Item, List, Saver), not DOM layout. A drag handle around assertion results doesn't help.

If a page.js has component demos that need responsive testing, the page itself wraps the demo output in `rewidth()` directly. The test renderer and the viewport chrome are separate concerns — don't merge them.

Original Test.js auto-wraps because it's a scratchpad tool where DOM output is the whole point. Test1 is a structured reporter where the output is pass/fail state.

## Upgrading Existing page.js Files

Pages that copy-paste a `render_suite()` function can be simplified to:

```js
import Test1 from "/framework/core/Test/1/Test1.js";
// ...
new Test1.View({ suite: MyClass.test }).render();
```

Remove the inline `el("style", ...)` block — `Test1.css` covers the same styles.

## List Upgrade Mechanics

`Test1`'s constructor takes `this.tests` (a `Test0.List` with any pre-populated children) and replaces it with a `Test1.List` (a real `List0` subclass), carrying existing children over. This means class-attached suites built before `Test1` is imported still work — their children are preserved.

## Open Questions

- Should `Test1.List` have a paired `Test1.List.View` for a flat tabular view of all failures? (Useful for a results dashboard.)
- JS-only collapse: click the test name → add a `collapsed` class, sibling `<details>` elements get `display:none`. No reload. This is the right isolation improvement before investing in hash routing.
- Is there a use case for rendering a Test1 suite without running it first? (Lazy rendering — show tree structure before results.) This would enable a "pending" state indicator.
