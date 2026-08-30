import {
    el,
    FeedbackType
} from "./dom.js";

import { Field }
    from "./components/Field.js";

import {
    Accordion,
    accordionGroup
} from "./components/Accordion.js";

import { OperationSelector }
    from "./components/OperationSelector.js";

import { TheoryBox }
    from "./components/TheoryBox.js";

import {
    IndexUpdateForm,
    RangeQueryForm
} from "./components/OperationForms.js";


const THEORY_SECTIONS = [
    {
        heading:
            "O que é persistência?",

        text:
            "Uma árvore persistente mantém as versões anteriores da estrutura mesmo depois de uma atualização.",
    },

    {
        heading:
            "Compartilhamento estrutural",

        text:
            "Ao atualizar um índice, somente os nós no caminho entre a raiz e a folha são recriados. Os demais nós são compartilhados entre as versões.",
    },

    {
        heading:
            "Versões",

        text:
            "A versão 0 representa a árvore inicial. Cada atualização cria uma nova raiz e uma nova versão sem modificar as anteriores.",
    },

    {
        heading:
            "Atualização",

        text:
            "Uma atualização de índice cria O(log n) novos nós, pois somente um caminho da árvore precisa ser reconstruído.",
    },

    {
        heading:
            "Consulta",

        text:
            "Cada versão possui sua própria raiz. Por isso, é possível consultar qualquer versão usando o mesmo algoritmo de consulta da árvore de segmentos.",
    },

    {
        heading:
            "Complexidade",

        items: [
            "Construção inicial: O(n).",
            "Atualização de índice: O(log n).",
            "Novos nós por atualização: O(log n).",
            "Consulta de intervalo: O(log n) nos casos usuais.",
            "Versões antigas permanecem disponíveis.",
        ],
    },
];


export function PersistentControlPanel({
    onBuild,
    onPointUpdate,
    onRangeQuery,
    onStrategyChange,
}) {
    const selector =
        OperationSelector({
            onChange:
                onStrategyChange,
        });

    const theory =
        TheoryBox(
            "Árvore de Segmentos Persistente",
            THEORY_SECTIONS,
            {
                description:
                    "Entenda como versões antigas são preservadas por meio do compartilhamento estrutural.",
            }
        );

    const arrayField =
        Field(
            "Digite o array:",
            {
                placeholder:
                    "ex: 1, 2, 3, 4, 5, 6",
            }
        );

    const buildForm = el(
        "form",
        {
            class:
                "panel__block",

            novalidate: "",

            onsubmit:
                (event) => {
                    event.preventDefault();

                    onBuild({
                        array:
                            arrayField.value,

                        strategyKey:
                            selector.value,
                    });
                },
        },

        arrayField.root,

        el(
            "button",
            {
                class:
                    "btn btn--primary btn--block",

                type:
                    "submit",
            },

            "Construir árvore"
        )
    );

    const indexUpdate =
        IndexUpdateForm(
            onPointUpdate
        );

    const rangeQuery =
        RangeQueryForm(
            onRangeQuery
        );

    const accordions =
        accordionGroup(
            (onToggle) => [
                Accordion(
                    "Criar nova versão",
                    indexUpdate.root,
                    { onToggle }
                ),

                Accordion(
                    "Consulta de intervalo",
                    rangeQuery.root,
                    { onToggle }
                ),
            ]
        );

    const feedback =
        el(
            "p",
            {
                class:
                    "feedback",

                role:
                    "status",

                "aria-live":
                    "polite",
            }
        );

    const root =
        el(
            "aside",
            {
                class:
                    "panel",
            },

            el(
                "section",
                {
                    class:
                        "panel__section panel__section--operations",
                },

                theory.root,

                el(
                    "h2",
                    {
                        class:
                            "panel__section-title",
                    },

                    "Operações da árvore:"
                ),

                selector.root,

                buildForm,

                el(
                    "div",
                    {
                        class:
                            "panel__accordions",
                    },

                    accordions.map(
                        (item) =>
                            item.root
                    )
                ),

                feedback
            )
        );


    return {
        root,

        get strategyKey() {
            return selector.value;
        },

        setFeedback(
            text,
            kind =
                FeedbackType.INFO
        ) {
            feedback.textContent =
                text ?? "";

            feedback.className =
                `feedback feedback--${kind}`;
        },

        setOperationsEnabled(
            enabled
        ) {
            for (
                const item
                of accordions
            ) {
                item.root
                    .classList
                    .toggle(
                        "accordion--disabled",
                        !enabled
                    );

                item.root
                    .querySelector(
                        ".accordion__trigger"
                    )
                    .disabled =
                        !enabled;

                if (!enabled) {
                    item.close();
                }
            }
        },

        clearOperationInputs() {
            for (
                const form
                of [
                    indexUpdate,
                    rangeQuery
                ]
            ) {
                form.fields.forEach(
                    (field) =>
                        field.clear()
                );
            }
        },
    };
}