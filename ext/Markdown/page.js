import app, { section, h1, p } from "/app.js";
import Markdown from "./Markdown.js";

app.$root.ac("page markdown-demo");

section.c("hero", () => {
    h1("Markdown Component Demo");
    p("This page demonstrates the reusable `Markdown` component.");
});

section.c("demo-content", () => {
    new Markdown({ file: "example.md" });
});
