import { el, div, Base, icon } from "/framework/core/App/App.js";
import List from "/framework/ext/List/List.js";
import Socket from "../Socket/Socket.js";
import is from "../../lib/is.js";
import File from "../File/File.js";

const socket = Socket.singleton();

export default class Directory2 extends Base {
    initialize(){
        this.ready = new Promise((res, rej) => {
			this.resolve = res;
		});


        fetch(this.url || "/directory.json")
            .then(res => res.json())
            .then(this.fetched.bind(this));
    }

    fetched(data){
        this.files = data.files.filter(this.filter.bind(this)).sort(this.compare);

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

            // 1) search for index.html or index.js before filtering children
            if (fd.children.find(child => child.name === "index.html")){
                fd.real = true;
            } else if (fd.children.find(child => child.name === "page.js")){
                fd.page = true;
            }

            // 2) filter children
            fd.children = fd.children.filter(this.filter.bind(this)).sort(this.compare);

            // 3) now we can return true
            if (fd.real || fd.page || fd.children.length){
                return true;
            }
        }

        if (fd.name.includes(".page.js")){
            fd.label = fd.name.replace(".page.js", "");
            fd.subpage = true;
            return true;
        }

        return false;
    }

    compare(a, b){
        if (a.type === "dir" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "dir") return 1;
        return a.name.localeCompare(b.name);
    }

    render(){
        this.view = div.c("directory directory2");

        if (this.files)
            this.update();

        return this.view;
    }

    update(){
        if (this.view){
            this.view.empty();
            this.view.append(() => this.render_files(this.files));
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

    render_file(fd){
        // console.log(fd);
        div.c("file", fd.label).click(() => {
            window.location.assign("/" + fd.full.replace(".page.js", ""));
        })
    }

    render_dir(fd){
        // console.log(fd);
        const dir = div.c("dir", dir => {
            dir.bar = div.c("bar", {
                name: div(fd.name).click(() => {
                    window.location.assign("/" + fd.full + "/");
                })
            })

            this.render_dir_children(dir, fd);
        });

        if (fd.real){
            dir.ac("real");
        } else if (fd.page){
            dir.ac("page");
        } else if (fd.subpage){
            dir.ac("subpage");
        }

        return dir;
    }

    render_dir_children(dir, fd){
        if (fd.children.length){
            dir.ac("has-icon");
            dir.bar.prepend(icon("arrow_right").click(() => {
                dir.children.toggle();
            }));
            dir.children = div.c("children", () => {
                this.render_files(fd.children || []);
            }).hide();
        }
    }
}