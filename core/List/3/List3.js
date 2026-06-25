import List2 from "../2/List2.js";

export default class List3 extends List2 {
    sort(compareFn) {
        const sorted = new this.constructor();

        [...this.children].sort(compareFn).forEach(item => sorted.append(item));

        this.on('add', item => {
            let insertIdx = sorted.children.findIndex(c => compareFn(item, c) < 0);
            if (insertIdx === -1) insertIdx = sorted.children.length;
            sorted.insert(item, insertIdx);
        });

        this.on('remove', item => sorted.remove(item));

        return sorted;
    }
}
