import List7 from '/framework/core/List/7/List7.js';

export default class NoteList extends List7 {
    get active() {
        return this._active ??= this.filter_reactive(n => !n.data.archived, ['archived']);
    }

    get archived() {
        return this._archived ??= this.filter_reactive(n => n.data.archived, ['archived']);
    }

    get by_date() {
        return this._by_date ??= this.sort_reactive(
            (a, b) => b.data.updated_at - a.data.updated_at,
            ['updated_at']
        );
    }

    with_tag(tag) {
        return this.filter_reactive(n => n.data.tags.includes(tag), ['tags']);
    }

    get by_first_tag() {
        return this._by_first_tag ??= this.group_by_reactive(
            n => n.data.tags[0] ?? 'untagged', ['tags']
        );
    }
}
