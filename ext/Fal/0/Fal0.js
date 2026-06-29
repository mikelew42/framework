import App, { div, el, p } from '/framework/core/App/App.js';
import Workspace0 from '/framework/ext/Workspace/0/Workspace0.js';
import { panel } from '/framework/ext/Workspace/0/Panel0.js';
import { card } from '/framework/ext/Workspace/0/Card0.js';

App.stylesheet(import.meta, 'Fal0.css');

/**
 * Fal0 — Image generation workspace.
 * Extends Workspace0: left=gen browser, center=viewer, right=metadata.
 * Reads gen/ via /directory.json; sidecar .json files for per-image metadata.
 * Model parameters/pricing live in /framework/ext/Fal/models.json.
 */
export default class Fal0 extends Workspace0 {

    instantiate(...args) {
        this.gens = [];
        this.selected = null;
        this.models_data = {};
        super.instantiate(...args);
    }

    // initialize() fires at end of super.instantiate() — the correct override point
    // Must call Workspace0.set_captor (not this.capture) so Panel0 can find this workspace
    initialize() {
        Workspace0.set_captor(this);
        this.build_panels();
        Workspace0.restore_captor();
        this.load_data();
    }

    // ── Panel layout ──────────────────────────────────────────────────

    build_panels() {
        // Left: thumbnail grid
        panel({ title: 'Generations', width_mode: 'fixed', width: '13em' }, () => {
            card({ height_mode: 'fill', content: () => {
                this.grid = div.c('fal-grid');
            }});
        });

        // Center: large image viewer
        panel({ width_mode: 'fill' }, () => {
            card({ height_mode: 'fill', content: () => {
                // viewer-empty is nested inside viewer so empty() replaces it cleanly
                this.viewer = div.c('fal-viewer', () => {
                    div.c('fal-viewer-empty', 'No image selected');
                });
            }});
        });

        // Right: prompt + details + model tips
        panel({ title: 'Info', width_mode: 'fixed', width: '17em' }, () => {
            card({ title: 'Prompt', content: () => {
                this.prompt_el = p('').ac('fal-prompt-text');
            }});
            card({ title: 'Details', content: () => {
                this.details_el = div.c('fal-details');
            }});
            card({ title: 'Model Tips', content: () => {
                this.tips_el = div.c('fal-tips');
            }});
        });
    }

    // ── Data loading ──────────────────────────────────────────────────

    async load_data() {
        const models_res = await fetch('/framework/ext/Fal/models.json').catch(() => null);
        if (models_res?.ok) this.models_data = await models_res.json();

        const dir_res = await fetch('/directory.json').catch(() => null);
        if (!dir_res?.ok) return;

        const { files } = await dir_res.json();
        this.gens = this.find_gens(files);
        this.render_grid();

        if (this.gens.length > 0) this.select(this.gens[0]);
    }

    // Walk directory tree, collect image files under ext/Fal/0/gen/
    find_gens(nodes) {
        const results = [];
        for (const node of nodes || []) {
            if (
                node.type === 'file' &&
                node.full.startsWith('framework/ext/Fal/0/gen/') &&
                /\.(jpg|jpeg|png)$/i.test(node.name)
            ) {
                results.push(node);
            }
            if (node.children) results.push(...this.find_gens(node.children));
        }
        return results.reverse(); // newest first (filenames are timestamp-prefixed)
    }

    // ── Grid ──────────────────────────────────────────────────────────

    render_grid() {
        this.grid.empty(() => {
            if (this.gens.length === 0) {
                div.c('fal-empty', 'No generations yet.\nRun gen.mjs to create some.');
                return;
            }
            for (const gen of this.gens) {
                const selected = this.selected === gen;
                // div.c with fn = nested captor; img gets captured into thumb
                div.c(selected ? 'fal-thumb fal-thumb-selected' : 'fal-thumb', () => {
                    el('img').attr('src', '/' + gen.full).attr('loading', 'lazy');
                }).click(() => this.select(gen));
            }
        });
    }

    // ── Selection ─────────────────────────────────────────────────────

    async select(gen) {
        this.selected = gen;
        this.render_grid();

        // Lazy-load sidecar JSON
        if (!gen.meta) {
            const json_url = '/' + gen.full.replace(/\.(jpg|jpeg|png)$/i, '.json');
            gen.meta = await fetch(json_url).then(r => r.json()).catch(() => ({}));
        }

        this.render_viewer(gen);
        this.render_info(gen);
    }

    // ── Viewer ────────────────────────────────────────────────────────

    render_viewer(gen) {
        this.viewer.empty(() => {
            el('img').ac('fal-viewer-img').attr('src', '/' + gen.full);
            div.c('fal-viewer-label', gen.name);
        });
    }

    // ── Info panel ────────────────────────────────────────────────────

    render_info(gen) {
        const m = gen.meta || {};
        const input = m.input || {};

        this.prompt_el.text(input.prompt || '—');

        this.details_el.empty(() => {
            const rows = [
                ['Model',      m.model],
                ['Resolution', input.resolution],
                ['Aspect',     input.aspect_ratio],
                ['Format',     input.output_format],
                ['Duration',   m.duration_ms ? (m.duration_ms / 1000).toFixed(1) + 's' : '—'],
                ['Date',       m.timestamp ? new Date(m.timestamp).toLocaleString() : '—'],
            ];
            for (const [label, val] of rows) {
                div.c('fal-detail-row', () => {
                    el('span').ac('fal-detail-label').text(label);
                    el('span').ac('fal-detail-val').text(val || '—');
                });
            }
        });

        const model_info = this.models_data[m.model];
        this.tips_el.empty(() => {
            if (!model_info) {
                div.c('fal-empty', 'No model data.\nAdd to models.json.');
                return;
            }
            for (const tip of model_info.tips || []) {
                div.c('fal-tip', tip);
            }
        });
    }
}
