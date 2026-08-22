import { SegmentTree } from "../segment-tree/SegmentTree.js";
import { Strategies } from "../segment-tree/Operations.js";
import { NodeStatus } from "../segment-tree/Enums.js";
import { StateManager } from "../state/StateManager.js";

import { el, formatValue } from "../ui/dom.js";
import { TreeRenderer } from "../visualization/TreeRenderer.js";
import { ControlPanel } from "../ui/ControlPanel.js";
import { Playback } from "../ui/components/Playback.js";
import { parseArray, parseIndex, parseNumber, parseRange, COMFORTABLE_ELEMENTS } from "../ui/validation.js";

const LEGEND = [
    [NodeStatus.IDLE, "Em repouso"],
    [NodeStatus.VISITING, "Visitando"],
    [NodeStatus.UPDATING, "Atualizado"],
    [NodeStatus.LAZY_PENDING, "Lazy pendente"],
    [NodeStatus.PUSHING_DOWN, "Push down"],
];

/**
 * Controlador da aplicação, traduz eventos da UI em chamadas ao core
 * e devolve o histórico gravado para o StateManager reproduzir
 */
export class App {
    constructor(root) {
        this.root = root;
        this.tree = null;

        this.panel = ControlPanel({
            onBuild: (input) => this.handleBuild(input),
            onPointUpdate: (input) => this.handlePointUpdate(input),
            onRangeQuery: (input) => this.handleRangeQuery(input),
            onRangeUpdate: (input) => this.handleRangeUpdate(input),
        });

        this.playback = Playback({
            onPrev: () => this.player.prev(),
            onNext: () => this.player.next(),
            onToggle: () => this.player.toggle(),
            onScrub: (index) => this.player.goTo(index),
            onSpeed: (ms) => this.player.setSpeed(ms),
        });

        this.player = new StateManager(
            (frame, index, total) => {
                this.renderer.render(frame);
                this.playback.update(frame, index, total);
            },
            (isPlaying) => this.playback.setPlaying(isPlaying)
        );
        this.player.setSpeed(600);

        this.mount();
        this.panel.setOperationsEnabled(false);
    }

    mount() {
        const canvas = el("div", { class: "tree-canvas" });

        const legend = el(
            "ul",
            { class: "legend" },
            LEGEND.map(([status, label]) =>
                el(
                    "li",
                    { class: "legend__item" },
                    el("span", { class: `legend__dot legend__dot--${status}` }),
                    label
                )
            )
        );

        this.root.replaceChildren(
            el(
                "main",
                { class: "page" },
                el("h1", { class: "page__title" }, "Visualizador de Árvore de Segmentos"),
                el(
                    "div",
                    { class: "workspace" },
                    el("section", { class: "tree-card" }, canvas, legend, this.playback.root),
                    this.panel.root
                )
            )
        );

        this.renderer = new TreeRenderer(canvas);
    }

    // Operações

    handleBuild({ array, strategyKey }) {
        const parsed = parseArray(array);
        if (!parsed.ok) return this.fail(parsed.error);

        const option = Strategies[strategyKey];
        this.tree = new SegmentTree(parsed.value, option.strategy);

        this.player.loadHistory(this.tree.history);
        this.panel.setOperationsEnabled(true);
        this.panel.clearOperationInputs();

        const warning =
            parsed.value.length > COMFORTABLE_ELEMENTS
                ? " (arrays grandes ficam apertados na tela)"
                : "";

        this.panel.setFeedback(
            `Árvore de ${option.label} construída com ${parsed.value.length} elemento(s).${warning}`,
            "success"
        );
    }

    handlePointUpdate({ index, value }) {
        if (!this.requireTree()) return;

        const position = parseIndex(index, "Digite o índice", this.tree.size);
        if (!position.ok) return this.fail(position.error);

        const newValue = parseNumber(value, "Insira o valor");
        if (!newValue.ok) return this.fail(newValue.error);

        this.player.loadHistory(this.tree.runPointUpdate(position.value, newValue.value));
        this.panel.setFeedback(
            `Índice [${position.value}] recebeu o valor ${newValue.value}.`,
            "success"
        );
    }

    handleRangeUpdate({ start, end, value }) {
        if (!this.requireTree()) return;

        const range = parseRange(start, end, this.tree.size);
        if (!range.ok) return this.fail(range.error);

        const delta = parseNumber(value, "Insira o valor");
        if (!delta.ok) return this.fail(delta.error);

        const [left, right] = range.value;

        this.player.loadHistory(this.tree.runRangeUpdate(left, right, delta.value));
        this.panel.setFeedback(
            `Somado ${delta.value} a cada elemento de [${left}, ${right}] via lazy propagation.`,
            "success"
        );
    }

    handleRangeQuery({ start, end }) {
        if (!this.requireTree()) return;

        const range = parseRange(start, end, this.tree.size);
        if (!range.ok) return this.fail(range.error);

        const [left, right] = range.value;
        const { result, history } = this.tree.runRangeQuery(left, right);
        const label = Object.values(Strategies).find((item) => item.strategy === this.tree.operation);

        this.player.loadHistory(history);
        this.panel.setFeedback(
            `${label?.resultLabel ?? "Resultado"} de [${left}, ${right}] = ${formatValue(result)}`,
            "result"
        );
    }

    // Utils

    requireTree() {
        if (this.tree) return true;

        this.fail("Construa uma árvore antes de executar operações.");
        return false;
    }

    fail(message) {
        this.panel.setFeedback(message, "error");
    }
}