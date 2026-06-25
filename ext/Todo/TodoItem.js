import Item7 from "/framework/core/Item/7/Item7.js";

export default class TodoItem extends Item7 {
    constructor(...args) {
        super(...args);
        this.data.done = this.data.done ?? false;
        this.data.priority = this.data.priority ?? 'normal';
        this.compute('label', ['title', 'done'],
            (title, done) => done ? `✓ ${title || '(untitled)'}` : (title || '(untitled)'));
    }

    toggle() {
        this.set('done', !this.data.done);
        return this;
    }
}
