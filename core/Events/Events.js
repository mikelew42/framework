export default class Events {

    constructor(...args){
        this.assign(...args);
        this.instantiate();
    }

    assign(...args){
        return Object.assign(this, ...args);
    }

    instantiate() {
        this.events = {};
        this.initialize();
    }

    initialize(){}

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => listener.apply(this, args));
    }

    clear(event) {
        if (!this.events[event]) return;

        this.events[event] = [];
    }
    
    static events = {};

    static on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    static off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    static once(event, listener) {
        const onceWrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    static emit(event, ...args) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => listener.apply(this, args));
    }

    static clear(event) {
        if (!this.events[event]) return;

        this.events[event] = [];
    }
}

export { Events }