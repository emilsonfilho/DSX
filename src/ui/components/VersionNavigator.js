import { el } from "../dom.js";

export function VersionNavigator({
    onPrevious,
    onNext,
    onSelect,
} = {}) {
    const previousButton = el(
        "button",
        {
            class:
                "version-nav__arrow version-nav__arrow--previous",

            type: "button",

            title: "Versão anterior",

            "aria-label": "Visualizar versão anterior",

            onclick: () => onPrevious?.(),
        },
        "←"
    );

    const nextButton = el(
        "button",
        {
            class:
                "version-nav__arrow version-nav__arrow--next",

            type: "button",

            title: "Próxima versão",

            "aria-label": "Visualizar próxima versão",

            onclick: () => onNext?.(),
        },
        "→"
    );

    const currentLabel = el(
        "strong",
        {
            class: "version-nav__current",
        },
        "Nenhuma versão"
    );

    const parentLabel = el(
        "span",
        {
            class: "version-nav__parent",
        }
    );

    const timeline = el(
        "div",
        {
            class: "version-nav__timeline",
            "aria-label": "Histórico de versões",
        }
    );

    /*
     * Agora o root contém somente as informações
     * e a linha do tempo.
     *
     * As setas serão colocadas diretamente
     * nas laterais da área da árvore.
     */
    const root = el(
        "section",
        {
            class: "version-nav",
        },

        el(
            "div",
            {
                class: "version-nav__info",
            },

            currentLabel,
            parentLabel
        ),

        timeline
    );

    function renderTimeline(
        current,
        total
    ) {
        const buttons = [];

        for (
            let index = 0;
            index < total;
            index++
        ) {
            buttons.push(
                el(
                    "button",
                    {
                        class: "version-nav__version",

                        type: "button",

                        "aria-current":
                            index === current
                                ? "true"
                                : "false",

                        title:
                            `Abrir versão ${index}`,

                        onclick:
                            () => onSelect?.(index),
                    },

                    String(index)
                )
            );
        }

        timeline.replaceChildren(
            ...buttons
        );
    }

    return {
        root,

        /*
         * Expomos as setas separadamente para
         * PersistentSegmentTreeApp decidir
         * onde posicioná-las.
         */
        previousButton,
        nextButton,

        update({
            current,
            total,
            parentVersion,
        }) {
            currentLabel.textContent =
                `Versão ${current} de ${total - 1}`;

            parentLabel.textContent =
                parentVersion === null
                    ? "Versão inicial"
                    : `Criada a partir da versão ${parentVersion}`;

            previousButton.disabled =
                current <= 0;

            nextButton.disabled =
                current >= total - 1;

            renderTimeline(
                current,
                total
            );
        },

        clear() {
            currentLabel.textContent =
                "Nenhuma versão";

            parentLabel.textContent = "";

            previousButton.disabled = true;
            nextButton.disabled = true;

            timeline.replaceChildren();
        },
    };
}