# Test Module

## Class Progression

```
core/Test/
  readme.md        ← this file
  Test.js          ← original browser-only test class (stable, keep)
  0/
    Test0.js       ← Node-compatible, results as data, class-attached suites
    Test0.test.js
    page.js
    readme.md      ← Test0 design, runner plan, open questions
  1/
    Test1.js       ← browser renderer: upgrades tests to List0, adds Test1.View
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

## Open Design Question: Test Infrastructure Evolution

**Status: parked. Current system works. Deciding on next step.**

As the framework grows (10+ subclasses per domain object), pain points will compound:

1. **No unified dashboard** — test results are spread across 21 separate pages; no single view of pass/fail.
2. **No watcher** — `scripts/run-all.mjs` runs all 26 suites serially; no incremental rerun on file change.
3. **No DOM/UI tests** — Test0 is Node-only. Testing View rendering and interaction requires Playwright navigating to a full page — slow and coarse.

### Option A: Vitest browser mode + Playwright

Vitest in dev mode serves individual ES modules with HMR (it's a dev server, not a bundler — no build artifacts). The import graph is tracked automatically: when `Item5.js` changes, only tests that transitively import it rerun. Playwright can be the browser provider.

- `/framework/...` paths resolved via a `vite.config.js` alias — the only config needed.
- Existing Test0/Test1 suites don't migrate. New DOM/UI tests are written in Vitest `describe/it/expect` alongside them.
- Built-in `--ui` dashboard shows all results with file-level grouping and live status.
- The "no bundler" concern is about build artifacts. Vite dev mode doesn't produce them.

### Option B: Custom watcher + WebSocket dashboard

Keep Test0/Test1 as the format. Build:
- `scripts/watch.mjs` using chokidar: when `Foo.js` changes, run `Foo.test.js` (convention-based; not full import graph tracking).
- A `/dev/tests` page that receives results via WebSocket and displays them all.
- Playwright stays as the CI gate for DOM tests.

### Trade-off

The import graph tracking is the hard part to build correctly from scratch. Knowing that a change to `Item5.js` requires rerunning `Item5.test.js` through `Item9.test.js` requires a real module graph — Vitest gets that for free. The appeal of Option B is no new tools and the whole system stays vanilla.

**Not blocking anything. Decision deferred.**
