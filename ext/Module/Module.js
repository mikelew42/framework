// import Base from "../../core/Base/Base.js";
import Socket from "../../ext/Socket/Socket.js";
import File from "../File/File.js";
import Dir from "../Dir/Dir.js";
// import is from "../../lib/is.js";
import { App, el, div, View, h1, h2, h3, p, is, Base, icon } from "../../core/App/App.js";
// import draggable from "./draggable.js";

View.stylesheet("/framework/ext/Module/module.styles.css");

const socket = Socket.singleton();

export default class Module extends Base {

    async initialize(){
        console.log(this.constructor.name.toLowerCase() + ".iniitalize");
        // if (!this.get("order")){
        //     this.set("order", []); 
        // } // we can now add optional default data to the file

        this.children = [];

        for (const o of this.get("order")){
            console.log("order", o);
            this.children.push(new this.constructor({
                id: o,
                parent: this
            }));
        }

        await Promise.all(this.children.map(child => child.ready));
    }

    instantiate(...args){
        this.config(...args);
		this.load(); // load the file
        
        // if we await comp.ready, will initialize() run first or after?
        // hopefully they run in the order they are added, which I think would run this first...
        
        // Nope, seems like the external await runs first, not sure why
        
		// this.initialize(); // then initialize 
        // moved this to the file.ready.then
        
		/* The whole point of async here was to get initialize() to run AFTER data, but BEFORE ready?
		Well, it didn't work.  Not it basically does/should :D */
	}
	
    config(...args){
        this.name = this.constructor.name.toLowerCase();
        this.classname = this.constructor.name;

        // this is a hack, please figure out a better way
        if (!this.constructor.socket)
            this.constructor.socket = socket;

        this.File = this.constructor.File; // so load_file() works on the Class
            // can't do new this.constructor.File on the class, the constructor prop doesn't exist

        // this.constructor?.track(this);



		this.assign(...args);

		this.pointermove = this.pointermove.bind(this);
		this.pointerup = this.pointerup.bind(this);
		this.pointerdown = this.pointerdown.bind(this);
    }

	load(){
		if (!this.data){
			this.load_file();
			this.ready = this.file.ready.then(async () => {
				this.data = this.file.data;
				this.saver = this.file;
				await this.initialize();
				return this;
			});
			
		}  else {
			this.saver = this.parent.saver;
		}// assume if data is present, it's from a parent component
	}

    load_file(){
            // new() passes parent, not path
            if (!this.path && this.parent){
                this.path = this.parent.path + this.parent.id + "/";
            }
    
            this.dir = new Dir({
                name: this.id,
                path: this.path 
            });

            const data = {
                order: []
            };

            if (this.name)
                data.name = this.name;
    
            this.file = this.dir.file(this.constructor.name.toLowerCase() + ".json", { 
                data // default data for new notes
            });
    
            // await this.file.ready;
            // this.get("order");
            // for each order, new Note({ id: order[i], parent: this });
        }
    
        nuke(){
            if (this.parent){
                const order = this.parent.get("order");
                const index = order.indexOf(this.id);
                if (index !== -1) order.splice(index, 1);
                this.parent.set("order", order);
    
                this.parent.children = this.parent.children.filter(n => n.id !== this.id);
            }
    
            this.dir.rm();
    
            if (this.parent){
                this.parent.update();
            } else {
                this.update();
            }
        }
    
        // render(){
        //     this.view = div.c("note", view => {
        //         h2(this.id);
        //         view.content = div.c("content").attr("contenteditable", true).on("input", e => {
        //             this.set("content", e.target.innerHTML);
        //         });
        //         h3("Notes");
        //         el("button", "New").on("click", () => {
        //             this.new();
        //         });            
        //         el("button", "Nuke").on("click", () => {
        //             this.nuke();
        //         });
        //         view.notes = div.c("notes");
        //     });
    
        //     this.update();
        // }
    
        // update(){
    
        //     // debugger;
        //         // !! This set method (html vs text) is important
        //         // if you try to set innerHTML into text, it duplicates a bunch of characters
        //     this.view.content.html(this.get("content"));
        //     this.view.notes.empty();
        //     this.view.notes.append(() => {
        //         for (const child of this.children){
        //             child.render();
        //         }
        //     });
        // }

	set(name, value){
		if (is.pojo(name)){
			for (const prop in name){
				this.set(prop, name[prop]);
			}
		} else if (value?.setup){
			console.warn("is this used?");
			value.setup(this, name);
		} else {
			const current = this.data[name];

			if (current?.set){
				console.warn("set(name, value) ?") // not sure this is used
				current.set(value);
			} else {
				if (this.data[name] !== value){
					this.data[name] = value;	
					this.changed();
				}
			}
		}

		// this.changed();
		
		return this;
	}

	async setup(parent, name){
		this.parent = parent;
		this.name = name; // overrides own name?
			// can thing.name be different than parent["name"] = thing?
		
		await this.parent.ready;
		await this.ready;
		this.parent.data[name] = this.data;
		console.warn("huh?"); // i'm not sure this logically makes sense?
			// does the data come from the parent? or...?
	}

	get(name){
		const value = this.data[name];
		if (value?.get)
			return value.get(); // ? what type of instance is this?
		else
			return value;
	}

	changed(){
		this.save();

		if (this.update && !this.updating){
			this.updating = setTimeout(() => {
				this.updating = false;
				this.update();
			}, 0);
		}
	}

    save(){
        this.saver.save();
    }

	render(){
		this.view = div.c("list " + this.name.replace(" ", ""), {
			bar: {
				name: div(this.get("name")).on("input", e => {
                    this.set("name", e.target.textContent);
                }),
                id: div(this.id),
                edit: div("edit").click(() => {
                    // debugger;
                    if (this.view.bar.name.attr("contenteditable")){
                        this.view.bar.name.attr("contenteditable", false);
                    } else {
                        this.view.bar.name.attr("contenteditable", true);
                        this.view.bar.name.el.focus();
                    }
                }).style("cursor", "pointer"),
				add: div("add").click(() => this.add()),
				delete: div("delete").click(() => this.parent.remove(this))
			},
			container: div()
		});

		this.view.name = this.view.bar.name;

		this.update();

		this.view.name.on("pointerdown", this.pointerdown);
	}

	update(){
		this.view?.container.empty().append(() => {
			this.each(item => item?.render());
		});
	}

    pointerdown(e){
        document.addEventListener("pointermove", this.pointermove);
		document.addEventListener("pointerup", this.pointerup);
		this.view.ac("dragging");
		View.body().ac("drag-in-progress");
        if (!this.cursor){
            this.cursor = div.c("drag-cursor");
        }
    }

    pointermove(e){
        if (this.target !== e.target){
            this.new_target(e);
        }

        this.cursor_update(e);
    }

    pointerup(e){
        document.removeEventListener("pointermove", this.pointermove);
		document.removeEventListener("pointerup", this.pointerup);
		this.view.rc("dragging");
		View.body().rc("drag-in-progress");

        this.target?.classList.remove("dragover");
        this.target_list?.view.rc("dragover");
        // this.cursor.remove();

        if (this.target_list){
            this.parent?.remove(this);
            this.target_list.insert(this, this.last_nearest_insert_index);
        }
    }

    new_target(e){
        this.target?.classList.remove("dragover");
        this.target_list?.view.rc("dragover");
            // this.last_target = this.target;
            // this.last_lists_target = this.target_list;

        this.target = e.target;
        this.target_list = this.get_list_from_target(this.target);

        if (this.target_list && this.target_list !== this){
            this.target_list.view.ac("dragover");
        }

        console.log("new target", e.target);
    }

    cursor_update(e){
        if (this.target.matches(".list > .container")){
            const real_children = Array.from(this.target.children).filter(c => c !== this.cursor.el);
            // console.log("real", real_children);

            // y coordinate midpoints for each child
            const midpoints = [];
            for (const child of real_children){
                midpoints.push(
                    child.getBoundingClientRect().top 
                 + (child.getBoundingClientRect().height / 2)
                );
            }

            // returns { value, index }

            console.log("midpoints", midpoints);
            const nearest = findClosestNumber(midpoints, e.clientY);

            if (e.clientY < nearest.value){
                // nearest.insert_index = Math.max(0, nearest.index - 1); // ensures we don't go below 0
                nearest.insert_index = nearest.index; // ensures we don't go below 0
            } else {
                nearest.insert_index = nearest.index + 1;
            }

            nearest.el = real_children[nearest.insert_index];

            this.last_nearest_insert_index = nearest.insert_index;
            console.log(nearest);

            if (nearest.el !== this.last_nearest_el){
                this.last_nearest_el = nearest.el;
                console.log("new target...");
                this.target.insertBefore(this.cursor.el, nearest.el);
                this.target.classList.add("has-cursor");
                // setTimeout(() => this.cursor.ac("grow"), 0);
                this.cursor.ac("grow");
            } else {
                console.log("same target...")
            }
        } else {
            this.cursor.remove();
        }
    }

    get_list_from_target(target, search_parents = true){

        if (this.view.el.contains(target)){
            // maybe its this, maybe its a child...

            var child_match;
            this.each(child => {
                child_match = child.get_list_from_target(target, false);
                if (child_match) return false;
            });

            if (child_match){
                return child_match;
            }

            return this;
        } else if (search_parents){
            // parent match?
            var parent = this.parent?.get_list_from_target(target);
            if (parent){
                return parent;
            }
        }
        return null; // this was return false

        /* but this.target_list?.view.ac() kept throwing undefined error 
         * the conditional ?. property accessor still continues if the property is false, which is absurd */
    }

	insert(child, index) {
        if (child.parent !== this){
            const nextid = this.get("nextid") || 1;
            child.id = nextid;
            child.parent = this;
            child.index = index;
        }
		// Use splice to insert the item at the specified index
		this.children.splice(index, 0, child);
        this.get("order").splice(index, 0, child.id);
        this.save();
		this.changed();
		return this;
	}

	remove(child){
		if (child){
            // this.find?
			this.each((item, i) => {
				if (item === child){
                    delete child.parent;
					this.children.splice(i, 1);
                    this.get("order").splice(i, 1);
                    this.save();
				}
			});
			this.changed();

        // (if !child), we're calling mod.remove() with no args => remove self from parent
		} else if (this.parent){
			this.parent.remove(this);
		}
	}

	find(fn){
		var result;
		this.each(function find(v, i){
			if (fn(v, i)){
				result = v;
				return false;
			}
		});
		return result;
	}

	each(fn){
		for (let i = 0; i < this.children.length; i++){
			if (fn.call(this, this.children[i], i) === false)
				return this; // return false to stop early
		}
		return this;
	}

        
    
    async new(){
        const child = new this.constructor({
            id: nextid,
            parent: this
        }); // does this attempt to load it?
        // this.children.push(child);
        this.get("order").push(nextid); // no need to set, as long as something else is saving
        
        await child.ready;
        // debugger;
        // eww...
        this.set("nextid", nextid + 1);
        /*  This is causing a rendering problem:
        1. set -> update -> render -> render children
        2. the new Note hasn't loaded properly, and there is no data to render */
        
        return child;
    }
    
	async add(child, push = true){
        const nextid = this.get("nextid") || 1;
		if (!child){
			child = await new this.constructor({
                id: nextid,
                name: "item " + nextid,
                parent: this
            });
		} else {
            child.id = nextid;
            child.parent = this;
        }

        if (push){
            this.get("order").push(nextid);
            this.children.push(child);
        }
        await child.ready;
        this.set("nextid", nextid + 1);
		// this.changed(); // i think the set will trigger changed
		return this;
	}

	make(n){
        var nextid = this.get("nextid") || 1;
        const made = [];
		for (let i = 1; i <= n; i++){
            console.log(nextid);
			made.push(new this.constructor({ 
                name: "item " + i, 
                parent: this,
                id: nextid++
            }));
		}
        this.set("nextid", nextid);
        Promise.all(made.map(child => child.ready)).then(made => {
            for (const child of made){
                this.add(child);
            }
        });
		return this;
	}
}



function findClosestNumber(array, inputNumber) {
    // debugger;
    // Initialize variables to store the closest number and the smallest difference
    let closestNumber = array[0];
    let smallestDifference = Math.abs(array[0] - inputNumber);
    let index = 0;

    // Loop through the array
    for (let i = 1; i < array.length; i++) {
        // Calculate the difference between the current array element and the input number
        const currentDifference = Math.abs(array[i] - inputNumber);

        // If the current difference is smaller than the smallest difference found so far
        if (currentDifference < smallestDifference) {
            // Update the smallest difference and the closest number
            smallestDifference = currentDifference;
            closestNumber = array[i];
            index = i;
        }
    }

    // Return the closest number found
    return { value: closestNumber, index };
}