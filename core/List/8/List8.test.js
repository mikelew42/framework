import List7 from '../7/List7.test.js';
import List8 from './List8.js';
import Item5 from '../../Item/5/Item5.js';
import Test0 from '../../Test/0/Test0.js';

List8.test = new Test0({ class: List8, _name: 'List8' });
List8.test.add(List7.test);

const mkItem = (id, val = 0) => new Item5({ data: { id, val } });

List8.test
    .add("index_by — initial index", t => {
        const list = new List8();
        const a = mkItem('a'), b = mkItem('b');
        list.append(a, b);
        const idx = list.index_by(item => item.data.id);
        t.assert(idx.get('a') === a, "a indexed");
        t.assert(idx.get('b') === b, "b indexed");
        t.assert(idx.size === 2, "two entries");
    })
    .add("index_by — add updates index", t => {
        const list = new List8();
        const idx = list.index_by(item => item.data.id);
        const c = mkItem('c');
        list.append(c);
        t.assert(idx.get('c') === c, "c added to index");
    })
    .add("index_by — remove clears index entry", t => {
        const list = new List8();
        const a = mkItem('a'), b = mkItem('b');
        list.append(a, b);
        const idx = list.index_by(item => item.data.id);
        list.remove(a);
        t.assert(!idx.has('a'), "a removed from index");
        t.assert(idx.get('b') === b, "b still indexed");
    })
    .add("index_by — empty list", t => {
        const list = new List8();
        const idx = list.index_by(item => item.data.id);
        t.assert(idx.size === 0, "empty index");
        list.append(mkItem('x'));
        t.assert(idx.size === 1, "one after append");
    })
    .add("index_by — key mutation re-indexes", t => {
        const list = new List8();
        const a = mkItem('old_key');
        list.append(a);
        const idx = list.index_by(item => item.data.id, ['id']);
        t.assert(idx.get('old_key') === a, "initially indexed");
        a.set('id', 'new_key');
        t.assert(!idx.has('old_key'), "old key removed");
        t.assert(idx.get('new_key') === a, "new key indexed");
    })
    .add("index_by — unrelated key change doesn't reindex", t => {
        const list = new List8();
        const a = mkItem('key_a');
        list.append(a);
        const idx = list.index_by(item => item.data.id, ['id']);
        a.set('val', 99);  // val is not in watch_keys
        t.assert(idx.get('key_a') === a, "still indexed at same key");
    })
    .add("index_by — removed item unsubscribed", t => {
        const list = new List8();
        const a = mkItem('a');
        list.append(a);
        const idx = list.index_by(item => item.data.id, ['id']);
        list.remove(a);
        t.assert(!idx.has('a'), "removed from index");
        a.set('id', 'new_id');  // should not affect index
        t.assert(!idx.has('new_id'), "mutating removed item has no effect");
    })
    .add("index_by — numeric keys", t => {
        const list = new List8();
        list.append(new Item5({ data: { n: 1 } }), new Item5({ data: { n: 2 } }));
        const idx = list.index_by(item => item.data.n);
        t.assert(idx.has(1), "key 1 indexed");
        t.assert(idx.has(2), "key 2 indexed");
    })
    .add("index_by — last-write-wins on duplicate keys", t => {
        const list = new List8();
        const a = mkItem('dup', 1), b = mkItem('dup', 2);
        list.append(a, b);
        const idx = list.index_by(item => item.data.id);
        t.assert(idx.get('dup') === b, "b wins (appended later)");
    })
    .add("index_by — computed key function", t => {
        const list = new List8();
        list.append(mkItem('hello'), mkItem('world'));
        const idx = list.index_by(item => item.data.id.toUpperCase());
        t.assert(idx.has('HELLO'), "uppercase key works");
        t.assert(idx.has('WORLD'), "uppercase key works");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List8.test.run();
    List8.test.print();
}

export default List8;
