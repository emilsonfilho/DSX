/**
 * Helpers mínimos de criação de DOM
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function appendChildren(parent, children) {
    for (const child of children.flat(Infinity)) {
        if (child === null || child === undefined || child === false) continue;

        parent.appendChild(
            child instanceof Node ? child : document.createTextNode(String(child))
        );
    }
}

function applyProps(node, props) {
    for (const [key, value] of Object.entries(props)) {
        if (value === null || value === undefined || value === false) continue;

        if (key === "class") node.setAttribute("class", value);
        else if (key === "dataset") Object.assign(node.dataset, value);
        else if (key.startsWith("on") && typeof value === "function")
            node.addEventListener(key.slice(2).toLowerCase(), value);
        else node.setAttribute(key, value);
    }
}

export function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    applyProps(node, props);
    appendChildren(node, children);

    return node;
}

export function svgEl(tag, props = {}, ...children) {
    const node = document.createElementNS(SVG_NS, tag);
    applyProps(node, props);
    appendChildren(node, children);

    return node;
}

/** Formata valores do core para exibição (o neutro do MÍN/MÁX é infinito). */
export function formatValue(value) {
    if (value === Infinity) return "∞";
    if (value === -Infinity) return "-∞";
    if (typeof value === "number" && !Number.isInteger(value)) return value.toFixed(2);

    return String(value);
}