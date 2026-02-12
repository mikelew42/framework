import app, { el, div, View, h1, h2, h3, p, is, test, Test } from "../../../app.js";
import icon from "./icon.js";

app.$root.ac("icon-page");

const select = await icon.select();
select.on("change", e => {
    console.log(e.target.value);
});
app.$root.append(select);