import List1 from '../1/List1.test.js';
import List2 from './List2.js';
import Test0 from '../../Test/0/Test0.js';

List2.test = new Test0({ class: List2, _name: 'List2' });
List2.test.add(List1.test);

List2.test
    .add("derive — initial population", t => {
        const source = new List2();
        source.append(1, 2, 3, 4, 5);
        const evens = source.derive(n => n % 2 === 0);
        t.assert(evens.children.length === 2, "two even numbers");
        t.assert(evens.children[0] === 2, "first even is 2");
        t.assert(evens.children[1] === 4, "second even is 4");
    })
    .add("derive — append to source updates derived", t => {
        const source = new List2();
        source.append(1, 3);
        const evens = source.derive(n => n % 2 === 0);
        source.append(2);
        t.assert(evens.children.length === 1, "derived has one even");
        t.assert(evens.children[0] === 2, "even is 2");
    })
    .add("derive — non-matching append leaves derived unchanged", t => {
        const source = new List2();
        const evens = source.derive(n => n % 2 === 0);
        source.append(1, 3, 5);
        t.assert(evens.children.length === 0, "no evens added");
    })
    .add("derive — insert preserves order in derived", t => {
        const source = new List2();
        source.append(2, 4);
        const evens = source.derive(n => n % 2 === 0);
        // insert 6 between 2 and 4 (at source index 1)
        source.insert(6, 1);
        t.assert(evens.children.length === 3, "three evens");
        t.assert(evens.children[0] === 2, "first is 2");
        t.assert(evens.children[1] === 6, "second is 6");
        t.assert(evens.children[2] === 4, "third is 4");
    })
    .add("derive — remove from source removes from derived", t => {
        const source = new List2();
        source.append(1, 2, 3);
        const evens = source.derive(n => n % 2 === 0);
        source.remove(2);
        t.assert(evens.children.length === 0, "derived is empty after remove");
    })
    .add("derive — remove non-matching item leaves derived unchanged", t => {
        const source = new List2();
        source.append(1, 2, 3);
        const evens = source.derive(n => n % 2 === 0);
        source.remove(1);
        t.assert(evens.children.length === 1, "even still present");
        t.assert(evens.children[0] === 2, "even is 2");
    })
    .add("filter is alias for derive", t => {
        const source = new List2();
        source.append(1, 2, 3, 4);
        const evens = source.filter(n => n % 2 === 0);
        t.assert(evens.children.length === 2, "filter gives same result as derive");
    })
    .add("derived list is a List2 (chainable)", t => {
        const source = new List2();
        source.append(1, 2, 3, 4, 6, 8);
        const evens = source.filter(n => n % 2 === 0);
        const big_evens = evens.filter(n => n > 4);
        t.assert(big_evens.children.length === 2, "two big evens initially");
        source.append(10);
        t.assert(big_evens.children.length === 3, "10 propagates through both filters");
    })
    .add("derived list fires its own events", t => {
        const source = new List2();
        const evens = source.filter(n => n % 2 === 0);
        const log = [];
        evens.on('add', item => log.push(item));
        source.append(1, 2, 3, 4);
        t.assert(log.length === 2, "two add events on derived");
        t.assert(log[0] === 2, "first event item is 2");
        t.assert(log[1] === 4, "second event item is 4");
    })
    .add("multiple derives from same source are independent", t => {
        const source = new List2();
        source.append(1, 2, 3);
        const odds = source.derive(n => n % 2 !== 0);
        const evens = source.derive(n => n % 2 === 0);
        source.append(4, 5);
        t.assert(odds.children.length === 3, "three odds: 1, 3, 5");
        t.assert(evens.children.length === 2, "two evens: 2, 4");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List2.test.run();
    List2.test.print();
}

export default List2;
