import View, { el, div, style } from "../../core/View/View.js";

export default function icon(name){
    return el.c("span", "material-icons icon", name);
}

style(`

.icon-box {
    width:200px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.5);
}

.icon-name {
    font-size: 12px;
}

`);

icon.select = async function(name){
    const response = await fetch("/framework/ui/icon/icons.txt");
    const text = await response.text();
    const icons = text.split("\n").map(line => line.split(" ")[0]);
    const dropdown = div.c("icons flex wrap gap", () => {
        icons.forEach(icn => {
            div.c("icon-box flex", icon(icn), div.c("icon-name", icn));
        });
    });
    return dropdown;
}