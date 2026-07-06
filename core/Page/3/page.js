import { app, el, div, h1, h2, h3, p } from "/app.js";
import { page, tabs } from "./Page3.js";
import Markdown from "/framework/ext/Markdown/Markdown.js";

app.$root.ac("pad");
h1.c("", "Page3 — columns & tabs").style({ margin: "0 0 .4em", "font-size": "1.5em" });

// Live theme switcher — themes are just CSS-variable presets (see Pager.css tokens).
el("style", `.themes{display:flex;gap:.3em;align-items:center;margin:0 0 .8em;font-size:.85em;color:#666}.themes .page-btn{padding:.25em .7em}`);
div.c("themes", () => {
    p("theme:").style({ margin: 0 });
    const themes = {
        Light: { "--page-card": "#fff",     "--page-accent": "#3b82f6", "--page-line": "rgba(0,0,0,.12)" },
        Slate: { "--page-card": "#f1f5f9",  "--page-accent": "#0ea5e9", "--page-line": "rgba(15,23,42,.14)" },
        Warm:  { "--page-card": "#fffdf6",  "--page-accent": "#e07a3f", "--page-line": "rgba(120,80,40,.18)" },
    };
    for (const [name, vars] of Object.entries(themes))
        div.c("page-btn", name).click(() => {
            for (const k in vars) document.documentElement.style.setProperty(k, vars[k]);
        });
}).ac("pager");   // borrow .pager .page-btn styling

// COLUMNS (default). Drill in — each pick opens a new column to the right.
page("Docs", (root) => {
    p("`page()` opens children as columns to the right →. `tabs()` (try Settings) shows them in-place. Drill in — ancestors stay visible; use the breadcrumb or ✕ to come back.");

    page("Guide", () => {
        h2("Guide");
        page("Install", () => p("No npm, no bundler — serve & import."));
		page("Readme", () => {
			new Markdown({ file: "readme.md" }).render();
		});
        page("Routing", () => {
			p("Each column is a hash segment: #docs/guide/routing.")
			page("sub1", () => {
				p("Each column is a hash segment: #docs/guide/routing/sub1.")

			});			
			page("sub2", () => {
				p("Each column is a hash segment: #docs/guide/routing/sub2.")

			});
		});
    });

    page("Reference", () => {
        h2("Reference");
        page("Page",  () => p("The noun: title + content + children."));
        page("Pager", () => p("The navigator: routes + layout. ColumnPager / TabPager."));
    });

    // a TABS section nested inside the columns — its children are in-place tabs
    tabs("Settings", () => {
        h2("Settings");
        p("These children are TABS (in-place), even though Settings itself is a column.");
        page("Profile", () => p("Profile tab content."));
        page("Account", () => p("Account tab content."));
        page("Theme",   () => p("Theme tab content."));
    });
});