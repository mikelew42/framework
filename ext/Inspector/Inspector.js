import { View, el, div, button, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "Inspector.css");

export default class Inspector {
	active = false;
	selected = null; // currently selected view

	constructor(...args) {
		this.assign(...args);
		this.setup_hotkey();
	}

	render() {
		this.view = div.c("inspector", () => {
			el("h3", "Inspector");
			this.toggle_btn = button("Inspect")
				.ac("inspect-btn")
				.click(() => this.toggle());
			this.content = div.c("inspector-content");
		});
		return this.view;
	}

	assign(...args) {
		return Object.assign(this, ...args);
	}

	setup_hotkey() {
		window.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "i") {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	toggle() {
		this.active ? this.deactivate() : this.activate();
	}

	activate() {
		this.active = true;
		this.view.ac("active");
		this.toggle_btn.ac("active").text("Stop");
		this.bind_events();
	}

	deactivate() {
		this.active = false;
		this.view.rc("active");
		this.toggle_btn.rc("active").text("Inspect");
		this.unbind_events();
		this.clear_hover();
	}

	bind_events() {
		this._on_move = (e) => this.on_move(e);
		this._on_click = (e) => this.on_click(e);
		document.addEventListener("pointermove", this._on_move);
		document.addEventListener("pointerdown", this._on_click, true);
	}

	unbind_events() {
		document.removeEventListener("pointermove", this._on_move);
		document.removeEventListener("pointerdown", this._on_click, true);
	}

	on_move(e) {
		if (!this.active) return;

		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el || el === this._hovered_el) return;

		this.clear_hover();
		this._hovered_el = el;
		el.classList.add("inspector-hover");
	}

	on_click(e) {
		if (!this.active) return;

		this.deactivate();

		// ignore clicks on the inspector itself
		if (this.view.el.contains(e.target)) return;

		e.preventDefault();
		e.stopPropagation();

		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el) return;

		this.select(el);
	}

	clear_hover() {
		if (this._hovered_el) {
			this._hovered_el.classList.remove("inspector-hover");
			this._hovered_el = null;
		}
	}

	select(el) {
		// remove previous selection
		if (this.selected?.el) {
			this.selected.el.classList.remove("inspector-selected");
			this.selected._inspector_panel?.rc("inspector-active");
		}

		// lookup the view
		const view = View.lookup(el);

		if (view) {
			this.selected = view;
			el.classList.add("inspector-selected");
			this.show_panel(view);
		} else {
			// no view, just highlight the raw element
			this.selected = { el }; // wrap raw el
			el.classList.add("inspector-selected");
			this.show_raw_panel(el);
		}
	}

	// cached panel per view
	show_panel(view) {
		// hide all panels
		this.hide_all_panels();

		// get or create cached panel
		if (!view._inspector_panel) {
			view._inspector_panel = this.create_panel(view);
			this.content.append(view._inspector_panel);
		} else {
			// refresh classes in case they changed
			this.refresh_panel(view);
		}

		view._inspector_panel.ac("inspector-active");
	}

	show_raw_panel(el) {
		this.hide_all_panels();

		// create a temporary panel for raw elements
		const panel = this.create_raw_panel(el);
		this.content.empty(panel);
	}

	hide_all_panels() {
		const panels = this.content.el.querySelectorAll(".inspector-panel");
		panels.forEach((p) => p.classList.remove("inspector-active"));
	}

	create_panel(view) {
		return div.c("inspector-panel", (panel) => {
			el("h4", view.constructor.name || "View");
			this.render_nav(view);
			this.render_classes(view, panel);
		});
	}

	render_nav(view) {
		div.c("inspector-nav", () => {
			button("↑ Parent").ac("nav-btn").click(() => {
				const parent_el = view.el.parentElement;
				if (!parent_el) return;
				const parent_view = View.lookup(parent_el);
				if (parent_view) {
					this.select(parent_view.el);
				} else {
					// walk up until we find a view
					let el = parent_el;
					while (el && !View.lookup(el)) {
						el = el.parentElement;
					}
					if (el) this.select(el);
				}
			});
		});
	}

	render_classes(view, panel) {
		const classes = Array.from(view.el.classList).join(" ");
		if (classes) {
			panel.class_ctrls = div.c("class-section", () => {
				el("h5", "Classes");
				view.ctrl(classes);
			});
		} else {
			panel.class_ctrls = div.c("class-section", () => {
				el("h5", "Classes");
				el("em", "(no classes)");
			});
		}
	}

	refresh_panel(view) {
		if (!view._inspector_panel?.class_ctrls) return;

		// rebuild class controls
		const classes = Array.from(view.el.classList).join(" ");
		view._inspector_panel.class_ctrls.empty(() => {
			el("h5", "Classes");
			if (classes) {
				view.ctrl(classes);
			} else {
				el("em", "(no classes)");
			}
		});
	}

	create_raw_panel(el) {
		const classes = Array.from(el.classList).join(" ");
		return div.c("inspector-panel inspector-active", () => {
			span("Element: ").ac("label");
			span(el.tagName.toLowerCase()).ac("tag");
			div.c("class-section", () => {
				el("h5", "Classes");
				if (classes) {
					div.c("raw-classes", classes);
				} else {
					span("(no classes)").ac("empty");
				}
			});
		});
	}
}