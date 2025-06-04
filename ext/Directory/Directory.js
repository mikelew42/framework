import Base from '../../core/Base/Base.js';
import { div, View, icon } from "../../core/View/View.js";

View.stylesheet("/framework/ext/Directory/Directory.css");

export default class Directory extends Base {
	instantiate(...args){
		this.assign(...args);
		this.initialize();
	}
    
    initialize(){
        this.views = [];

        this.ready = new Promise((res, rej) => {
			this.resolve = res;
		});


        fetch(this.url || "/directory.json").then(res => res.json()).then(this.fetched.bind(this));

        window.addEventListener('hashchange', function() {
            // Reload the page on back/forward
            window.location.reload();
		});
    }

    fetched(data){
        this.files = data.files.filter(this.filter.bind(this)).sort(this.compare);
        console.log("directory loaded", this.files);

        // // only match after data is loaded
        // if (window.location.hash){
        //     // this.match();
        //     this.load();
		// }

        // this.files.forEach(fd => {
        //     if (fd.type === "dir" && fd.children && fd.children.length){
        //         fd.children = fd.children.filter(this.filter).sort(this.compare);
        //     }
        // });
        this.update();

        this.resolve(this);
    }

    container(){
        const container = div.c("directory-container");

        if (window.location.hash) {
            // await this.ready; // make sure data is loaded  ??? wtf, we don't actually match anything
            var url = window.location.hash.substring(1); // removes the #

            function pathop(path){
                const parts = path.split("/").filter(Boolean);
                const name = parts[parts.length - 1];
                return path + name + ".page.js"; // "/one/two/two.page.js"
            }

            const css_class = "page-" + url.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "-");
            
            if (url.endsWith("/")) {
                url = pathop(url);
            } else {
                url += ".page.js";
            }

            
            if (window.location.pathname.length > 1){
                url = "/framework" + url;
            }

            console.group(url);
            
            // let the calling code finish rendering
            setTimeout(() => {
                this.app.$body.ac(css_class);
                View.set_captor(container);
                import(url).then(() => {
                    console.groupEnd();
                    View.restore_captor();
                });
            }, 0);
        }

        return container;
    }

    filter(fd){
        if (fd.skip)
            return false;

        if (this.ignore && this.ignore.includes(fd.name)) {
            return false;
        }

        if (window.location.pathname.length > 1){
            const parts = fd.full.split("/").filter(Boolean);
            parts.shift(); // remove "framework" path part
            fd.full = parts.join("/")
        }

        if (fd.type === "dir" && fd.children && fd.children.length){

            // 1) search for index.html or index.js before filtering children
            if (fd.children.find(child => child.name === "index.html")){
                fd.real = true;
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
            fd.children = fd.children.filter(this.filter.bind(this)).sort(this.compare);

            // 3) now we can return true
            if (fd.real || fd.default || fd.children.length){
                return true;
            }
        }

        if (fd.name.includes(".page.js")){
            fd.short = fd.name.replace(".page.js", "");
            fd.page = true;
            return true;
        }

        return false;

        // if (fd.type === "dir" && fd.)

        // for (const str of ["index.html", "index.js", ".css"]){
        //     if (fd.name.includes(str)) return false;
        // }
        // return ![".git"].contains(fd.name) !== ".git";
    }

    compare(a, b){
        if (a.type === "dir" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "dir") return 1;
        return a.name.localeCompare(b.name);
    }

    
    // not used
    match(){
		var full = window.location.hash.substring(2); // removes the # and /
        
        if (!full.endsWith("/")) {
            full += ".page.js";
        }
		var match;
		for (const fd of this.files){
			match = this.search_fd(fd, full);
			if (match) break;
		}

		if (!match){
			console.log("no match");
		} else {
            import("/" + full);
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
        this.views.push(div.c("directory"));

        if (this.files) // directory.json loads quickly sometimes
            this.update();
    }

    render_file(fd){
        div.c("file", fd.short).click(() => {
            window.location.hash = "/" + fd.full.replace(".page.js", "");
            window.location.reload();
        })
    }

    render_dir(fd){
        const dir = div.c("dir", dir =>{
            dir.bar = div.c("bar", {
                name: div(fd.name).click(() => {
                    if (fd.real){
                        window.location.assign("/" + fd.full + "/");
                    } else if (fd.default){
                        window.location.hash = "/" + fd.full + "/";
                        window.location.reload();
                    }
                })
            })

            if (fd.children.length){
                dir.ac("has-icon");
                dir.bar.prepend(icon("arrow_right").click(() => {
                    dir.children.toggle();
                }));
                dir.children = div.c("children", () => {
                    this.render_files(fd.children || []);
                }).hide();
            }
        });

        if (fd.real){
            dir.ac("real");
        } else if (fd.default){
            dir.ac("default");
        } else if (fd.page){
            dir.ac("page");
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
        for (const view of this.views){
            view.empty();
            view.append(() => {
                this.render_files(this.files);
            });
        }
    }
}