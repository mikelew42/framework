import app, { h1, div, el, p } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import Item9 from "./Item9.test.js";

app.$root.ac("page");

h1("Item9 — checkpoint / undo / redo");
p("`checkpoint()` snapshots `data` (deep clone) onto a history stack. `undo()` and `redo()` restore snapshots and emit `'undo'`/`'redo'` events. `save()` auto-checkpoints before persisting. History is per-instance and isolated — array mutations in snapshots don't corrupt earlier states.");

await Item9.test.run();
new Test1.View({ suite: Item9.test }).render();

h1("Live demo — text editor with undo");

el("style", `
    .editor { font-family: sans-serif; max-width: 32em; margin: 1em; }
    .editor textarea { width: 100%; height: 6em; padding: 0.5em; font-size: 1em; box-sizing: border-box; }
    .editor-toolbar { display: flex; gap: 0.5em; margin: 0.3em 0; }
    .editor-toolbar button { padding: 0.3em 0.7em; cursor: pointer; }
    .editor-toolbar button:disabled { opacity: 0.4; cursor: default; }
    .editor-status { font-size: 0.8em; color: #888; margin-top: 0.3em; }
`);

const note = new Item9({ data: { text: '', saved: false } });
note.schema({ text: String });

div.c("editor", () => {
    const textarea = el("textarea");
    textarea.el.value = note.get('text') || '';

    div.c("editor-toolbar", () => {
        const undo_btn = el("button", "Undo").el;
        const redo_btn = el("button", "Redo").el;
        const save_btn = el("button", "Checkpoint").el;

        const update_btns = () => {
            undo_btn.disabled = !note.can_undo;
            redo_btn.disabled = !note.can_redo;
        };

        undo_btn.addEventListener("click", () => { note.undo(); update_btns(); });
        redo_btn.addEventListener("click", () => { note.redo(); update_btns(); });
        save_btn.addEventListener("click", () => { note.checkpoint(); update_btns(); });

        update_btns();

        note.on('undo', () => update_btns());
        note.on('redo', () => update_btns());
    });

    textarea.el.addEventListener("input", () => {
        note.set('text', textarea.el.value);
    });

    note.on('change', (key, val) => {
        if (key === 'text' && textarea.el.value !== val) {
            textarea.el.value = val ?? '';
        }
    });

    const status = div.c("editor-status", "Type something, then click Checkpoint to save an undo point.");

    note.on('undo', () => {
        status.el.textContent = `Undo — ${note._history.length} history point(s) remain`;
    });
    note.on('redo', () => {
        status.el.textContent = `Redo — ${note._future.length} future point(s) remain`;
    });
});
