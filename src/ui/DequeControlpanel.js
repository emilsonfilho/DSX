import { el } from "./dom.js";
import { Field } from "./components/Field.js";
import { Accordion, accordionGroup } from "./components/Accordion.js";

export function DequeControlPanel({ onPushFront, onPushBack, onPopFront, onPopBack, onSlidingWindow }) {
    // ==========================================
    // 1. OPERAÇÕES BÁSICAS (Inserção e Remoção)
    // ==========================================
    const valueField = Field("Valor:", { inputMode: "numeric" });

    // Linha 1: Botões Push (Primários, Fundo Azul)
    const btnPushFront = el("button", {
        class: "btn btn--primary",
        type: "button",
        onclick: () => onPushFront(valueField.value)
    }, "Push Front");

    const btnPushBack = el("button", {
        class: "btn btn--primary",
        type: "button",
        onclick: () => onPushBack(valueField.value)
    }, "Push Back");

    // Linha 2: Botões Pop (Secundários, Borda Azul)
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

    // Agrupando campos básicos usando as grids do seu painel
    const basicOperations = el("div", { class: "panel__block" },
        valueField.root,
        el("div", { class: "form__row", style: "margin-top: 8px;" }, btnPushFront, btnPushBack),
        el("div", { class: "form__row" }, btnPopFront, btnPopBack)
    );

    // ==========================================
    // 2. CONTEÚDO DOS ACCORDIONS (Janela e Teoria)
    // ==========================================

    // Formulário da Janela Deslizante
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

    // Conteúdo da Monotonicidade
    const monotonicContent = el("p", { style: "color: var(--ink-600); font-size: 13px; margin: 0;" },
        "Um Monotonic Deque garante que todos os elementos internos permaneçam em ordem estritamente crescente ou decrescente, descartando valores que quebrem essa regra durante as inserções."
    );

    // Criando os Accordions (Apenas 1 aberto por vez, comportamento original)
    const accordions = accordionGroup((onToggle) => [
        Accordion("Janela deslizante", slidingWindowContent, { onToggle }),
        Accordion("Monotonicidade", monotonicContent, { onToggle })
    ]);

    // Abra o primeiro accordion por padrão (igual à imagem)
    accordions[0].open();

    // ==========================================
    // 3. ESTRUTURA FINAL DO PAINEL
    // ==========================================
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });

    // Elemento Raiz que encapsula tudo
    const root = el("aside", { class: "panel" },
        // Título igual ao da imagem
        el("h2", { style: "color: var(--accent); font-size: 14.5px; font-weight: 700; margin: 8px 0;" }, "Operações do deque:"),

        basicOperations,

        // Espaço para os accordions
        el("div", { class: "panel__accordions", style: "margin-top: 16px;" }, accordions.map((item) => item.root)),

        feedback
    );

    // ==========================================
    // 4. API EXPOSTA PARA O APP
    // ==========================================
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
            // Habilita ou desabilita todos os botões (útil para travar a tela enquanto anima)
            const buttons = root.querySelectorAll("button");
            buttons.forEach(btn => btn.disabled = !enabled);
        }
    };
}