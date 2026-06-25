import List4 from '../4/List4.test.js';
import List5 from './List5.js';
import Item5 from '../../Item/5/Item5.js';
import Test0 from '../../Test/0/Test0.js';

List5.test = new Test0({ class: List5, _name: 'List5' });
List5.test.add(List4.test);

const mkItem = (done = false) => new Item5({ data: { done, n: 0 } });

List5.test
    .add("derive_reactive — initial population", t => {
        const list = new List5();
        list.append(mkItem(false), mkItem(true), mkItem(false));
        const active = list.derive_reactive(item => !item.data.done);
        t.assert(active.children.length === 2, "two active items initially");
    })
    .add("derive_reactive — add/remove still work", t => {
        const list = new List5();
        const active = list.derive_reactive(item => !item.data.done);
        list.append(mkItem(false));
        t.assert(active.children.length === 1, "active updates on append");
        list.remove(list.children[0]);
        t.assert(active.children.length === 0, "active updates on remove");
    })
    .add("derive_reactive — item mutation updates derived", t => {
        const list = new List5();
        const item = mkItem(false);
        list.append(item);
        const active = list.derive_reactive(i => !i.data.done);
        t.assert(active.children.length === 1, "item starts active");
        item.set('done', true);
        t.assert(active.children.length === 0, "item removed from active on mutation");
        item.set('done', false);
        t.assert(active.children.length === 1, "item re-added when mutation reverses");
    })
    .add("derive_reactive — watch_keys limits reactivity", t => {
        const list = new List5();
        const item = new Item5({ data: { done: false, note: '' } });
        list.append(item);
        const active = list.derive_reactive(i => !i.data.done, ['done']);
        t.assert(active.children.length === 1, "active initially");
        item.set('note', 'hello'); // not in watch_keys
        t.assert(active.children.length === 1, "still active (note change ignored)");
        item.set('done', true); // in watch_keys
        t.assert(active.children.length === 0, "done=true removes from active");
    })
    .add("derive_reactive — item removed from source is unwatched", t => {
        const list = new List5();
        const item = mkItem(false);
        list.append(item);
        const active = list.derive_reactive(i => !i.data.done);
        list.remove(item);
        t.assert(active.children.length === 0, "item gone from active");
        // Mutating removed item should not error or affect derived list
        item.set('done', true);
        t.assert(active.children.length === 0, "no effect after item removed from source");
    })
    .add("derive_reactive — order preserved in derived list", t => {
        const list = new List5();
        const a = new Item5({ data: { done: false, label: 'a' } });
        const b = new Item5({ data: { done: true, label: 'b' } });
        const c = new Item5({ data: { done: false, label: 'c' } });
        list.append(a, b, c);
        const active = list.derive_reactive(i => !i.data.done);
        t.assert(active.children[0].data.label === 'a', "a is first");
        t.assert(active.children[1].data.label === 'c', "c is second");
        // Now make b active — should insert between a and c
        b.set('done', false);
        t.assert(active.children.length === 3, "all three active now");
        t.assert(active.children[0].data.label === 'a', "a still first");
        t.assert(active.children[1].data.label === 'b', "b inserted in middle");
        t.assert(active.children[2].data.label === 'c', "c still last");
    })
    .add("filter_reactive is alias for derive_reactive", t => {
        const list = new List5();
        const item = mkItem(false);
        list.append(item);
        const active = list.filter_reactive(i => !i.data.done);
        t.assert(active.children.length === 1, "filter_reactive works");
        item.set('done', true);
        t.assert(active.children.length === 0, "reactive update works via alias");
    })
    .add("derive_reactive without Item5 items — no error", t => {
        const list = new List5();
        list.append(1, 2, 3); // plain values, no on/off
        const evens = list.derive_reactive(n => n % 2 === 0);
        t.assert(evens.children.length === 1, "evens filtered");
        t.assert(evens.children[0] === 2, "2 is in evens");
        // No error — plain values just don't trigger reactive updates
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List5.test.run();
    List5.test.print();
}

export default List5;
