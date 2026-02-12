import app, { div, h1, h2, h3, p, code, section, button, br, hr, span, label, input, select, textarea, ul, li, el } from "/app.js";

app.$root.ac("page");

h1("Framework CSS");
p("Comprehensive documentation of the core styles defined in `framework.css`.");

hr();

// --- BASE LAYER ---
section(() => {
    h2("Base Layer");
    p("Basic resets and typography defaults for all elements.");

    h3("Typography & Resets");
    p("The base layer sets standard margins and line heights.");
    div.c("viz", () => {
        h3("Heading Level 3");
        p("Paragraph with standard line height and overflow-wrap. LongWordThatShouldWrapEvenIfItIsVeryLongIndeed.");
        ul(() => {
            li("List item one");
            li("List item two");
        });
    });
});

hr();

// --- THEME LAYER ---
section(() => {
    h2("Theme Layer");
    p("Defines design tokens and specific element styles.");

    h3("Colors");
    div.c("flex gap wrap", () => {
        div.c("viz pad", d => {
            code("var(--prim)");
        });
        div.c("viz pad", d => {
            code("var(--bg)");
        });
        div.c("viz pad", d => {
            code("var(--subtle)");
        });
    });

    h3("Buttons");
    div.c("flex gap wrap", () => {
        button("Default Button");
        button("Primary Button").ac("prim");
        button("BG Button").ac("bg");
    });

    h3("Forms");
    div.c("flex v gap", () => {
        div.c("flex v", () => {
            label("Standard Input");
            input().attr("placeholder", "Type here...");
        });
        div.c("flex v", () => {
            label("Select Menu");
            select(() => {
                el("option", "Option 1");
                el("option", "Option 2");
            });
        });
        div.c("flex v", () => {
            label("Textarea (auto-sized)");
            textarea().ac("auto").attr("placeholder", "Expands with content...");
        });
    });
});

hr();

// --- UTILITY LAYER ---
section(() => {
    h2("Utility Layer");
    p("Helper classes for layout, spacing, and debugging.");

    h3("Flex Layouts");
    p("`.flex` and its modifiers for rapid layout building.");
    div.c("flex v gap", () => {
        p("`.flex.gap` (Horizontal)");
        div.c("flex gap viz all-pad", () => {
            div("Item 1");
            div("Item 2");
            div("Item 3");
        });

        p("`.flex.v.gap` (Vertical)");
        div.c("flex v gap viz all-pad", () => {
            div("Item A");
            div("Item B");
        });

        p("`.flex.split` (Space Between)");
        div.c("flex split viz all-pad", () => {
            div("Left Side");
            div("Right Side");
        });
    });

    h3("Grid & Auto Layouts");
    p("`.grid.auto` for responsive columns (uses `--column` variable).");
    div.c("grid auto gap viz all-pad", () => {
        div("Column 1");
        div("Column 2");
        div("Column 3");
    }).style("--column", "100px");

    h3("Debug Tool - .viz");
    p("Visualizes elements and their children for debugging layouts.");
    div.c("viz pad", () => {
        p("I am inside a .viz container");
        div.c("flex gap", () => {
            div("Child 1");
            div("Child 2");
        });
    });
});

hr();

// --- OVERRIDE LAYER ---
section(() => {
    h2("Override Layer");
    p("Utility classes for final adjustments and color modes.");

    h3("Dark & Light Modes");
    div.c("flex gap wrap", () => {
        div.c("dark pad", "This is .dark mode");
        div.c("light pad", "This is .light mode");
    });

    h3("Margins");
    p("`.mb-0`, `.ml-auto`, `.mr-auto`, `.mx-auto` for centering or removing margins.");
    div.c("viz all-pad", () => {
        div("Centered with .mx-auto").ac("mx-auto").style("width", "max-content");
    });
});
