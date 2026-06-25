import Item9 from '/framework/core/Item/9/Item9.js';

export default class NoteItem extends Item9 {
    constructor(...args) {
        super(...args);
        this.data.title    = this.data.title    ?? '';
        this.data.body     = this.data.body     ?? '';
        this.data.tags     = this.data.tags     ?? [];
        this.data.archived = this.data.archived ?? false;
        this.data.created_at  = this.data.created_at  ?? Date.now();
        this.data.updated_at  = this.data.updated_at  ?? Date.now();

        this.schema({ title: String, body: String, archived: Boolean });
        this.compute('word_count', ['body'],
            body => (body?.trim() ? body.trim().split(/\s+/).length : 0));
        this.compute('preview', ['body'],
            body => body?.slice(0, 120) + (body?.length > 120 ? '…' : ''));
    }

    set(key, val) {
        if (key === 'title' || key === 'body') {
            this.data.updated_at = Date.now();
        }
        return super.set(key, val);
    }

    archive()   { this.set('archived', true);  return this; }
    unarchive() { this.set('archived', false); return this; }

    add_tag(tag) {
        const tags = [...this.data.tags];
        if (!tags.includes(tag)) { tags.push(tag); this.set('tags', tags); }
        return this;
    }

    remove_tag(tag) {
        const tags = this.data.tags.filter(t => t !== tag);
        this.set('tags', tags);
        return this;
    }
}
