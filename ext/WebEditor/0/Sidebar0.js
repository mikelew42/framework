import View, { el, div, style } from '/framework/core/View/View.js';
import icon from '/framework/ui/icon/icon.js';

style(`
    .sidebar-wrap {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 12px 8px;
        box-sizing: border-box;
    }
    .sidebar-section-label {
        font-size: 11px;
        font-weight: 600;
        color: #9a9a94;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 8px 8px;
    }
    .lib-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: grab;
        font-size: 13.5px;
        color: #1b1b19;
        user-select: none;
    }
    .lib-item:hover {
        background: #f4f4f3;
    }
    .lib-item:active {
        cursor: grabbing;
    }
    .lib-item .icon {
        font-size: 18px;
        color: #6b6b66;
    }
`);

export default class Sidebar0 extends View {
    render() {
        const wrap = div.c('sidebar-wrap');
        const label = div.c('sidebar-section-label', 'Elements');
        wrap.append(label);

        const frame_item = div.c('lib-item');
        frame_item.append(icon('crop_square'));
        frame_item.el.appendChild(document.createTextNode('Frame'));
        frame_item.el.setAttribute('draggable', 'true');
        frame_item.el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('web-editor-kind', 'frame');
            e.dataTransfer.effectAllowed = 'copy';
        });

        const text_item = div.c('lib-item');
        text_item.append(icon('text_fields'));
        text_item.el.appendChild(document.createTextNode('Text'));
        text_item.el.setAttribute('draggable', 'true');
        text_item.el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('web-editor-kind', 'text');
            e.dataTransfer.effectAllowed = 'copy';
        });

        wrap.append(frame_item, text_item);
        this.append(wrap);
    }
}
