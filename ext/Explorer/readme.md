# Explorer — Multi-Column Pager

A responsive, multi-column navigation UX that lives inside `app.workspace.main`.
Inspired by macOS Finder's column view and the iOS Files app: clicking something
in one column reveals its content in the next column, intuitively building a
breadcrumb trail of navigation through a hierarchy.

**Status:** Planned — not yet implemented.

---

## The Core Idea

On mobile: 1 column (fill viewport). On tablet: 2 columns. On desktop: 3+ columns.

Each column shows a "page" — a directory listing, a document, a settings panel,
whatever the app needs. Clicking an item in column N loads a new page into column N+1
(or replaces the rightmost column if already at max columns for the viewport).

This is not a fixed layout — it's a **responsive navigation pattern** where the number
of visible columns is determined by viewport width, and navigation is spatial.

---

## Relationship to Workspace

Explorer does NOT replace Workspace — it lives INSIDE it:

```
App
└── workspace: Workspace
      ├── left:  Panel  ← sidebar / nav tree (optional)
      ├── main:  Panel  ← Explorer lives here
      └── right: Panel  ← properties / inspector
```

The Explorer is a sub-app that occupies `workspace.main`. When the user selects
something in the Explorer (a file, a record, a node), it broadcasts via
`workspace.select(item)` so the right panel can display contextual properties
intuitively — without the Explorer knowing anything about the right panel.

---

## Column Model

```
Explorer
└── columns: Column[]     ← responsive count (1/2/3+ based on viewport)
      └── each column:
            ├── page: View   ← current visible page
            ├── history: []  ← back-stack for this column
            └── title: str   ← column breadcrumb label
```

Navigating pushes a new page into the next column. Going "back" pops from the column's
history stack. On narrow viewports, columns are hidden/shown (only the focused column
is visible on mobile), giving a slide-in UX.

---

## Intuitive Navigation Rules

1. Clicking an item in column N always loads into column N+1.
2. If N+1 doesn't exist (already at max columns), replace the last column.
3. On mobile (1 column), all navigation is "replace" — the back button is the only way back.
4. The currently "active" column is highlighted (subtle background or border).
5. Column headers show the breadcrumb: what was selected to get here.

---

## HashRouter Integration

The URL reflects the current explorer state so navigation is shareable and
the browser back/forward buttons work intuitively:

```
#explorer/documents                         ← 1 column: documents
#explorer/documents/readme.md               ← 2 columns: docs + file detail
#explorer/documents/readme.md/edit          ← 3 columns: docs + file + editor
```

The Explorer syncs its column state to the hash on every navigation. On page load,
it reads the hash and restores the columns intuitively (deep-link support).

Implementation: each Explorer column corresponds to a HashRouter segment.
The root Explorer router has children for each column position.

---

## Selection Broadcasting

Any click in the Explorer that selects an item broadcasts to the workspace:

```js
column.on('select', item => {
    this.workspace.select(item);   // right panel updates intuitively
    this.navigate(item, col_index + 1);  // next column shows item content
});
```

The Explorer doesn't know or care what the right panel shows. The workspace selection
bus handles that routing. This is the key architectural benefit of Explorer living
inside Workspace rather than replacing it.

---

## Responsive Breakpoints (proposed)

| Viewport width | Visible columns | Behavior |
|----------------|-----------------|----------|
| < 600px        | 1               | Mobile: slide transition, browser back = column back |
| 600–1000px     | 2               | Tablet: 2 columns side-by-side |
| 1000–1400px    | 3               | Desktop: 3 columns |
| > 1400px       | 4+              | Wide: 4+ columns |

Column widths are equal by default (flex: 1 each). Individual columns can be given
fixed or hug widths for special cases (e.g., a narrow nav column + wide content column).

---

## Relationship to Existing Modules

| Module | Relationship |
|--------|-------------|
| `ext/Workspace` | Explorer lives in `workspace.main`; uses `workspace.select()` |
| `ext/HashRouter` | Each column position maps to a HashRouter segment |
| `ext/Directory` | `Directory.js` provides the filesystem listing Explorer can display |
| `ext/HashPager` | HashPager is the simpler, single-column version of the same idea |
| `ext/HashPage` | Similar concept; Explorer generalizes it to multiple columns |

---

## Proposed Class Design

```
Explorer
  extends: EventEmitter (or possibly Workspace, or wraps a Workspace preset)
  owns:
    columns: Column[]   ← responsive array, count changes on resize
    router: HashRouter  ← syncs column state to URL
  methods:
    navigate(item, col_index)     ← load item into column
    push_column(page_fn)          ← add a column to the right
    pop_column()                  ← remove the rightmost column
    set_column_count(n)           ← resize to n columns (called on viewport resize)
    select(item)                  ← broadcast via workspace.select()

Column
  owns:
    page: View          ← current content
    history: View[]     ← back-stack
    title: string       ← breadcrumb label for this column
  methods:
    push(page, title)   ← show new page, save old to history
    pop()               ← go back in this column's history
    replace(page, title) ← replace current, no history
```

---

## Open Questions

- Should Explorer **extend** Workspace (column-based preset), or just be a View that
  lives inside `workspace.main`? Extending Workspace gives it selection broadcasting
  and sessions for free — but is a tighter coupling.
- How does column count change on resize? Does it animate, or snap?
- On mobile, does the "active column" slide left/right (CSS translate animation),
  or does the column list just hide/show? Native mobile feel = slide.
- Should columns support different content types (list view, icon view, preview)?
  Or is the content entirely consumer-provided?
- Should `Explorer` live in `core/` (it's a fundamental UI pattern) or `ext/` (it's
  an app-level component)? Leaning toward `ext/` since it uses HashRouter.
- When all columns navigate to the same item (e.g., deep-linking), should intermediate
  columns show a loading/placeholder state while content loads?
- How does the Explorer interact with sessions? Should column state be part of
  `workspace.session` (so layout restores on reload) or managed by the hash alone?
