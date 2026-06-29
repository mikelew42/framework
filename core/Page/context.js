/**
 * Shared Page context — ONE source of truth for the captor stack and the root
 * collection, across all Page levels (Page1, Page2, …).
 *
 * Why not class statics? Static fields don't inherit cleanly: a subclass
 * assigning `Page2.captor = x` creates an OWN property that shadows the base
 * `Page1.captor`, so `page()` in one class and `render_content()` in another
 * can silently read different captors. Routing every level through this single
 * object (via accessors on the Page class) makes that impossible.
 */
const ctx = {
    captor: null,        // the page currently rendering its content (adopts page() calls)
    roots: [],           // root pages created with no captor (App.load_page fallback)
    stack: [],           // captor stack for nesting

    set_captor(pg){ ctx.stack.push(ctx.captor); ctx.captor = pg; },
    restore_captor(){ ctx.captor = ctx.stack.length ? ctx.stack.pop() : null; },
};

export default ctx;
