import {
    PersistentSegmentTree
} from "../segment-tree/PersistentSegmentTree.js";

import {
    Strategies
} from "../segment-tree/Operations.js";

import {
    NodeStatus
} from "../segment-tree/Enums.js";

import {
    StateManager
} from "../state/StateManager.js";

import {
    el,
    FeedbackType,
    formatValue
} from "../ui/dom.js";

import {
    TreeRenderer
} from "../visualization/TreeRenderer.js";

import {
    PersistentControlPanel
} from "../ui/PersistentControlPanel.js";

import {
    Playback
} from "../ui/components/Playback.js";

import {
    VersionNavigator
} from "../ui/components/VersionNavigator.js";

import {
    parseArray,
    parseIndex,
    parseNumber,
    parseRange,
    COMFORTABLE_ELEMENTS
} from "../ui/validation.js";


const LEGEND = [
    [
        NodeStatus.PERSISTENT_NEW,
        "Novo nesta versão"
    ],

    [
        NodeStatus.PERSISTENT_SHARED,
        "Reaproveitado"
    ],

    [
        NodeStatus.VISITING,
        "Visitando"
    ],

    [
        NodeStatus.UPDATING,
        "Em atualização"
    ],
];


export class PersistentSegmentTreeApp {
    constructor(root) {
        this.root = root;

        this.tree = null;

        this.panel =
            PersistentControlPanel({
                onBuild:
                    (input) =>
                        this.handleBuild(
                            input
                        ),

                onPointUpdate:
                    (input) =>
                        this.handlePointUpdate(
                            input
                        ),

                onRangeQuery:
                    (input) =>
                        this.handleRangeQuery(
                            input
                        ),

                onStrategyChange:
                    (strategyKey) =>
                        this.handleStrategyChange(
                            strategyKey
                        ),
            });

        this.playback =
            Playback({
                onPrev:
                    () =>
                        this.player.prev(),

                onNext:
                    () =>
                        this.player.next(),

                onToggle:
                    () =>
                        this.player.toggle(),

                onScrub:
                    (index) =>
                        this.player.goTo(
                            index
                        ),

                onSpeed:
                    (ms) =>
                        this.player.setSpeed(
                            ms
                        ),
            });

        this.versionNavigator =
            VersionNavigator({
                onPrevious:
                    () =>
                        this.openPreviousVersion(),

                onNext:
                    () =>
                        this.openNextVersion(),

                onSelect:
                    (index) =>
                        this.openVersion(
                            index
                        ),
            });

        this.player =
            new StateManager();

        this.player.on(
            "frameChange",
            (
                frame,
                index,
                total
            ) => {
                this.renderer.render(
                    frame
                );

                this.playback.update(
                    frame,
                    index,
                    total
                );
            }
        );

        this.player.on(
            "playStateChange",
            (isPlaying) =>
                this.playback
                    .setPlaying(
                        isPlaying
                    )
        );

        this.player.setSpeed(
            600
        );

        this.mount();

        this.panel
            .setOperationsEnabled(
                false
            );

        this.versionNavigator
            .clear();
    }


    mount() {
        const canvas =
            el(
                "div",
                {
                    class:
                        "tree-canvas",
                }
            );
        
        
        const treeStage = el(
            "div",
            {
                class: "persistent-tree-stage",
            },

            this.versionNavigator.previousButton,

            canvas,

            this.versionNavigator.nextButton
        );
        

        const legend =
            el(
                "ul",
                {
                    class:
                        "legend persistent-legend",
                },

                LEGEND.map(
                    (
                        [
                            status,
                            label
                        ]
                    ) =>
                        el(
                            "li",
                            {
                                class:
                                    "legend__item",
                            },

                            el(
                                "span",
                                {
                                    class:
                                        `legend__dot legend__dot--${status}`,
                                }
                            ),

                            label
                        )
                )
            );

        this.root.replaceChildren(
            el(
                "div",
                {
                    class:
                        "workspace",
                },

                el(
                    "section",
                    {
                        class:
                            "tree-card persistent-tree-card",
                    },

                    /*
                    * Primeiro vem a visualização.
                    * As setas ficam nas laterais dela.
                    */
                    treeStage,

                    /*
                    * Depois vem o histórico das versões.
                    */
                    this.versionNavigator.root,

                    legend,

                    this.playback.root
                ),

                this.panel.root
            )
        );

        /*
         * Utiliza o mesmo renderer da Lazy.
         *
         * O core persistente transforma sua árvore
         * de referências em um snapshot compatível.
         */
        this.renderer =
            new TreeRenderer(
                canvas
            );
    }


    /* =====================================================
       CONSTRUÇÃO
       ===================================================== */

    handleBuild({
        array,
        strategyKey
    }) {
        const parsed =
            parseArray(array);

        if (!parsed.ok) {
            return this.fail(
                parsed.error
            );
        }

        const option =
            Strategies[
                strategyKey
            ];

        this.tree =
            new PersistentSegmentTree(
                parsed.value,
                option.strategy
            );

        this.player.loadHistory(
            this.tree
                .getBuildHistory()
        );

        this.panel
            .setOperationsEnabled(
                true
            );

        this.panel
            .clearOperationInputs();

        this.updateVersionNavigator();

        const warning =
            parsed.value.length >
            COMFORTABLE_ELEMENTS
                ? " Arrays grandes podem exigir zoom."
                : "";

        this.panel.setFeedback(
            `Versão 0 criada com ${parsed.value.length} elemento(s).${warning}`,
            FeedbackType.SUCCESS
        );
    }


    /* =====================================================
       NOVA VERSÃO
       ===================================================== */

    handlePointUpdate({
        index,
        value
    }) {
        if (!this.requireTree()) {
            return;
        }

        const position =
            parseIndex(
                index,
                "Digite o índice",
                this.tree.size
            );

        if (!position.ok) {
            return this.fail(
                position.error
            );
        }

        const newValue =
            parseNumber(
                value,
                "Insira o valor"
            );

        if (!newValue.ok) {
            return this.fail(
                newValue.error
            );
        }

        const {
            versionIndex,
            baseVersionIndex,
            createdNodes,
            history
        } =
            this.tree
                .runPointUpdate(
                    position.value,
                    newValue.value
                );

        this.player.loadHistory(
            history
        );

        this.updateVersionNavigator();

        this.panel.setFeedback(
            `Versão ${versionIndex} criada a partir da versão ${baseVersionIndex}. ${createdNodes} novo(s) nó(s) foram necessários.`,
            FeedbackType.SUCCESS
        );
    }


    /* =====================================================
       CONSULTA
       ===================================================== */

    handleRangeQuery({
        start,
        end
    }) {
        if (!this.requireTree()) {
            return;
        }

        const range =
            parseRange(
                start,
                end,
                this.tree.size
            );

        if (!range.ok) {
            return this.fail(
                range.error
            );
        }

        const [
            left,
            right
        ] =
            range.value;

        const {
            result,
            history,
            versionIndex
        } =
            this.tree
                .runRangeQuery(
                    left,
                    right
                );

        this.player.loadHistory(
            history
        );

        const option =
            Object
                .values(
                    Strategies
                )
                .find(
                    (item) =>
                        item.strategy ===
                        this.tree.operation
                );

        this.panel.setFeedback(
            `${option?.resultLabel ?? "Resultado"} de [${left}, ${right}] na versão ${versionIndex} = ${formatValue(result)}`,
            FeedbackType.RESULT
        );
    }


    /* =====================================================
       NAVEGAÇÃO ENTRE VERSÕES
       ===================================================== */

    openPreviousVersion() {
        if (!this.requireTree()) {
            return;
        }

        const target =
            this.tree
                .currentVersionIndex -
            1;

        this.openVersion(
            target
        );
    }


    openNextVersion() {
        if (!this.requireTree()) {
            return;
        }

        const target =
            this.tree
                .currentVersionIndex +
            1;

        this.openVersion(
            target
        );
    }


    openVersion(index) {
        if (!this.requireTree()) {
            return;
        }

        if (
            !this.tree
                .selectVersion(index)
        ) {
            return;
        }

        /*
         * Ao trocar de versão não queremos reproduzir
         * uma operação antiga.
         */
        this.player.pause();

        this.playback.reset();

        this.renderer.render(
            this.tree.getFrame(
                index
            )
        );

        this.updateVersionNavigator();

        const meta =
            this.tree
                .getVersionMeta(
                    index
                );

        if (
            meta.parentVersion ===
            null
        ) {
            this.panel.setFeedback(
                "Visualizando a versão inicial.",
                FeedbackType.INFO
            );

            return;
        }

        this.panel.setFeedback(
            `Visualizando versão ${index}, criada a partir da versão ${meta.parentVersion}.`,
            FeedbackType.INFO
        );
    }


    updateVersionNavigator() {
        if (!this.tree) {
            this.versionNavigator
                .clear();

            return;
        }

        const meta =
            this.tree
                .getVersionMeta();

        this.versionNavigator.update({
            current:
                meta.index,

            total:
                meta.total,

            parentVersion:
                meta.parentVersion,
        });
    }


    /* =====================================================
       TROCA DE OPERAÇÃO
       ===================================================== */

    handleStrategyChange(
        strategyKey
    ) {
        if (!this.tree) {
            return;
        }

        this.tree = null;

        this.player.pause();

        this.player
            .loadHistory([]);

        this.renderer.clear(
            "Operação alterada. Construa a árvore novamente."
        );

        this.playback.reset();

        this.versionNavigator
            .clear();

        this.panel
            .setOperationsEnabled(
                false
            );

        const option =
            Strategies[
                strategyKey
            ];

        this.panel.setFeedback(
            `Operação alterada para ${option.label}. Construa uma nova árvore persistente.`,
            FeedbackType.INFO
        );
    }


    /* =====================================================
       UTILS
       ===================================================== */

    requireTree() {
        if (this.tree) {
            return true;
        }

        this.fail(
            "Construa uma árvore antes de executar operações."
        );

        return false;
    }


    fail(message) {
        this.panel.setFeedback(
            message,
            FeedbackType.ERROR
        );
    }


    destroy() {
        this.player?.pause();

        this.tree = null;

        this.root
            .replaceChildren();
    }
}