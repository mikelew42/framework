import { el } from "./View/View.js";

export * from "./Base/Base.js";
export * from "./Events/Events.js";
export * from "./View/View.js";
export * from "./Test/Test.js";
// app?

// el("style", `
//     * { box-sizing: border-box; margin-top: 0; }
//     /* *:last-child { margin-bottom: 0; } */

//     html { height: 100%; }
//     body { min-height: 100%; background: #ddd; margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.5; }

//     p { margin-bottom: 1em; }

//     h1, h2, h3 { font-weight: 700; }

//     h1 { font-size: 2em; margin-bottom: 0.5em; line-height: 1.4; }
//     h2 { font-size: 1.5em; margin-bottom: 0.666em; }
//     h3 { font-size: 1.25em; margin-bottom: 0.8em; }
// `).append_to(document.head);