import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon } from "/app.js";
import Component from "/framework/ext/Component/Component.js";
import File from "/framework/ext/File/File.js";
import Dir from "/framework/ext/Dir/Dir.js";


Component.socket = File.socket = Dir.socket = app.socket;

export default class Note extends Component {
    load_file(){
        // new() passes parent, not path
        if (!this.path && this.parent){
            this.path = (this.parent.path ? this.parent.path + "/" : "") + this.parent.id + "/";
        } else if (!this.path && window.location.pathname){
            this.path = window.location.pathname;
        }

        this.dir = new Dir({
            name: this.id,
            path: this.path 
        });

        this.file = this.dir.file("note.json", { 
            data: { // default data for new notes
                order: [] 
            }
        });

        // await this.file.ready;
        // this.get("order");
        // for each order, new Note({ id: order[i], parent: this });
    }

    async initialize(){
        console.group("note.initalize", this.id);
        // if (!this.get("order")){
        //     this.set("order", []); 
        // } // we can now add optional default data to the file

        this.notes = [];

        for (const o of this.get("order")){
            this.notes.push(new Note({
                id: o,
                parent: this
            }));
        }
        
        console.groupEnd();

        await Promise.all(this.notes.map(note => note.ready));

        console.log("note.ready", this.id);
    }

    async new(){
        const nextid = this.get("nextid") || 1;
        const note = new Note({
            id: nextid,
            parent: this
        }); // does this attempt to load it?
        this.notes.push(note);
        this.get("order").push(nextid); // no need to set, as long as something else is saving
        
        await note.ready;
        // debugger;
        // eww...
        this.set("nextid", nextid + 1);
        /*  This is causing a rendering problem:
                1. set -> update -> render -> render children
                2. the new Note hasn't loaded properly, and there is no data to render */
    }

    add(note){
        this.notes.push(note);
        this.update();  
    }

    nuke(){
        if (this.parent){
            const order = this.parent.get("order");
            const index = order.indexOf(this.id);
            if (index !== -1) order.splice(index, 1);
            this.parent.set("order", order);

            this.parent.notes = this.parent.notes.filter(n => n.id !== this.id);
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
            for (const note of this.notes){
                note.render();
            }
        });
    }
}