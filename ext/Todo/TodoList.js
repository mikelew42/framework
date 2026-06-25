import List4 from "/framework/core/List/4/List4.js";

const RANK = { high: 0, normal: 1, low: 2 };

export default class TodoList extends List4 {
    get active()      { return this._active     ??= this.filter(t => !t.data.done); }
    get done_items()  { return this._done       ??= this.filter(t => t.data.done); }
    get by_priority() { return this._by_prio    ??= this.sort((a, b) => (RANK[a.data.priority] ?? 1) - (RANK[b.data.priority] ?? 1)); }
}
