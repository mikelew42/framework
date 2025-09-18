import App from "./core/App/App.js";
import { el, View } from "./core/View/View.js";
export * from "./core/Base/Base.js";
export * from "./core/Events/Events.js";
export * from "./core/View/View.js";
export * from "./core/Test/Test.js";
export * from "./core/App/App.js";


// move this to /framework/core/core.css
el("style", `
    * { box-sizing: border-box; margin-top: 0; }
    /* *:last-child { margin-bottom: 0; } */

    html { height: 100%; }
    body { min-height: 100%; background: #ddd; margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.5; }

    p { margin-bottom: 1em; }

    h1, h2, h3 { font-weight: 700; }

    h1 { font-size: 2em; margin-bottom: 0.5em; line-height: 1.4; }
    h2 { font-size: 1.5em; margin-bottom: 0.666em; }
    h3 { font-size: 1.25em; margin-bottom: 0.8em; }
`).append_to(document.head);

export default new App({
    main(){
        View.set_captor(el.c("main", "app"));
    }
});