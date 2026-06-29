import Base from '../../../core/Base/Base.js';
import { div, App } from '../../../core/App/App.js';

App.stylesheet(import.meta, 'Workspace0.css');

/**
 * Workspace0 — flex-row panel container.
 * Use workspace(fn) helper; panels created inside capture(fn) auto-register.
 */
export default class Workspace0 extends Base {
    instantiate(...args) {
        this.panels = [];
        this.current = null;
        this.assign(...args);
        this.render();
        this.initialize();
    }

    render() {
        this.view = div.c('workspace');
    }

    // add a Panel0 instance; called automatically by Panel0 when captured
    add(panel) {
        this.panels.push(panel);
        this.view.append(panel.view);
        return panel;
    }

    // set this workspace as the active capture context for new Panel0 instances
    capture(fn) {
        this.constructor.set_captor(this);
        fn(this);
        this.constructor.restore_captor();
        return this;
    }

    static set_captor(ws) {
        this.previous_captors.push(this.captor);
        this.captor = ws;
    }

    static restore_captor() {
        this.captor = this.previous_captors.pop();
    }
}

Workspace0.previous_captors = [];

// helper: new Workspace0() + ws.capture(fn) in one call
export function workspace(fn) {
    const ws = new Workspace0();
    if (fn) ws.capture(fn);
    return ws;
}
