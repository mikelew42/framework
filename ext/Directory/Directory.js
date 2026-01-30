import { App, div, View, el, icon } from "../../core/App/App.js";

App.stylesheet(import.meta, "Directory.css");

export default class Directory {
	constructor(...args){
		Object.assign(this, ...args);
		this.initialize();
	}
    
    initialize(){
        this.views = [];

        this.ready = new Promise((res, rej) => {
			this.resolve = res;
		});

        this.filter = this.filter.bind(this);
        this.fetched = this.fetched.bind(this);

        if (!this.url){
            if (this.app.base){
                this.url = this.app.base + "directory.json";
            } else {
                this.url = "/directory.json";
            }
        }

        fetch(this.url).then(res => res.json()).then(this.fetched);
    }

    fetched(data){
        this.files = data.files.filter(this.filter).sort(this.compare);
        this.update();
        this.resolve(this);
    }

    filter(fd){
        if (fd.skip)
            return false;

        if (this.ignore && this.ignore.includes(fd.name)) {
            return false;
        }

        if (fd.type === "dir" && fd.children && fd.children.length){

            fd.children.forEach(child => child.parent = fd);

            // 1) search for index.html or index.js before filtering children
            if (fd.children.find(child => child.name === "index.html")){
                fd.real = true;
            } else if (fd.children.find(child => child.name === "page.js")){
                fd.newway = true;
            } else if (  fd.children.find( child => { 
                    if (child.name === `${fd.name}.page.js`){
                        child.skip = true;
                        return true;
                    } else {
                        return false;
                    } } )  
                ){
                    fd.default = true;
            }

            // 2) filter children
            fd.children = fd.children.filter(this.filter).sort(this.compare);

            // 3) now we can return true
            if (fd.real || fd.default || fd.children.length || fd.newway){
                return true;
            }
        }

        if (fd.name.includes(".page.js")){
            fd.label = fd.name.replace(".page.js", "");
            fd.page = true;
            return true;
        }

        return false;
    }

    compare(a, b){
        if (a.type === "dir" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "dir") return 1;
        return a.name.localeCompare(b.name);
    }

    /**
     * Convert "page-name" or "page_name" to "Page Name"
     */
    to_title(str) {
        return str.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Get a subtree of files starting from root_path
     * @param {string} root_path - Path like "/styles/" or "/topic/sub/"
     * @returns {Array} - Array of file/dir objects
     */
    get_subtree(root_path) {
        if (!root_path || root_path === "/") return this.files;
        
        const parts = root_path.split("/").filter(Boolean);
        
        // Handle app.base prefix
        if (this.app.base.length > 1) {
            const base_parts = this.app.base.split("/").filter(Boolean);
            // Remove base prefix from parts if present
            if (parts[0] === base_parts[0]) {
                parts.shift();
            }
        }
        
        let current = this.files;
        
        for (const part of parts) {
            const found = current.find(f => f.name === part && f.type === "dir");
            if (found && found.children) {
                current = found.children;
            } else {
                return []; // Path not found
            }
        }
        return current;
    }

    /**
     * Mark active states on files based on current_path
     * Sets: active, active_ancestor, active_page
     */
    mark_active(files, current_path) {
        // Clear all active states first
        this.clear_active(files);
        
        let parts = current_path.split("/").filter(Boolean);
        
        // Handle app.base prefix
        if (this.app.base.length > 1) {
            parts = parts.slice(1);
        }
        
        const is_dir_path = current_path.endsWith("/");
        this._mark_recursive(files, parts, 0, is_dir_path);
    }

    clear_active(files) {
        for (const fd of files) {
            fd.active = false;
            fd.active_ancestor = false;
            fd.active_page = false;
            if (fd.children?.length) {
                this.clear_active(fd.children);
            }
        }
    }

    _mark_recursive(files, parts, depth, is_dir_path) {
        if (depth >= parts.length) return;
        
        for (const fd of files) {
            if (fd.type === "dir" && parts[depth] === fd.name) {
                // Check if this is the final destination (dir path like /topic/)
                if (depth === parts.length - 1 && is_dir_path) {
                    fd.active_page = true;
                    fd.active = true;
                } else if (fd.children?.length) {
                    // This is an ancestor
                    fd.active_ancestor = true;
                    fd.active = true;
                    this._mark_recursive(fd.children, parts, depth + 1, is_dir_path);
                }
            } else if (fd.type === "file" && fd.page) {
                // Check for .page.js files (path like /topic/sub-page)
                const page_name = fd.name.replace(".page.js", "");
                if (depth === parts.length - 1 && parts[depth] === page_name && !is_dir_path) {
                    fd.active_page = true;
                    fd.active = true;
                }
            }
        }
    }

    /**
	 * fd is file data object {
	 * 		name: "file.ext" || "dirname",
	 * 		type: "file" || "dir",
	 * 		path: "path/to",
	 * 		full: "path/to/file.ext" || "path/to/dirname",
	 * 		children: [] // if dir
	 * }
	 */
	search_fd(fd, full){
		var found;
		if (fd.full === full){
			return fd;
		} else if (fd.children?.length){
			for (const child of fd.children){
				if (found = this.search_fd(child, full)){
					return found;
				}
			}
		}
		return false;
	}

    /**
     * Render directory navigation
     * @param {string} root_path - Optional path to filter subtree (e.g., "/styles/")
     * @param {string} current_path - Optional path to determine active states (defaults to window.location.pathname)
     * @returns {View} - The directory view element
     */
    render(root_path = null, current_path = window.location.pathname) {
        const $dir = div.c("directory");
        
        // Store view with its render options
        const view_config = { 
            el: $dir, 
            root_path, 
            current_path 
        };
        this.views.push(view_config);

        if (this.files) {
            this.update_view(view_config);
        }

        return $dir;
    }

    render_file(fd){
        const classes = ["file"];
        if (fd.active) classes.push("active");
        if (fd.active_page) classes.push("active-page");
        
        const label = this.to_title(fd.label || fd.name.replace(".page.js", ""));
        
        el.c("a", classes.join(" "), label)
            .attr("href", this.app.base + fd.full.replace(".page.js", ""));
    }

    render_dir(fd){
        const classes = ["dir"];
        if (fd.active) classes.push("active");
        if (fd.active_ancestor) classes.push("active-ancestor");
        if (fd.active_page) classes.push("active-page");
        
        const dir = div.c(classes.join(" "), dir => {
            const label = this.to_title(fd.name);
            dir.bar = div.c("bar", {
                name: el("a", label).attr("href", this.app.base + fd.full + "/")
            });

            this.render_dir_children(dir, fd);
        });

        if (fd.real){
            dir.ac("real");
        } else if (fd.default){
            dir.ac("default");
        } else if (fd.page){
            dir.ac("page");
        }

        return dir;
    }

    render_dir_children(dir, fd){
        if (fd.children.length){
            dir.ac("has-icon");
            dir.bar.prepend(
                div.c("icon-wrap", dir.icon = icon("arrow_right")).click(() => {
                    dir.tc("expand");
                })
            );
            dir.children = div.c("children", () => {
                this.render_files(fd.children || []);
            });

            // Auto-expand if active or ancestor
            if (fd.active || fd.active_ancestor) {
                dir.ac("expand");
            }
        }
    }

    render_files(files){
        for (const fd of files){
            if (fd.type === "file") {
                this.render_file(fd);
            } else if (fd.type === "dir") {
                this.render_dir(fd);
            }
        }
    }

    /**
     * Update a single view with its specific root_path and current_path
     */
    update_view(view_config) {
        const { el, root_path, current_path } = view_config;
        
        // Get the appropriate subtree
        const files = this.get_subtree(root_path);
        
        // Mark active states
        this.mark_active(files, current_path);
        
        el.empty();
        el.append(() => {
            this.render_files(files);
        });
    }

    /**
     * Update all registered views
     */
    update(){
        for (const view of this.views){
            // Handle both old-style (direct element) and new-style (config object) views
            if (view.el) {
                this.update_view(view);
            } else {
                // Legacy support: view is the element itself
                this.mark_active(this.files, window.location.pathname);
                view.empty();
                view.append(() => {
                    this.render_files(this.files);
                });
            }
        }
    }
}