import app, { App, el, div, View, h1, h2, h3, p, is, Base, icon, test } from "/app.js";

// app.$body.style("background", "#eee").style("font-family", "'Courier New', Courier");

// app.sidenav();

app.$root.ac("pad");

h1("Framework");

el("style", `
    #root > .directory { flex-direction: row; max-width: 100%; flex-wrap: wrap; background: transparent; }
    #root > .directory .file, #root > .directory .dir { background: white; flex: 0 1 auto; margin-right: 1em; margin-bottom: 1em;  }  
`);

const $directory = div.c("directory");

await app.directory.ready;

$directory.append(() => {
    const dir = app.directory.files.find(fd => fd.name === "framework");
    const $dir = app.directory.render_files(dir.children);
});

// el("main", main => {
    
//     app.$main = main; // otherwise it's not available in the loaded script

//     main.attr("id", "main");

//     if (window.location.hash){
        
//         app.directory.load();
        
//     } else {
        
//         // default content here
//         main.ac("flex pad flex-h-center");

//         div.c("card", () =>{

//             h1("/framework/").click(() => {
//                 window.location.href = "/framework/";
//             }).style("cursor", "pointer");
            
//             app.directory.render();
//         });
    
//     }

// });

/*

This is showing up in the nav, because it has an index.html file, and doesn't get detected as a "default page".
*/