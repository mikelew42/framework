import List5 from "../5/List5.js";

export default class List6 extends List5 {
    // Structural-only: does NOT re-group when an item's key changes via set().
    // Use group_by_reactive for that.
    group_by(fn) {
        const groups = new Map();

        const get_group = (key) => {
            if (!groups.has(key)) groups.set(key, new this.constructor());
            return groups.get(key);
        };

        this.each(item => get_group(fn(item)).append(item));

        this.on('add', (item) => get_group(fn(item)).append(item));

        this.on('remove', (item) => {
            const key   = fn(item);
            const group = groups.get(key);
            if (!group) return;
            group.remove(item);
            if (group.children.length === 0) groups.delete(key);
        });

        return groups;
    }

    group_by_reactive(fn, watch_keys = null) {
        const groups   = new Map();
        const item_key = new Map();  // item → current group key (needed to move items out)
        const unsubs   = new Map();  // item → cleanup fn

        const get_group = (key) => {
            if (!groups.has(key)) groups.set(key, new this.constructor());
            return groups.get(key);
        };

        const move = (item) => {
            const old_key = item_key.get(item);
            const new_key = fn(item);
            if (old_key === new_key) return;

            if (old_key !== undefined) {
                const old_group = groups.get(old_key);
                if (old_group) {
                    old_group.remove(item);
                    if (old_group.children.length === 0) groups.delete(old_key);
                }
            }

            get_group(new_key).append(item);
            item_key.set(item, new_key);
        };

        const watch = (item) => {
            if (!item?.on) return;
            const handler = (key) => {
                if (!watch_keys || watch_keys.includes(key)) move(item);
            };
            item.on('change', handler);
            unsubs.set(item, () => item.off('change', handler));
        };

        const unwatch = (item) => {
            unsubs.get(item)?.();
            unsubs.delete(item);
        };

        this.each(item => {
            const key = fn(item);
            get_group(key).append(item);
            item_key.set(item, key);
            watch(item);
        });

        this.on('add', (item) => {
            const key = fn(item);
            get_group(key).append(item);
            item_key.set(item, key);
            watch(item);
        });

        this.on('remove', (item) => {
            const key = item_key.get(item);
            if (key !== undefined) {
                const group = groups.get(key);
                if (group) {
                    group.remove(item);
                    if (group.children.length === 0) groups.delete(key);
                }
                item_key.delete(item);
            }
            unwatch(item);
        });

        return groups;
    }
}
