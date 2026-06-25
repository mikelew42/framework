import List6 from '../6/List6.test.js';
import List7 from './List7.js';
import Item5 from '../../Item/5/Item5.js';
import Test0 from '../../Test/0/Test0.js';

List7.test = new Test0({ class: List7, _name: 'List7' });
List7.test.add(List6.test);

const mkItem = (n, label = '') => new Item5({ data: { n, label } });
const by_n = (a, b) => a.data.n - b.data.n;
const by_label = (a, b) => (a.data.label < b.data.label ? -1 : a.data.label > b.data.label ? 1 : 0);

List7.test
    .add("sort_reactive — initial sort", t => {
        const list = new List7();
        list.append(mkItem(3), mkItem(1), mkItem(2));
        const sorted = list.sort_reactive(by_n, ['n']);
        t.assert(sorted.children.map(i => i.data.n).join(',') === '1,2,3', "initially sorted");
    })
    .add("sort_reactive — new item inserted in order", t => {
        const list = new List7();
        list.append(mkItem(3), mkItem(1));
        const sorted = list.sort_reactive(by_n, ['n']);
        list.append(mkItem(2));
        t.assert(sorted.children.map(i => i.data.n).join(',') === '1,2,3', "new item in order");
    })
    .add("sort_reactive — item removed from sorted", t => {
        const list = new List7();
        const b = mkItem(2);
        list.append(mkItem(1), b, mkItem(3));
        const sorted = list.sort_reactive(by_n, ['n']);
        list.remove(b);
        t.assert(sorted.children.map(i => i.data.n).join(',') === '1,3', "item removed");
    })
    .add("sort_reactive — item key change re-sorts", t => {
        const list = new List7();
        // item_x has label 'x', item_y has label 'y', item_z has label 'z'
        const item_y = mkItem(1, 'y');
        const item_x = mkItem(2, 'x');
        const item_z = mkItem(3, 'z');
        list.append(item_y, item_x, item_z);
        const sorted = list.sort_reactive(by_label, ['label']);
        t.assert(sorted.children.map(i => i.data.label).join(',') === 'x,y,z', "initial order");
        item_x.set('label', 'w');  // item_x moves from 'x' to 'w' — stays first
        t.assert(sorted.children.map(i => i.data.label).join(',') === 'w,y,z', "re-sorted: w before y");
        item_z.set('label', 'a');  // item_z moves to front
        t.assert(sorted.children.map(i => i.data.label).join(',') === 'a,w,y', "re-sorted: a first");
    })
    .add("sort_reactive — move from middle to front", t => {
        const list = new List7();
        const a = mkItem(1), b = mkItem(5), c = mkItem(10);
        list.append(a, b, c);
        const sorted = list.sort_reactive(by_n, ['n']);
        b.set('n', 0);  // b should move to first
        t.assert(sorted.children[0] === b, "b is now first");
        t.assert(sorted.children.map(i => i.data.n).join(',') === '0,1,10', "correct order");
    })
    .add("sort_reactive — move from middle to end", t => {
        const list = new List7();
        const a = mkItem(1), b = mkItem(5), c = mkItem(10);
        list.append(a, b, c);
        const sorted = list.sort_reactive(by_n, ['n']);
        b.set('n', 20);  // b should move to last
        t.assert(sorted.children[2] === b, "b is now last");
        t.assert(sorted.children.map(i => i.data.n).join(',') === '1,10,20', "correct order");
    })
    .add("sort_reactive — unrelated key change doesn't reorder", t => {
        const list = new List7();
        const a = mkItem(1, 'x'), b = mkItem(2, 'y');
        list.append(a, b);
        const sorted = list.sort_reactive(by_n, ['n']);
        b.set('label', 'a');  // not a watched key
        t.assert(sorted.children[0] === a, "order unchanged");
        t.assert(sorted.children[1] === b, "b still last");
    })
    .add("sort_reactive — item removed from source is unwatched", t => {
        const list = new List7();
        const a = mkItem(1), b = mkItem(2);
        list.append(a, b);
        const sorted = list.sort_reactive(by_n, ['n']);
        list.remove(a);
        t.assert(sorted.children.length === 1, "a removed from sorted");
        // Mutating removed item should not affect sorted
        a.set('n', 0);
        t.assert(sorted.children.length === 1, "no effect on sorted");
        t.assert(sorted.children[0] === b, "b still there");
    })
    .add("sort_reactive — empty list", t => {
        const list = new List7();
        const sorted = list.sort_reactive(by_n);
        t.assert(sorted.children.length === 0, "empty sorted");
        list.append(mkItem(5));
        t.assert(sorted.children.length === 1, "item added");
    })
    .add("sort_reactive — stable with equal keys", t => {
        const list = new List7();
        const a = mkItem(1), b = mkItem(1), c = mkItem(1);
        list.append(a, b, c);
        const sorted = list.sort_reactive(by_n, ['n']);
        t.assert(sorted.children.length === 3, "all three in sorted");
        // Change one to make it move — shouldn't error
        a.set('n', 0);
        t.assert(sorted.children[0] === a, "a moved to front");
        t.assert(sorted.children.length === 3, "still three items");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List7.test.run();
    List7.test.print();
}

export default List7;
