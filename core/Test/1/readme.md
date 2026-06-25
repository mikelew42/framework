# Test1

Browser-only extension of Test0 that adds rendering and real List0 traversal.

## What it adds over Test0

- **`this.tests` is a real `List0` subclass** — all traversal methods (`each`, `walk`, `find`, `map`, `clone`, etc.) are available on the test tree.
- **`Test1.View`** — renders a single suite node: name + assertion results + child suites recursively. Pass/fail state drives CSS classes (`pass`/`fail`) so styling is pure CSS.
- **`Test1.css`** — minimal monospace stylesheet for the rendered tree.

## Browser-only

Test1 imports `View`, `List0`, and `App` — it cannot run in Node. Use Test0 (`.test.js` files) for the Node track. Use Test1.View in `page.js` files for browser rendering.

## Usage

```js
// In a page.js:
import Test1 from "/framework/core/Test/1/Test1.js";
import MyClass from "../MyClass.test.js";

await MyClass.test.run();
new Test1.View({ suite: MyClass.test }).render();
```

The suite must be run before rendering — `run()` populates `results` on each node.

## Upgrading existing page.js files

Pages that copy-paste a `render_suite()` function can be simplified to:

```js
import Test1 from "/framework/core/Test/1/Test1.js";
// ...
new Test1.View({ suite: MyClass.test }).render();
```

Remove the inline `el("style", ...)` block — `Test1.css` covers the same styles.

## List upgrade mechanics

`Test1`'s constructor takes `this.tests` (a `Test0.List` with any pre-populated children) and replaces it with a `Test1.List` (a real `List0` subclass), carrying existing children over. This means class-attached suites built before `Test1` is imported still work — their children are preserved.

## Open questions

- Should `Test1.List` have a paired `Test1.List.View` for a flat tabular view of all failures? (Useful for a results dashboard.)
- Collapsible suite nodes — add a click handler on `.t1-name` to toggle child visibility?
