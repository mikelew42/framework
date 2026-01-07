import Draggable from "./Draggable.js";

/**
 * Sortable plugin
 *
 * Enables simple vertical list sorting within a container.
 * Inspired by the existing `ext/Draggable2/Sortable.js`, but
 * adapted to the plugin API.
 *
 * Usage:
 *   const drag = new Draggable({ view, container, list });
 *   drag.addPlugin(Sortable());
 *
 * Required on draggable:
 *   - view: View instance representing the item
 *   - container: children wrapper of the list (View or element wrapper)
 *   - list: backing data node that supports remove/append/insert (optional but recommended)
 */

export default function Sortable(options = {}){
    const config = Object.assign({}, options || {});

    return {
        name: "Sortable",

        init(draggable){
            this.draggable = draggable;
            document.addEventListener("contextmenu", this.contextmenu.bind(this));
        },

        contextmenu(e){
            if (this.draggable.dragging){
                e.preventDefault();
                this.draggable.cleanup();
                this.draggable.stop && this.draggable.stop(e);
            }
        },

        start(e){
            const view = this.draggable.view;
            if (!view || !view.el) return;

            this.origin = {
                el: view.el.parentNode,
                index: view.index ? view.index() : Array.prototype.indexOf.call(view.el.parentNode.children, view.el)
            };
        },

        drop_check(e){
            this.lookup(e);
            this.indexing(e);

            // valid if we have a target and an index (or append)
            return !!this.target;
        },

        drop(e){
            if (!this.target) return;

            const src_list = this.draggable.list;
            const dst_list = this.target.list || src_list;

            if (!src_list || !dst_list || src_list === dst_list){
                // DOM-only reordering (no backing list)
                if (this.index === "append"){
                    this.target.container.append(this.draggable.view);
                } else if (this.index){
                    this.target.container.el.insertBefore(this.draggable.view.el, this.index);
                }
                return;
            }

            // Backing data move
            src_list.remove(this.draggable.listItem || this.draggable.list);

            if (typeof this.index_index === "number"){
                dst_list.insert(this.draggable.listItem || this.draggable.list, this.index_index);
            } else {
                dst_list.append(this.draggable.listItem || this.draggable.list);
            }

            delete this.target;
        },

        move(e){
            this.lookup(e);
            this.targeting(e);
        },

        lookup(e){
            if (e.target === this.last_raw_target)
                return;

            this.last_raw_target?.classList.remove("drag3-raw-target");
            e.target.classList.add("drag3-raw-target");
            this.last_raw_target = e.target;

            this.target = Draggable.lookup(e.target);
        },

        targeting(e){
            if (this.target){
                if (this.target !== this.last_target){
                    this.target.view?.ac("drag3-target");
                    this.last_target?.view?.rc("drag3-target");

                    this.indexing(e);
                    this.preview();

                    this.last_target = this.target;
                } else {
                    this.indexing(e);
                    this.preview();
                }
            } else {
                this.last_target?.view?.rc("drag3-target");
                this.last_target = null;
            }
        },

        indexing(e){
            this.index = null;
            delete this.index_index;

            if (!this.target || !this.target.container || !this.target.container.el)
                return false;

            const children = Array.from(this.target.container.el.children)
                .filter(child => child !== this.draggable.view.el);
            const clientY = e.clientY;

            if (!children.length){
                this.index = "append";
                return true;
            }

            for (let i = 0; i < children.length; i++){
                const child = children[i];
                const rect = child.getBoundingClientRect();

                if (clientY < (rect.top + (rect.height / 2))){
                    this.index = child;
                    this.index_index = i;
                    return true;
                }
            }

            this.index = "append";
            return true;
        },

        preview(){
            if (!this.target || !this.target.container) return;

            if (!this.index && this.target !== this.last_target){
                this.last_index?.classList?.remove("drag3-index");
                this.target.container.append(this.draggable.view);

            } else if (this.index && this.index !== this.last_index){
                this.last_index?.classList?.remove("drag3-index");

                if (this.index === "append"){
                    this.target.container.append(this.draggable.view);
                } else {
                    this.index.classList.add("drag3-index");
                    this.target.container.el.insertBefore(this.draggable.view.el, this.index);
                }
            }

            if (this.index !== this.last_index)
                this.last_index = this.index;
        },

        cleanup(){
            this.last_raw_target?.classList.remove("drag3-raw-target");
            this.last_target?.view?.rc("drag3-target");
            this.last_index?.classList?.remove("drag3-index");
        },

        destroy(){
            document.removeEventListener("contextmenu", this.contextmenu);
        }
    };
}

