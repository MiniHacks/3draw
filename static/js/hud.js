const hideHudItemById = (itemId) => {
    const el = document.getElementById(itemId);
    hideHudItemByEl(el);
};

const hideHudItemByEl = (el) => {
    el.setAttribute("material", "opacity", "0.0");
    el.setAttribute("text", "value", "");
};

const showHudItemById = (itemId, text, opacity = 0.5) => {
    const el = document.getElementById(itemId);
    showHudItemByEl(el, text, opacity);
};

const showHudItemByEl = (el, text, opacity = 0.5) => {
    el.setAttribute("material", "opacity", `${opacity}`);
    el.setAttribute("text", "value", text);
};
