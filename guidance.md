# Framework Guidance — Simplification Proposals

Written after a full read of every module's readme and key code files. Ordered by impact.

---

## 1. Make the Entry Point Obvious

**Problem:** A new developer reading the framework asks "where do I start?" and finds 10 levels of Item and 9 levels of List. The answer is buried.

**Proposal:** Add a `quick-start.md` at the framework root (or expand README.md) that says:

> **For 90% of apps, you need exactly this:**
> - `Item` (= Item9) for persistent domain objects
> - `ListSaver` to persist a collection to one file
> - `Store` for named single-item slots (settings, profile, etc.)
> - `WebApp` for the three-panel shell
> - `ui.*` for controls, `ux.*` for patterns

The numbered progressions are learning tools — show them as *learning paths*, not production API surface. The Item/List/Saver readmes do this well; the top-level README didn't until now.

**Action:** Done — README.md has been rewritten with a "Typical App Pattern" section.

---

## 2. Collapse Binding Into One API

**Problem:** There are three ways to bind UI to an Item field:

```js
// A — manual
item.on('change', (key, val) => { if (key === 'title') el.textContent = val; });

// B — bind.js (raw DOM elements)
import { bind_text } from '/framework/ext/Bind/bind.js';
bind_text(span.el, item, 'title');

// C — ui.bound (creates the control for you)
ui.bound(item, 'font_size', ui.scrub, { min: 1, max: 200 })
```

Option A is always needed. Options B and C overlap — `bind.js` takes an existing DOM element; `ui.bound` creates the control. These aren't really competing.

**Proposal:** Keep all three, but document them together in one place (`ext/Bind/readme.md` or a `binding.md` page) with a decision guide:

- Use `ui.bound` / `ui.form` when building a property panel from scratch.
- Use `bind.js` when you already have DOM elements and need two-way sync.
- Use `item.on('change', ...)` for custom logic beyond simple value sync.

No code change needed — just a decision page.

---

## 3. Standardize the Constructor Pattern

**Problem:** CLAUDE.md says the standard constructor is `Object.assign(this, ...args)`, but Item0–Item9 use explicit destructuring:

```js
// Item0 (current):
constructor(opts = {}) {
    const { data, parent, saver } = opts;
    this.data = data || {};
    // ...
}

// CLAUDE.md pattern:
constructor(...args) {
    this.assign(...args);
}
```

Item0's destructuring is actually cleaner and more explicit than the `assign` pattern for a class with known, required properties like `data`, `parent`, `saver`. The CLAUDE.md pattern makes more sense for looser config objects (like WebApp opts).

**Proposal:** Accept both patterns. Update CLAUDE.md to say:

> Use `Object.assign(this, opts)` for loose config classes (WebApp, Tabs, ui controls). Use explicit destructuring for domain classes with known required fields (Item, List, Saver). Match whichever is in the file you're editing.

---

## 4. Remove or Archive Dead Code

There are several folders that exist purely for backwards compat or are clearly abandoned:

| Path | Status | Action |
|------|--------|--------|
| `ext/Thing_old/` | Predates Item; nothing imports it | Delete |
| `ext/Savable/Savable.js` | Single file, no readme, not referenced | Delete or document |
| `ext/Component/` | Legacy, migration guide written | Keep but add `_legacy` prefix or move to `_archive/` |
| `lib/backbone.js`, `lib/three.js`, `lib/underscore.js` | Not part of the framework | Move out or document as "vendored optional deps" |

The `lib/` folder especially — it contains Backbone, Three.js, Underscore. These are big external libs that don't belong in a "minimal local-first framework." They should live in the app layer, not the framework.

---

## 5. Ship WebApp2

**Problem:** `WebApp2/readme.md` is a detailed spec with a full implementation plan but no code. The spec has been written; the code hasn't been started. Every new app that wants panel persistence has to hand-roll it.

**Proposal:** Build WebApp2 now. The implementation plan in its readme is complete:

1. Copy WebApp1 constructor, call `super(opts)`.
2. Read localStorage if `app_id` provided.
3. Override `toggle_left()` / `toggle_right()` to animate + persist.
4. Debounce-persist width changes in the resize handle.
5. Add `collapse_btn_left()` / `collapse_btn_right()`.
6. Bind `Keys` if `left_key` / `right_key` provided.

The readme says "WebApp2.js should be under 120 lines." Build it.

---

## 6. Clarify the ux / ui Split

**Problem:** The `ui.*` / `ux.*` split is somewhat arbitrary. `ui.form`, `ui.row`, `ui.section` feel like layout helpers, not primitive controls. `ux.tabs` feels like a primitive. New devs have to check both to find what they need.

**Proposal:** Don't restructure (breaking imports), but add a one-line doc to both `ui/readme.md` and `ux/readme.md` explaining the split rule:

> `ui.*` — controls that hold a value (`.val()` getter/setter). Primitives.
> `ux.*` — patterns that manage navigation, state, or behavior. No single value.

`ui.form`, `ui.row`, `ui.section` are layout helpers for `ui.*` controls — they stay in `ui.*` because they compose directly with controls.

---

## 7. Condense Item Documentation for Learners

**Problem:** The `core/Item/readme.md` is excellent for reference but dense for onboarding. Each level has a full API surface description. A learner reading top-to-bottom has to absorb all 10 levels before they can write anything.

**Proposal:** Add a "Learning Path" section at the top of `core/Item/readme.md`:

```
Start here → Item0   get/set/save (pure in-memory)
Add storage → Item1   async load + FileSaver
Add events  → Item5   on/off/emit + reactive 'change'
Ship it     → Item9   schema + undo/redo (the default import)
```

Items 2, 3, 4, 6, 7, 8 are important stepping stones but most devs jump directly from Item1 to Item9 in practice. The learning path should reflect that.

---

## 8. Consider Collapsing List0–List4 Into One "List Base"

**Problem:** List0–List4 build up traversal → events → derive → sort → transform. In practice, no production code imports List1, List2, List3, or List4 directly. They all need at least List5 (reactive filter). The progression is valuable for understanding but adds cognitive load.

**Proposal:** Create a `List.base.js` that is `List4` (or `List5`) and re-export it as the "simple List" entry point, alongside the full `List.js` → List8. This gives a clear two-tier system:

- `List.base.js` — add/remove + events + basic derive/sort (no reactive)
- `List.js` — the full reactive stack (current default)

Or, simpler: just document in `core/List/readme.md` which levels are "usually enough" vs "for complex reactive UIs."

---

## 9. Store as the Default App Data Pattern

**Problem:** The most common first thing a new app does is create an Item with a FileSaver for settings. But the pattern shown first in most docs is the low-level `new Item9({ saver: new FileSaver(...) })` approach.

**Proposal:** Make `Store` the default recommendation in docs and the quick-start guide. Store gives the same thing with less boilerplate and handles the `load_all()` lifecycle automatically.

```js
// Before (what new devs write)
const settings = new Item9({ saver: new FileSaver({ path: '/data/settings.json' }) });
await settings.load();

// After (what they should write)
const store = new Store({ dir: '/data/' });
const settings = store.item('settings');
await store.load_all();
```

Store is already built and tested. It just needs to be mentioned first.

---

## 10. Notes App as the Canonical Demo

The Notes app (`ext/Notes/`) demonstrates every layer of the framework:
- Item9 (schema + compute + undo)
- List7 (reactive filter + sort + group_by)
- ListSaver (one file for all notes)
- View (reactive DOM updates)

It should be the first demo anyone looks at. Update `ext/Notes/readme.md` to say "this is the canonical full-stack example" and add a link to it from README.md and the Item/List readmes.

---

## Summary — Quick Wins vs Long Projects

| Task | Effort | Impact |
|------|--------|--------|
| Add "Learning Path" to Item/readme.md | 10 min | High |
| Build WebApp2 (spec is ready) | 2–3 hrs | High |
| Add `quick-start.md` or expand README | Done | High |
| Delete `ext/Thing_old/` | 5 min | Low |
| Write binding decision guide | 30 min | Medium |
| Update CLAUDE.md constructor guidance | 10 min | Medium |
| Move `lib/backbone.js` etc. out of framework | 10 min | Medium |
| Notes as canonical demo | 15 min | Medium |
| Promote Store in docs | 15 min | High |
| List "learning path" annotation | 10 min | Medium |
