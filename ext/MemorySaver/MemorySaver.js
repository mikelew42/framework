export default class MemorySaver {
    constructor(initial = null) {
        this.data = initial ? { ...initial } : null;
        this.save_count = 0;
        this.deleted = false;
    }

    load(item) {
        if (this.data) item.data = { ...this.data };
    }

    save(item, patch) {
        this.data = { ...item.data };
        this.save_count++;
        this.deleted = false;
    }

    delete(item) {
        this.data = null;
        this.deleted = true;
    }
}
