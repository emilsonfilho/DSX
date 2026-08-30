import { el } from "../ui/dom.js";

import { LazySegmentTreeApp }
    from "./LazySegmentTreeApp.js";

import { PersistentSegmentTreeApp }
    from "./PersistentSegmentTreeApp.js";

import {
    SegmentTreeMode,
    SegmentTreeModeSelector,
} from "../ui/components/SegmentTreeModeSelector.js";


export class SegmentTreeApp {
    constructor(root) {
        this.root = root;

        this.currentMode = null;
        this.currentApp = null;

        this.content = el(
            "div",
            {
                class:
                    "segment-tree-mode-content",
            }
        );

        this.modeSelector =
            SegmentTreeModeSelector({
                value: SegmentTreeMode.LAZY,

                onChange: (mode) => {
                    this.selectMode(mode);
                },
            });

        this.mount();

        /*
         * Lazy Propagation é sempre a implementação
         * aberta inicialmente.
         */
        this.selectMode(
            SegmentTreeMode.LAZY
        );
    }

    mount() {
        const header = el(
            "div",
            {
                class:
                    "page__header page__header--segment-tree",
            },

            el(
                "h1",
                { class: "page__title" },
                "Visualizador de Árvore de Segmentos"
            ),

            this.modeSelector.root
        );

        this.root.replaceChildren(
            el(
                "main",
                { class: "page" },

                header,

                this.content
            )
        );
    }

    selectMode(mode) {
        if (mode === this.currentMode) {
            return;
        }

        /*
         * Desmonta completamente a implementação
         * anterior antes de criar a próxima.
         */
        this.currentApp?.destroy?.();

        this.currentApp = null;

        this.content.replaceChildren();

        switch (mode) {
            case SegmentTreeMode.PERSISTENT:
                this.currentApp =
                    new PersistentSegmentTreeApp(
                        this.content
                    );
                break;

            case SegmentTreeMode.LAZY:
            default:
                this.currentApp =
                    new LazySegmentTreeApp(
                        this.content
                    );
                break;
        }

        this.currentMode = mode;
    }

    destroy() {
        this.currentApp?.destroy?.();

        this.currentApp = null;
        this.currentMode = null;

        this.root.replaceChildren();
    }
}