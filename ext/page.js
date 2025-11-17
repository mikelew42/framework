import app, { App, el, div, View, h1, h2, h3, p, is, icon, style } from "../../app.js";

app.$root.ac("page");

h1("Framework Ext");

el("style", `
    .root > .directory { flex-direction: row; max-width: 100%; flex-wrap: wrap; background: transparent; }
    .root > .directory .file, .root > .directory .dir { background: white; flex: 0 1 auto; margin-right: 1em; margin-bottom: 1em;  }  
`);

const $directory = div.c("directory");

await app.directory.ready;

$directory.append(() => {
    const fw = app.directory.files.find(fd => fd.name === "framework");
    const core = fw.children.find(fd => fd.name === "ext");
    const $dir = app.directory.render_files(core.children);
});
