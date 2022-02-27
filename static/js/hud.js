
const hideHudItemById = (itemId) => {
    const el = document.getElementById(itemId);
    el.setAttribute("material", "opacity", "0.0");
    el.setAttribute("text", "value", "");
}

const showHudItemById = (itemId, text, opacity=0.5) => {
    const el = document.getElementById(itemId);
    el.setAttribute("material", "opacity", `${opacity}`);
    el.setAttribute("text", "value", text);
}
