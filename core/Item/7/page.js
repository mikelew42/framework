import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item7 from "./Item7.test.js";

app.$root.ac("page");

h1("Item7 — computed fields");
p("`compute(key, deps, fn)` registers a derived field that auto-recalculates whenever any listed dependency changes. The function receives the current values of each dep in order. `'change'` fires for the computed key only if the result actually differs — respects batching from Item6.");

await Item7.test.run();
new Test1.View({ suite: Item7.test }).render();

// Live demo: order calculator with computed total
h1("Live demo");
p("Edit fields — computed total updates in real time.");

el("style", `
    .i7-demo { font-family: sans-serif; max-width: 24em; margin: 1em; }
    .i7-row { display: flex; gap: 1em; align-items: center; margin: 0.4em 0; }
    .i7-row label { width: 6em; font-weight: bold; }
    .i7-row input { width: 6em; padding: 0.3em; }
    .i7-total { font-size: 1.3em; font-weight: bold; margin-top: 0.8em; font-family: monospace; }
    .i7-events { margin-top: 0.5em; font-family: monospace; font-size: 0.8em; color: #666; max-height: 4em; overflow: auto; }
`);

const order = new Item7({ data: { price: 10, qty: 3, discount: 2 } });

order.compute('subtotal', ['price', 'qty'], (p, q) => p * q);
order.compute('total', ['subtotal', 'discount'], (s, d) => s - d);

let eventsEl;

div.c("i7-demo", () => {
    for (const [key, label] of [['price', 'Price ($)'], ['qty', 'Quantity'], ['discount', 'Discount ($)']]) {
        div.c("i7-row", () => {
            el("label", label);
            const input = el("input");
            input.el.type = 'number';
            input.el.value = order.get(key);
            input.el.addEventListener("input", e => {
                const n = Number(e.target.value);
                if (!isNaN(n)) order.set(key, n);
            });
        });
    }

    const totalEl = div.c("i7-total", `Total: $${order.get('total')}`);
    eventsEl = div.c("i7-events");

    order.on('change', (key, val) => {
        if (key === 'total') totalEl.el.textContent = `Total: $${val}`;
        eventsEl.el.innerHTML = `<div>change: ${key} = ${val}</div>` + eventsEl.el.innerHTML;
    });
});
