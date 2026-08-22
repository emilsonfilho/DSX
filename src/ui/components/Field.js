import { el } from "../dom.js";

let fieldCounter = 0;

/** Par rótulo + input, na mesma proporção do mockup. */
export function Field(labelText, { placeholder = "", type = "text", inputMode } = {}) {
    const id = `field-${++fieldCounter}`;

    const input = el("input", { class: "field__input", id, type, placeholder, inputmode: inputMode });
    const root = el(
        "div",
        { class: "field" },
        el("label", { class: "field__label", for: id }, labelText),
        input
    );

    return {
        root,
        input,
        get value() {
            return input.value.trim();
        },
        set value(next) {
            input.value = next;
        },
        clear() {
            input.value = "";
        },
    };
}