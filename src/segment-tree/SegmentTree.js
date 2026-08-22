import { NodeStatus } from "./Enums.js";
import { SumStrategy } from "./Operations.js";

export class SegmentTree {
    constructor(array, strategy = SumStrategy) {
        this.size = array.length;
        this.array = [...array];
        this.operation = strategy;

        this.tree = new Array(this.size * 4).fill(null).map(() => ({
            id: null,
            range: [0, 0],
            value: this.operation.neutral,
            lazy: 0,
            status: NodeStatus.IDLE,
            isLeaf: false,
        }));

        this.history = [];

        this.build(array, 1, 0, this.size - 1);
        this._endRecording(`Árvore construída com ${this.size} elemento(s).`);
    }

    _saveFrame(message) {
        this.history.push({
            message,
            size: this.size,
            nodes: this.tree.map((node) => ({ ...node, range: [...node.range] })),
        })
    }

    // Volta todos os nós ao estado de repouso, preservando as lazy tags pendentes
    _resetStatuses() {
        for (const node of this.tree) {
            if (node.id === null) continue;
            node.status = node.lazy !== 0 ? NodeStatus.LAZY_PENDING : NodeStatus.IDLE;
        }
    }

    // Inicia a gravação de uma nova operação e a fita antiga é descartada
    _beginRecording(message) {
        this.history = [];
        this._resetStatuses();
        this._saveFrame(message);
    }

    // Fecha a gravação com um frame final "limpo"
    _endRecording(message) {
        this._resetStatuses();
        this._saveFrame(message);
    }

    build(array, nodeIndex, left, right) {
        if (left == right) {
            this.tree[nodeIndex] = {
                id: nodeIndex,
                range: [left, right],
                value: array[left],
                lazy: 0,
                status: NodeStatus.IDLE,
                isLeaf: true,
            };

            this._saveFrame(`Nó folha criado no índice [${left}] com valor ${array[left]}`);

            return;
        }

        let middle = Math.floor((left + right) / 2);
        this.build(array, 2 * nodeIndex, left, middle);
        this.build(array, 2 * nodeIndex + 1, middle + 1, right);

        let leftValue = this.tree[2 * nodeIndex].value,
            rightValue = this.tree[2 * nodeIndex + 1].value;

        this.tree[nodeIndex] = {
            id: nodeIndex,
            range: [left, right],

            value: this.operation.merge(leftValue, rightValue),

            lazy: 0,
            status: NodeStatus.IDLE,
            isLeaf: false
        };

        this._saveFrame(`Merge no intervalo [${left}, ${right}]. Valor atualizado para ${this.tree[nodeIndex].value}.`);
    }

    pushDown(nodeIndex, left, right) {
        let node = this.tree[nodeIndex];

        if (node.lazy === 0) return;

        node.status = NodeStatus.PUSHING_DOWN;
        this._saveFrame(`Iniciando push down no nó ${nodeIndex} (intervalo [${left}, ${right}])`);

        let middle = Math.floor((left + right) / 2);
        let leftChild = 2 * nodeIndex,
            rightChild  = 2 * nodeIndex + 1;

        let leftSize = middle - left + 1,
            rightSize = right - middle;

        this.tree[leftChild].value = this.operation.applyLazy(this.tree[leftChild].value, node.lazy, leftSize);
        this.tree[leftChild].lazy = this.operation.joinLazy(this.tree[leftChild].lazy, node.lazy);
        this.tree[leftChild].status = NodeStatus.LAZY_PENDING;

        this.tree[rightChild].value = this.operation.applyLazy(this.tree[rightChild].value, node.lazy, rightSize);
        this.tree[rightChild].lazy = this.operation.joinLazy(this.tree[rightChild].lazy, node.lazy);
        this.tree[rightChild].status = NodeStatus.LAZY_PENDING;

        node.lazy = 0;
        node.status = NodeStatus.IDLE;

        this._saveFrame(`Push down concluído. Filhos herdaram as Lazy Tags.`);
    }

    updateRange(nodeIndex, left, right, qLeft, qRight, newValue) {
        if (left > qRight || right < qLeft)
            return;

        this.tree[nodeIndex].status = NodeStatus.VISITING,
        this._saveFrame(`Visitando o nó do intervalo [${left}, ${right}]`);

        if (left >= qLeft && right <= qRight) {
            let rangeSize = right - left + 1;

            this.tree[nodeIndex].value = this.operation.applyLazy(this.tree[nodeIndex].value, newValue, rangeSize);
            this.tree[nodeIndex].lazy = this.operation.joinLazy(this.tree[nodeIndex].lazy, newValue)
            this.tree[nodeIndex].status = NodeStatus.LAZY_PENDING;

            this._saveFrame(`Intervalo [${left}, ${right}] totalmete coberto. Valor atualizado e Lazy Tag aplicada.`);

            return;
        }

        this.pushDown(nodeIndex, left, right);

        let middle = Math.floor((left + right) / 2);

        this.updateRange(2 * nodeIndex, left, middle, qLeft, qRight, newValue);
        this.updateRange(2 * nodeIndex + 1, middle + 1, right, qLeft, qRight, newValue);

        let leftValue = this.tree[2 * nodeIndex].value,
            rightValue = this.tree[2 * nodeIndex + 1].value;

        this.tree[nodeIndex].value = this.operation.merge(leftValue, rightValue);

        this.tree[nodeIndex].status = NodeStatus.UPDATING;
        this._saveFrame(`Merge no intervalo [${left}, ${right}]. Novo valor: ${this.tree[nodeIndex].value}`);

        this.tree[nodeIndex].status = this.tree[nodeIndex].lazy !== 0 ? NodeStatus.LAZY_PENDING : NodeStatus.IDLE;
    }

    // Atribui um novo valor a uma única posição do array
    updatePoint(nodeIndex, left, right, position, newValue) {
        this.tree[nodeIndex].status = NodeStatus.VISITING;
        this._saveFrame(`Descendo pelo nó do intervalo [${left}, ${right}] em busca do índice [${position}]`);

        if (left === right) {
            this.tree[nodeIndex].value = newValue;
            this.tree[nodeIndex].lazy = 0;
            this.tree[nodeIndex].status = NodeStatus.UPDATING;

            this._saveFrame(`Folha [${position}] recebeu o valor ${newValue}.`);
            return;
        }

        this.pushDown(nodeIndex, left, right);

        let middle = Math.floor((left + right) / 2);

        if (position <= middle)
            this.updatePoint(2 * nodeIndex, left, middle, position, newValue);
        else
            this.updatePoint(2 * nodeIndex + 1, middle + 1, right, position, newValue);

        let leftValue = this.tree[2 * nodeIndex].value,
            rightValue = this.tree[2 * nodeIndex + 1].value;

        this.tree[nodeIndex].value = this.operation.merge(leftValue, rightValue);

        this.tree[nodeIndex].status = NodeStatus.UPDATING;
        this._saveFrame(`Merge no intervalo [${left}, ${right}]. Novo valor: ${this.tree[nodeIndex].value}`);

        this.tree[nodeIndex].status = this.tree[nodeIndex].lazy !== 0 ? NodeStatus.LAZY_PENDING : NodeStatus.IDLE;
    }

    queryRange(nodeIndex, left, right, qLeft, qRight) {
        // Se tiver fora do intervalo devolve o elemento neutro para não contaminar o merge
        if (left > qRight || right < qLeft) return this.operation.neutral;

        let originalStatus = this.tree[nodeIndex].status;

        this.tree[nodeIndex].status = NodeStatus.VISITING;
        this._saveFrame(`Consultando nó no intervalo [${left}, ${right}]`);

        if (left >= qLeft && right <= qRight) {
            this.tree[nodeIndex].status = originalStatus;

            this._saveFrame(`Intervalo [${left}, ${right}] está dentro da query. Retornando valor: ${this.tree[nodeIndex].value}`);

            return this.tree[nodeIndex].value;
        }

        this.pushDown(nodeIndex, left, right);

        let middle = Math.floor((left + right) / 2);

        let leftResult = this.queryRange(2 * nodeIndex, left, middle, qLeft, qRight),
            rightResult = this.queryRange(2 * nodeIndex + 1, middle + 1, right, qLeft, qRight);

        this.tree[nodeIndex].status = originalStatus;

        let combinedResult = this.operation.merge(leftResult, rightResult);

        this._saveFrame(`Resultado da query no intervalo [${left}, ${right}] é ${combinedResult}`);
        return combinedResult;
    }


    runPointUpdate(position, newValue) {
        this._beginRecording(`Atualizando o índice [${position}] para o valor ${newValue}.`);
        this.updatePoint(1, 0, this.size - 1, position, newValue);
        this.array[position] = newValue;
        this._endRecording(`Índice [${position}] atualizado para ${newValue}.`);

        return this.history;
    }

    runRangeUpdate(qLeft, qRight, delta) {
        this._beginRecording(`Somando ${delta} a cada elemento do intervalo [${qLeft}, ${qRight}].`);
        this.updateRange(1, 0, this.size - 1, qLeft, qRight, delta);
        for (let i = qLeft; i <= qRight; i++) this.array[i] += delta;
        this._endRecording(`Intervalo [${qLeft}, ${qRight}] atualizado com +${delta}.`);

        return this.history;
    }

    runRangeQuery(qLeft, qRight) {
        this._beginRecording(`Consultando o intervalo [${qLeft}, ${qRight}].`);
        const result = this.queryRange(1, 0, this.size - 1, qLeft, qRight);
        this._endRecording(`Consulta em [${qLeft}, ${qRight}] concluída. Resultado: ${result}`);

        return { result, history: this.history };
    }
}