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

        // window.addEventListener('hashchange', function() {
        //     // Reload the page on back/forward
        //     window.location.reload();
		// });
    }

    fetched(data){
        this.files = data.files.filter(this.filter).sort(this.compare);

        // console.log(this.files);
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

    
    match(){
        let parts = window.location.pathname.split("/").filter(Boolean);

        if (this.app.base.length > 1){
            parts = parts.slice(1);
        }

        if (window.location.pathname === "/"){

        } else if (window.location.pathname.endsWith("/")){
            // look for /page.js or /index.html
            this.match_a(parts, this.files);

        } else {
            // look for /<name>.page.js
            this.match_b(parts, this.files);
            
        }
    }

    match_a(parts, files){
        if (parts.length){
            for (const fd of files){
                if (parts[0] === fd.name){
                    fd.active = true;
                    // console.log("matched_a", parts[0], fd);

                    if (parts[1] && fd.children && fd.children.length){
                        this.match_a(parts.slice(1), fd.children)
                    } else {
                        // console.log("matched_a_node", parts[0], fd)
                        fd.active_node = true;
                    }
                }
            }
        }
    }

    match_b(parts, files){
        if (parts.length > 1){
            for (const fd of files){
                
                if (parts[0] === fd.name){
                    fd.active = true;
                    console.log("matched_b", parts[0], fd);

                    if (fd.children && fd.children.length){
                        this.match_b(parts.slice(1), fd.children);
                    } else {
                        console.warn("huh?");
                    }
                }
            }
        } else if (parts.length === 1) {
            for (const fd of files){
                if ( (parts[0] + ".page.js") === fd.name ){
                    fd.active_node = true;
                    console.log("matched_b_node", parts[0], fd);
                }
            }
        } else {
            console.warn("huh???");
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
	 * 
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

    render(){
        const $dir = div.c("directory");
        this.views.push($dir);

        if (this.files) // directory.json loads quickly sometimes
            this.update();

        return $dir;
    }

    render_file(fd){
        el.c("a", "file" + (fd.active_node ? " active active-node" : ""), fd.label).attr("href", this.app.base + fd.full.replace(".page.js", ""))
        // .click(() => {
        //     window.location.assign("/" + fd.full.replace(".page.js", ""));
        // })
    }

    render_dir(fd){
        const dir = div.c("dir" + (fd.active ? " active" : "") + (fd.active_node ? " active-node" : ""), dir => {
            dir.bar = div.c("bar", {
                name: el("a", fd.name).attr("href", this.app.base + fd.full + "/")
            })

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

            if (fd.active)
                dir.ac("expand");
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

    update(){
        this.match();
        for (const view of this.views){
            view.empty();
            view.append(() => {
                this.render_files(this.files);
            });
        }
    }
}