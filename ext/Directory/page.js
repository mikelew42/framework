import { app, el, div, h1, test, View, p, Base, code } from "/app.js";
import Directory from "./Directory.js"
import CodeEditor from "../CodeEditor/CodeEditor.js"

app.$root.ac("page");

h1("class Directory");

p.c("intro", "This is the directory, clearly.");

code.eval(`const directory = new Directory();

directory.render();`, code => eval(code));