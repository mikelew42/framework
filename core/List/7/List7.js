import List6 from "../6/List6.js";

export default class List7 extends List6 {
    sort_reactive(compareFn, watch_keys = null) {
        const sorted = new this.constructor();
        const unsubs = new Map();

        const find_insert_idx = (item) => {
            // item is NOT currently in sorted when this is called (we remove first)
            let idx = sorted.children.findIndex(c => compareFn(item, c) < 0);
            return idx === -1 ? sorted.children.length : idx;
        };

        const reorder = (item) => {
            sorted.remove(item);
            sorted.insert(item, find_insert_idx(item));
        };

        const watch = (item) => {
            if (!item?.on) return;
            const handler = (key) => {
                if (!watch_keys || watch_keys.includes(key)) reorder(item);
            };
            item.on('change', handler);
            unsubs.set(item, () => item.off('change', handler));
        };

        const unwatch = (item) => {
            unsubs.get(item)?.();
            unsubs.delete(item);
        };

        [...this.children].sort(compareFn).forEach(item => {
            sorted.append(item);
            watch(item);
        });

        this.on('add', (item) => {
            sorted.insert(item, find_insert_idx(item));
            watch(item);
        });

        this.on('remove', (item) => {
            sorted.remove(item);
            unwatch(item);
        });

        return sorted;
    }
}
