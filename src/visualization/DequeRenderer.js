import { svgEl, el } from "../ui/dom.js";

const BOX_WIDTH = 60;
const BOX_HEIGHT = 60;
const GAP = 12;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 400;

export class DequeRenderer {
    constructor(container) {
        this.container = container;
        this.clear();
    }

    clear(message = "O deque aparecerá aqui após a primeira operação.") {
        this.render({ elements: [], message });
    }

    render(frame) {
        if (!frame || !frame.elements) return this.clear();

        const elements = frame.elements;
        const isEmpty = elements.length === 0;
        const drawCount = isEmpty ? 6 : elements.length;

        const svg = svgEl("svg", {
            class: "deque-canvas__svg",
            viewBox: `0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`,
            preserveAspectRatio: "xMidYMid meet",
            role: "img"
        });

        const centerY = STAGE_HEIGHT / 2.2;
        const dequeTotalWidth = (drawCount * BOX_WIDTH) + ((drawCount - 1) * GAP);
        const startX = (STAGE_WIDTH / 2) - (dequeTotalWidth / 2);

        svg.appendChild(svgEl("text", {
            x: startX - 15, y: centerY + 4, "text-anchor": "end", fill: "var(--blue-700)", "font-size": "12px", "font-weight": "800"
        }, "FRONT"));

        svg.appendChild(svgEl("text", {
            x: startX + dequeTotalWidth + 15, y: centerY + 4, "text-anchor": "start", fill: "var(--blue-700)", "font-size": "12px", "font-weight": "800"
        }, "BACK"));

        const getColorProps = (isTarget, status) => {
            if (!isTarget) return { stroke: "var(--blue-700)", fill: "var(--surface)", width: "2" };
            switch(status) {
                case 'compare': return { stroke: "#f5a623", fill: "var(--surface)", width: "4" }; // Laranja
                case 'violate':
                case 'expired': return { stroke: "var(--danger)", fill: "#fce8e6", width: "4" }; // Vermelho
                case 'valid': return { stroke: "var(--success)", fill: "#e6f4ea", width: "4" }; // Verde
                default: return { stroke: "var(--blue-700)", fill: "var(--surface)", width: "2" };
            }
        };

        const getCandColors = (status) => {
            switch(status) {
                case 'compare': return { stroke: "#f5a623", fill: "var(--surface)" };
                case 'violate': return { stroke: "var(--danger)", fill: "var(--surface)" };
                case 'valid': return { stroke: "var(--success)", fill: "var(--surface)" };
                default: return { stroke: "var(--blue-500)", fill: "var(--surface)" };
            }
        };

        for (let i = 0; i < drawCount; i++) {
            const x = startX + (i * (BOX_WIDTH + GAP));
            const y = centerY - (BOX_HEIGHT / 2);

            const isTarget = (frame.target === 'back' && i === drawCount - 1) ||
                (frame.target === 'front' && i === 0);

            const colors = getColorProps(isTarget, frame.status);

            const group = svgEl("g", { class: `deque__item` });
            const rectProps = { x, y, width: BOX_WIDTH, height: BOX_HEIGHT, rx: 6 };

            if (isEmpty) {
                rectProps.fill = "none";
                rectProps.stroke = "var(--line)";
                rectProps.style = "stroke-dasharray: 6 4";
            } else {
                rectProps.fill = colors.fill;
                rectProps.stroke = colors.stroke;
                rectProps["stroke-width"] = colors.width;
            }

            group.appendChild(svgEl("rect", rectProps));

            if (!isEmpty) {
                const [value, index] = elements[i];
                group.appendChild(svgEl("text", { x: x + (BOX_WIDTH / 2), y: y + (BOX_HEIGHT / 2) + 6, "text-anchor": "middle", fill: "var(--ink-900)", "font-size": "20px", "font-weight": "700" }, String(value)));
                group.appendChild(svgEl("text", { x: x + BOX_WIDTH - 6, y: y + BOX_HEIGHT - 6, "text-anchor": "end", fill: "var(--ink-400)", "font-size": "10px", "font-weight": "600" }, `i:${index}`));
            }
            svg.appendChild(group);
        }

        if (frame.candidate) {
            const [candValue, candIndex] = frame.candidate;
            const candColors = getCandColors(frame.status);

            const candX = startX + dequeTotalWidth + 20;
            const candY = centerY - BOX_HEIGHT - 30;

            const candGroup = svgEl("g", { class: `deque__candidate` });

            candGroup.appendChild(svgEl("rect", {
                x: candX, y: candY, width: BOX_WIDTH, height: BOX_HEIGHT, rx: 6, fill: candColors.fill, stroke: candColors.stroke, "stroke-width": "3", "stroke-dasharray": "4 4"
            }));

            candGroup.appendChild(svgEl("text", { x: candX + (BOX_WIDTH / 2), y: candY + (BOX_HEIGHT / 2) + 6, "text-anchor": "middle", fill: candColors.stroke, "font-size": "20px", "font-weight": "700" }, String(candValue)));
            candGroup.appendChild(svgEl("text", { x: candX + BOX_WIDTH - 6, y: candY + BOX_HEIGHT - 6, "text-anchor": "end", fill: candColors.stroke, "font-size": "10px", "font-weight": "600" }, `i:${candIndex}`));
            candGroup.appendChild(svgEl("text", { x: candX + (BOX_WIDTH / 2), y: candY - 10, "text-anchor": "middle", fill: candColors.stroke, "font-size": "12px", "font-weight": "700" }, "CANDIDATO"));

            svg.appendChild(candGroup);
        }

        if (frame.result && frame.result.length > 0) {
            svg.appendChild(svgEl("text", {
                x: STAGE_WIDTH / 2, y: STAGE_HEIGHT - 20, "text-anchor": "middle", fill: "var(--blue-700)", "font-size": "15px", "font-weight": "800"
            }, `Resultados das Janelas: [ ${frame.result.join(', ')} ]`));
        }

        const wrapper = el("div", {
            class: "deque-canvas-wrapper",
            style: "display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;"
        }, svg);

        this.container.replaceChildren(wrapper);
    }
}