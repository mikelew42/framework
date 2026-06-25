import List0 from '../0/List0.test.js';
import List1 from './List1.js';
import Test0 from '../../Test/0/Test0.js';

List1.test = new Test0({ class: List1, _name: 'List1' });
List1.test.add(List0.test);

List1.test
    .add("on / emit", t => {
        const list = new List1();
        const log = [];
        list.on('custom', x => log.push(x));
        list.emit('custom', 'hello');
        list.emit('custom', 'world');
        t.assert(log.length === 2, "two emissions");
        t.assert(log[0] === 'hello', "first emission");
    })
    .add("off removes listener", t => {
        const list = new List1();
        const log = [];
        const fn = x => log.push(x);
        list.on('x', fn);
        list.emit('x', 1);
        list.off('x', fn);
        list.emit('x', 2);
        t.assert(log.length === 1, "only one emission after off");
    })
    .add("'add' fires on append", t => {
        const list = new List1();
        const log = [];
        list.on('add', (item, idx) => log.push({ item, idx }));
        list.append('a', 'b');
        t.assert(log.length === 2, "two add events");
        t.assert(log[0].item === 'a', "first item");
        t.assert(log[0].idx === 0, "first index");
        t.assert(log[1].item === 'b', "second item");
        t.assert(log[1].idx === 1, "second index");
    })
    .add("'add' fires on insert", t => {
        const list = new List1();
        list.append('a', 'c');
        const log = [];
        list.on('add', (item, idx) => log.push({ item, idx }));
        list.insert('b', 1);
        t.assert(log.length === 1, "one add event");
        t.assert(log[0].item === 'b', "item is b");
        t.assert(log[0].idx === 1, "inserted at index 1");
        t.assert(list.children[1] === 'b', "b is at position 1");
    })
    .add("'remove' fires on remove", t => {
        const list = new List1();
        const a = { name: 'a' };
        const b = { name: 'b' };
        list.append(a, b);
        const log = [];
        list.on('remove', (item, idx) => log.push({ item, idx }));
        list.remove(a);
        t.assert(log.length === 1, "one remove event");
        t.assert(log[0].item === a, "item is a");
        t.assert(log[0].idx === 0, "was at index 0");
    })
    .add("'remove' fires on self-remove", t => {
        const parent = new List1();
        const child = new List1();
        parent.append(child);
        const log = [];
        parent.on('remove', (item, idx) => log.push({ item, idx }));
        child.remove();
        t.assert(log.length === 1, "remove event fires on parent");
        t.assert(log[0].item === child, "child is reported");
    })
    .add("no event for unknown emit", t => {
        const list = new List1();
        list.emit('nope', 1);
        t.assert(true, "no error emitting unknown event");
    })
    .add("listeners are isolated per instance", t => {
        const a = new List1();
        const b = new List1();
        const logA = [], logB = [];
        a.on('add', item => logA.push(item));
        b.on('add', item => logB.push(item));
        a.append('x');
        t.assert(logA.length === 1, "a got event");
        t.assert(logB.length === 0, "b got no event");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List1.test.run();
    List1.test.print();
}

export default List1;
