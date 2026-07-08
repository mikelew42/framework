# Markdown

Markdown rendering as a **View addon**, not a component class. Importing `Markdown.js` installs `View.prototype.md()`; the default export is the `md()` helper.

```js
import md from "/framework/ext/Markdown/Markdown.js";

p().md("Some **inline** markdown");   // into an existing view
md("Hi.").ac("note");                 // a real <p>, chainable — md() replaces p()
md.c("note", "Hi.");                  // classes first, like div.c() / p.c()
md("# Title");                        // a real <h1>
md("# Multi\n\nblock");               // captured <div class="md">
md({ file: "notes.md" });             // fetch a file, then parse into a div.md
```

## Design decisions

- **`md()` is smart about its root: you get the element you wrote.** The content is parsed, and if it produces a single root block (`<p>`, `<h1>`, `<ul>`, ...), that element is adopted directly via `new View({ el })` — so `md("Hi.")` behaves like `p()` and chains normally. Multiple blocks get wrapped in a `div.md`. Strict-paragraphs (`parseInline` into a `p()`) was rejected: it would render `md("# Heading")` as literal `# Heading` text.
- **`marked.parse()` wraps output in `<p>` tags** (it treats input as block-level). So the multi-block wrapper is a div, not a `p()` — otherwise you'd double-wrap.
- **`view.md()` is tag-aware**: block containers (`div`, `section`, ...) get `marked.parse()`; phrasing elements (`p`, `h1`, `span`, `li`, ...) get `marked.parseInline()`, so `p().md("**hi**")` doesn't nest `<p>` inside `<p>`.
- **The helper is captured like any element helper** — `new View({ el })` still auto-appends to `View.captor`, so `md()` lands wherever it's called, same as `p()`.
- **`marked` loads from the jsdelivr CDN** — the ESM build, no local copy. Pages that don't import Markdown pay nothing.
- The old `class Markdown extends View` component was replaced by this addon (2026-07).

## Open questions

- Export `md` from `app.js`? Convenient, but would make every page load pull marked from the CDN. Currently pages opt in by importing this module directly.
- File loading has no `ready` promise — `md({ file })` returns the view immediately and fills it when the fetch resolves. Fine off-dom; may need a promise if callers want to await it.
- Sanitization: marked does not sanitize HTML. Fine for local-first trusted content; revisit if rendering untrusted input.
