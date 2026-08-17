import { NodeStatus } from "./Enums.js";
import { SumStrategy } from "./Operations.js";

export class SegmentTree {
    constructor(array, strategy = SumStrategy) {
        this.size = array.length;
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
    }

    _saveFrame(message) {
        this.history.push({
            message,
            nodes: JSON.parse(JSON.stringify(this.tree)),
        })
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

        let previousStatus = this.tree[nodeIndex].status;
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

    queryRange(nodeIndex, left, right, qLeft, qRight) {
        if (left > qRight || right < qLeft) return;

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
}