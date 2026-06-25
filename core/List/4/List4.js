import List3 from "../3/List3.js";

export default class List4 extends List3 {
    // Unlike List0.map(), the result stays in sync as items are added/removed.
    transform(fn) {
        const mapped = new this.constructor();
        const memo   = new Map();  // source item → transformed item

        this.each(item => {
            const t = fn(item);
            memo.set(item, t);
            mapped.append(t);
        });

        this.on('add', (item, idx) => {
            const t = fn(item);
            memo.set(item, t);
            mapped.insert(t, idx);
        });

        this.on('remove', item => {
            const t = memo.get(item);
            if (t !== undefined) {
                mapped.remove(t);
                memo.delete(item);
            }
        });

        return mapped;
    }
}
