# Test Module

## Class Progression

```
core/Test/
  readme.md        ← this file
  Test.js          ← original browser-only test class (stable, keep)
  0/
    Test0.js       ← new: Node-compatible, results as data, class-attached suites
    page.js
  1/
    Test1.js       ← browser-only: upgrades this.tests to List0, adds Test1.View renderer
    Test1.css      ← monospace pass/fail styles
    page.js        ← demo page (inline suite + Item3.test)
    readme.md
```

---

## Original Test.js

Browser-side test primitive. Each `test(name, fn)` call:
1. Parses `fn.toString()` to extract assert conditions as labels
2. Renders a DOM element per test (pass/green, fail/red)
3. Pushes failures to `window.fails`

Used by all existing `page.js` files. Stays as-is for backwards compat.

---

## Test0 — new design

**Key decisions:**
- **Node-compatible** — no View/DOM imports. Runs directly in Node with a path loader.
- **Results as data** — `test.results = [{pass, message}]` instead of `window.fails`. Structured, queryable, serializable.
- **Class-attached suites** — the suite lives on the class it tests:
  ```js
  Item0.test = new Test0({ class: Item0 });
  Item0.test.add("get/set", (t) => { ... });
  ```
  The `.test.js` file sets this up and re-exports the class. Name defaults to `test.class.name`.
- **Composable** — `add(other_test)` nests a whole suite. Higher levels import the lower class from its `.test.js` file and inherit the contract:
  ```js
  // Item1.test.js
  import Item0 from "../0/Item0.test.js";   // Item0.test is already attached
  import Item1 from "./Item1.js";
  Item1.test = new Test0({ class: Item1 });
  Item1.test.add(Item0.test);               // inherit Item0 contract
  Item1.test.add("load from saver", (t) => { ... });
  export default Item1;
  ```
- **`run(args)` for contract testing** — args passed as second param to each test function, without mutating the suite:
  ```js
  Item0.test.run({ Item: Item1 });  // verify Item1 satisfies Item0's contract
  // test fn: (t, { Item = Item0 } = {}) => { const item = new Item(...) }
  ```
- **`Test0.List`** is a minimal inline list (no View imports). Test1 upgrades it to a real `List0` subclass with `Test1.View`-based rendering.

---

## Autonomous Runner Plan

**Node track (fast, <100ms):** `.test.js` files that import only the class + Test0. Run via Node + a path loader when any source file changes. Covers all pure-logic tests.

**Playwright track (slow, ~2–5s):** for tests that need View/DOM. Run on demand.

**Node path loader** (10 lines) maps browser-absolute imports to filesystem paths:
```js
// scripts/loader.js
export function resolve(specifier, context, next) {
    if (specifier.startsWith('/')) {
        return next(new URL('.' + specifier, 'file:///path/to/public/').href, context);
    }
    return next(specifier, context);
}
```
Then: `node --import ./scripts/loader.js Item0.test.js`

**Incremental via chokidar:**
- `Foo.js` changes → run `Foo.test.js`
- `Foo.test.js` changes → run `Foo.test.js`
- Convention: file and test file share the base name (`Item0.js` → `Item0.test.js`)
- Higher-level suites (Item1.test.js imports Item0.test.js) run naturally when Item1 changes

**Runner output:** `test.print()` logs `test.summary()` — a tree of ✓/✗ lines, works in any terminal.

---

## Lean into List

`Test1.List` is a real `List0` subclass (implemented in `1/Test1.js`). This gives:
- All List traversal methods (`each`, `find`, `walk`, `map`, `clone`) on the test tree.
- `Test1.View` handles rendering (pass/fail colors, assertion details, recursive child suites).
- `Test1.List.View` is `null` — the list is never rendered directly; `Test1.View` owns rendering.

Everything that is a sequence should visibly be a `List`.

---

## Feedback Loop & Notification (needs ironing out)

_Summary of design conversation — decisions still open._

**Near-term (what works now):**
- Claude runs `node path/to/Foo.test.js` via Bash after each edit and reads output inline.
- You watch the terminal or Claude pastes a summary in chat.
- No server involved for pure-logic tests.

**The server question:**
The app server may be managed by **Servex** (a separate project at `../servex/`) which uses pm2 to manage multiple project servers. If the server is managed by pm2/Servex, Claude can't intercept its console output.

However — pure-logic `.test.js` tests **don't need the app server at all**. The server only enters the picture for browser/Playwright tests (View, layout, UX). So this isn't a blocker for the Node track.

**Servex / DevSocket:**
Part of the Servex design includes a **DevSocket** per server for full visibility and control. Test reporting could eventually emit over this channel (test runner → DevSocket → admin dashboard). But this is infrastructure that doesn't exist yet — don't block on it.

**Don't start app server as subprocess just for test reporting.** That creates coupling that breaks when the server setup changes. Keep test runner and app server fully independent.

**Playwright track notification:**
When we get there: Playwright loads the page, Claude calls `page.evaluate(() => MyClass.test.run())` and reads results. No `window.fails` needed. This requires the app server to be running, but Claude doesn't need to own it — just needs a URL to open.

**Incremental chokidar watcher (planned, not built):**
When a `.js` file changes, run the corresponding `.test.js` via `spawn`. Exit code drives pass/fail. This can run as a separate terminal process alongside the app server.

## Resolved

- **Runner script location** — `scripts/` at repo root. `scripts/loader.mjs` maps `/framework/...` imports. Run any test with: `node --import ./scripts/loader.mjs path/to/Foo.test.js`. See `scripts/readme.md`.
- **Exit code on failure** — `Test0.print()` sets `process.exitCode = 1` when any test fails (Node-safe: guards on `typeof process`). Zero exit = all green.
- **`Item0.test.js` main-guard** — each `.test.js` file ends with `if (process.argv[1] === fileURLToPath(import.meta.url)) { Foo.test.run().print(); }` so importing the file doesn't auto-run the suite.
- **`run()` is async** — `Test0.run()` is `async` and awaits each test function. Async test bodies (e.g., `auto_save` debounce tests) work correctly.

## Open Questions

- Playwright track: who starts the browser session? (Claude can run `npx playwright` if installed — defer until needed.)
- Servex DevSocket integration: message shape for test results — defer until DevSocket exists.
