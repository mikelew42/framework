import { App, div, el, View, icon, code, h1, h2, h3, p, style, pre } from "../../core/App/App.js";
import Draggable from "../Draggable/Draggable.js";

App.stylesheet(import.meta, "CodeEditor.css");

export default class CodeEditor {

    // code here, is el.code
    static setup(el_code){
        el_code.edit = code => new CodeEditor({ code });
        el_code.eval = (code, fn) => new CodeEditor({ code, fn, external_eval: true });
        el_code.html = html => new CodeEditor({ code: html, html: true });
        return el_code;
    }

    constructor(...args){
        Object.assign(this, ...args);
        this.update = this.update.bind(this);
        this.render();
    }

    render(){
        this.view = div.c("code-editor", view => {
                
            this.viewport = div.c("viewport", { 
                content: div(),
                handle: div()
            });

            new Draggable({
                view: this.viewport.handle,
                viewport: this.viewport,
                initialize(){
                    this.reset = this.reset.bind(this);
                    this.view.on("contextmenu", this.reset);
                },
                start(e){
                    // console.log("dragstart");
                    this.startX = e.clientX;
                    this.startWidth = this.viewport.el.offsetWidth;
                },
                move(e){
                    // console.log("moving");
                    this.viewport.el.style.width = `${this.startWidth + e.clientX - this.startX}px`;
                },
                stop(){
                    // console.log("dragend");
                    this.view.off("contextmenu", this.reset);
                },
                reset(){
                    // console.log("reset");
                    this.viewport.el.style.width = "";
                }
            });

            this.wrapper = div.c("wrapper flex", () => {
                this.textarea = el.c("textarea", "editor-textarea", this.code)
                    .attr("spellcheck", "false").on("input", this.update);
                
                this.$error = div.c("error", $error => {
                    $error.icon = icon("report_problem");
                }).hide();
            });

        });

        this.update();
    }

    update(){
        const content = new View({ capture: false}).ac("content");
        
        try {
            if (this.external_eval){
                content.append(() => {
                    this.fn(this.textarea.el.value);
                });
            } else {
                content.append(() => {
                    eval(this.textarea.el.value);
                });
            }

            this.viewport.content.replace(content);
            this.viewport.content = content;
            this.$error.hide();

        } catch (e) {
            this.$error.attr("title", e.message);
            this.$error.show();
        }
    }
}