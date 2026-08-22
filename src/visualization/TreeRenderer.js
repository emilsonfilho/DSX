import { svgEl, el, formatValue } from "../ui/dom.js";
import { layoutTree } from "./layout.js";

const X_GAP = 78;
const Y_GAP = 92;
const PADDING_X = 48;
const PADDING_Y = 44;
const RADIUS = 19;

// Desenha um frame do histórico
export class TreeRenderer {
    constructor(container) {
        this.container = container;
        this.clear();
    }

    clear(message = "Digite um array e clique em “Construir árvore”.") {
        this.container.replaceChildren(el("p", { class: "tree-canvas__empty" }, message));
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

        this.container.replaceChildren(svg);
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