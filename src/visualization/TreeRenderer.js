import { svgEl, el, formatValue } from "../ui/dom.js";
import { layoutTree } from "./layout.js";

const X_GAP = 78;
const Y_GAP = 92;
const PADDING_X = 48;
const PADDING_Y = 44;
const RADIUS = 19;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;

const ZOOM_SENSITIVITY = 0.0015;

export class TreeRenderer {
    constructor(container) {
        this.container = container;
        this.zoom = 1;

        this.zoomWrap = el(
            "div",
            { class: "tree-canvas__zoom-wrap" }
        );

        this.container.replaceChildren(this.zoomWrap);

        /*
        * O zoom é controlado diretamente pelo scroll
        * do mouse/trackpad sobre a visualização.
        */
        this.container.addEventListener(
            "wheel",
            (event) => this._handleWheel(event),
            { passive: false }
        );

        /*
        * Duplo clique restaura a visualização.
        */
        this.container.addEventListener(
            "dblclick",
            () => this.resetZoom()
        );

        this.container.title =
            "Use o scroll para controlar o zoom. Duplo clique para restaurar.";

        this._applyZoom();
        this.clear();
    }

    clear(message = "Digite um array e clique em “Construir árvore”.") {
        this.zoomWrap.replaceChildren(el("p", { class: "tree-canvas__empty" }, message));
    }

    _handleWheel(event) {
        /*
        * Não captura o scroll enquanto não existir
        * uma árvore desenhada.
        */
        if (!this.zoomWrap.querySelector("svg")) {
            return;
        }

        const direction = -event.deltaY;

        /*
        * Zoom exponencial deixa tanto a rodinha
        * quanto o trackpad mais suaves.
        */
        const factor = Math.exp(
            direction * ZOOM_SENSITIVITY
        );

        const nextZoom = Math.min(
            ZOOM_MAX,
            Math.max(
                ZOOM_MIN,
                this.zoom * factor
            )
        );

        /*
        * Se já chegou no limite, permite que o
        * scroll continue normalmente pela página.
        */
        if (Math.abs(nextZoom - this.zoom) < 0.001) {
            return;
        }

        event.preventDefault();

        this._setZoom(nextZoom);
    }

    resetZoom() {
        this._setZoom(1);
    }

    _setZoom(value) {
        this.zoom = Math.min(
            ZOOM_MAX,
            Math.max(
                ZOOM_MIN,
                Number(value.toFixed(2))
            )
        );

        this._applyZoom();
    }

    _applyZoom() {
        this.zoomWrap.style.transform =
            `scale(${this.zoom})`;
    }

    render(frame) {
        if (!frame || !Array.isArray(frame.nodes) || !frame.size) return this.clear();

        const { positions, edges, columns, depth } = layoutTree(frame.size);
        if (positions.size === 0) return this.clear();

        const width = (columns - 1) * X_GAP + PADDING_X * 2;
        const height = depth * Y_GAP + PADDING_Y * 2;

        const toPixels = ({ x, y }) => ({ x: PADDING_X + x * X_GAP, y: PADDING_Y + y * Y_GAP });

        const svg = svgEl("svg", {
            class: "tree-canvas__svg",
            width,
            height,
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: "xMidYMid meet",
            role: "img",
            "aria-label": frame.message,
        });

        for (const [parent, child] of edges) {
            const from = toPixels(positions.get(parent));
            const to = toPixels(positions.get(child));

            svg.appendChild(
                svgEl("line", { class: "edge", x1: from.x, y1: from.y, x2: to.x, y2: to.y })
            );
        }

        for (const [index, position] of positions) {
            svg.appendChild(this._renderNode(frame.nodes[index], position, toPixels(position)));
        }

        this.zoomWrap.replaceChildren(svg);
    }

    _renderNode(node, position, { x, y }) {
        if (!node || node.id === null) return this._renderPendingNode(position, { x, y });

        const group = svgEl("g", { class: `node node--${node.status}` });

        group.appendChild(
            svgEl(
                "text",
                { class: "node__range", x, y: y - RADIUS - 11, "text-anchor": "middle" },
                `[${node.range[0]} .. ${node.range[1]}]`
            )
        );

        group.appendChild(svgEl("circle", { class: "node__circle", cx: x, cy: y, r: RADIUS }));

        group.appendChild(
            svgEl(
                "text",
                { class: "node__value", x, y: y + 5, "text-anchor": "middle" },
                formatValue(node.value)
            )
        );

        if (node.lazy !== 0) {
            const badgeX = x + RADIUS - 2;
            const badgeY = y - RADIUS + 2;

            group.appendChild(svgEl("circle", { class: "node__lazy-bg", cx: badgeX, cy: badgeY, r: 10 }));
            group.appendChild(
                svgEl(
                    "text",
                    { class: "node__lazy-text", x: badgeX, y: badgeY + 3.5, "text-anchor": "middle" },
                    formatValue(node.lazy)
                )
            );
        }

        return group;
    }

    _renderPendingNode(position, { x, y }) {
        const group = svgEl("g", { class: "node node--pending" });

        group.appendChild(
            svgEl(
                "text",
                { class: "node__range", x, y: y - RADIUS - 11, "text-anchor": "middle" },
                `[${position.range[0]} .. ${position.range[1]}]`
            )
        );

        group.appendChild(svgEl("circle", { class: "node__circle node__circle--pending", cx: x, cy: y, r: RADIUS }));

        return group;
    }
}