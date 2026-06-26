// ColorPicker — full HSL color picker widget.
//
// Usage:
//   import ColorPicker from '/framework/ui/ColorPicker/ColorPicker.js';
//
//   const picker = new ColorPicker({ value: '#5b57d6', on_change: v => console.log(v) });
//   document.body.appendChild(picker.el);
//
//   picker.val()           // → '#5b57d6'
//   picker.val('#ff0000')  // set value
//
// As a Popover (common usage):
//   import { ux } from '/app.js';
//   const picker = new ColorPicker({ value: '#5b57d6', on_change: update });
//   const pop = ux.popover({ trigger: swatch_el, content: picker, placement: 'bottom-start' });
//   swatch_el.addEventListener('click', () => pop.toggle());

import View, { style } from '../../core/View/View.js';

style(`
.cp-wrap {
    width: 220px;
    user-select: none;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* SL box (saturation + lightness) */
.cp-sl-box {
    position: relative;
    width: 100%;
    height: 140px;
    border-radius: 6px;
    cursor: crosshair;
    overflow: hidden;
}
.cp-sl-white { position: absolute; inset: 0; background: linear-gradient(to right, white, transparent); }
.cp-sl-black { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, black); }
.cp-sl-cursor {
    position: absolute;
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
}

/* Hue slider */
.cp-hue {
    width: 100%;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(to right,
        #f00 0%, #ff0 16.6%, #0f0 33.3%, #0ff 50%, #00f 66.6%, #f0f 83.3%, #f00 100%);
    position: relative;
    cursor: pointer;
}

/* Alpha slider */
.cp-alpha {
    width: 100%;
    height: 12px;
    border-radius: 6px;
    position: relative;
    cursor: pointer;
    background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}
.cp-alpha-gradient {
    position: absolute; inset: 0;
    border-radius: 6px;
}

/* Slider handle shared style */
.cp-slider-handle {
    position: absolute;
    top: 50%;
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.2);
    transform: translate(-50%, -50%);
    pointer-events: none;
    background: currentColor;
}

/* Hex + alpha inputs */
.cp-inputs {
    display: flex;
    gap: 6px;
    align-items: center;
}
.cp-hex-wrap { flex: 1; position: relative; }
.cp-hex-label {
    position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
    color: #9a9a94; font-size: 11px; pointer-events: none;
}
.cp-hex-input {
    width: 100%;
    padding: 5px 8px 5px 22px;
    border: 1px solid #e6e6e3;
    border-radius: 6px;
    font-size: 12px;
    font-family: monospace;
    color: #1b1b19;
    background: #fafafa;
    outline: none;
    box-sizing: border-box;
}
.cp-hex-input:focus { border-color: #5b57d6; background: #fff; }

.cp-alpha-input {
    width: 54px;
    padding: 5px 8px;
    border: 1px solid #e6e6e3;
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
    color: #1b1b19;
    background: #fafafa;
    outline: none;
    box-sizing: border-box;
}
.cp-alpha-input:focus { border-color: #5b57d6; background: #fff; }

/* Preview swatch */
.cp-preview {
    width: 28px; height: 28px;
    border-radius: 6px;
    border: 1px solid #e6e6e3;
    flex-shrink: 0;
    background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    position: relative;
    overflow: hidden;
}
.cp-preview-inner { position: absolute; inset: 0; }
`);

// ── Colour math helpers ───────────────────────────────────────────────────────

function hex_to_hsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hsl_to_hex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

function hsl_to_rgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(f(0) * 255),
        g: Math.round(f(8) * 255),
        b: Math.round(f(4) * 255),
    };
}

// Convert HSL to HSV (for the SL box)
function hsl_to_hsv(h, s, l) {
    s /= 100; l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);
    return { h, s: sv * 100, v: v * 100 };
}

function hsv_to_hsl(h, s, v) {
    s /= 100; v /= 100;
    const l = v * (1 - s / 2);
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return { h, s: sl * 100, l: l * 100 };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── ColorPicker class ─────────────────────────────────────────────────────────

export default class ColorPicker {
    constructor({ value = '#5b57d6', alpha = false, on_change } = {}) {
        this._on_change = on_change;
        this._alpha_enabled = alpha;

        // State: HSV + alpha
        const hsl = hex_to_hsl(value.length === 4
            ? '#' + [...value.slice(1)].map(c => c + c).join('')
            : value);
        const hsv = hsl_to_hsv(hsl.h, hsl.s, hsl.l);
        this._h = hsv.h;
        this._s = hsv.s;   // 0–100
        this._v = hsv.v;   // 0–100
        this._a = 100;     // 0–100

        this._build();
        this._render();
    }

    get el() { return this._root; }

    val(hex) {
        if (hex === undefined) {
            const h = hsl_to_hex(...Object.values(this._hsl()));
            if (this._alpha_enabled) {
                const a = Math.round(this._a / 100 * 255).toString(16).padStart(2, '0');
                return h + a;
            }
            return h;
        }
        // Set value
        const clean = hex.replace(/^#/, '');
        let hex6 = clean.length === 3 ? [...clean].map(c => c + c).join('') : clean.slice(0, 6);
        const hsl = hex_to_hsl('#' + hex6);
        const hsv = hsl_to_hsv(hsl.h, hsl.s, hsl.l);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
        if (clean.length === 8) this._a = parseInt(clean.slice(6, 8), 16) / 255 * 100;
        this._render();
        return this;
    }

    _hsl() {
        const { h, s, l } = hsv_to_hsl(this._h, this._s, this._v);
        return { h, s, l };
    }

    _build() {
        this._root = document.createElement('div');
        this._root.className = 'cp-wrap';

        // SL box
        this._sl_box = document.createElement('div');
        this._sl_box.className = 'cp-sl-box';
        const sl_white = document.createElement('div');
        sl_white.className = 'cp-sl-white';
        const sl_black = document.createElement('div');
        sl_black.className = 'cp-sl-black';
        this._sl_cursor = document.createElement('div');
        this._sl_cursor.className = 'cp-sl-cursor';
        this._sl_box.append(sl_white, sl_black, this._sl_cursor);
        this._bind_sl_drag();

        // Hue slider
        this._hue_bar = document.createElement('div');
        this._hue_bar.className = 'cp-hue';
        this._hue_handle = document.createElement('div');
        this._hue_handle.className = 'cp-slider-handle';
        this._hue_bar.appendChild(this._hue_handle);
        this._bind_slider_drag(this._hue_bar, x => {
            this._h = x * 360;
            this._render();
            this._emit();
        });

        // Alpha slider (optional)
        this._alpha_row = document.createElement('div');
        this._alpha_row.className = 'cp-alpha';
        this._alpha_gradient = document.createElement('div');
        this._alpha_gradient.className = 'cp-alpha-gradient';
        this._alpha_handle = document.createElement('div');
        this._alpha_handle.className = 'cp-slider-handle';
        this._alpha_row.append(this._alpha_gradient, this._alpha_handle);
        if (!this._alpha_enabled) this._alpha_row.style.display = 'none';
        this._bind_slider_drag(this._alpha_row, x => {
            this._a = x * 100;
            this._render();
            this._emit();
        });

        // Inputs row
        const inputs = document.createElement('div');
        inputs.className = 'cp-inputs';

        // Preview swatch
        this._preview_outer = document.createElement('div');
        this._preview_outer.className = 'cp-preview';
        this._preview_inner = document.createElement('div');
        this._preview_inner.className = 'cp-preview-inner';
        this._preview_outer.appendChild(this._preview_inner);

        // Hex input
        const hex_wrap = document.createElement('div');
        hex_wrap.className = 'cp-hex-wrap';
        const hex_label = document.createElement('span');
        hex_label.className = 'cp-hex-label';
        hex_label.textContent = '#';
        this._hex_input = document.createElement('input');
        this._hex_input.className = 'cp-hex-input';
        this._hex_input.maxLength = 7;
        hex_wrap.append(hex_label, this._hex_input);
        this._hex_input.addEventListener('input', () => {
            const v = this._hex_input.value.replace(/[^0-9a-fA-F]/g, '');
            if (v.length === 6) this.val('#' + v);
        });
        this._hex_input.addEventListener('blur', () => this._render());

        // Alpha input
        this._alpha_input = document.createElement('input');
        this._alpha_input.className = 'cp-alpha-input';
        this._alpha_input.type = 'text';
        this._alpha_input.maxLength = 4;
        if (!this._alpha_enabled) this._alpha_input.style.display = 'none';
        this._alpha_input.addEventListener('input', () => {
            let v = parseFloat(this._alpha_input.value);
            if (!isNaN(v)) { this._a = clamp(v, 0, 100); this._render(); this._emit(); }
        });
        this._alpha_input.addEventListener('blur', () => this._render());

        inputs.append(this._preview_outer, hex_wrap, this._alpha_input);

        this._root.append(this._sl_box, this._hue_bar, this._alpha_row, inputs);
    }

    // Bind pointer-drag on the SL box
    _bind_sl_drag() {
        let active = false;
        const update = e => {
            if (!active) return;
            const r = this._sl_box.getBoundingClientRect();
            this._s = clamp((e.clientX - r.left) / r.width * 100, 0, 100);
            this._v = clamp(100 - (e.clientY - r.top) / r.height * 100, 0, 100);
            this._render();
            this._emit();
        };
        this._sl_box.addEventListener('pointerdown', e => {
            active = true;
            this._sl_box.setPointerCapture(e.pointerId);
            update(e);
        });
        this._sl_box.addEventListener('pointermove', update);
        this._sl_box.addEventListener('pointerup', () => active = false);
    }

    // Bind pointer-drag on a horizontal slider
    _bind_slider_drag(el, on_change) {
        let active = false;
        const update = e => {
            if (!active) return;
            const r = el.getBoundingClientRect();
            on_change(clamp((e.clientX - r.left) / r.width, 0, 1));
        };
        el.addEventListener('pointerdown', e => {
            active = true;
            el.setPointerCapture(e.pointerId);
            update(e);
        });
        el.addEventListener('pointermove', update);
        el.addEventListener('pointerup', () => active = false);
    }

    _emit() {
        if (this._on_change) this._on_change(this.val());
    }

    _render() {
        const { h, s, l } = this._hsl();

        // SL box background
        this._sl_box.style.background = `hsl(${this._h}, 100%, 50%)`;

        // SL cursor position
        this._sl_cursor.style.left = this._s + '%';
        this._sl_cursor.style.top  = (100 - this._v) + '%';

        // Cursor colour (contrast for visibility)
        const cur_hex = hsl_to_hex(h, s, l);
        this._sl_cursor.style.background = cur_hex;

        // Hue handle position
        this._hue_handle.style.left  = (this._h / 360 * 100) + '%';
        this._hue_handle.style.color = `hsl(${this._h}, 100%, 50%)`;

        // Alpha slider gradient + handle
        const { r, g, b } = hsl_to_rgb(h, s, l);
        this._alpha_gradient.style.background =
            `linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`;
        this._alpha_handle.style.left  = this._a + '%';
        this._alpha_handle.style.color = `rgba(${r},${g},${b},${this._a / 100})`;

        // Preview
        this._preview_inner.style.background = `rgba(${r},${g},${b},${this._a / 100})`;

        // Hex input
        if (document.activeElement !== this._hex_input) {
            this._hex_input.value = cur_hex.slice(1).toUpperCase();
        }

        // Alpha input
        if (document.activeElement !== this._alpha_input) {
            this._alpha_input.value = Math.round(this._a) + '%';
        }
    }
}
