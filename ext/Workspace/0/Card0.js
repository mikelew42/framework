import Base from '../../../core/Base/Base.js';
import { div } from '../../../core/App/App.js';
import Panel0 from './Panel0.js';

/**
 * Card0 — content unit inside a Panel0.
 *
 * Sizing (each axis independent):
 *   width_mode:  default (fill via stretch) | 'hug' | 'fixed'
 *   height_mode: default (hug via auto)     | 'fill' | 'hug' | 'fixed'
 *   width / height: number (em) or CSS string — only for 'fixed' mode
 *
 * content: View, string, or fn(card) called inside a captor context
 */
export default class Card0 extends Base {
    instantiate(...args) {
        this.assign(...args);

        // grab panel ref before rendering so we can register after
        if (this.get_captured && !this.panel) {
            this.panel = Panel0.captor;
        }

        this.render();

        if (this.panel) {
            this.panel.add(this);
        }

        this.initialize();
    }

    render() {
        const cls = ['card', this.width_cls(), this.height_cls()].filter(Boolean).join(' ');

        this.view = div.c(cls, () => {
            if (this.title) div.c('card-header', this.title);
            this.body = div.c('card-body');
        });

        // append content into card-body after both are created
        if (this.content != null) {
            if (typeof this.content === 'function') {
                // fn(card) called in captor context so created elements land in body
                this.body.append(() => this.content(this));
            } else {
                this.body.append(this.content);
            }
        }

        // fixed explicit dimensions
        const style = {};
        if (this.width_mode === 'fixed' && this.width != null) {
            style.width = typeof this.width === 'number' ? this.width + 'em' : this.width;
        }
        if (this.height_mode === 'fixed' && this.height != null) {
            style.height = typeof this.height === 'number' ? this.height + 'em' : this.height;
        }
        if (Object.keys(style).length) this.view.style(style);
    }

    width_cls() {
        if (this.width_mode === 'hug')  return 'card-hug-w';
        if (this.width_mode === 'fill') return 'card-fill-w';
        return ''; // default: stretch (fill) via flex cross-axis
    }

    height_cls() {
        if (this.height_mode === 'fill') return 'card-fill-h';
        if (this.height_mode === 'hug')  return 'card-hug-h';
        return ''; // default: auto (hug) via flex main-axis
    }
}

Card0.prototype.get_captured = true;

// helper: accepts string shorthand ("Title") or full opts object
export function card(opts) {
    if (typeof opts === 'string') opts = { title: opts };
    return new Card0(opts || {});
}
