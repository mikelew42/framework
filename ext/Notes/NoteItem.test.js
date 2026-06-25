import Item9 from '/framework/core/Item/9/Item9.test.js';
import NoteItem from './NoteItem.js';
import NoteList from './NoteList.js';
import Test0 from '/framework/core/Test/0/Test0.js';

NoteItem.test = new Test0({ class: NoteItem, _name: 'NoteItem' });
NoteItem.test.add(Item9.test);

NoteItem.test
    .add("defaults initialized correctly", t => {
        const note = new NoteItem();
        t.assert(note.get('title') === '', "title is ''");
        t.assert(note.get('body') === '', "body is ''");
        t.assert(Array.isArray(note.get('tags')), "tags is array");
        t.assert(note.get('archived') === false, "archived is false");
        t.assert(typeof note.get('created_at') === 'number', "created_at is number");
    })
    .add("word_count computed from body", t => {
        const note = new NoteItem({ data: { body: 'Hello world foo' } });
        t.assert(note.get('word_count') === 3, "3 words");
        note.set('body', 'One');
        t.assert(note.get('word_count') === 1, "1 word after set");
        note.set('body', '');
        t.assert(note.get('word_count') === 0, "0 for empty body");
    })
    .add("preview truncates long body", t => {
        const note = new NoteItem({ data: { body: 'a'.repeat(200) } });
        t.assert(note.get('preview').endsWith('…'), "preview has ellipsis");
        t.assert(note.get('preview').length <= 121, "preview is max 121 chars (120 + …)");
    })
    .add("preview shows full body when short", t => {
        const note = new NoteItem({ data: { body: 'Short note.' } });
        t.assert(note.get('preview') === 'Short note.', "preview equals body");
    })
    .add("archive() / unarchive()", t => {
        const note = new NoteItem();
        note.archive();
        t.assert(note.get('archived') === true, "archived after archive()");
        note.unarchive();
        t.assert(note.get('archived') === false, "not archived after unarchive()");
    })
    .add("add_tag() / remove_tag()", t => {
        const note = new NoteItem();
        note.add_tag('work');
        t.assert(note.data.tags.includes('work'), "work tag added");
        note.add_tag('urgent');
        t.assert(note.data.tags.length === 2, "two tags");
        note.add_tag('work'); // duplicate
        t.assert(note.data.tags.length === 2, "duplicate not added");
        note.remove_tag('work');
        t.assert(!note.data.tags.includes('work'), "work removed");
        t.assert(note.data.tags.includes('urgent'), "urgent still there");
    })
    .add("set('title') updates updated_at", t => {
        const note = new NoteItem({ data: { updated_at: 100 } });
        note.set('title', 'New title');
        t.assert(note.data.updated_at > 100, "updated_at bumped");
    })
    .add("add_tag fires 'change' for tags", t => {
        const note = new NoteItem();
        const changes = [];
        note.on('change', (key) => changes.push(key));
        note.add_tag('x');
        t.assert(changes.includes('tags'), "'change' fired for tags");
    })
    .add("schema: title coerced to string", t => {
        const note = new NoteItem();
        note.set('title', 42);
        t.assert(note.get('title') === '42', "42 → '42'");
    })
    .add("undo restores title", t => {
        const note = new NoteItem();
        note.checkpoint();
        note.set('title', 'Hello');
        t.assert(note.get('title') === 'Hello', "title set");
        note.undo();
        t.assert(note.get('title') === '', "title restored to ''");
    });

// NoteList tests
const NoteListTest = new Test0({ _name: 'NoteList' });
NoteItem.test.add(NoteListTest);

const mkNote = (title, archived = false) => new NoteItem({ data: { title, archived, tags: [], body: '', created_at: Date.now(), updated_at: Date.now() } });

NoteListTest
    .add("active reactive filter", t => {
        const list = new NoteList();
        const a = mkNote('A');
        const b = mkNote('B', true); // archived
        list.append(a, b);
        const active = list.active;
        t.assert(active.children.length === 1, "one active note");
        t.assert(active.children[0] === a, "active is note a");
        b.unarchive();
        t.assert(active.children.length === 2, "b now active after unarchive");
    })
    .add("with_tag reactive filter", t => {
        const list = new NoteList();
        const work = new NoteItem({ data: { title: 'Task', tags: ['work'], body: '', archived: false, created_at: 0, updated_at: 0 } });
        const home = new NoteItem({ data: { title: 'Chore', tags: ['home'], body: '', archived: false, created_at: 0, updated_at: 0 } });
        list.append(work, home);
        const work_notes = list.with_tag('work');
        t.assert(work_notes.children.length === 1, "one work note");
        home.add_tag('work');
        t.assert(work_notes.children.length === 2, "home now has work tag — shows in filter");
    })
    .add("by_date sorts most recent first", t => {
        const list = new NoteList();
        const old = new NoteItem({ data: { title: 'Old', updated_at: 100, tags: [], body: '', archived: false, created_at: 100 } });
        const new_ = new NoteItem({ data: { title: 'New', updated_at: 999, tags: [], body: '', archived: false, created_at: 999 } });
        list.append(old, new_);
        const dated = list.by_date;
        t.assert(dated.children[0] === new_, "most recent first");
        t.assert(dated.children[1] === old, "older second");
    })
    .add("by_first_tag groups correctly", t => {
        const list = new NoteList();
        const w1 = new NoteItem({ data: { title: 'W1', tags: ['work'], body: '', archived: false, created_at: 0, updated_at: 0 } });
        const w2 = new NoteItem({ data: { title: 'W2', tags: ['work', 'urgent'], body: '', archived: false, created_at: 0, updated_at: 0 } });
        const h1 = new NoteItem({ data: { title: 'H1', tags: ['home'], body: '', archived: false, created_at: 0, updated_at: 0 } });
        const u1 = new NoteItem({ data: { title: 'Untagged', tags: [], body: '', archived: false, created_at: 0, updated_at: 0 } });
        list.append(w1, w2, h1, u1);
        const groups = list.by_first_tag;
        t.assert(groups.get('work')?.children.length === 2, "two work notes");
        t.assert(groups.get('home')?.children.length === 1, "one home note");
        t.assert(groups.get('untagged')?.children.length === 1, "one untagged note");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await NoteItem.test.run();
    NoteItem.test.print();
}

export default NoteItem;
