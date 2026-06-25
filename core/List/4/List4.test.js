import List3 from '../3/List3.test.js';
import List4 from './List4.js';
import Test0 from '../../Test/0/Test0.js';

List4.test = new Test0({ class: List4, _name: 'List4' });
List4.test.add(List3.test);

List4.test
    .add("transform — initial population", t => {
        const source = new List4();
        source.append(1, 2, 3);
        const doubled = source.transform(n => n * 2);
        t.assert(doubled.children[0] === 2, "1 → 2");
        t.assert(doubled.children[1] === 4, "2 → 4");
        t.assert(doubled.children[2] === 6, "3 → 6");
    })
    .add("transform — append updates mapped list", t => {
        const source = new List4();
        source.append(1, 2);
        const doubled = source.transform(n => n * 2);
        source.append(3);
        t.assert(doubled.children.length === 3, "3 items after append");
        t.assert(doubled.children[2] === 6, "3 → 6");
    })
    .add("transform — remove updates mapped list", t => {
        const source = new List4();
        source.append(1, 2, 3);
        const doubled = source.transform(n => n * 2);
        source.remove(2);
        t.assert(doubled.children.length === 2, "2 items after remove");
        t.assert(doubled.children[0] === 2, "1 → 2 still present");
        t.assert(doubled.children[1] === 6, "3 → 6 still present");
    })
    .add("transform — preserves insertion order", t => {
        const source = new List4();
        source.append(10, 30);
        const doubled = source.transform(n => n * 2);
        source.insert(20, 1); // insert between 10 and 30
        t.assert(doubled.children[0] === 20, "10→20 first");
        t.assert(doubled.children[1] === 40, "20→40 second");
        t.assert(doubled.children[2] === 60, "30→60 third");
    })
    .add("transform — object mapping", t => {
        const source = new List4();
        source.append({ n: 1 }, { n: 2 });
        const labels = source.transform(obj => `item-${obj.n}`);
        t.assert(labels.children[0] === 'item-1', "first label");
        t.assert(labels.children[1] === 'item-2', "second label");
    })
    .add("transform — result is a List4", t => {
        const source = new List4();
        const mapped = source.transform(n => n);
        t.assert(mapped instanceof List4, "transform returns List4");
    })
    .add("filter().transform() chaining", t => {
        const source = new List4();
        source.append(1, 2, 3, 4, 5);
        const even_labels = source
            .filter(n => n % 2 === 0)
            .transform(n => `even-${n}`);
        t.assert(even_labels.children.length === 2, "two even labels");
        t.assert(even_labels.children[0] === 'even-2', "first even label");
        source.append(6);
        t.assert(even_labels.children[2] === 'even-6', "6 propagates through");
    })
    .add("transform().sort() chaining", t => {
        const source = new List4();
        source.append(3, 1, 2);
        const sorted_labels = source
            .transform(n => ({ value: n, label: `item-${n}` }))
            .sort((a, b) => a.value - b.value);
        t.assert(sorted_labels.children[0].value === 1, "sorted: value 1 first");
        t.assert(sorted_labels.children[2].value === 3, "sorted: value 3 last");
    })
    .add("transform with no items — empty source", t => {
        const source = new List4();
        const mapped = source.transform(n => n * 10);
        t.assert(mapped.children.length === 0, "empty mapped list");
        source.append(5);
        t.assert(mapped.children[0] === 50, "5 → 50 after append");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List4.test.run();
    List4.test.print();
}

export default List4;
