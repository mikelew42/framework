// Base class for all savers — documents the contract, provides no-op defaults.
// Item-savers: save/load/delete receive an Item as `target`.
// List-savers (e.g. ListSaver): save/load/delete receive a List as `target`.
export default class Saver {
    load(target) {}
    save(target, patch) {}
    delete(target) {}
}
