import Events from "../../core/Events/Events.js";
import View from "../../core/View/View.js";
import App from "../../core/App/App.js";

App.stylesheet(import.meta, "styles.css");

/**
 * Draggable3
 *
 * A modular, plugin-based draggable core.
 *
 * new Draggable({
 *     view,            // required: View instance or element wrapper
 *     handle,          // optional: drag handle (defaults to view)
 *     container,       // optional: container for sortable behavior
 *     enabled,         // optional: enable/disable dragging (default true)
 *     threshold,       // optional: pixels before drag starts (default 0)
 *     cursor,          // optional: cursor during drag (default 'grab')
 *     start, move, stop, drop, drop_check // optional callbacks
 * });
 *
 * Plugins:
 *   instance.addPlugin(plugin)
 *   - plugin can be:
 *       function(draggable) => pluginInstance
 *       or object with { init?, destroy?, start?, move?, stop?, drop?, drop_check?, pointerdown?, pointerup?, cleanup? }
 */

export default class Draggable extends Events {

    instantiate(...args){
        // Base config defaults
        this.config = Object.assign({
            enabled: true,
            threshold: 0,
            cursor: "grab"
        }, this.config || {});

        this.plugins = [];

        this.assign(...args);
        this.instantiate_draggable();
        this.initialize();
    }

    initialize(){}

    instantiate_draggable(){
        if (!this.view)
            console.error("Draggable3: `view` is required.");

        if (!this.handle)
            this.handle = this.view;

        if (!this.container && this.view && this.view.children){
            this.container = this.view.children;
        }

        this.pointerdown = this.pointerdown.bind(this);
        this.pointerup = this.pointerup.bind(this);
        this.pointermove = this.pointermove.bind(this);

        this.handle.on("pointerdown", this.pointerdown);
        this.handle.ac("drag3-handle");

        // Optional pre-configured plugins via this.use = [plugin, ...]
        if (Array.isArray(this.use)){
            this.use.forEach(plugin => this.addPlugin(plugin));
        }

        // Register base instance for lookup features
        if (this.view && this.view.el){
            Draggable.register(this.view.el, this);
        }
    }

    /**
     * Plugin management
     */
    addPlugin(plugin){
        if (!plugin) return;

        const instance = (typeof plugin === "function")
            ? plugin(this)
            : plugin;

        if (!instance) return;

        this.plugins.push(instance);
        instance.init && instance.init(this);
        return instance;
    }

    callPlugins(hook, ...args){
        for (const plugin of this.plugins){
            const fn = plugin && plugin[hook];
            if (typeof fn === "function"){
                fn.apply(plugin, args);
            }
        }
    }

    pointerdown(e){
        if (!this.config.enabled)
            return;

        // respect threshold by recording start position
        this._downX = e.clientX;
        this._downY = e.clientY;
        this._did_cross_threshold = this.config.threshold === 0;

        document.addEventListener("pointermove", this.pointermove);
        document.addEventListener("pointerup", this.pointerup);

        this.view?.ac("drag3-pending");
        this.handle?.ac("drag3-handle-active");

        this.callPlugins("pointerdown", e, this);

        if (this.start)
            this.start(e);
        this.callPlugins("start", e, this);
    }

    pointermove(e){
        if (!this._did_cross_threshold){
            const dx = e.clientX - this._downX;
            const dy = e.clientY - this._downY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.config.threshold){
                return;
            }
            this._did_cross_threshold = true;
            this.view?.rc("drag3-pending")
                .ac("drag3-dragging")
                .style("pointer-events", "none");
            View.body().ac("drag3-in-progress");
            this.dragging = true;
        }

        if (!this.dragging)
            return;

        if (this.move)
            this.move(e);
        this.callPlugins("move", e, this);
    }

    cleanup(){
        document.removeEventListener("pointermove", this.pointermove);
        document.removeEventListener("pointerup", this.pointerup);

        this.callPlugins("cleanup", this);

        this.view?.rc("drag3-dragging drag3-pending").style("pointer-events", "");
        this.handle?.rc("drag3-handle-active");
        this.dragging = false;
        this.previewing = false;

        this.last_raw_target?.classList.remove("drag3-raw-target");
        this.last_target?.view?.rc("drag3-target");
        this.last_index?.classList?.remove("drag3-index");
        this.index?.classList?.remove("drag3-index");

        View.body().rc("drag3-in-progress");
    }

    pointerup(e){
        this.callPlugins("pointerup", e, this);

        this.cleanup();

        let drop_ok = false;

        // Instance drop_check
        if (this.drop_check){
            drop_ok = !!this.drop_check(e);
        }

        // Plugin drop_check ORs into result
        for (const plugin of this.plugins){
            if (typeof plugin.drop_check === "function"){
                if (plugin.drop_check(e, this)){
                    drop_ok = true;
                }
            }
        }

        if (drop_ok){
            if (this.drop)
                this.drop(e);
            this.callPlugins("drop", e, this);
        }

        if (this.stop)
            this.stop(e);
        this.callPlugins("stop", e, this);
    }

    // Instance implementations can override these
    drop_check(e){
        return false;
    }

    drop(e){}

    destroy(){
        this.handle?.off("pointerdown", this.pointerdown);
        this.callPlugins("destroy", this);

        if (this.view && this.view.el){
            Draggable.unregister(this.view.el);
        }
    }

    /**
     * Static lookup helpers (similar to Draggable2)
     */
    static lookup(el){
        while (el) {
            const draggable = Draggable.registry.get(el);
            if (draggable) {
                return draggable;
            }
            el = el.parentElement;
        }
        return undefined;
    }

    static lookdown(el){
        const draggable = Draggable.registry.get(el);

        if (draggable) {
            return draggable;
        }

        for (let i = 0; i < el.children.length; i++){
            const result = Draggable.lookdown(el.children[i]);
            if (result) return result;
        }

        return undefined;
    }

    static register(el, draggable){
        Draggable.registry.set(el, draggable);
    }

    static unregister(el){
        Draggable.registry.delete(el);
    }
}

Draggable.registry = new WeakMap();

