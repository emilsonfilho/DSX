import { el } from "../dom.js";


export function Accordion(title, content, { onToggle } = {}) {
    const caret = el("span", { class: "accordion__caret", "aria-hidden": "true" }, "▶");

    const trigger = el(
        "button",
        {
            class: "accordion__trigger",
            type: "button",
            "aria-expanded": "false",
            onclick: () => api.toggle(),
        },
        caret,
        el("span", { class: "accordion__title" }, title)
    );

    const body = el("div", { class: "accordion__body", hidden: true }, content);
    const root = el("section", { class: "accordion" }, trigger, body);

    const api = {
        root,
        get isOpen() {
            return !body.hidden;
        },
        open() {
            body.hidden = false;
            root.classList.add("accordion--open");
            trigger.setAttribute("aria-expanded", "true");
            caret.textContent = "▼";
            onToggle?.(api);
        },
        close() {
            body.hidden = true;
            root.classList.remove("accordion--open");
            trigger.setAttribute("aria-expanded", "false");
            caret.textContent = "▶";
        },
        toggle() {
            api.isOpen ? api.close() : api.open();
        },
    };

    return api;
}

/** Somente um acordeão aberto por vez. */
export function accordionGroup(build) {
    const items = [];
    const onToggle = (opened) => items.forEach((item) => item !== opened && item.close());

    const created = build(onToggle);
    items.push(...created);

    return created;
}