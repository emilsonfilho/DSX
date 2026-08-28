import { el } from "../dom.js";
import { Strategies, DEFAULT_STRATEGY_KEY } from "../../segment-tree/Operations.js";

export function OperationSelector({ onChange } = {}) {
    let selected = DEFAULT_STRATEGY_KEY;

    const buttons = new Map();

    const group = el(
        "div",
        { class: "segmented", role: "group", "aria-label": "Tipo de árvore de segmentos" },
        Object.values(Strategies).map((option) => {
            const button = el(
                "button",
                {
                    class: "segmented__option",
                    type: "button",
                    "aria-pressed": String(option.key === selected),
                    onclick: () => api.select(option.key),
                },
                option.label
            );

            buttons.set(option.key, button);
            return button;
        })
    );

    const root = el(
        "div",
        { class: "panel__block" },
        el("span", { class: "panel__label panel__label--accent" }, "Selecione o tipo de árvore de segmentos:"),
        group
    );

    const api = {
        root,
        get value() {
            return selected;
        },
        select(key) {
            if (!Strategies[key] || key === selected) return;

            selected = key;
            for (const [optionKey, button] of buttons)
                button.setAttribute("aria-pressed", String(optionKey === selected));

            onChange?.(selected);
        },
    };

    api.select(selected);

    return api;
}