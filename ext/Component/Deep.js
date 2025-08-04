import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon } from "/app.js";
import Component from "/framework/ext/Component/Component.js";
import File from "/framework/ext/File/File.js";
import Dir from "/framework/ext/Dir/Dir.js";


Component.socket = File.socket = Dir.socket = app.socket;

export default class Deep extends Component {
    load_file(){
        // new() passes parent, not path
        if (!this.path && this.parent){
            this.path = this.parent.path + this.parent.id + "/";
        }

        this.dir = new Dir({
            name: this.id,
            path: this.path 
        });

        this.file = this.dir.file(this.constructor.name.toLowerCase() + ".json", { 
            data: { // default data for new notes
                order: [] 
            }
        });

        // await this.file.ready;
        // this.get("order");
        // for each order, new Note({ id: order[i], parent: this });
    }

    async initialize(){
        console.log(this.constructor.name.toLowerCase() + ".iniitalize");
        // if (!this.get("order")){
        //     this.set("order", []); 
        // } // we can now add optional default data to the file

        this.children = [];

        for (const o of this.get("order")){
            this.children.push(new this.constructor({
                id: o,
                parent: this
            }));
        }

        await Promise.all(this.children.map(child => child.ready));
    }

    async new(){
        const nextid = this.get("nextid") || 1;
        const child = new this.constructor({
            id: nextid,
            parent: this
        }); // does this attempt to load it?
        this.children.push(child);
        this.get("order").push(nextid); // no need to set, as long as something else is saving
        
        await child.ready;
        // debugger;
        // eww...
        this.set("nextid", nextid + 1);
        /*  This is causing a rendering problem:
                1. set -> update -> render -> render children
                2. the new Note hasn't loaded properly, and there is no data to render */
    }

    add(child){
        this.children.push(child);
        this.update();  
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

    render(){
        this.view = div.c("note", view => {
            h2(this.id);
            view.content = div.c("content").attr("contenteditable", true).on("input", e => {
                this.set("content", e.target.innerHTML);
            });
            h3("Notes");
            el("button", "New").on("click", () => {
                this.new();
            });            
            el("button", "Nuke").on("click", () => {
                this.nuke();
            });
            view.notes = div.c("notes");
        });

        this.update();
    }

    update(){

        // debugger;
            // !! This set method (html vs text) is important
            // if you try to set innerHTML into text, it duplicates a bunch of characters
        this.view.content.html(this.get("content"));
        this.view.notes.empty();
        this.view.notes.append(() => {
            for (const child of this.children){
                child.render();
            }
        });
    }
}