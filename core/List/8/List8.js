import List7 from "../7/List7.js";

export default class List8 extends List7 {
    // last-write-wins on duplicate keys
    index_by(keyFn, watch_keys = null) {
        const index       = new Map();
        const item_to_key = new Map();
        const unsubs      = new Map();

        const reindex = (item) => {
            const old_key = item_to_key.get(item);
            const new_key = keyFn(item);
            if (old_key === new_key) return;
            // only delete if this item is still the registered holder of old_key
            if (old_key !== undefined && index.get(old_key) === item) index.delete(old_key);
            index.set(new_key, item);
            item_to_key.set(item, new_key);
        };

        const watch = (item) => {
            if (!item?.on) return;
            const handler = (key) => {
                if (!watch_keys || watch_keys.includes(key)) reindex(item);
            };
            item.on('change', handler);
            unsubs.set(item, () => item.off('change', handler));
        };

        const unwatch = (item) => {
            unsubs.get(item)?.();
            unsubs.delete(item);
        };

        this.each(item => {
            const key = keyFn(item);
            index.set(key, item);
            item_to_key.set(item, key);
            watch(item);
        });

        this.on('add', (item) => {
            const key = keyFn(item);
            index.set(key, item);
            item_to_key.set(item, key);
            watch(item);
        });

        this.on('remove', (item) => {
            const key = item_to_key.get(item);
            if (key !== undefined && index.get(key) === item) index.delete(key);
            item_to_key.delete(item);
            unwatch(item);
        });

        return index;
    }
}
