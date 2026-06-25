import List1 from "../1/List1.js";

export default class List2 extends List1 {
    derive(fn) {
        const derived = new this.constructor();

        this.each(item => {
            if (fn(item)) derived.append(item);
        });

        this.on('add', (item, idx) => {
            if (!fn(item)) return;
            const insertIdx = this.children.slice(0, idx).filter(fn).length;
            derived.insert(item, insertIdx);
        });

        this.on('remove', item => {
            derived.remove(item);
        });

        return derived;
    }

    filter(fn) {
        return this.derive(fn);
    }
}
