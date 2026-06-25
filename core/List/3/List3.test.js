import List2 from '../2/List2.test.js';
import List3 from './List3.js';
import Test0 from '../../Test/0/Test0.js';

List3.test = new Test0({ class: List3, _name: 'List3' });
List3.test.add(List2.test);

const asc = (a, b) => a - b;
const desc = (a, b) => b - a;

List3.test
    .add("sort — initial order", t => {
        const source = new List3();
        source.append(3, 1, 2);
        const sorted = source.sort(asc);
        t.assert(sorted.children[0] === 1, "first is 1");
        t.assert(sorted.children[1] === 2, "second is 2");
        t.assert(sorted.children[2] === 3, "third is 3");
    })
    .add("sort — insert maintains order", t => {
        const source = new List3();
        source.append(1, 3, 5);
        const sorted = source.sort(asc);
        source.append(2);
        source.append(4);
        t.assert(sorted.children.join(',') === '1,2,3,4,5', "order is 1,2,3,4,5");
    })
    .add("sort — prepend (smallest value)", t => {
        const source = new List3();
        source.append(3, 5, 7);
        const sorted = source.sort(asc);
        source.append(1);
        t.assert(sorted.children[0] === 1, "1 at front");
        t.assert(sorted.children.length === 4, "length is 4");
    })
    .add("sort — append (largest value)", t => {
        const source = new List3();
        source.append(1, 3);
        const sorted = source.sort(asc);
        source.append(99);
        t.assert(sorted.children[2] === 99, "99 at end");
    })
    .add("sort — remove updates sorted", t => {
        const source = new List3();
        source.append(3, 1, 2);
        const sorted = source.sort(asc);
        source.remove(2);
        t.assert(sorted.children.length === 2, "length is 2");
        t.assert(sorted.children[0] === 1, "1 first");
        t.assert(sorted.children[1] === 3, "3 second");
    })
    .add("sort descending", t => {
        const source = new List3();
        source.append(1, 2, 3);
        const sorted = source.sort(desc);
        t.assert(sorted.children[0] === 3, "3 first (desc)");
        t.assert(sorted.children[2] === 1, "1 last (desc)");
    })
    .add("sort — empty source, then populate", t => {
        const source = new List3();
        const sorted = source.sort(asc);
        source.append(5, 3, 1);
        t.assert(sorted.children[0] === 1, "min at front");
        t.assert(sorted.children[2] === 5, "max at end");
    })
    .add("sort — sorted list is a List3", t => {
        const source = new List3();
        const sorted = source.sort(asc);
        t.assert(sorted instanceof List3, "sorted is a List3");
    })
    .add("filter().sort() chaining", t => {
        const source = new List3();
        source.append(1, 2, 3, 4, 5, 6);
        const sorted_evens = source
            .filter(n => n % 2 === 0)
            .sort(asc);
        t.assert(sorted_evens.children.join(',') === '2,4,6', "sorted evens: 2,4,6");
        source.append(8);
        t.assert(sorted_evens.children[3] === 8, "8 added to sorted evens");
    })
    .add("sort with string compareFn", t => {
        const source = new List3();
        source.append("banana", "apple", "cherry");
        const sorted = source.sort((a, b) => a.localeCompare(b));
        t.assert(sorted.children[0] === 'apple', "apple first");
        t.assert(sorted.children[2] === 'cherry', "cherry last");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List3.test.run();
    List3.test.print();
}

export default List3;
