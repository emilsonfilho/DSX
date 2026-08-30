import { NodeStatus } from "./Enums.js";
import { SumStrategy } from "./Operations.js";

import { HistoryRecorder }
    from "../state/HistoryRecorder.js";

import { VersionManager }
    from "../state/VersionManager.js";


export class PersistentSegmentTree {
    constructor(
        array,
        strategy = SumStrategy
    ) {
        this.size = array.length;
        this.operation = strategy;

        /*
         * Cada nó real da estrutura recebe um ID próprio.
         *
         * Esse ID é diferente da posição visual dele
         * na árvore.
         */
        this.nextNodeId = 1;

        this.versions =
            new VersionManager();

        /*
         * A construção inicial pertence à versão 0.
         */
        const root = this._build(
            array,
            0,
            this.size - 1,
            0
        );

        const initialNodes =
            this._collectNodeIds(root);

        this.versions.add({
            root,

            array: [...array],

            parentVersion: null,

            createdNodeIds:
                initialNodes,
        });

        this.buildHistory = [
            {
                message:
                    "Versão 0 criada.",

                detail:
                    "Esta é a árvore inicial. Todos os nós pertencem à primeira versão.",

                ...this._snapshot(0),
            },
        ];
    }

    get versionCount() {
        return this.versions.count;
    }

    get currentVersionIndex() {
        return this.versions
            .currentVersionIndex;
    }

    get currentVersion() {
        return this.versions.current;
    }


    // criação de no
    _createNode({
        left,
        right,
        value,

        leftChild = null,
        rightChild = null,

        createdVersion,
    }) {
        return {
            id: this.nextNodeId++,

            range: [left, right],

            value,

            leftChild,
            rightChild,

            createdVersion,

            isLeaf:
                left === right,
        };
    }


    // construtor
    _build(
        array,
        left,
        right,
        version
    ) {
        if (left === right) {
            return this._createNode({
                left,
                right,

                value: array[left],

                createdVersion:
                    version,
            });
        }

        const middle =
            Math.floor(
                (left + right) / 2
            );

        const leftChild =
            this._build(
                array,
                left,
                middle,
                version
            );

        const rightChild =
            this._build(
                array,
                middle + 1,
                right,
                version
            );

        return this._createNode({
            left,
            right,

            value:
                this.operation.merge(
                    leftChild.value,
                    rightChild.value
                ),

            leftChild,
            rightChild,

            createdVersion:
                version,
        });
    }


    // Atualizaçãp persistente
    _updatePoint(
        node,
        position,
        newValue,
        newVersionIndex,
        createdNodes
    ) {
        const [left, right] =
            node.range;

        /*
         * Chegamos à folha.
         *
         * Não alteramos a folha antiga:
         * criamos uma nova.
         */
        if (left === right) {
            const newNode =
                this._createNode({
                    left,
                    right,

                    value: newValue,

                    createdVersion:
                        newVersionIndex,
                });

            createdNodes.push({
                node: newNode,
                type: "leaf",
            });

            return newNode;
        }

        const middle =
            Math.floor(
                (left + right) / 2
            );

        let leftChild;
        let rightChild;
        let sharedSide;

        /*
         * Apenas o caminho que contém o índice
         * será recriado.
         *
         * O outro filho continua apontando
         * para o MESMO objeto da versão anterior.
         */
        if (position <= middle) {
            leftChild =
                this._updatePoint(
                    node.leftChild,
                    position,
                    newValue,
                    newVersionIndex,
                    createdNodes
                );

            rightChild =
                node.rightChild;

            sharedSide = "direito";
        }

        else {
            leftChild =
                node.leftChild;

            rightChild =
                this._updatePoint(
                    node.rightChild,
                    position,
                    newValue,
                    newVersionIndex,
                    createdNodes
                );

            sharedSide = "esquerdo";
        }

        /*
         * O ancestral também precisa ser novo,
         * porque seu valor mudou.
         */
        const newNode =
            this._createNode({
                left,
                right,

                value:
                    this.operation.merge(
                        leftChild.value,
                        rightChild.value
                    ),

                leftChild,
                rightChild,

                createdVersion:
                    newVersionIndex,
            });

        createdNodes.push({
            node: newNode,
            type: "internal",
            sharedSide,
        });

        return newNode;
    }


    runPointUpdate(
        position,
        newValue
    ) {
        const baseVersionIndex =
            this.currentVersionIndex;

        const baseVersion =
            this.currentVersion;

        const newVersionIndex =
            this.versionCount;

        const createdNodes = [];

        const newRoot =
            this._updatePoint(
                baseVersion.root,
                position,
                newValue,
                newVersionIndex,
                createdNodes
            );

        const newArray =
            [...baseVersion.array];

        newArray[position] =
            newValue;

        /*
         * Guardamos a nova raiz.
         *
         * As versões anteriores continuam
         * apontando para suas raízes antigas.
         */
        const versionIndex =
            this.versions.add({
                root: newRoot,

                array: newArray,

                parentVersion:
                    baseVersionIndex,

                createdNodeIds:
                    new Set(
                        createdNodes.map(
                            ({ node }) =>
                                node.id
                        )
                    ),
            });

        /*
         * Agora geramos a animação.
         *
         * A árvore já existe; o playback apenas
         * mostra quais nós precisaram ser criados.
         */
        let activeNodeId = null;

        const recorder =
            new HistoryRecorder(
                () =>
                    this._snapshot(
                        versionIndex,
                        {
                            activeNodeId,

                            activeStatus:
                                NodeStatus.UPDATING,
                        }
                    )
            );

        recorder.beginRecording(
            `Criando versão ${versionIndex}.`,
            `Baseada na versão ${baseVersionIndex}; índice [${position}] receberá ${newValue}.`
        );

        for (
            const created
            of createdNodes
        ) {
            activeNodeId =
                created.node.id;

            const [
                left,
                right
            ] =
                created.node.range;

            if (
                created.type ===
                "leaf"
            ) {
                recorder.saveFrame(
                    `Nova folha [${left}] criada.`,
                    `Valor ${newValue}; a folha da versão anterior continua preservada.`
                );

                continue;
            }

            recorder.saveFrame(
                `Novo nó [${left}, ${right}] criado.`,
                `O filho ${created.sharedSide} foi reaproveitado da versão anterior.`
            );
        }

        activeNodeId = null;

        recorder.endRecording(
            `Versão ${versionIndex} criada.`,
            `${createdNodes.length} novo(s) nó(s); o restante da árvore foi compartilhado.`
        );

        return {
            versionIndex,

            baseVersionIndex,

            createdNodes:
                createdNodes.length,

            history:
                recorder.getHistory(),
        };
    }


    // Consulta
    _queryRange(
        node,
        qLeft,
        qRight,
        onVisit,
        onResult
    ) {
        if (!node) {
            return this.operation.neutral;
        }

        const [left, right] =
            node.range;

        if (
            right < qLeft ||
            left > qRight
        ) {
            return this.operation.neutral;
        }

        onVisit?.(node);

        if (
            qLeft <= left &&
            right <= qRight
        ) {
            onResult?.(
                node,
                node.value,
                true
            );

            return node.value;
        }

        const leftResult =
            this._queryRange(
                node.leftChild,
                qLeft,
                qRight,
                onVisit,
                onResult
            );

        const rightResult =
            this._queryRange(
                node.rightChild,
                qLeft,
                qRight,
                onVisit,
                onResult
            );

        const result =
            this.operation.merge(
                leftResult,
                rightResult
            );

        onResult?.(
            node,
            result,
            false
        );

        return result;
    }


    runRangeQuery(
        qLeft,
        qRight
    ) {
        const versionIndex =
            this.currentVersionIndex;

        const version =
            this.currentVersion;

        let activeNodeId = null;
        let activeStatus =
            NodeStatus.VISITING;

        const recorder =
            new HistoryRecorder(
                () =>
                    this._snapshot(
                        versionIndex,
                        {
                            activeNodeId,
                            activeStatus,
                        }
                    )
            );

        recorder.beginRecording(
            `Consultar [${qLeft}, ${qRight}] na versão ${versionIndex}.`
        );

        const result =
            this._queryRange(
                version.root,

                qLeft,
                qRight,

                (node) => {
                    activeNodeId =
                        node.id;

                    activeStatus =
                        NodeStatus.VISITING;

                    const [
                        left,
                        right
                    ] =
                        node.range;

                    recorder.saveFrame(
                        `Consultando [${left}, ${right}].`,
                        `Intervalo desejado: [${qLeft}, ${qRight}].`
                    );
                },

                (
                    node,
                    partialResult,
                    fullyCovered
                ) => {
                    activeNodeId =
                        node.id;

                    activeStatus =
                        NodeStatus.UPDATING;

                    const [
                        left,
                        right
                    ] =
                        node.range;

                    if (
                        fullyCovered
                    ) {
                        recorder.saveFrame(
                            `[${left}, ${right}] está totalmente dentro.`,
                            `Retorna ${partialResult}.`
                        );

                        return;
                    }

                    recorder.saveFrame(
                        `Resultado em [${left}, ${right}]: ${partialResult}.`,
                        "Combinação dos resultados dos filhos."
                    );
                }
            );

        activeNodeId = null;

        recorder.endRecording(
            `Consulta concluída: ${result}.`,
            `Versão ${versionIndex}.`
        );

        return {
            result,

            versionIndex,

            history:
                recorder.getHistory(),
        };
    }


    // Versões
    selectVersion(index) {
        return this.versions.goTo(
            index
        );
    }

    previousVersion() {
        return this.versions.previous();
    }

    nextVersion() {
        return this.versions.next();
    }

    getVersionMeta(
        index =
            this.currentVersionIndex
    ) {
        const version =
            this.versions.get(index);

        if (!version) {
            return null;
        }

        return {
            index,

            total:
                this.versionCount,

            parentVersion:
                version.parentVersion,

            createdNodes:
                version
                    .createdNodeIds
                    .size,
        };
    }


    // SNAPSHOT PARA O TREE RENDERER
    _snapshot(
        versionIndex,
        {
            activeNodeId = null,
            activeStatus = null,
        } = {}
    ) {
        const version =
            this.versions.get(
                versionIndex
            );

        const nodes =
            new Array(
                this.size * 4
            ).fill(null);

        const walk = (
            node,
            visualIndex
        ) => {
            if (!node) {
                return;
            }

            let status;

            if (
                node.id ===
                activeNodeId
            ) {
                status =
                    activeStatus;
            }

            else if (
                node.createdVersion ===
                versionIndex
            ) {
                status =
                    NodeStatus
                        .PERSISTENT_NEW;
            }

            else {
                status =
                    NodeStatus
                        .PERSISTENT_SHARED;
            }

            nodes[visualIndex] = {
                id: node.id,

                range:
                    [...node.range],

                value:
                    node.value,

                lazy: 0,

                status,

                isLeaf:
                    node.isLeaf,
            };

            if (
                node.leftChild
            ) {
                walk(
                    node.leftChild,
                    visualIndex * 2
                );
            }

            if (
                node.rightChild
            ) {
                walk(
                    node.rightChild,
                    visualIndex * 2 + 1
                );
            }
        };

        walk(
            version.root,
            1
        );

        return {
            size: this.size,
            nodes,
            versionIndex,
        };
    }


    getFrame(
        versionIndex =
            this.currentVersionIndex
    ) {
        const meta =
            this.getVersionMeta(
                versionIndex
            );

        return {
            message:
                `Versão ${versionIndex}.`,

            detail:
                meta.parentVersion === null
                    ? "Versão inicial da árvore."
                    : `Criada a partir da versão ${meta.parentVersion}.`,

            ...this._snapshot(
                versionIndex
            ),
        };
    }


    getBuildHistory() {
        return this.buildHistory;
    }


    // Utils
    _collectNodeIds(root) {
        const ids = new Set();

        const walk = (node) => {
            if (!node) {
                return;
            }

            ids.add(node.id);

            walk(node.leftChild);
            walk(node.rightChild);
        };

        walk(root);

        return ids;
    }
}