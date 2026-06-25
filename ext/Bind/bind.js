// Two-way binding helpers: wire DOM elements to Item5+ fields.
// Each returns a cleanup function; call it before switching to a different item.

export function bind(input_el, item, key) {
    const initial = item.get(key);
    if (initial != null) input_el.value = initial;
    const on_input = () => item.set(key, input_el.value);
    const on_change = (k, v) => { if (k === key) input_el.value = v ?? ''; };
    input_el.addEventListener('input', on_input);
    item.on('change', on_change);
    return () => { input_el.removeEventListener('input', on_input); item.off('change', on_change); };
}

export function bind_checked(input_el, item, key) {
    input_el.checked = !!item.get(key);
    const on_change_dom = () => item.set(key, input_el.checked);
    const on_change = (k, v) => { if (k === key) input_el.checked = !!v; };
    input_el.addEventListener('change', on_change_dom);
    item.on('change', on_change);
    return () => { input_el.removeEventListener('change', on_change_dom); item.off('change', on_change); };
}

export function bind_text(el, item, key) {
    el.textContent = item.get(key) ?? '';
    const on_change = (k, v) => { if (k === key) el.textContent = v ?? ''; };
    item.on('change', on_change);
    return () => item.off('change', on_change);
}

export function bind_number(input_el, item, key) {
    const initial = item.get(key);
    if (initial != null) input_el.value = initial;
    const on_input = () => item.set(key, Number(input_el.value));
    const on_change = (k, v) => { if (k === key) input_el.value = v ?? 0; };
    input_el.addEventListener('input', on_input);
    item.on('change', on_change);
    return () => { input_el.removeEventListener('input', on_input); item.off('change', on_change); };
}

// bind_select: two-way bind a <select> element to an item field.
export function bind_select(select_el, item, key) {
    select_el.value = item.get(key) ?? '';
    const on_change_dom = () => item.set(key, select_el.value);
    const on_change = (k, v) => { if (k === key) select_el.value = v ?? ''; };
    select_el.addEventListener('change', on_change_dom);
    item.on('change', on_change);
    return () => { select_el.removeEventListener('change', on_change_dom); item.off('change', on_change); };
}
