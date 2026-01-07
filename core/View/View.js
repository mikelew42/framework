import is from "../../lib/is.js";

export default class View {

	tag = "div";
	// capture = true; // this is set on View.prototype at end of file

	constructor(...args){
		this.assign(...args);
		this.prerender();
		this.initialize();
	}

	initialize(){
		this.append(this.render);
	}

	render(){}

	prerender(){
		this.el = this.el || document.createElement(this.tag || "div");
		this.capture && View.captor && View.captor.append(this);
		this.classify && this.classify();
	}

	// add class
	ac(...args){
		for (const arg of args){
			arg && arg.split(" ").forEach(cls => this.el.classList.add(cls));
		}
		return this;
	}

	// remove class
	rc(...args){
		for (const arg of args){
			arg && arg.split(" ").forEach(cls => this.el.classList.remove(cls));
		}
		return this;
	}

	classify(){
		this.ac(this.classes); // probably a bad idea, this won't stay sync'd...

		var cls = this.constructor;

		while (cls !== View){
			this.ac(cls.name.replace("View", "").toLowerCase());
			cls = Object.getPrototypeOf(cls);
		}

		if (this.name)
			this.ac(this.name);
	}

	append(...args){
		for (const arg of args){
			if (arg && arg.el){
				arg.parent = this;
				this.el.appendChild(arg.el);
			} else if (is.fn(arg?.render)){
				this.append_fn(() => arg.render(this));
			} else if (is.pojo(arg)){
				this.append_pojo(arg);
			} else if (is.arr(arg)){
				this.append.apply(this, arg);
			} else if (is.fn(arg)){
				this.append_fn(arg);
			} else {
				// DOM, str, undefined, null, etc
				this.el.append(arg);
			}
		}
		return this;
	}

	prepend(...args){
		for (const arg of args){
			if (arg && arg.el){
				arg.parent = this;
				this.el.prepend(arg.el);
			} else if (is.pojo(arg)){
				this.prepend_pojo(arg);
			} else if (is.obj(arg)){
				console.error("maybe not");
			} else if (is.arr(arg)){
				this.prepend.apply(this, arg);
			} else if (is.fn(arg)){
				this.prepend_fn(arg); // this will be tricky, this fn does not exist right now
			} else {
				// DOM, str, undefined, null, etc
				this.el.prepend(arg);
			}
		}
		return this;
	}

	prepend_to(view){
		if (is.dom(view)){
			view.prepend(this.el);
		} else {
			view.prepend(this);
		}
		return this;
	}

	append_fn(fn){
		View.set_captor(this);
		const return_value = fn.call(this, this);
		View.restore_captor();

		if (is.def(return_value))
			this.append(return_value);

		return this;
	}

	append_pojo(pojo){
		for (const prop in pojo){
			this.append_prop(prop, pojo[prop]);
		}
		
		return this;
	}

	append_prop(prop, value){
		var view;
		if (value && value.el){
			view = value;
		} else {
			view = (new View({ tag: this.tag })).append(value);
		}

		view.ac(prop).append_to(this);

		if (!this[prop]){
			this[prop] = view;
		} else {
			console.warn(`.${prop} property is already taken`);
		}

		return this;
	}

	append_to(view){
		if (is.dom(view)){
			view.appendChild(this.el);
		} else {
			view.append(this);
		}
		return this;
	}

	has_class(cls){
		return this.el.classList.contains(cls);
	}

	hc(cls){
		return this.has_class(cls);
	}

	toggle_class(cls){
		return this.has_class(cls) ? this.rc(cls) : this.ac(cls);
	}

	tc(cls){
		const classes = cls.split(" ");
		for (const clas of classes)
			this.toggle_class(clas);
		return this;
	}

	html(value){
		// set
		if (is.def(value) && value !== this.el.innerHTML){  
									// don't re-update, important for contenteditable change events
									// and losing focus upon re-update, etc.
									// does touching this.el.innerHTML cause a performance hit?
			this.el.innerHTML = value;
			return this;

		// get
		} else {
			return this.el.innerHTML
		}
	}

	text(value){
		// set
		if (is.def(value) && value !== this.el.textContent){ // see comment in html()
			this.el.textContent = value;
			return this;

		// get
		} else {
			return this.el.textContent;
		}
	}

	backtick_append(...args){
		for (const arg of args){
			if (is.str(arg))
				this.backticks(arg);
			else
				this.append(arg);
		}
		return this;
	}

	// Author: Gemini 2.5 Flash
	backticks(text){
		const regex = /`([^`]+)`/g;
		let parts = [];
		let lastIndex = 0;
		let match;

		// 1. Iterate through all matches
		while ((match = regex.exec(text)) !== null) {
			const fullMatch = match[0]; // e.g., '`code segment`'
			const capturedContent = match[1]; // e.g., 'code segment'
			const matchStart = match.index;
			const matchEnd = matchStart + fullMatch.length;

			// 2. Capture the preceding plain text
			const precedingText = text.substring(lastIndex, matchStart);
			if (precedingText) {
				parts.push(precedingText);
			}

			// 3. Create and push the 'code' element
			const codeElement = el("code", capturedContent);
			parts.push(codeElement);

			// 4. Update the index for the next segment
			lastIndex = matchEnd;
		}

		// 5. Capture any remaining text after the last match
		const remainingText = text.substring(lastIndex);
		if (remainingText) {
			parts.push(remainingText);
		}

		this.append(parts);
		return this;
	}

	attr(name, value){
		// set
		if (is.def(value) && value !== this.el.getAttribute(name)){ // see comment in html()
			this.el.setAttribute(name, value);
			return this;

		// get
		} else {
			return this.el.getAttribute(name);
		}
	}

	click(cb){
		if (!cb) console.error("must provide a callback");
		return this.on("click", cb);
	}

	on(event, cb){
		this.el.addEventListener(event, (...args) => {
			cb.call(this, ...args);
		});

		return this;
	}

	off(event, cb){
		this.el.removeEventListener(event, cb);
		return this;
	}

	// this might mess up the normal capturing?
	// this would be called synchronously... it might work though
	// load(src){
	// 	set this as captor
	// 	const mod = await import(src);
	// 	console.log("loaded script", src, mod);
	// 	restor captor
	// }

	// returns index of self relative to parentNode.children
	index(){
		return Array.prototype.indexOf.call(this.el.parentNode.children, this.el);
	}

	insert(el, index){
		// can content be an array? can you not insert multiple?
		// maybe insert(index, ...content) is better?
		// but upgrading all inputs ("str", num, capturing fns, views, and elements)
		// to viable dom-worthy values is going to be tricky...
		if (el.el)
			el = el.el; // if you pass in a view

		if (index >= this.el.children.length){
			this.append(el);
		} else {
			this.el.insertBefore(el, this.el.children[index]);
		}

		return this;
	}

	empty(...args){
		this.el.innerHTML = "";
		this.append(...args);
		return this;
	}

	// inline styles
	style(prop, value){
		// set with object
		if (is.obj(prop)){
			for (var p in prop){
				this.style(p, prop[p]);
			}
			return this;

		// set with "prop", "value"
		} else if (prop && is.def(value)) {
			this.el.style[prop] = value;
			return this;

		// get with "prop"
		} else if (prop) {
			return this.el.style[prop];

		// get all
		} else if (!arguments.length){
			return this.el.style;
		} else {
			throw "whaaaat";
		}
	}
	hide(){
		this.el.style.display = "none";
		return this;
	}
	show(){
		this.el.style.display = "";
		return this;
	}
	// this doesn't work if css display: none is the starting point...
	toggle(){
		if (getComputedStyle(this.el).display === "none")
			return this.show();
		else {
			return this.hide();
		}
	}
	remove(){
		this.el.parentNode?.removeChild(this.el);
		return this;
	}

	replace(view){
		this.el.replaceWith(view.el ? view.el : view);
		return this;
	}

	buffer(){
		this._buffer_clone = this.el.cloneNode(true);
		this.el.replaceWith(this._buffer_clone);
		return this;
	}

	flush(){
		this._buffer_clone.replaceWith(this.el);
		delete this._buffer_clone;
		return this;
	}

	// this might be prone to recapturing
	clone(){
		return new this.constructor({
			el: this.el.cloneNode(true)
		});
	}

	static set_captor(view){
		View.previous_captors.push(View.captor);
		View.captor = view;
	}

	static restore_captor(){
		View.captor = View.previous_captors.pop();
	}

	/**
	 * View.stylesheet("path/file.css")
	 * or
	 * View.stylesheet(import.meta, "path/file.css")
	 */
	static stylesheet(meta, url){
		if (is.str(meta)){ // stylesheet("/styles.css");
			url = meta;
		} else { // stylesheet(import.meta, "file.css");
			url = new URL(url, meta.url).href;
		}

		const prom = new Promise((res, rej) => {
			new View({ tag: "link" }).attr("rel", "stylesheet").attr("href", url)
				.append_to(document.head).on("load", () => {
					res(); // if a stylesheet fails to load, the app won't render?  should probably render an error message
				});
		});
		
		this.stylesheets.push(prom);

		return prom;
	}

	static elements(){
		const View = this;
		const fns = {
			el(tag, ...args){
				return new View({ tag }).append(...args);
			},
			div(){
				return new View().append(...arguments);
			},
			p(){
				return new View({ tag: "p" }).backtick_append(...arguments);
			},
			style(){
				return new View({ tag: "style" }).append(...arguments).append_to(document.head);
			}
		};

		fns.el.c = function(tag, classes, ...args){
			return new View({ tag }).ac(classes).append(...args);
		};

		fns.div.c = function(classes, ...args){
			return new View().ac(classes).append(...args);
		};

		fns.p.c = function(classes, ...args){
			return new View({ tag: "p" }).ac(classes).backtick_append(...args);
		};
		
		
		["h1", "h2", "h3", "pre", "code"].forEach(tag => {
			fns[tag] = function(){
				return new View({ tag }).append(...arguments);
			};

			fns[tag].c = function(classes, ...args){
				return new View({ tag }).ac(classes).append(...args);
			};
		})

		return fns;
	}

	// setup body as captor
	static body(){
		if (View._body){
			return View._body;
		} else {
			View._body = new View({
				tag: "body",
				el: document.body,
				capture: false,
				init(){
					View.set_captor(this);
					return this;
				}
			});

			// View.set_captor(View._body); // this might backfire, if you're trying to get View.body() inside another view, for example..
			return View._body;
		}
	}

	assign(...args){
		return Object.assign(this, ...args);
	}
}

View.stylesheets = [];

export function icon(name){
	return el.c("span", "material-icons icon", name);
}

export const { el, div, p, h1, h2, h3, style, pre, code } = View.elements();
export { View, is };

View.previous_captors = [];
View.prototype.capture = true;