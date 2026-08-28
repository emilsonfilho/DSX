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

        this.deque = new MonotonicDeque();

        this.manualIndex = 0;

        this.panel = DequeControlPanel({
            onPushBack: (value) => this.handlePushBack(value),
            onPopFront: () => this.handlePopFront(),
            onPopBack: () => this.handlePopBack(),
            onSlidingWindow: (seq, windowSize) => this.handleSlidingWindow(seq, windowSize),
        });

        this.playback = Playback({
            onPrev: () => this.player.prev(),
            onNext: () => this.player.next(),
            onToggle: () => this.player.toggle(),
            onScrub: (index) => this.player.goTo(index),
            onSpeed: (ms) => this.player.setSpeed(ms),
        });

        this.player = new StateManager();

        this.player.on('frameChange', (frame, index, total) => {
            this.renderer.render(frame);
            this.playback.update(frame, index, total);
        });

        this.player.on('playStateChange', (isPlaying) => {
            this.playback.setPlaying(isPlaying);
        });

        this.player.setSpeed(600);

        this.mount();
    }

    mount() {
        const canvas = el("div", { class: "tree-canvas" }); // Reutilizando a classe do canvas

        // Monta a estrutura da página
        this.root.replaceChildren(
            el("main", { class: "page" },
                el("h1", { class: "page__title" }, "Visualizador de Deque Monotônica"),
                el("div", { class: "workspace" },
                    // Lado esquerdo: Renderização + Controles de vídeo
                    el("section", { class: "tree-card" }, canvas, this.playback.root),
                    // Lado direito: Painel de Controle
                    this.panel.root
                )
            )
        );

        this.renderer = new DequeRenderer(canvas);

        this.renderer.clear();
    }

    handlePushBack(valueText) {
        const parsed = parseNumber(valueText, "Valor");
        if (!parsed.ok) return this.panel.setFeedback(parsed.error, "error");

        const history = this.deque.runPushBack(parsed.value, this.manualIndex++);

        this.player.loadHistory(history);

        this.panel.clearValueInput();
        this.panel.setFeedback(`Valor ${parsed.value} empurrado (Push) no Deque.`, "success");
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
        const parsedArray = parseArray(seqText);
        if (!parsedArray.ok) return this.panel.setFeedback(parsedArray.error, "error");

        const parsedK = parseNumber(windowSizeText, "Tamanho da janela");
        if (!parsedK.ok) return this.panel.setFeedback(parsedK.error, "error");

        if (parsedK.value <= 0 || parsedK.value > parsedArray.value.length) {
            return this.panel.setFeedback("Tamanho da janela deve ser maior que 0 e menor ou igual ao array.", "error");
        }

        const { result, history } = this.deque.runSlidingWindow(parsedArray.value, parsedK.value);

        this.player.loadHistory(history);

        this.panel.setFeedback(`Janela Deslizante concluída. Resultado final: [${result.join(', ')}]`, "result");
    }
}