import app, { h1, h2, h3, p, div, el, a } from "../app.js";

app.$root.ac("page");

el("style", `
    .fw-page { max-width: 52em; margin: 0 auto; font-family: sans-serif; line-height: 1.5; }
    .fw-page h1 { font-size: 1.8em; margin-bottom: 0.2em; }
    .fw-page h2 { font-size: 1.2em; margin: 1.6em 0 0.4em; border-bottom: 2px solid #eee; padding-bottom: 0.2em; }
    .fw-page h3 { font-size: 0.95em; margin: 1em 0 0.2em; color: #333; }
    .fw-page p  { margin: 0.3em 0 0.6em; color: #444; font-size: 0.92em; }
    .fw-tagline { font-size: 1em; color: #666; margin-bottom: 1.2em; }
    .fw-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(22em, 1fr)); gap: 1em; margin: 0.6em 0; }
    .fw-card  { border: 1px solid #e0e0e0; border-radius: 6px; padding: 0.8em 1em; background: #fafafa; }
    .fw-card a { font-weight: bold; text-decoration: none; color: #1a6; font-size: 0.95em; }
    .fw-card a:hover { text-decoration: underline; }
    .fw-card p { margin: 0.2em 0 0; font-size: 0.85em; color: #555; }
    .fw-table { width: 100%; border-collapse: collapse; font-size: 0.88em; margin: 0.5em 0; }
    .fw-table th { text-align: left; padding: 0.3em 0.6em; background: #f0f0f0; border-bottom: 2px solid #ddd; }
    .fw-table td { padding: 0.3em 0.6em; border-bottom: 1px solid #eee; vertical-align: top; }
    .fw-table td:first-child { white-space: nowrap; font-family: monospace; font-weight: bold; }
    .fw-table a { color: #1a6; text-decoration: none; }
    .fw-table a:hover { text-decoration: underline; }
    .fw-adds { color: #a60; font-size: 0.82em; font-style: italic; }
    .fw-pill { display: inline-block; font-size: 0.78em; padding: 0.15em 0.5em; border-radius: 10px; background: #e8f4ee; color: #1a6; font-family: monospace; margin-right: 0.3em; }
    .fw-note { background: #fffbe6; border-left: 3px solid #f5c518; padding: 0.5em 0.8em; font-size: 0.88em; color: #555; margin: 0.8em 0; border-radius: 0 4px 4px 0; }
`);

div.c("fw-page", () => {
    h1("frozen-helix framework");
    div.c("fw-tagline", "Local-first · ES modules · No bundler · Static HTML + Node WebSocket");

    p("A progressive framework for building persistent local-first web apps. Static HTML + vanilla ES modules served directly from Node — no build step, no React, no bundler. Persistence goes through a WebSocket channel to the local filesystem.");

    // ── Architecture ──────────────────────────────────────────────────────────
    h2("Architecture");
    div.c("fw-grid", () => {
        const cards = [
            ["/framework/core/Item/", "Item — domain objects", "Active Record pattern. Wraps a data object with get/set, dirty tracking, async load/save, events, computed fields, schema coercion, and undo/redo. 10 progressive levels (Item0–Item9)."],
            ["/framework/core/List/", "List — ordered collections", "The framework's collection primitive. Traversal, add/remove events, derived/filtered/sorted/grouped/indexed views — all reactive. 9 progressive levels (List0–List8)."],
            ["/framework/ext/File/", "Savers — persistence backends", "Swappable backends: FileSaver (WebSocket JSON), MemorySaver (tests), LocalStorageSaver (browser), CollectionSaver (whole list → one file). Item never knows which one is in use."],
            ["/framework/core/Test/", "Test — node + browser", "Test0 runs in Node (no DOM). Test1 adds a browser renderer with collapsible pass/fail trees. Suites attach to their class and inherit lower-level contracts."],
        ];
        cards.forEach(([href, title, desc]) => {
            div.c("fw-card", () => {
                a(title).attr("href", href);
                p(desc);
            });
        });
    });

    div.c("fw-note", "Every class follows the progressive versioning pattern: Item0→Item9, List0→List8. Each level is independently importable and testable. Higher levels extend lower ones but never break the lower-level contract.");

    // ── Item progression ──────────────────────────────────────────────────────
    h2("Item progression");
    p("Import a specific level to pin the contract, or import from `core/Item/Item.js` for the current default (Item9).");

    el.c("table", "fw-table", () => {
        el("thead", () => {
            el("tr", () => {
                el("th", "Level");
                el("th", "What it adds");
            });
        });
        el("tbody", () => {
            const rows = [
                ["/framework/core/Item/0/", "Item0", "get(key) / set(key, val) · dirty tracking · save() delegates to saver · auto_save(ms) debounce · saver inheritance from parent"],
                ["/framework/core/Item/1/", "Item1", "async ready promise · saver.load() on construct · save() / delete() return Promises"],
                ["/framework/core/Item/2/", "Item2", "items[] parent-child tree · add() / remove() · toJSON() serializes tree · saver inherited down the chain"],
                ["/framework/core/Item/3/", "Item3", "dot-notation path property (root.0.2) · delta(patch) → {jspath, patch, ts} · apply_server_delta() skips dirty keys"],
                ["/framework/core/Item/4/", "Item4", "items becomes a reactive List1 · add/remove emit events · child.parent stays the Item, not the List"],
                ["/framework/core/Item/5/", "Item5", "on() / off() / emit() · set() emits 'change'(key, newVal, oldVal) on actual changes"],
                ["/framework/core/Item/6/", "Item6", "once() · 'save' event · batch(fn) defers 'change' events, emits only net change per key"],
                ["/framework/core/Item/7/", "Item7", "compute(key, deps, fn) · auto-recalculates on dependency change · respects batch()"],
                ["/framework/core/Item/8/", "Item8", "schema(def) type coercion (Number, String, Boolean, Array, Object, or fn) · 'error' event on failure"],
                ["/framework/core/Item/9/", "Item9", "checkpoint() / undo() / redo() · save() auto-checkpoints · deep-clone snapshots · 'undo'/'redo' events"],
            ];
            rows.forEach(([href, name, desc]) => {
                el("tr", () => {
                    el("td", () => a(name).attr("href", href));
                    el("td", desc);
                });
            });
        });
    });

    // ── List progression ──────────────────────────────────────────────────────
    h2("List progression");
    p("Import from `core/List/List.js` for the current default (List8), or pin a specific level.");

    el.c("table", "fw-table", () => {
        el("thead", () => {
            el("tr", () => {
                el("th", "Level");
                el("th", "What it adds");
            });
        });
        el("tbody", () => {
            const rows = [
                ["/framework/core/List/0/", "List0", "children[] · append / insert / remove · each / find / walk · map() · Symbol.iterator · parent adoption"],
                ["/framework/core/List/1/", "List1", "on() / off() / emit() · 'add'(item, idx) and 'remove'(item, idx) events"],
                ["/framework/core/List/2/", "List2", "filter(fn) / derive(fn) — snapshot-derived list that stays in sync via 'add'/'remove'"],
                ["/framework/core/List/3/", "List3", "sort(compareFn) — live sorted snapshot, correct insertion index on every add"],
                ["/framework/core/List/4/", "List4", "transform(fn) — live mapped list with O(1) remove via internal memo Map"],
                ["/framework/core/List/5/", "List5", "filter_reactive(fn, watch_keys) — re-evaluates predicate when item keys change (requires Item5+)"],
                ["/framework/core/List/6/", "List6", "group_by(fn) static Map · group_by_reactive(fn, watch_keys) live Map, items move groups on mutation"],
                ["/framework/core/List/7/", "List7", "sort_reactive(fn, watch_keys) — re-sorts when watched keys change, removes and re-inserts at correct position"],
                ["/framework/core/List/8/", "List8", "index_by(keyFn, watch_keys) — live Map for O(1) lookup, re-indexes on mutation"],
            ];
            rows.forEach(([href, name, desc]) => {
                el("tr", () => {
                    el("td", () => a(name).attr("href", href));
                    el("td", desc);
                });
            });
        });
    });

    // ── Savers ────────────────────────────────────────────────────────────────
    h2("Savers — persistence backends");
    p("All savers implement the same three-method contract: `load(item)`, `save(item, patch)`, `delete(item)`. Set a saver on any Item and children inherit it automatically.");

    div.c("fw-grid", () => {
        const savers = [
            ["/framework/ext/File/", "FileSaver", "Writes Item data to a JSON file on the local filesystem via WebSocket RPC. load() uses fetch(). Debounces concurrent writes."],
            ["/framework/ext/CollectionSaver/", "CollectionSaver", "Persists a whole List as a JSON array to one file. load() instantiates each element as an Item. Debounced like FileSaver."],
            ["/framework/ext/LocalStorageSaver/", "LocalStorageSaver", "Persists Item data to browser localStorage by key. Synchronous. Good for settings and lightweight state."],
            ["/framework/ext/MemorySaver/", "MemorySaver", "In-memory ephemeral store. Tracks save_count and deleted flag for assertions. Used in all unit tests."],
        ];
        savers.forEach(([href, name, desc]) => {
            div.c("fw-card", () => {
                a(name).attr("href", href);
                p(desc);
            });
        });
    });

    // ── Higher-level ──────────────────────────────────────────────────────────
    h2("Higher-level modules");

    div.c("fw-grid", () => {
        const mods = [
            ["/framework/ext/Store/", "Store", "Registry for named Items. Store.item('key') lazily creates an Item9 with FileSaver pointing to /data/{key}.json. Singleton per name."],
            ["/framework/ext/Notes/", "NoteItem / NoteList", "Demo app: NoteItem extends Item9 with title, body, tags, word_count, preview, archive/unarchive. NoteList extends List7 with reactive active/archived/by_date/by_first_tag views."],
            ["/framework/ext/Todo/", "TodoItem / TodoList", "Demo app: TodoItem extends Item7 with done, priority, computed label. TodoList extends List4 with active/done_items/by_priority derived views."],
            ["/framework/ext/Bind/", "bind.js", "Two-way DOM binding helpers: bind(input, item, key), bind_text, bind_checked, bind_number, bind_select. Each returns a cleanup function for switchable editors."],
        ];
        mods.forEach(([href, name, desc]) => {
            div.c("fw-card", () => {
                a(name).attr("href", href);
                p(desc);
            });
        });
    });

    // ── Testing ───────────────────────────────────────────────────────────────
    h2("Testing");

    div.c("fw-grid", () => {
        div.c("fw-card", () => {
            a("Test0 — Node runner").attr("href", "/framework/core/Test/0/");
            p("Runs in Node, no DOM. Suites attach to their class: `Item0.test = new Test0({ class: Item0 })`. Higher levels inherit lower contracts via `suite.add(lowerSuite)`. Run with: node --import ./scripts/register.mjs path/to/Foo.test.js");
        });
        div.c("fw-card", () => {
            a("Test1 — browser renderer").attr("href", "/framework/core/Test/1/");
            p("Extends Test0 with a collapsible browser view. Passed suites collapse to a single summary line. Failed suites open automatically. Each page.js runs its suite and renders Test1.View.");
        });
        div.c("fw-card", () => {
            a("Playwright — browser tests").attr("href", "#");
            p("21 browser tests via npx playwright test — one per framework page. Navigates to each page, waits for .t1-suite to render, asserts zero .t1-suite.fail elements. Server starts automatically on port 3131.");
        });
    });

    p(`Current status: 26/26 Node test suites passing · 21/21 Playwright browser tests passing.`);

    // ── Dev conventions ───────────────────────────────────────────────────────
    h2("Dev conventions");

    el.c("table", "fw-table", () => {
        el("tbody", () => {
            const rows = [
                ["No bundler", "Import paths are /framework/... served directly. scripts/loader.mjs maps them in Node tests."],
                ["No comments", "Code is self-documenting. Comments only for non-obvious WHY — hidden constraint, subtle invariant, workaround."],
                ["constructor via assign()", "new Foo({ key: val }) works for all properties. Subclasses call super(...args) and add defaults."],
                ["item.ready", "Always means: data loaded, children instantiated, ready to call get/set."],
                ["toJSON()", "Nested Items implement toJSON(){ return this.data } so JSON.stringify traverses naturally."],
                ["app.js", "Single import entry point for pages. Exports everything: Item, List, Store, all Savers, View helpers."],
                ["readme.md", "Every module folder has a design doc — decisions made, open questions, next steps. Living document."],
            ];
            rows.forEach(([k, v]) => {
                el("tr", () => {
                    el("td", k);
                    el("td", v);
                });
            });
        });
    });
});
