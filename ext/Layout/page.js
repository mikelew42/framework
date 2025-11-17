import app, { App, el, div, View, h1, h2, h3, icon, p, is, test } from "/app.js";
import Layout from "./Layout.js";


app.$root.ac("pad");

h1("Layout");

div.c("flex flex-wrap columns mb-1 flex-gap-1", () => {
    div.c("card min-w-400 flex-1", () => {
        h3("This is an H3");
        p("This is a paragraph.");
    });
    div.c("card min-w-400 flex-1", () => {
        h3("This is an H3");
        p("This is a paragraph.");
    });
    div.c("card min-w-400 flex-1", () => {
        h3("This is an H3");
        p("This is a paragraph.");
    });
});

const layout = new Layout();
layout.view.style("margin-bottom", "2em");

div.c("card", () => {

    p("It seems flex is tricky.");

    h2("Use flex: 1 1 0%");
    p("And then make sure the min-width (breakpoint) is on the flex items, not children.")

    h3("flex: 1 1 auto");
    // p("Works better for wrapping (with content that has own min-width).  Setting a % basis ruins that.")
    // p("However, you don't get even columns without using a %.");
    p("I had a problem before with min-width on child blocks not being obeyed?");
    p("The problem was the .layout { min-width: 300px; } part.  And it was working as it should?");
    p("The blocks would overlap, and I think it was because the min-width on the parent was overriding the min-width of the children, so that the children would poke through the parent.")
});

const layout1 = new Layout().flex().wrap();
layout1.child1 = layout1.add().minw400().grow();
layout1.child2 = layout1.add().minw400().grow();
layout1.child3 = layout1.add().minw400().grow();

layout1.child1.add();
layout1.child1.add();
layout1.child2.add();
layout1.child2.add();
layout1.child2.add();
layout1.child3.add();