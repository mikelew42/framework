import Base from '../../../core/Base/Base.js';
import { div } from '../../../core/App/App.js';
import Workspace0 from './Workspace0.js';

/**
 * Panel0 — flex-column content container inside a Workspace0.
 *
 * width_mode: 'fill' (default, flex:1) | 'hug' (fit-content) | 'fixed' (inline width)
 * width: number (em) or CSS string — only used when width_mode is 'fixed'
 */
export default class Panel0 extends Base {
    instantiate(...args) {
        this.cards = [];
        this.assign(...args);

        // grab workspace ref before rendering so we can register after
        if (this.get_captured && !this.workspace) {
            this.workspace = Workspace0.captor;
        }

        this.render();

        if (this.workspace) {
            this.workspace.add(this);
        }

        this.initialize();
    }

    render() {
        const mode = this.width_mode || 'fill';
        this.view = div.c('panel panel-' + mode, () => {
            if (this.title) div.c('panel-header', this.title);
            this.body = div.c('panel-body');
        });

        // apply explicit pixel/em width for 'fixed' mode
        if (mode === 'fixed' && this.width != null) {
            const w = typeof this.width === 'number' ? this.width + 'em' : this.width;
            this.view.style({ width: w });
        }
    }

    // add a Card0 instance; called automatically by Card0 when captured
    add(card) {
        this.cards.push(card);
        this.body.append(card.view);
        return card;
    }

    // set this panel as the active capture context for new Card0 instances
    capture(fn) {
        this.constructor.set_captor(this);
        fn(this);
        this.constructor.restore_captor();
        return this;
    }

    static set_captor(panel) {
        this.previous_captors.push(this.captor);
        this.captor = panel;
    }

    static restore_captor() {
        this.captor = this.previous_captors.pop();
    }
}

Panel0.previous_captors = [];
Panel0.prototype.get_captured = true;

// helper: accepts string shorthand ("Title") or opts object, optional capture fn
export function panel(opts, fn) {
    if (typeof opts === 'string') opts = { title: opts };
    if (typeof opts === 'function') { fn = opts; opts = {}; }
    const p = new Panel0(opts || {});
    if (fn) p.capture(fn);
    return p;
}
