import { App, div, el, View, icon, code } from "../../core/App/App.js";

App.stylesheet(import.meta, "CodeEditor.css");

export default class CodeEditor {
    constructor(...args){
        Object.assign(this, ...args);
        this.update = this.update.bind(this);
        this.render();
    }

    render(){
        this.view = div.c("code-editor", view => {
            view.layout = div.c("layout", () => {
                this.wrapper = div.c("wrapper flex", () => {
                    this.textarea = el.c("textarea", "editor-textarea", this.code)
                        .attr("spellcheck", "false").on("input", this.update);
                    
                    this.$error = div.c("error", $error => {
                        $error.icon = icon("report_problem");
                    }).hide();
                });

                this.viewport = div.c("viewport", { content: div() })
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

code.edit = function(code){
    return new CodeEditor({ code });
};

code.eval = function(code, fn){
    return new CodeEditor({ code, fn, external_eval: true })
}