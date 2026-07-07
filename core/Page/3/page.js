import { div, el, h2, h3, p } from "/app.js";
import { page, tabs } from "./Page3.js";
import Markdown from "/framework/ext/Markdown/Markdown.js";

/* Page3 demo — FULL SCREEN (no app padding). The whole viewport is one set of
   full-width "paper" tabs, and each tab combines the layouts differently:

     page("X", fn)          → X's children are COLUMNS (Finder drill-down)
     tabs("X", fn)          → X's children are TABS    (paper look, default)
     tabs.buttons("X", fn)  → …TABS with the button look

   The helper you use sets how a node lays out ITS children — a node's own
   appearance is decided by its PARENT. So you nest freely: columns in a tab,
   tabs in a column, tabs in tabs. This page shows all of those combined.       */

// small demo-only styles (previews + control rows)
el("style", `
    .demo-note { color: var(--page-muted); }
    .preview { background: #eee; padding: 1em; border-radius: .6em; margin: .6em 0 1.2em; }
    .ctl-row { display: flex; flex-wrap: wrap; gap: .4em; align-items: center; margin: .3em 0 1em; }
    .ctl-row .lbl { color: var(--page-muted); font-size: .9em; margin: 0 .2em 0 0; }
`);

// ── TOP-LEVEL: full-width paper tabs filling the screen ───────────────────────
const shell = tabs("Frozen Helix", () => {

    // TAB 1 — plain content
    page("Overview", () => {
        h2("Columns & tabs, combined");
        p("These top tabs are the `paper-tabs` look: the active tab is white and flows straight into the content; inactive tabs are dimmed. Because the helper you use only sets how a node lays out ITS children, you can mix layouts at any depth.").ac("demo-note");
        p("Try the tabs above — Columns is a Finder-style drill-down, Nested is tabs-inside-tabs, Styles is a live style guide.");
    });

    // TAB 2 — this tab's children are COLUMNS (Finder drill-down inside the tab)
    page("Columns", () => {
        h3("Finder-style columns");
        p("Each pick opens a new column to the right; ancestors stay visible. Use the breadcrumb or ✕ to come back. (Column width & distribution are live-tunable under Styles ▸ Columns.)").ac("demo-note");

        page("Guide", () => {
            h3("Guide");
            page("Install", () => p("No npm, no bundler — serve & import."));
            page("Routing", () => {
                p("Each column is a hash segment: #columns/guide/routing.");
                page("Deep", () => p("…and it keeps nesting: #columns/guide/routing/deep."));
            });
            page("Readme", () => new Markdown({ file: "readme.md" }).render());
        });
        page("Reference", () => {
            h3("Reference");
            page("Page",  () => p("The noun: title + content + children."));
            page("Pager", () => p("The navigator: routes + layout (ColumnPager / TabPager)."));
        });
    });

    // TAB 3 — this tab's children are TABS (tabs nested in tabs, both looks)
    tabs("Nested", () => {
        h3("Tabs inside tabs");
        p("This whole section is tabs; a panel can hold more tabs, columns, anything.").ac("demo-note");
        page("Profile", () => p("Profile panel."));
        page("Account", () => {
            p("Account panel — with its own BUTTON-style tabs nested inside:");
            tabs.buttons("Security", () => {
                page("Password", () => p("Change password…"));
                page("2FA",      () => p("Two-factor…"));
            });
        });
    });

    // TAB 4 — the style guide (itself nested tabs)
    tabs("Styles", () => {

        // 4a — the two tab looks, side by side (inert previews)
        page("Tab looks", () => {
            h3("Tab looks");
            p("Styling is just a CSS class on the pager — no subclass. Same tabs, two looks:").ac("demo-note");

            p("paper-tabs — `tabs()` (default): white, active flows into content, inactive dimmed.");
            div.c("preview", () => {
                div.c("pager tab-pager paper-tabs", () => {
                    div.c("nav", () => {
                        div.c("page-btn active", "Active");
                        div.c("page-btn", "Dimmed");
                        div.c("page-btn", "Dimmed");
                    });
                    div.c("pages", () => p("The active tab merges into this panel — a clean, paper-like feel."));
                });
            });

            p("button-tabs — `tabs.buttons()`: pill buttons, accent-colored active.");
            div.c("preview", () => {
                div.c("pager tab-pager button-tabs", () => {
                    div.c("nav", () => {
                        div.c("page-btn active", "Active");
                        div.c("page-btn", "Two");
                        div.c("page-btn", "Three");
                    });
                    div.c("pages", () => p("Chunky and obvious — good for toolbars / mode switches."));
                });
            });
        });

        // 4b — live column-layout controls (affect the real Columns tab)
        page("Columns", () => {
            h3("Column layout options");
            p("These controls tweak every column row live. Open the Columns tab first, then come back and try them.").ac("demo-note");

            const set_var  = (k, v) => document.documentElement.style.setProperty(k, v);
            const set_mode = (mode) => document.querySelectorAll(".col-root").forEach(elm => {
                elm.classList.remove("cols-even", "cols-fill", "cols-narrow", "cols-wide");
                if (mode) elm.classList.add(mode);
            });

            div.c("ctl-row", () => {
                p("width:").ac("lbl");
                div.c("page-btn", "Narrow").click(() => { set_mode(); set_var("--col-w", "18em"); });
                div.c("page-btn", "Default").click(() => { set_mode(); set_var("--col-w", "24em"); });
                div.c("page-btn", "Wide").click(() => { set_mode(); set_var("--col-w", "32em"); });
            });
            div.c("ctl-row", () => {
                p("distribute:").ac("lbl");
                div.c("page-btn", "Fixed (scroll)").click(() => set_mode(""));
                div.c("page-btn", "Even").click(() => set_mode("cols-even"));
                div.c("page-btn", "Fill (capped)").click(() => set_mode("cols-fill"));
            });

            p("• Fixed — columns keep --col-w and never shrink → the row scrolls horizontally.").ac("demo-note");
            p("• Even — columns share the row equally (no scroll).").ac("demo-note");
            p("• Fill — columns grow to fill, capped at --col-max.").ac("demo-note");
        });

        // 4c — theme tokens (retheme without touching the pagers)
        page("Theme", () => {
            h3("Theme tokens");
            p("The look is CSS variables (see Pager.css). Flip them live:").ac("demo-note");
            const themes = {
                Light: { "--page-card": "#fff",    "--page-accent": "#3b82f6", "--page-line": "rgba(0,0,0,.12)" },
                Slate: { "--page-card": "#f1f5f9", "--page-accent": "#0ea5e9", "--page-line": "rgba(15,23,42,.14)" },
                Warm:  { "--page-card": "#fffdf6", "--page-accent": "#e07a3f", "--page-line": "rgba(120,80,40,.18)" },
            };
            div.c("ctl-row", () => {
                p("theme:").ac("lbl");
                for (const [name, vars] of Object.entries(themes))
                    div.c("page-btn", name).click(() => {
                        for (const k in vars) document.documentElement.style.setProperty(k, vars[k]);
                    });
            });
        });
    });
});

shell.tab_full = true;   // full-width, full-height top tab strip
