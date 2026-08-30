import { el } from "../dom.js";

export const SegmentTreeMode = Object.freeze({
    LAZY: "lazy",
    PERSISTENT: "persistent",
});

const MODES = [
    {
        key: SegmentTreeMode.LAZY,
        label: "Lazy Propagation",
    },
    {
        key: SegmentTreeMode.PERSISTENT,
        label: "Persistente",
    },
];

export function SegmentTreeModeSelector({
    value = SegmentTreeMode.LAZY,
    onChange,
} = {}) {
    let selected = value;

    const buttons = new Map();

    const valueLabel = el(
        "span",
        { class: "mode-selector__value" },
        MODES.find((mode) => mode.key === selected)?.label
        ?? "Lazy Propagation"
    );

    const arrow = el(
        "span",
        {
            class: "mode-selector__arrow",
            "aria-hidden": "true",
        },
        "▾"
    );

    const trigger = el(
        "summary",
        {
            class: "mode-selector__trigger",
            "aria-label": "Selecionar implementação da árvore",
        },

        valueLabel,
        arrow
    );

    const menu = el(
        "div",
        {
            class: "mode-selector__menu",
            role: "menu",
        }
    );

    const root = el(
        "details",
        { class: "mode-selector" },

        trigger,
        menu
    );

    const api = {
        root,

        get value() {
            return selected;
        },

        select(key, { notify = true } = {}) {
            const option = MODES.find(
                (mode) => mode.key === key
            );

            if (!option) {
                return;
            }

            const changed = key !== selected;

            selected = key;

            valueLabel.textContent = option.label;

            for (const [modeKey, button] of buttons) {
                button.setAttribute(
                    "aria-checked",
                    String(modeKey === selected)
                );
            }

            root.open = false;

            if (changed && notify) {
                onChange?.(selected);
            }
        },
    };

    for (const mode of MODES) {
        const button = el(
            "button",
            {
                class: "mode-selector__option",
                type: "button",
                role: "menuitemradio",
                "aria-checked": String(
                    mode.key === selected
                ),

                onclick: () => {
                    api.select(mode.key);
                },
            },

            mode.label
        );

        buttons.set(mode.key, button);

        menu.appendChild(button);
    }

    return api;
}