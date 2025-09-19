import { App, el, div, View, h1, h2, h3, icon, p, is, Base, test } from "/framework/core/App/App.js";

App.stylesheet(import.meta, "styles.css");

export default class Layout extends Base {
    initialize(){
        this.view = div.c("layout", view => {
            this.toolbar = div.c("toolbar", () => {
                this.$display = el.c("span", "button", "Display: ", el.c("select", "button", () => {
                    el("option", "Block").attr("value", "block");
                    el("option", "Inline").attr("value", "inline");
                    el("option", "Inline-Block").attr("value", "inline-block");
                    el("option", "Flex").attr("value", "flex");
                    el("option", "Grid").attr("value", "grid");
                    el("option", "None").attr("value", "none");
                })).on("change", e => {
                    view.style("display", e.target.value);
                    
                    // if (e.target.value === "flex"){
                    //     console.log("show flex");
                    //     this.flex.show();
                    // } else {
                    //     this.flex.hide();
                    // }
                });
                
                this.$wrap = el("button", "Wrap").click(() => {
                    this.wrap();
                });                
                this.$minw400 = el("button", "min-w-400").click(() => {
                    this.minw400();
                });
                
                this.$flex = el.c("span", "button", "Flex: ", el.c("select", "button", () => {
                    el("option", "None").attr("value", "");
                    el("option", "1 (1 1 0%)").attr("value", "1");
                    el("option", "1 1 auto").attr("value", "1 1 auto");
                    el("option", "1 1 50%").attr("value", "1 1 50%");
                })).on("change", e => {
                    view.style("flex", e.target.value);
                });

                el.c("button", "", "+").click(() => {
                    this.add();
                });
                el.c("button", "", "X").click(() => {
                    view.remove();
                });
            });

            // this.toolbar
            //     // .hide()
            //     .on("mouseenter", () => this.view.ac("hovered"))
            //     .on("mouseleave", () => this.view.rc("hovered"));
            // el.c("span", "button", "Position: ", el.c("select", "button", () => {
            //     el("option", "Static").attr("value", "static");
            //     el("option", "Relative").attr("value", "relative");
            //     el("option", "Absolute").attr("value", "absolute");
            //     el("option", "Fixed").attr("value", "fixed");
            //     el("option", "Sticky").attr("value", "sticky");
            //     el("option", "None").attr("value", "none");
            // })).on("change", e => {
            //     view.style("position", e.target.value);
            // });;

            this.content();
        });

    }

    flex(){
        this.view.ac("flex");
        return this;
    }

    minw400(){
        this.view.tc("min-w-400");
        this.$minw400.tc("prim");
        return this;
    }

    wrap(){
        this.view.tc("flex-wrap");
        this.$wrap.tc("prim");
        return this;
    }

    add(){
        let ret;
        this.view.append(() => {
            ret = new Layout();
        })
        return ret;
    }

    grow(){
        this.view.ac("flex-1");
        return this;
    }

    content(){}
}