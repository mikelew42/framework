import app, { h1, div, el, p, ListSaver } from "/app.js";
import Test1 from "/framework/core/Test/1/Test1.js";
import NoteItem from "./NoteItem.test.js";
import NoteList from "./NoteList.js";
import { bind, bind_text } from "/framework/ext/Bind/bind.js";

app.$root.ac("page");

el("style", `
    .notes-app  { display: flex; gap: 0; height: 80vh; font-family: sans-serif; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .notes-list { width: 260px; border-right: 1px solid #ddd; overflow-y: auto; background: #fafafa; }
    .notes-toolbar { padding: 0.5em; border-bottom: 1px solid #eee; display: flex; gap: 0.3em; }
    .notes-toolbar button { padding: 0.3em 0.6em; cursor: pointer; font-size: 0.8em; }
    .note-row  { padding: 0.5em 0.7em; border-bottom: 1px solid #eee; cursor: pointer; }
    .note-row.active { background: #e8f0fe; }
    .note-row-title { font-weight: 500; font-size: 0.9em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .note-row-meta  { font-size: 0.75em; color: #888; }
    .notes-editor { flex: 1; display: flex; flex-direction: column; }
    .editor-toolbar { padding: 0.4em 0.6em; border-bottom: 1px solid #eee; display: flex; gap: 0.3em; align-items: center; }
    .editor-toolbar button { padding: 0.2em 0.5em; cursor: pointer; font-size: 0.8em; }
    .editor-toolbar span { font-size: 0.75em; color: #999; margin-left: auto; }
    .notes-title { border: none; outline: none; font-size: 1.2em; font-weight: 600; padding: 0.7em; border-bottom: 1px solid #f0f0f0; width: 100%; box-sizing: border-box; }
    .notes-body  { border: none; outline: none; flex: 1; padding: 0.7em; font-size: 0.95em; resize: none; line-height: 1.5; width: 100%; box-sizing: border-box; }
    .notes-tags  { padding: 0.3em 0.7em; font-size: 0.75em; color: #666; border-top: 1px solid #f0f0f0; }
`);

h1("Notes — NoteItem (Item9) + NoteList (List7) + ListSaver");
p("Data persists to /data/notes.json via ListSaver.");

const saver = new ListSaver({ path: '/data/notes.json', item_class: NoteItem });
const notes = new NoteList();

await saver.load(notes);

const active_notes = notes.active;

const persist = () => saver.save(notes);
notes.on('add',    persist);
notes.on('remove', persist);

let current_note = null;
let title_el, body_el, tags_el, undo_btn, redo_btn, word_count_el, list_container;
let unbind_title = null, unbind_body = null, unbind_words = null;

function update_editor_ui() {
    if (!current_note) return;
    if (undo_btn) undo_btn.disabled = !current_note.can_undo;
    if (redo_btn) redo_btn.disabled = !current_note.can_redo;
}

function select_note(note) {
    // Clean up previous bindings
    unbind_title?.();
    unbind_body?.();
    unbind_words?.();

    current_note = note;

    // Bind editor fields — undo/redo automatically updates DOM via 'change' events
    unbind_title = bind(title_el, note, 'title');
    unbind_body  = bind(body_el,  note, 'body');
    unbind_words = bind_text(word_count_el, note, 'word_count');

    tags_el.textContent = (note.data.tags ?? []).join(', ') || '(no tags)';

    // Re-listen for undo/redo state changes
    note.on('change', () => update_editor_ui());
    note.on('undo',   () => { update_editor_ui(); tags_el.textContent = (note.data.tags ?? []).join(', ') || '(no tags)'; });
    note.on('redo',   () => { update_editor_ui(); tags_el.textContent = (note.data.tags ?? []).join(', ') || '(no tags)'; });

    update_editor_ui();

    // Update active highlight in list
    document.querySelectorAll('.note-row').forEach(r => r.classList.remove('active'));
    const rows = list_container.el.querySelectorAll('.note-row');
    active_notes.each((n, i) => { if (n === note) rows[i]?.classList.add('active'); });
}

function render_list() {
    list_container.el.innerHTML = '';
    active_notes.each(note => {
        const row = div.c("note-row");
        if (note === current_note) row.el.classList.add('active');
        const title_row = div.c("note-row-title", note.get('title') || '(untitled)');
        const meta_row  = div.c("note-row-meta",  `${note.get('word_count')} words`);
        title_row.append_to(row);
        meta_row.append_to(row);
        row.el.addEventListener("click", () => select_note(note));
        note.on('change', () => {
            title_row.el.textContent = note.get('title') || '(untitled)';
            meta_row.el.textContent  = `${note.get('word_count')} words`;
        });
        list_container.el.append(row.el);
    });
}

div.c("notes-app", () => {
    div.c("notes-list", () => {
        div.c("notes-toolbar", () => {
            el("button", "+ New").el.addEventListener("click", () => {
                const note = new NoteItem({ data: {
                    id: Date.now().toString(36),
                    title: '', body: '', tags: [], archived: false,
                    created_at: Date.now(), updated_at: Date.now()
                }});
                notes.append(note);
                select_note(note);
                title_el.focus();
            });
        });
        list_container = div();
        notes.on('add',    render_list);
        notes.on('remove', render_list);
        render_list();
    });

    div.c("notes-editor", () => {
        div.c("editor-toolbar", () => {
            undo_btn    = el("button", "Undo").el;
            redo_btn    = el("button", "Redo").el;
            const ckpt_btn    = el("button", "Checkpoint").el;
            const archive_btn = el("button", "Archive").el;
            word_count_el = el("span", "").el;

            // undo/redo auto-sync DOM via bind() 'change' listeners
            undo_btn.addEventListener("click", () => { current_note?.undo(); });
            redo_btn.addEventListener("click", () => { current_note?.redo(); });
            ckpt_btn.addEventListener("click", () => { current_note?.checkpoint(); update_editor_ui(); });
            archive_btn.addEventListener("click", () => {
                if (!current_note) return;
                unbind_title?.(); unbind_body?.(); unbind_words?.();
                current_note.archive();
                persist();
                current_note = null;
                title_el.value = '';
                body_el.value  = '';
                tags_el.textContent = '';
                render_list();
            });
        });

        title_el = el("input").ac("notes-title").el;
        title_el.placeholder = "Note title…";
        title_el.addEventListener("blur", () => { if (current_note) { current_note.checkpoint(); persist(); } });

        body_el = el("textarea").ac("notes-body").el;
        body_el.placeholder = "Write something…";
        body_el.addEventListener("blur", () => { if (current_note) { current_note.checkpoint(); persist(); } });

        tags_el = div.c("notes-tags", "(no tags)").el;
    });
});

if (active_notes.children.length > 0) select_note(active_notes.children[0]);

h1("Test suite");
await NoteItem.test.run();
new Test1.View({ suite: NoteItem.test }).render();
