# App — Application Singleton

The `App` class is the root singleton that bootstraps the framework: creates the DOM
structure, loads the page module, and provides the `app` global that all page code
imports from `app.js`.

There is always exactly one `App` instance. It's created in `app.js` and exported as
the default. Every `page.js` begins with `import app from '/app.js'`.

---

## Current DOM Structure

```
<body>
  <div.app>
    <div.header>       ← app.$header (sidenav/topbar)
    <div.main>
      <div.left>       ← app.$sidenav (left nav, shown by default)
      <div.background>
        <div.root>     ← app.$root (page content goes here)
```

Page modules append content to `app.$root`. The framework loads `page.js` for the
current URL path and appends its default export to `app.$root`.

---

## Lifecycle

```
new App()
  → config()
      → config_framework()       ← framework-level setup
      → render()                 ← builds DOM tree, sets View.captor to $root
  → load()
      → load_page()              ← dynamic import of page.js for current path
      → wait for stylesheets + loaders
  → initialize()
      → inject()                 ← appends $app to <body>
      → ready.resolve()          ← app.ready promise resolves
```

---

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `app.$root` | View | Mount point for page content |
| `app.$header` | View | Top header bar |
| `app.$sidenav` | View | Left navigation panel |
| `app.ready` | Promise | Resolves when page is loaded and injected |
| `app.loaded` | Promise | Resolves when all stylesheets + loaders finish |

---

## URL → Page Module Resolution

```
/                     → /page.js
/about/               → /about/page.js
/framework/core/App/  → /framework/core/App/page.js
/thing                → /thing.page.js
```

The App dynamically imports the page module for the current `window.location.pathname`.
If the import fails (404, syntax error), an error message is shown in `$root`.

---

## app.js Entry Point

`app.js` (in `public/`) is the single import entry for all page modules:

```js
import app, { el, div, h1, p, test, ui, ux } from '/app.js';
```

It creates the `App` singleton, exports it as default, and re-exports framework
primitives (View helpers, test utilities, ui/ux controls) for convenient access.

---

## Suggested Improvements

### 1. app.workspace as the Primary Shell

Currently, `app.$root` is a raw div where page modules append content directly.
This works, but provides no structure for the common pattern of "left sidebar +
main content + right properties panel."

**Proposal:** `app.workspace` becomes the standard entry point for apps with a UI shell:
```js
// Instead of: app.$root.append(myThing)
// Do:
app.workspace.main.push(myContent);
app.workspace.left.push(navView);
app.workspace.right.push(propsView);
```

`app.workspace` would be an instance of `ext/Workspace/Workspace.js`, created lazily
when first accessed. The Workspace takes over `$root` and provides named panels.

This makes the common pattern intuitive without changing how simple page.js files work —
apps that just append to `$root` still work unchanged.

### 2. app.workspace.select() as the Selection Bus

Selection coordination between sub-apps (e.g., a file tree updating a properties panel)
currently requires direct coupling. An intuitive selection bus on `app.workspace` would
decouple this:

```js
// Any component:
app.workspace.select(item);

// Any properties panel:
app.workspace.on('select', item => props.render(item));
```

### 3. app.router as a Named HashRouter

The `HashRouter` singleton is accessed via `HashRouter.singleton()`. It would be more
intuitive to expose it on the app:

```js
app.router      // → HashRouter.singleton()
app.go('#path') // → window.location.hash = '#path'
app.hash        // → current hash segments
```

This makes routing feel like part of the app, not a separate system.

---

## Open Questions

- Should `app.workspace` auto-hide `$header` / `$sidenav` when created, or expect
  the page to do it manually?
- Should `app.router` be the raw HashRouter singleton, or a thin wrapper?
- Should `app.ready` wait for the workspace to be fully initialized, or just the page load?
