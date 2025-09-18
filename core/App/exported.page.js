import { el, div, p, View } from "../View/View.js";

export default {
    render(){
        div.c("page", () => {
            console.log("rendering");
            p("This is an exported page?");
            // debugger; // this shouldn't appear yet
        });
    }
}