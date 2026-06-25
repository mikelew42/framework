import List4 from "../4/List4.js";

export default class List5 extends List4 {
    // Re-evaluates fn when item emits 'change' on any key (or only watch_keys if given).
    // Items must implement on/off (Item5+).
    derive_reactive(fn, watch_keys = null) {
        const derived = new this.constructor();
        const memo   = new Map();   // item → currently in derived?
        const unsubs = new Map();   // item → cleanup fn

        const sync = (item) => {
            const was_in = memo.get(item) ?? false;
            const now_in = fn(item);
            if (now_in === was_in) return;
            memo.set(item, now_in);
            if (now_in) {
                const srcIdx    = this.children.indexOf(item);
                const insertIdx = this.children.slice(0, srcIdx).filter(c => memo.get(c)).length;
                derived.insert(item, insertIdx);
            } else {
                derived.remove(item);
            }
        };

        const watch = (item) => {
            if (!item?.on) return;
            const handler = (key) => {
                if (!watch_keys || watch_keys.includes(key)) sync(item);
            };
            item.on('change', handler);
            unsubs.set(item, () => item.off('change', handler));
        };

        const unwatch = (item) => {
            unsubs.get(item)?.();
            unsubs.delete(item);
        };

        this.each(item => {
            const passes = fn(item);
            memo.set(item, passes);
            if (passes) derived.append(item);
            watch(item);
        });

        this.on('add', (item) => {
            const passes = fn(item);
            memo.set(item, passes);
            if (passes) {
                const idx       = this.children.indexOf(item);
                const insertIdx = this.children.slice(0, idx).filter(c => memo.get(c)).length;
                derived.insert(item, insertIdx);
            }
            watch(item);
        });

        this.on('remove', (item) => {
            if (memo.get(item)) derived.remove(item);
            memo.delete(item);
            unwatch(item);
        });

        return derived;
    }

    filter_reactive(fn, watch_keys = null) {
        return this.derive_reactive(fn, watch_keys);
    }
}
