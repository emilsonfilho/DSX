import { el } from "./dom.js";
import { Field } from "./components/Field.js";
import { Accordion, accordionGroup } from "./components/Accordion.js";
import { OperationSelector } from "./components/OperationSelector.js";
import { IndexUpdateForm, RangeQueryForm, RangeUpdateForm } from "./components/OperationForms.js";

export function ControlPanel({ onBuild, onPointUpdate, onRangeQuery, onRangeUpdate }) {
    const selector = OperationSelector();

    const arrayField = Field("Digite o array:", { placeholder: "ex: 1, 2, 3, 4, 5, 6" });
    const buildButton = el(
        "button",
        { class: "btn btn--primary btn--block", type: "submit" },
        "Construir árvore"
    );

    const buildForm = el(
        "form",
        {
            class: "panel__block",
            novalidate: "",
            onsubmit: (event) => {
                event.preventDefault();
                onBuild({ array: arrayField.value, strategyKey: selector.value });
            },
        },
        arrayField.root,
        buildButton
    );

    const indexUpdate = IndexUpdateForm(onPointUpdate);
    const rangeQuery = RangeQueryForm(onRangeQuery);
    const rangeUpdate = RangeUpdateForm(onRangeUpdate);

    const accordions = accordionGroup((onToggle) => [
        Accordion("Atualizar índice", indexUpdate.root, { onToggle }),
        Accordion("Consulta de intervalo", rangeQuery.root, { onToggle }),
        Accordion("Atualização de alcance", rangeUpdate.root, { onToggle }),
    ]);

    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });

    const root = el(
        "aside",
        { class: "panel" },
        selector.root,
        buildForm,
        el("div", { class: "panel__accordions" }, accordions.map((item) => item.root)),
        feedback
    );

    return {
        root,
        get strategyKey() {
            return selector.value;
        },
        setFeedback(text, kind = "info") {
            feedback.textContent = text ?? "";
            feedback.className = `feedback feedback--${kind}`;
        },
        /** Habilita as operações só depois que existe uma árvore construída. */
        setOperationsEnabled(enabled) {
            for (const item of accordions) {
                item.root.classList.toggle("accordion--disabled", !enabled);
                item.root.querySelector(".accordion__trigger").disabled = !enabled;
                if (!enabled) item.close();
            }
        },
        clearOperationInputs() {
            for (const form of [indexUpdate, rangeQuery, rangeUpdate])
                form.fields.forEach((field) => field.clear());
        },
    };
}