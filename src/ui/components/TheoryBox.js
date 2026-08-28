import { el } from "../dom.js";

let theoryBoxCounter = 0;

/**
 * Abre a teoria da estrutura em uma caixa ampla sobre a interface.
 * O painel lateral mantém apenas o acionador para não disputar espaço
 * com a visualização e com as operações da estrutura.
 */
export function TheoryBox(title, sections, { description = "" } = {}) {
    const id = `theory-dialog-${++theoryBoxCounter}`;
    const titleId = `${id}-title`;

    let previouslyFocusedElement = null;

    const sectionGrid = el(
        "div",
        { class: "theory__sections" },
        sections.map(({ heading, text, items = [] }) =>
            el(
                "section",
                { class: "theory__section" },

                el(
                    "h3",
                    { class: "theory__heading" },
                    heading
                ),

                text
                    ? el(
                        "p",
                        { class: "theory__text" },
                        text
                    )
                    : null,

                items.length
                    ? el(
                        "ul",
                        { class: "theory__list" },

                        items.map((item) =>
                            el(
                                "li",
                                { class: "theory__list-item" },
                                item
                            )
                        )
                    )
                    : null
            )
        )
    );

    const closeButton = el(
        "button",
        {
            class: "theory__close",
            type: "button",
            "aria-label": "Fechar teoria da estrutura",
            title: "Fechar",
            onclick: () => api.close(),
        },
        "×"
    );

    const dialog = el(
        "div",
        {
            class: "theory__dialog",
            id,
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": titleId,
            tabindex: "-1",
        },

        el(
            "header",
            { class: "theory__header" },

            el(
                "div",
                { class: "theory__header-copy" },

                el(
                    "span",
                    { class: "theory__eyebrow" },
                    "TEORIA DA ESTRUTURA"
                ),

                el(
                    "h2",
                    {
                        class: "theory__title",
                        id: titleId,
                    },
                    title
                ),

                description
                    ? el(
                        "p",
                        { class: "theory__description" },
                        description
                    )
                    : null
            ),

            closeButton
        ),

        sectionGrid
    );

    const overlay = el(
        "div",
        {
            class: "theory__overlay",
            hidden: true,

            onclick: (event) => {
                if (event.target === overlay) {
                    api.close();
                }
            },
        },

        dialog
    );

    const icon = el(
        "span",
        {
            class: "theory__icon",
            "aria-hidden": "true",
        },
        "i"
    );

    const caret = el(
        "span",
        {
            class: "theory__trigger-caret",
            "aria-hidden": "true",
        },
        "↗"
    );

    const trigger = el(
        "button",
        {
            class: "theory__trigger",
            type: "button",
            "aria-haspopup": "dialog",
            "aria-controls": id,
            "aria-expanded": "false",

            onclick: () => api.open(),
        },

        icon,
        el("span", {}, "Teoria da estrutura"),
        caret
    );

    const root = el(
        "section",
        { class: "theory" },
        trigger,
        overlay
    );

    function onKeyDown(event) {
        if (event.key === "Escape") {
            api.close();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusable = dialog.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusable.length) {
            event.preventDefault();
            dialog.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        }

        else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

    const api = {
        root,

        get isOpen() {
            return !overlay.hidden;
        },

        open() {
            if (api.isOpen) {
                return;
            }

            previouslyFocusedElement =
                document.activeElement;

            overlay.hidden = false;

            trigger.setAttribute(
                "aria-expanded",
                "true"
            );

            root.classList.add(
                "theory--open"
            );

            document.body.classList.add(
                "theory-modal-open"
            );

            document.addEventListener(
                "keydown",
                onKeyDown
            );

            closeButton.focus();
        },

        close() {
            if (!api.isOpen) {
                return;
            }

            overlay.hidden = true;

            trigger.setAttribute(
                "aria-expanded",
                "false"
            );

            root.classList.remove(
                "theory--open"
            );

            document.body.classList.remove(
                "theory-modal-open"
            );

            document.removeEventListener(
                "keydown",
                onKeyDown
            );

            if (
                previouslyFocusedElement
                instanceof HTMLElement
            ) {
                previouslyFocusedElement.focus();
            }
        },
    };

    return api;
}