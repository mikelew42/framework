import { app, el, div, h1, h2, h3, p, test } from "../../../app.js";
import Draggable from "./Draggable.js";
import Movable from "./Movable.js";
import Sortable from "./Sortable.js";
import Previewable from "./Previewable.js";
import Constraints from "./Constraints.js";

app.$root.ac("page drag3-page");

el("style", `
.drag3-page {
    padding: 1.5rem;
}
`);

h1("Draggable3");

div.c("drag3-section", () => {
    h2("Overview");
    p("Draggable3 is a modular, plugin-based draggable system. Start with a small, focused core and compose behavior using plugins like Movable, Sortable, Previewable, and Constraints.");
    p("Each draggable instance is created with a config object, and plugins are attached via .addPlugin(). This page documents the core API and shows interactive examples.");
});

div.c("drag3-section", () => {
    h2("Core API");

    p("Create a basic draggable by passing a config object. The only required property is view, which should be a View instance created with the framework helpers.");

    el("div").ac("drag3-code").text(`
import Draggable from "./Draggable.js";
import Movable from "./Movable.js";

const box = div.c("drag3-box", "Drag me");

const drag = new Draggable({
    view: box,
    handle: box,          // optional, defaults to view
    container: null,      // optional, for sortable behaviors
    enabled: true,        // optional, default true
    threshold: 4,         // optional, pixels before drag starts
    cursor: "grab",       // optional, cursor style
    start(e){},
    move(e){},
    stop(e){},
    drop(e){},
    drop_check(e){ return false; }
});

drag.addPlugin(Movable());
    `.trim());
});

// Basic dragging example (no movement, just events)
test("Draggable3 - basic", t => {
    const row = div.c("drag3-demo-row");

    const box = div.c("drag3-box", "Basic drag (no movement)");
    row.append(box);

    new Draggable({
        view: box,
        threshold: 0,
        start(){
            console.log("Draggable3 basic start");
        },
        move(){
            console.log("Draggable3 basic move");
        },
        stop(){
            console.log("Draggable3 basic stop");
        }
    });
});

// Movable example
test("Draggable3 - Movable", t => {
    const row = div.c("drag3-demo-row");

    const box = div.c("drag3-box", "Movable");
    row.append(box);

    const drag = new Draggable({
        view: box,
        threshold: 0
    });

    drag.addPlugin(Movable());
});

// Sortable list example
test("Draggable3 - Sortable list", t => {
    const section = div.c("drag3-section");
    h3("Sortable list");
    p("Drag items up and down to reorder them within the list.");

    const list = div.c("drag3-list");
    section.append(list);

    const items = ["One", "Two", "Three", "Four"];

    items.forEach(label => {
        const item = div.c("drag3-list-item", label);
        list.append(item);

        const view = item; // already a View

        const drag = new Draggable({
            view,
            container: list
        });

        drag.addPlugin(Movable());
        drag.addPlugin(Sortable());
    });
});

// Sortable + Previewable example
test("Draggable3 - Sortable + Previewable", t => {
    const section = div.c("drag3-section");
    h3("Sortable with preview");
    p("Drag items to see a visual preview of the drop target.");

    const list = div.c("drag3-list");
    section.append(list);

    const items = ["Alpha", "Beta", "Gamma", "Delta"];

    items.forEach(label => {
        const item = div.c("drag3-list-item", label);
        list.append(item);

        const view = item;

        const drag = new Draggable({
            view,
            container: list
        });

        drag.addPlugin(Movable());
        drag.addPlugin(Sortable());
        drag.addPlugin(Previewable());
    });
});

// Constraints example
test("Draggable3 - Constraints (axis + grid)", t => {
    const section = div.c("drag3-section");
    h3("Constraints");
    p("This box is locked to the horizontal axis and snaps to a 40px grid.");

    const row = div.c("drag3-demo-row");
    section.append(row);

    const box = div.c("drag3-box", "Axis X + grid 40px");
    row.append(box);

    const drag = new Draggable({
        view: box,
        threshold: 0
    });

    const constraints = Constraints({ axis: "x", grid: 40 });
    drag.addPlugin(constraints);

    // Custom movable that respects constraints
    drag.addPlugin(function(draggable){
        return {
            name: "ConstrainedMovable",
            start(e){
                this.startX = e.clientX;
                this.startY = e.clientY;
                const rect = draggable.view.el.getBoundingClientRect();
                this.originLeft = rect.left + window.scrollX;
                this.originTop = rect.top + window.scrollY;
                draggable.view.el.style.willChange = "transform";
            },
            move(e){
                const c = draggable._constraints;
                if (!c) return;
                draggable.view.el.style.transform = `translate(${c.dx}px, ${c.dy}px)`;
            },
            stop(){
                draggable.view.el.style.transform = "";
                draggable.view.el.style.willChange = "";
            }
        };
    });
});

// Combined plugins example
test("Draggable3 - Combined", t => {
    const section = div.c("drag3-section");
    h3("Combined plugins");
    p("Draggable3 instances can compose multiple plugins. Here we show a tiny board where you can drag items between lists.");

    const row = div.c("drag3-demo-row");
    section.append(row);

    function makeList(title, items){
        const col = div.c("drag3-list");
        const header = div.c("drag3-list-item", title);
        col.append(header);

        const body = div.c("drag3-list");
        col.append(body);

        items.forEach(label => {
            const item = div.c("drag3-list-item", label);
            body.append(item);

            const drag = new Draggable({
                view: item,
                container: body
            });

            drag.addPlugin(Movable());
            drag.addPlugin(Sortable());
            drag.addPlugin(Previewable());
        });

        return col;
    }

    row.append(makeList("Todo", ["Task 1", "Task 2"]));
    row.append(makeList("Doing", ["Task 3"]));
    row.append(makeList("Done", ["Task 4"]));
});

