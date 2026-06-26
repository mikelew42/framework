import app, { el, div, h1, p } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import LocalStorageSaver from "./LocalStorageSaver.js";

app.$root.ac("page");

el("style", `
    .lss-demo { font-family: sans-serif; max-width: 28em; margin: 1em; }
    .lss-demo label { display: block; margin: 0.5em 0 0.2em; font-weight: bold; }
    .lss-demo input { width: 100%; padding: 0.4em; font-size: 1em; box-sizing: border-box; }
    .lss-demo button { margin-top: 0.6em; padding: 0.4em 1em; cursor: pointer; }
    .lss-status { margin-top: 0.6em; color: #555; font-size: 0.9em; font-family: monospace; }
`);

h1("LocalStorageSaver demo");
p("Data persists across page reloads via localStorage.");

const note = new Item({ saver: new LocalStorageSaver({ key: "lss-demo-note" }) });
await note.ready;

let statusEl;
div.c("lss-demo", () => {
    el("label", "Title");
    const titleInput = el("input");
    titleInput.value = note.get("title") || "";
    titleInput.addEventListener("input", () => {
        note.set("title", titleInput.value);
        statusEl.textContent = "unsaved";
    });

    el("label", "Body");
    const bodyInput = el("input");
    bodyInput.value = note.get("body") || "";
    bodyInput.addEventListener("input", () => {
        note.set("body", bodyInput.value);
        statusEl.textContent = "unsaved";
    });

    el("button", "Save").addEventListener("click", () => {
        note.save();
        statusEl.textContent = "saved to localStorage";
    });

    el("button", "Delete").addEventListener("click", async () => {
        await note.delete();
        titleInput.value = "";
        bodyInput.value = "";
        statusEl.textContent = "deleted";
    });

    statusEl = div.c("lss-status", "loaded from localStorage");
});
