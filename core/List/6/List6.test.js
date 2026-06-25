import List5 from '../5/List5.test.js';
import List6 from './List6.js';
import Item5 from '../../Item/5/Item5.js';
import Test0 from '../../Test/0/Test0.js';

List6.test = new Test0({ class: List6, _name: 'List6' });
List6.test.add(List5.test);

const mkItem = (priority, title) => new Item5({ data: { priority, title } });

List6.test
    .add("group_by — initial grouping", t => {
        const list = new List6();
        list.append(mkItem('high', 'A'), mkItem('low', 'B'), mkItem('high', 'C'));
        const groups = list.group_by(item => item.data.priority);
        t.assert(groups.has('high'), "high group exists");
        t.assert(groups.has('low'), "low group exists");
        t.assert(groups.get('high').children.length === 2, "two high items");
        t.assert(groups.get('low').children.length === 1, "one low item");
    })
    .add("group_by — new item added to correct group", t => {
        const list = new List6();
        list.append(mkItem('high', 'A'));
        const groups = list.group_by(item => item.data.priority);
        list.append(mkItem('low', 'B'));
        list.append(mkItem('high', 'C'));
        t.assert(groups.get('high').children.length === 2, "high has 2 after appends");
        t.assert(groups.get('low').children.length === 1, "low has 1");
    })
    .add("group_by — item removed from correct group", t => {
        const list = new List6();
        const item_a = mkItem('high', 'A');
        list.append(item_a, mkItem('high', 'B'), mkItem('low', 'C'));
        const groups = list.group_by(item => item.data.priority);
        list.remove(item_a);
        t.assert(groups.get('high').children.length === 1, "high has 1 after remove");
    })
    .add("group_by — empty group is removed from map", t => {
        const list = new List6();
        const item = mkItem('solo', 'X');
        list.append(item);
        const groups = list.group_by(i => i.data.priority);
        t.assert(groups.has('solo'), "solo group exists");
        list.remove(item);
        t.assert(!groups.has('solo'), "solo group removed when empty");
    })
    .add("group_by — new group created on first item", t => {
        const list = new List6();
        const groups = list.group_by(i => i.data.priority);
        t.assert(groups.size === 0, "no groups initially");
        list.append(mkItem('urgent', 'Hotfix'));
        t.assert(groups.has('urgent'), "urgent group created on first item");
    })
    .add("group_by_reactive — initial grouping", t => {
        const list = new List6();
        list.append(mkItem('high', 'A'), mkItem('low', 'B'));
        const groups = list.group_by_reactive(i => i.data.priority, ['priority']);
        t.assert(groups.get('high').children.length === 1, "high has 1");
        t.assert(groups.get('low').children.length === 1, "low has 1");
    })
    .add("group_by_reactive — item moves group on mutation", t => {
        const list = new List6();
        const item = mkItem('high', 'A');
        list.append(item);
        const groups = list.group_by_reactive(i => i.data.priority, ['priority']);
        t.assert(groups.has('high'), "starts in high");
        t.assert(!groups.has('low'), "no low group yet");
        item.set('priority', 'low');
        t.assert(!groups.has('high'), "high group removed (was only item)");
        t.assert(groups.has('low'), "low group created");
        t.assert(groups.get('low').children.length === 1, "item in low");
    })
    .add("group_by_reactive — unrelated key change doesn't move item", t => {
        const list = new List6();
        const item = mkItem('high', 'A');
        list.append(item);
        const groups = list.group_by_reactive(i => i.data.priority, ['priority']);
        item.set('title', 'B'); // title not in watch_keys
        t.assert(groups.get('high').children.length === 1, "still in high");
    })
    .add("group_by_reactive — item removed is unwatched", t => {
        const list = new List6();
        const item = mkItem('high', 'A');
        list.append(item);
        const groups = list.group_by_reactive(i => i.data.priority, ['priority']);
        list.remove(item);
        t.assert(!groups.has('high'), "high group gone after remove");
        // Mutating removed item should not affect groups
        item.set('priority', 'low');
        t.assert(!groups.has('low'), "mutation after remove has no effect");
    })
    .add("group_by_reactive — multiple items, one moves", t => {
        const list = new List6();
        const a = mkItem('high', 'A');
        const b = mkItem('high', 'B');
        list.append(a, b);
        const groups = list.group_by_reactive(i => i.data.priority, ['priority']);
        a.set('priority', 'low');
        t.assert(groups.get('high').children.length === 1, "one item remains in high");
        t.assert(groups.get('high').children[0] === b, "B remains in high");
        t.assert(groups.get('low').children[0] === a, "A moved to low");
    });

if (typeof process !== 'undefined' && process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
    await List6.test.run();
    List6.test.print();
}

export default List6;
