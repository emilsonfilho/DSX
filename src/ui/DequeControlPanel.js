import { el } from "./dom.js";
import { Field } from "./components/Field.js";
import { Accordion, accordionGroup } from "./components/Accordion.js";
import { TheoryBox } from "./components/TheoryBox.js";

const THEORY_SECTIONS = [
    {
        heading: "O que é uma Deque Monotônica?",
        text: "É uma fila de duas pontas (deque) que mantém seus elementos sempre em ordem — crescente ou decrescente, dependendo do problema. Ela existe para responder rapidamente à pergunta \"qual é o menor (ou maior) valor dentro da janela que está deslizando sobre o array agora?\", o problema clássico da Janela Deslizante.",
        example: "Para o array [3, 7, 5, 2, 6, 1] com janela de tamanho 3, o menor valor de cada janela é [3, 2, 2, 1]. É esse tipo de resposta que a estrutura calcula, uma janela por vez, sem recomeçar do zero a cada passo.",
    },
    {
        heading: "Por que uma deque, e não uma fila comum?",
        text: "O algoritmo precisa fazer duas coisas o tempo todo: descartar, pela frente, elementos que saíram da janela, e descartar, pelo final, elementos que nunca mais poderão ser a resposta. Uma deque é a estrutura certa porque insere e remove nas duas pontas em tempo O(1).",
        example: "Uma fila comum só remove pela frente. Se o algoritmo precisasse tirar um elemento do final para manter a ordem, teria que reconstruir a fila inteira — é exatamente esse custo que a deque evita.",
    },
    {
        heading: "A ideia central: descartar quem nunca vai vencer",
        text: "Ao chegar um novo elemento, ele é comparado com quem está no final da deque. Se o elemento do final perde para o novo (por exemplo, é maior que ele, num problema de mínimo), ele nunca mais será a resposta de nenhuma janela futura — o candidato novo é mais recente e melhor. Por isso ele é removido antes do novo valor ser inserido. Essa poda contínua é o que mantém a deque sempre ordenada.",
        example: "A deque tem [3, 7] e chega o valor 5. Como 7 é maior que 5, o 7 é removido — enquanto o 5 estiver na janela, o 7 nunca seria o mínimo. A deque passa a ser [3], e depois [3, 5].",
    },
    {
        heading: "Removendo quem já saiu da janela",
        text: "Cada elemento é guardado como um par (valor, índice). A cada passo, antes de inserir o novo valor, verificamos se o elemento na frente da deque já saiu da janela atual, ou seja, se o índice dele é menor que o limite esquerdo da janela. Se for o caso, ele é removido da frente — mesmo que ainda seja o melhor valor, ele não pertence mais à janela.",
        example: "Processando o índice 3 (janela passa a ser [1, 3]), o valor 3 está na frente da deque com índice 0. Como 0 é menor que o novo limite esquerdo (1), ele é descartado — mesmo sendo o menor valor visto até agora.",
    },
    {
        heading: "Por que a resposta está sempre na frente",
        text: "Como a deque é mantida em ordem do início ao fim, o primeiro elemento é sempre o melhor entre os que ainda estão dentro da janela. Depois de processar cada índice, basta olhar a frente da deque para saber a resposta daquela janela, sem percorrer mais nada.",
        example: "Depois de processar o índice 2, a deque está [3, 5], em ordem crescente. A resposta da primeira janela (índices 0 a 2) é o valor da frente: 3.",
    },
    {
        heading: "E elementos repetidos?",
        text: "Guardar só o valor não bastaria para saber quando um elemento expira, já que dois valores iguais podem ter índices diferentes. Por isso a deque guarda pares (valor, índice): o valor decide quem é descartado na comparação, e o índice decide quando o elemento sai por ter ficado fora da janela.",
        example: "Se o array tivesse o valor 5 nos índices 2 e 6, e apenas o índice 2 tivesse expirado, comparar só pelo valor apagaria o par errado. Guardando (5, 2) e (5, 6), a deque sabe exatamente qual dos dois sai primeiro.",
    },
    {
        heading: "Complexidade",
        items: [
            "Inserção (push): O(1) amortizado — cada elemento entra e sai da deque no máximo uma vez.",
            "Remoção de expirados (pop): O(1) amortizado, pelo mesmo motivo.",
            "Janela deslizante completa, para um array de tamanho n: O(n) no total.",
            "Memória: O(k) no pior caso, onde k é o tamanho da janela.",
        ],
        example: "Comparando com a alternativa ingênua — percorrer os k elementos de cada janela para achar o mínimo, O(n·k) no total —, a deque monotônica resolve o mesmo problema em O(n), mesmo com janelas grandes.",
    },
];

export function DequeControlPanel({ onPushBack, onPopFront, onPopBack, onSlidingWindow }) {
    const valueField = Field("Valor:", { inputMode: "numeric" });

    const btnPushBack = el("button", {
        class: "btn btn--primary btn--block",
        type: "button",
        onclick: () => onPushBack(valueField.value)
    }, "Push Back");

    const outlineStyle = "border: 1px solid var(--blue-500); color: var(--blue-700); background: transparent;";

    const btnPopFront = el("button", {
        class: "btn",
        style: outlineStyle,
        type: "button",
        onclick: () => onPopFront()
    }, "Pop Front");

    const btnPopBack = el("button", {
        class: "btn",
        style: outlineStyle,
        type: "button",
        onclick: () => onPopBack()
    }, "Pop Back");

    const basicOperations = el("div", { class: "panel__block" },
        valueField.root,
        el("div", { style: "margin-top: 8px;" }, btnPushBack),
        el("div", { class: "form__row" }, btnPopFront, btnPopBack)
    );

    const theory = TheoryBox(
        "Deque Monotônica",
        THEORY_SECTIONS,
        {
            description:
                "Entenda por que só é preciso inserir pelo final, como a ordem monotônica é mantida e por que a resposta de cada janela está sempre na frente da deque.",
        }
    );

    const seqField = Field("Sequência inicial:", { placeholder: "1, 3, -1, -3, 5, 3, 6" });
    const windowField = Field("Tamanho da janela:", { inputMode: "numeric", placeholder: "3" });

    const btnExecuteWindow = el("button", {
        class: "btn btn--primary btn--block",
        style: "margin-top: 12px;",
        type: "button",
        onclick: () => onSlidingWindow(seqField.value, windowField.value)
    }, "Executar janela");

    const slidingWindowContent = el("div", { class: "panel__block" },
        el("div", { class: "form__row" }, seqField.root, windowField.root),
        btnExecuteWindow
    );

    const accordions = accordionGroup((onToggle) => [
        Accordion("Janela deslizante", slidingWindowContent, { onToggle }),
    ]);

    accordions[0].open();

    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });

    const root = el("aside", { class: "panel" },
        theory.root,

        el("h2", { style: "color: var(--accent); font-size: 14.5px; font-weight: 700; margin: 8px 0;" }, "Operações do deque:"),

        basicOperations,

        el("div", { class: "panel__accordions", style: "margin-top: 16px;" }, accordions.map((item) => item.root)),

        feedback
    );

    return {
        root,
        setFeedback(text, kind = "info") {
            feedback.textContent = text ?? "";
            feedback.className = `feedback feedback--${kind}`;
        },
        clearValueInput() {
            valueField.clear();
        },
        setOperationsEnabled(enabled) {
            const buttons = root.querySelectorAll("button");
            buttons.forEach(btn => btn.disabled = !enabled);
        }
    };
}