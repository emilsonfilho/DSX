import { MonotonicDeque } from "../deque/MonotonicDeque.js";
import { StateManager } from "../state/StateManager.js";
import { el } from "../ui/dom.js";
import { DequeRenderer } from "../visualization/DequeRenderer.js";
import { DequeControlPanel } from "../ui/DequeControlPanel.js";
import { Playback } from "../ui/components/Playback.js";
import { parseArray, parseNumber } from "../ui/validation.js";

export class DequeApp {
    constructor(root) {
        this.root = root;

        // Instancia a classe principal de lógica do Deque
        this.deque = new MonotonicDeque();

        // Variável auxiliar para rastrear o "índice" nas inserções manuais soltas
        this.manualIndex = 0;

        // 1. Instancia o Painel de Controle (com todos os callbacks)
        this.panel = DequeControlPanel({
            onPushBack: (value) => this.handlePushBack(value),
            onPushFront: (value) => this.handlePushFront(value),
            onPopFront: () => this.handlePopFront(),
            onPopBack: () => this.handlePopBack(),
            onSlidingWindow: (seq, windowSize) => this.handleSlidingWindow(seq, windowSize),
        });

        // 2. Instancia a "Fita" de reprodução visual
        this.playback = Playback({
            onPrev: () => this.player.prev(),
            onNext: () => this.player.next(),
            onToggle: () => this.player.toggle(),
            onScrub: (index) => this.player.goTo(index),
            onSpeed: (ms) => this.player.setSpeed(ms),
        });

        // 3. Instancia o Gerenciador de Estado usando o seu Padrão Observer
        this.player = new StateManager();

        this.player.on('frameChange', (frame, index, total) => {
            this.renderer.render(frame);
            this.playback.update(frame, index, total);
        });

        this.player.on('playStateChange', (isPlaying) => {
            this.playback.setPlaying(isPlaying);
        });

        this.player.setSpeed(600);

        // Renderiza a interface na tela
        this.mount();
    }

    mount() {
        const canvas = el("div", { class: "tree-canvas" }); // Reutilizando a classe do canvas

        // Monta a estrutura da página
        this.root.replaceChildren(
            el("main", { class: "page" },
                el("h1", { class: "page__title" }, "Visualizador de Monotonic Deque"),
                el("div", { class: "workspace" },
                    // Lado esquerdo: Renderização + Controles de vídeo
                    el("section", { class: "tree-card" }, canvas, this.playback.root),
                    // Lado direito: Painel de Controle
                    this.panel.root
                )
            )
        );

        this.renderer = new DequeRenderer(canvas);

        // Renderiza a tela limpa inicial
        this.renderer.clear();
    }

    // ==========================================
    // HANDLERS (Ações disparadas pelo Painel)
    // ==========================================

    handlePushBack(valueText) {
        // Usa sua validação padrão
        const parsed = parseNumber(valueText, "Valor");
        if (!parsed.ok) return this.panel.setFeedback(parsed.error, "error");

        // Executa a lógica que criamos no core e pega a fita de vídeo (history)
        const history = this.deque.runPushBack(parsed.value, this.manualIndex++);

        // Carrega o vídeo no StateManager para tocar na tela
        this.player.loadHistory(history);

        this.panel.clearValueInput();
        this.panel.setFeedback(`Valor ${parsed.value} empurrado (Push) no Deque.`, "success");
    }

    handlePushFront(valueText) {
        const parsed = parseNumber(valueText, "Valor");
        if (!parsed.ok) return this.panel.setFeedback(parsed.error, "error");

        const history = this.deque.runPushFront(parsed.value, this.manualIndex++);
        this.player.loadHistory(history);

        this.panel.clearValueInput();
        this.panel.setFeedback(`Valor ${parsed.value} empurrado (Push) no Front.`, "success");
    }

    handlePopFront() {
        const history = this.deque.runPopFront();
        this.player.loadHistory(history);
        this.panel.setFeedback(`Elemento da frente (Front) removido.`, "success");
    }

    handlePopBack() {
        const history = this.deque.runPopBack();
        this.player.loadHistory(history);
        this.panel.setFeedback(`Elemento do final (Back) removido.`, "success");
    }

    handleSlidingWindow(seqText, windowSizeText) {
        // Validação da sequência
        const parsedArray = parseArray(seqText);
        if (!parsedArray.ok) return this.panel.setFeedback(parsedArray.error, "error");

        // Validação do tamanho da janela (k)
        const parsedK = parseNumber(windowSizeText, "Tamanho da janela");
        if (!parsedK.ok) return this.panel.setFeedback(parsedK.error, "error");

        if (parsedK.value <= 0 || parsedK.value > parsedArray.value.length) {
            return this.panel.setFeedback("Tamanho da janela deve ser maior que 0 e menor ou igual ao array.", "error");
        }

        // Executa a lógica da Janela Deslizante
        const { result, history } = this.deque.runSlidingWindow(parsedArray.value, parsedK.value);

        // Toca a animação
        this.player.loadHistory(history);

        this.panel.setFeedback(`Janela Deslizante concluída. Resultado final: [${result.join(', ')}]`, "result");
    }
}