import app, { el, div, h1, h2, p, style } from '/app.js';
import ui from './ui.js';

app.$root.ac('page');
style(`
.page { padding: 32px; }
.demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}
.demo-card {
    border: 1px solid #ececea;
    border-radius: 10px;
    padding: 16px;
    background: #fff;
}
.demo-card h2 {
    font-size: 13px;
    font-weight: 600;
    color: #9a9a94;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 12px;
}
`);

h1('Framework UI');
p('Reusable controls. Import from `/framework/ui/ui.js` or `/app.js`.');

div.c('demo-grid', () => {

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.input');
        div.c('', ui.input({ value: '', placeholder: 'Placeholder…' }));
        div.c('', () => { el.c('br'); });
        div.c('', ui.input({ value: 'With value', type: 'text' }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.textarea');
        div.c('', ui.textarea({ placeholder: 'Multi-line text…' }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.select');
        div.c('', ui.select({ value: 'b', options: [
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
            { value: 'c', label: 'Option C' },
        ]}));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.slider');
        div.c('', ui.slider({ value: 60, min: 0, max: 100 }));
        div.c('', ui.slider({ value: 4, min: 1, max: 10, step: 1 }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.scrub  (drag or click to type)');
        div.c('', ui.row('Width',  ui.scrub({ value: 240, min: 0, max: 1000 })));
        div.c('', ui.row('Height', ui.scrub({ value: 160, min: 0, max: 1000 })));
        div.c('', ui.row('Opacity', ui.scrub({ value: 1, min: 0, max: 1, step: 0.01, decimals: 2 })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.toggle');
        div.c('', ui.row('Dark mode', ui.toggle({ value: false })));
        div.c('', ui.row('Enabled',   ui.toggle({ value: true  })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.checkbox');
        div.c('', ui.checkbox({ label: 'Show grid',    value: true  }));
        div.c('', ui.checkbox({ label: 'Snap to grid', value: false }));
        div.c('', ui.checkbox({ label: 'Lock aspect',  value: true  }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.color');
        div.c('', ui.row('Fill',   ui.color({ value: '#5b57d6' })));
        div.c('', ui.row('Stroke', ui.color({ value: '#e07a2f' })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.button  (variants)');
        div.c('', ui.row('', ui.button({ label: 'Default' }), ui.button({ label: 'Primary', variant: 'primary' }), ui.button({ label: 'Ghost', variant: 'ghost' })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.item  (sidebar nav row)');
        div.c('', ui.item({ icon: 'brush',     label: 'Brush',   hint: 'B' }));
        div.c('', ui.item({ icon: 'crop_square', label: 'Select', hint: 'S', active: true }));
        div.c('', ui.item({ icon: 'layers',    label: 'Layers'             }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.section + ui.row');
        div.c('', ui.section('Typography',
            ui.row('Size',   ui.scrub({ value: 16, min: 1, max: 200 })),
            ui.row('Color',  ui.color({ value: '#1b1b19' })),
            ui.row('Weight', ui.select({ value: '400', options: ['400','500','600','700'] })),
        ));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.divider');
        div.c('', ui.item({ icon: 'layers', label: 'Item One' }));
        div.c('', ui.divider());
        div.c('', ui.item({ icon: 'layers', label: 'Item Two' }));
        div.c('', ui.divider());
        div.c('', ui.item({ icon: 'layers', label: 'Item Three' }));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.toggle_group');
        div.c('', ui.row('Align', ui.toggle_group({ value: 'left', options: [
            { value: 'left',   icon: 'format_align_left',   title: 'Left' },
            { value: 'center', icon: 'format_align_center', title: 'Center' },
            { value: 'right',  icon: 'format_align_right',  title: 'Right' },
        ]})));
        div.c('', ui.row('Weight', ui.toggle_group({ value: '400', options: [
            { value: '400', label: 'Rg' },
            { value: '500', label: 'Md' },
            { value: '700', label: 'Bd' },
        ]})));
        div.c('', ui.row('Size', ui.toggle_group({ value: 'md', options: ['sm', 'md', 'lg'] })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.badge');
        const wrap = div.c('');
        wrap.el.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
        wrap.append(
            ui.badge('Default'),
            ui.badge('Success', 'success'),
            ui.badge('Error', 'error'),
            ui.badge('Warning', 'warning'),
            ui.badge('Neutral', 'neutral'),
        );
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.bound  (Item binding)');
        // Fake item object for demo (works without full Item9)
        const fake_item = {
            _data: { size: 24, color: '#5b57d6', enabled: true },
            get(k)    { return this._data[k]; },
            set(k, v) { this._data[k] = v; },
        };
        div.c('', ui.row('Size',    ui.bound(fake_item, 'size',    ui.scrub, { min: 1, max: 200 })));
        div.c('', ui.row('Color',   ui.bound(fake_item, 'color',   ui.color)));
        div.c('', ui.row('Enabled', ui.bound(fake_item, 'enabled', ui.toggle)));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.number  (stepper with +/−)');
        div.c('', ui.row('Quantity', ui.number({ value: 1, min: 0, max: 99 })));
        div.c('', ui.row('Grid',     ui.number({ value: 8, min: 1, max: 64, step: 1 })));
        div.c('', ui.row('Opacity',  ui.number({ value: 1.0, min: 0, max: 1, step: 0.1, decimals: 1 })));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.combobox  (searchable dropdown)');
        const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Lato', 'Merriweather', 'Open Sans', 'Poppins', 'Source Code Pro', 'Ubuntu', 'Nunito', 'Raleway', 'Oswald'];
        div.c('', ui.row('Font', ui.combobox({ value: 'Inter', options: fonts })));
        const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'Mexico', 'South Korea', 'Netherlands'];
        div.c('', ui.row('Country', ui.combobox({ value: 'Japan', options: countries, placeholder: 'Search countries…' })));
        div.c('', ui.row('Status', ui.combobox({ options: [
            { value: 'draft', label: 'Draft' }, { value: 'review', label: 'In Review' },
            { value: 'pub', label: 'Published' }, { value: 'arch', label: 'Archived' },
        ]})));
    });

    div.c('demo-card', () => {
        el.c('h2', '', 'ui.form  (schema → bound rows)');
        const fake_item = {
            _data: { name: 'Card', size: 16, color: '#1b1b19', bold: false, align: 'left' },
            get(k)    { return this._data[k]; },
            set(k, v) { this._data[k] = v; },
        };
        div.c('', ui.form(fake_item, [
            { key: 'name',  type: 'input',  label: 'Name',  placeholder: 'Layer name' },
            { key: 'size',  type: 'scrub',  label: 'Size',  min: 1, max: 200 },
            { key: 'color', type: 'color',  label: 'Color' },
            { key: 'bold',  type: 'toggle', label: 'Bold' },
            { key: 'align', type: 'toggle_group', label: 'Align', options: ['left', 'center', 'right'] },
        ]));
    });

});
