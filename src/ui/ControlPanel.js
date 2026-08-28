import { el, FeedbackType } from "./dom.js";
import { Field } from "./components/Field.js";
import { Accordion, accordionGroup } from "./components/Accordion.js";
import { OperationSelector } from "./components/OperationSelector.js";
import { TheoryBox } from "./components/TheoryBox.js";
import {
    IndexUpdateForm,
    RangeQueryForm,
    RangeUpdateForm
} from "./components/OperationForms.js";

const THEORY_SECTIONS = [
    {
        heading: "O que é uma Árvore de Segmentos?",
        text: "É uma estrutura de dados em forma de árvore binária usada para responder consultas e realizar atualizações em intervalos de um array com eficiência. Cada nó representa um intervalo e armazena o resultado da operação escolhida para aquele trecho.",
    },
    {
        heading: "Como a árvore é organizada",
        text: "A raiz representa o array inteiro. Cada nó interno divide seu intervalo aproximadamente ao meio: o filho esquerdo representa a primeira metade e o direito representa a segunda. As folhas representam posições individuais do array.",
    },
    {
        heading: "Construção e merge",
        text: "A construção começa pelas folhas. Depois, os valores sobem pela árvore: cada nó interno combina os valores dos dois filhos usando a operação selecionada. Essa combinação é chamada de merge.",
    },
    {
        heading: "Consulta de intervalo",
        text: "Durante uma consulta [L, R], um nó totalmente fora do intervalo é ignorado, um nó totalmente dentro pode devolver seu valor imediatamente e um nó parcialmente coberto precisa consultar os filhos. No fim, os resultados parciais são combinados pelo merge.",
    },
    {
        heading: "Atualização de um índice",
        text: "Para alterar uma única posição, a árvore percorre apenas o caminho da raiz até a folha correspondente. Depois da alteração, os nós ancestrais são recalculados no caminho de volta até a raiz.",
    },
    {
        heading: "Lazy propagation",
        text: "Quando uma atualização afeta um intervalo inteiro, não é necessário modificar todas as folhas imediatamente. A árvore registra uma lazy tag no nó coberto. Essa atualização pendente só é repassada aos filhos quando uma operação futura precisar descer por eles.",
    },
    {
        heading: "Operação e elemento neutro",
        text: "A mesma estrutura pode trabalhar com diferentes operações associativas, como soma, mínimo, máximo, XOR, AND e MDC. Cada estratégia define como dois resultados são combinados e qual valor neutro pode ser usado sem alterar o resultado durante uma consulta.",
    },
    {
        heading: "Complexidade",
        items: [
            "Construção: O(n).",
            "Consulta de intervalo: O(log n) nos casos usuais.",
            "Atualização de um índice: O(log n).",
            "Atualização de intervalo com lazy propagation: O(log n) nos casos usuais.",
            "Memória: O(n); nesta implementação, o vetor interno reserva aproximadamente 4n posições.",
        ],
    },
];

export function ControlPanel({
    onBuild,
    onPointUpdate,
    onRangeQuery,
    onRangeUpdate,
    onStrategyChange
}) {
    const selector = OperationSelector({ onChange: onStrategyChange });

    const theory = TheoryBox(
        "Árvore de Segmentos",
        THEORY_SECTIONS,
        {
            description:
                "Entenda como os intervalos são representados, como as operações percorrem a árvore e por que a lazy propagation evita trabalho desnecessário.",
        }
    );

    const arrayField = Field("Digite o array:", {
        placeholder: "ex: 1, 2, 3, 4, 5, 6"
    });

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
                onBuild({ array: arrayField.value, strategyKey: selector.value});
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

    const feedback = el(
        "p",
        {
            class: "feedback",
            role: "status",
            "aria-live": "polite"
        }
    );

    const operationsCard = el(
        "section",
        { class: "panel__section panel__section--operations" },

        theory.root,

        el(
            "h2",
            { class: "panel__section-title" },
            "Operações da árvore:"
        ),

        selector.root,
        buildForm,

        el(
            "div",
            { class: "panel__accordions" },
            accordions.map((item) => item.root)
        ),

        feedback
    );

    const root = el(
        "aside",
        { class: "panel" },
        operationsCard
    );

    return {
        root,
        get strategyKey() {
            return selector.value;
        },
        setFeedback(text, kind = FeedbackType.INFO) {
            feedback.textContent = text ?? "";
            feedback.className = `feedback feedback--${kind}`;
        },
        setOperationsEnabled(enabled) {
            for (const item of accordions) {
                item.root.classList.toggle("accordion--disabled", !enabled);
                item.root.querySelector(".accordion__trigger").disabled = !enabled;
                if (!enabled) item.close();
            }
        },
        clearOperationInputs() {
            for (const form of [indexUpdate, rangeQuery, rangeUpdate]) {
                form.fields.forEach((field) => field.clear());
            }
        },
    };
}