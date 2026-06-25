import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item8 from "./Item8.test.js";

app.$root.ac("page");

h1("Item8 — schema + type coercion");
p("`schema(def)` maps keys to coercers — built-in types `Number`, `String`, `Boolean`, `Array`, `Object` or any function. `set()` pre-coerces values before storing; on failure it emits an `'error'` event `(key, rawVal, err)` and leaves the field unchanged. Works alongside `compute()` from Item7.");

await Item8.test.run();
new Test1.View({ suite: Item8.test }).render();

h1("Live demo — Product form");
p("Fields have Number/Boolean schema. Errors surface inline.");

el("style", `
    .demo { font-family: sans-serif; max-width: 28em; margin: 1em; }
    .field { margin: 0.5em 0; display: flex; gap: 0.5em; align-items: center; }
    .field label { width: 7em; font-size: 0.9em; }
    .field input { flex: 1; padding: 0.3em; }
    .error { color: red; font-size: 0.8em; }
    .output { margin: 1em 0; padding: 0.5em; background: #f5f5f5; font-size: 0.9em; }
`);

class Product extends Item8 {
    constructor(...args) {
        super(...args);
        this.schema({ price: Number, qty: Number, active: Boolean });
        this.compute('subtotal', ['price', 'qty'], (p, q) => +(p * q).toFixed(2));
    }
}

const product = new Product({ data: { name: 'Widget', price: 9.99, qty: 1, active: true } });

const err_display = {};

product.on('error', (key, val, err) => {
    if (err_display[key]) err_display[key].textContent = err.message;
});

product.on('change', () => update_output());

function make_field(key, label_text) {
    div.c("field", () => {
        el("label", label_text);
        const input = el("input");
        input.el.value = product.get(key) ?? '';
        input.el.addEventListener("input", () => product.set(key, input.el.value));
        err_display[key] = el.c("span", "error").el;
        product.on('change', (k, v) => { if (k === key) { err_display[key].textContent = ''; } });
    });
}

const output = div.c("output");
function update_output() {
    output.el.innerHTML = `
        <b>${product.get('name')}</b><br>
        Price: $${product.get('price')} × Qty: ${product.get('qty')} = $${product.get('subtotal')}<br>
        Active: ${product.get('active')}
    `;
}

div.c("demo", () => {
    make_field('name', 'Name (str)');
    make_field('price', 'Price (num)');
    make_field('qty', 'Qty (num)');
    make_field('active', 'Active (bool)');
    p("Type a non-number into Price/Qty, or a non-boolean into Active — see the error.");
    update_output();
});
