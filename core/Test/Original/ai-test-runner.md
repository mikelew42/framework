# JS Test Runner

## Overview

A lightweight, browser-based test and function runner for an OO JavaScript framework. Doubles as a general scratchpad — any time you want to try something, wrap it in a `test()`.

`test()` is simply syntactic sugar for `new Test()`.

---

## Design Philosophy

- **Universal runner**: not just for assertions — use it to run and observe any code
- **OO-oriented**: tests are organized per class
- **Progressive complexity**: supports inheritance chains (e.g. `Thing0 → Thing1 → Thing2`), where each class builds on the last and tests maintain working MVPs at each level
- **Synchronous execution**: runs and renders to the browser DOM synchronously
- **Isolation**: clicking a test's header bar re-runs only that test

---

## Syntax

```js
test("name of test", t => {
  assert(expr, "description of expr");

  test("nested test", t => {
    // ...
  });
});
```

---

## Current Behavior

- Each `test()` call renders a block in the browser DOM with a header bar
- Clicking the header isolates and re-runs only that test
- Nested tests are supported (behavior TBD / in progress)

---

## Server-Side Support

Tests should run server-side (Node) with the same API. The output channel just changes — instead of rendering to the DOM, results stream to the **Servex** dashboard over WebSocket. See `servex.md`.

---

## Notes / Reminders

- No bundler
- No TypeScript
- No React/Vue — uses a custom `class View { .el }` with jQuery-like API
- Keep it vanilla JS, OO style
- Goal: useful as both a test framework *and* an interactive scratchpad/REPL
- **`console.log()` in Node terminal sucks** — but once connected to Chrome DevTools, `console.log()` renders nicely in CDT. There's still a role for a custom `log()`, but TBD.