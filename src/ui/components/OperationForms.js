import { el } from "../dom.js";
import { Field } from "./Field.js";

function form(className, fields, submitLabel, onSubmit) {
    return el(
        "form",
        {
            class: `form ${className}`,
            novalidate: "",
            onsubmit: (event) => {
                event.preventDefault();
                onSubmit();
            },
        },
        fields,
        el("button", { class: "btn btn--primary", type: "submit" }, submitLabel)
    );
}

/** Atualizar índice: define o valor de uma posição do array. */
export function IndexUpdateForm(onSubmit) {
    const index = Field("Digite o índice:", { inputMode: "numeric" });
    const value = Field("Insira o valor:", { inputMode: "numeric" });

    const root = form(
        "form--index-update",
        el("div", { class: "form__row" }, index.root, value.root),
        "Índice de atualização",
        () => onSubmit({ index: index.value, value: value.value })
    );

    return { root, fields: [index, value] };
}

/** Consulta de intervalo: agrega [início, fim] segundo a estratégia da árvore. */
export function RangeQueryForm(onSubmit) {
    const start = Field("Intervalo inicial:", { inputMode: "numeric" });
    const end = Field("Alcance final:", { inputMode: "numeric" });

    const root = form(
        "form--range-query",
        el("div", { class: "form__row" }, start.root, end.root),
        "Intervalo de consulta",
        () => onSubmit({ start: start.value, end: end.value })
    );

    return { root, fields: [start, end] };
}

/** Atualização de alcance: soma um valor a todo o intervalo (lazy propagation). */
export function RangeUpdateForm(onSubmit) {
    const start = Field("Intervalo inicial:", { inputMode: "numeric" });
    const end = Field("Alcance final:", { inputMode: "numeric" });
    const value = Field("Insira o valor:", { inputMode: "numeric" });

    const root = form(
        "form--range-update",
        [el("div", { class: "form__row" }, start.root, end.root), value.root],
        "Intervalo de atualização",
        () => onSubmit({ start: start.value, end: end.value, value: value.value })
    );

    return { root, fields: [start, end, value] };
}