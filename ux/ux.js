// ux — higher-level UX patterns built on core primitives.
// Import as:  import { ux } from '/app.js'
//
// Patterns:
//   ux.tabs([{label, content}], opts)     → Tabs View
//   ux.accordion([{label, content}], opts) → Accordion View
//   ux.toast(msg, opts)                    → show notification
//   ux.modal                               → Modal (confirm, alert, prompt, open)
//   ux.context_menu                        → ContextMenu (show, hide, bind)

import Tabs        from './Tabs/Tabs.js';
import Accordion   from './Accordion/Accordion.js';
import Toast       from './Toast/Toast.js';
import Modal       from './Modal/Modal.js';
import ContextMenu from './ContextMenu/ContextMenu.js';
import Popover     from './Popover/Popover.js';
import Tooltip        from './Tooltip/Tooltip.js';
import CommandPalette from './CommandPalette/CommandPalette.js';
import Sheet          from './Sheet/Sheet.js';
import Notification   from './Notification/Notification.js';

// Factories

function tabs(tab_defs = [], { active_index = 0 } = {}) {
    return new Tabs({ tabs: tab_defs, active_index, capture: false });
}

function accordion(sections = [], opts = {}) {
    return new Accordion({ sections, ...opts, capture: false });
}

function toast(msg, opts) {
    return Toast.show(msg, opts);
}

// Popover factory — attaches to a trigger element.
// popover({ trigger, content, placement, offset }) → Popover instance
function popover(opts) {
    return new Popover(opts);
}

// Sheet factory — slide-in drawer.
// sheet({ content, side, size, title }) → Sheet instance
function sheet(opts) {
    return new Sheet(opts);
}

const ux = {
    tabs,
    accordion,
    toast,
    popover,
    tooltip:         Tooltip,
    command_palette: CommandPalette,
    sheet,
    notification:    Notification,
    modal:           Modal,
    context_menu:    ContextMenu,
    // Classes
    Tabs,
    Accordion,
    Toast,
    Modal,
    ContextMenu,
    Popover,
    Tooltip,
    CommandPalette,
    Sheet,
    Notification,
};

export default ux;
export { tabs, accordion, toast, popover, sheet, Tabs, Accordion, Toast, Modal, ContextMenu, Popover, Tooltip, CommandPalette, Sheet, Notification };
