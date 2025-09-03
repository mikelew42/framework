import { app, el, div, test, View } from "../../app.dev.js";
import Page from "./Page.js";

const page = new Page({ name: "Test Page" });

page.add(new Page({ name: "Sub Page 1" }));
page.add(new Page({ name: "Sub Page 2" }));

console.log(page);
page.render();