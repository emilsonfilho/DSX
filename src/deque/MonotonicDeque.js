import { AscendingComparator } from "../segment-tree/Operations";
import { Deque } from "./Deque";
import { HistoryRecorder } from "../state/HistoryRecorder.js";

/**
 * Double-ended queue that maintains its elements in monotonic order.
 *
 * Elements are stored as [value, index] pairs. The comparator determines
 * which elements should be removed from the back when a new value is
 * inserted, allowing the deque to efficiently support monotonic
 * sliding-window operations.
 *
 * The class also records the changes performed on the deque through a
 * {@link HistoryRecorder}, allowing the execution of the algorithm to be
 * visualized or inspected afterwards.
 */
export class MonotonicDeque {
    /**
     * Creates a monotonic deque.
     *
     * @param {Function} [comparator=AscendingComparator]
     * Comparator used to determine whether the deque's monotonic property
     * is preserved. The comparator receives the value at the back of the
     * deque and the value being inserted.
     */
    constructor(comparator = AscendingComparator) {
        this.deque = new Deque();
        this.comparator = comparator;

        this.recorder = new HistoryRecorder(() => ( {
            elements: this.deque.toArray(),
        }))
    }

    /**
     * Inserts a value into the deque while preserving its monotonicity.
     *
     * Elements at the back of the deque that are no longer useful according
     * to the comparator are removed before the new value is inserted.
     *
     * @param {*} value
     * Value to insert.
     *
     * @param {number} index
     * Index associated with the value, typically its position in the
     * original array.
     *
     * @returns {void}
     */
    push(value, index) {
        while (!this.deque.empty() && !this.comparator(this.deque.back[0], value)) {
            const removed = this.deque.pop();

            this.recorder.saveFrame(`Removendo valor ${removed[0]} do final para manter a motonicidade.`);

        }

        this.deque.push([value, index]);
        this.recorder.saveFrame(`Valor ${value} adicionado ao final do Deque.`);
    }

    /**
     * Removes elements that are outside the current sliding-window limit.
     *
     * Elements are removed from the front while their associated index is
     * smaller than the specified limit.
     *
     * @param {number} limit
     * Minimum valid index for the current sliding window.
     *
     * @returns {void}
     */
    pop(limit) {
        while (!this.deque.empty() && this.deque.front[1] < limit) {
            const removed = this.deque.shift();
            this.recorder.saveFrame(`Valor ${removed[0]} descartado pois está fora do limite da janela.`);
        }
    }

    /**
     * Determines whether the deque contains no elements.
     *
     * @returns {boolean}
     * `true` if the deque is empty; otherwise, `false`.
     */
    empty() {
        return this.deque.empty();
    }

    /**
     * Returns the value at the front of the deque.
     *
     * @returns {*|undefined}
     * The value stored at the front, or `undefined` if the deque is empty.
     */
    front() {
        if (this.empty())
            return undefined;

        return this.deque.front[0];
    }

    /**
     * Executes a single insertion while recording the entire operation.
     *
     * Starts a new recording, inserts the value, records the final state,
     * and returns the resulting history.
     *
     * @param {*} value
     * Value to insert.
     *
     * @param {number} index
     * Index associated with the value.
     *
     * @returns {Array<Object>}
     * History containing the states generated during the insertion.
     */
    runPushBack(value, index) {
        this.recorder.beginRecording(`Iniciando inserção do valor ${value}.`);

        this.push(value, index);

        this.recorder.endRecording(`Inserção do valor ${value} finalizada.`);
        return this.recorder.getHistory();
    }

    runPushFront(value, index) {
        this.recorder.beginRecording(`Iniciando inserção manual na frente.`);

        // Inserção direta na frente (usando o unshift do seu Deque.js)
        this.deque.unshift([value, index]);

        this.recorder.endRecording(`Valor ${value} empurrado (Push) no Front.`);
        return this.recorder.getHistory();
    }

    runPopFront() {
        this.recorder.beginRecording(`Removendo elemento da frente (Pop Front).`);

        if (this.empty()) {
            this.recorder.endRecording(`Operação cancelada: O deque já está vazio.`);
            return this.recorder.getHistory();
        }

        const removed = this.deque.shift(); // Remove da frente

        this.recorder.endRecording(`Valor ${removed[0]} removido da frente com sucesso.`);
        return this.recorder.getHistory();
    }

    runPopBack() {
        this.recorder.beginRecording(`Removendo elemento do final (Pop Back).`);

        if (this.empty()) {
            this.recorder.endRecording(`Operação cancelada: O deque já está vazio.`);
            return this.recorder.getHistory();
        }

        const removed = this.deque.pop(); // Remove do final

        this.recorder.endRecording(`Valor ${removed[0]} removido do final com sucesso.`);
        return this.recorder.getHistory();
    }

    /**
     * Executes the monotonic deque algorithm for a sliding window.
     *
     * For each element in the input array, elements outside the current
     * window are removed and the new element is inserted while preserving
     * monotonicity. Once the first complete window is reached, the best
     * value according to the comparator is added to the result.
     *
     * @param {Array<*>} array
     * Input array to process.
     *
     * @param {number} k
     * Size of the sliding window.
     *
     * @returns {{
     *   result: Array<*>,
     *   history: Array<Object>
     * }}
     * Object containing the best value for each complete sliding window
     * and the history of the algorithm's execution.
     */
    runSlidingWindow(array, k) {
        this.recorder.beginRecording(`Iniciando Janela Deslizante de tamanho ${k}.`);
        while (!this.empty()) this.deque.pop();

        const result = [];

        for (let i = 0; i < array.length; i++) {
            const current = array[i];
            const cand = [current, i];

            // Helper para injetar os estados extras no frame (Candidato e Resultado)
            const baseState = () => ({ candidate: cand, result: [...result] });

            this.recorder.saveFrame(`i=${i}, A[${i}]=${current}`, { ...baseState(), status: 'idle' });

            // ==========================================
            // 1. POP EXPIRED (Verifica o limite da Janela)
            // ==========================================
            if (i >= k) {
                const expiredIdx = i - k;
                // Lembrando que no nosso Deque.js, o getter front devolve o [valor, índice]
                const isFrontExpired = !this.empty() && this.deque.front[1] === expiredIdx;

                const msg = `Janela (${i - k + 1}..${i}) → Saiu ${expiredIdx}. A[${expiredIdx}] ∈ L? ${isFrontExpired ? 'YES' : 'NO'}`;

                if (isFrontExpired) {
                    // Fica vermelho apontando pro primeiro elemento
                    this.recorder.saveFrame(msg, { ...baseState(), status: 'expired', target: 'front' });
                    this.deque.shift();
                    this.recorder.saveFrame(`${msg}\nRemovido da frente.`, { ...baseState(), status: 'idle' });
                } else {
                    this.recorder.saveFrame(msg, { ...baseState(), status: 'idle' });
                }
            }

            // ==========================================
            // 2. PUSH (Dança da Monotonicidade)
            // ==========================================
            while (!this.empty()) {
                const backVal = this.deque.back[0];

                // Frame 1: Laranja (Avaliando)
                this.recorder.saveFrame(`Comparando candidato ${current} com o fim da deque (${backVal})...`, { ...baseState(), status: 'compare', target: 'back' });

                if (!this.comparator(backVal, current)) {
                    // Frame 2: Vermelho (Violação) -> REMOVE
                    this.recorder.saveFrame(`${current} < ${backVal} → REMOVE`, { ...baseState(), status: 'violate', target: 'back' });
                    this.deque.pop();
                } else {
                    // Frame 2: Verde (Válido) -> ADD
                    this.recorder.saveFrame(`${current} ≮ ${backVal} → ADD`, { ...baseState(), status: 'valid', target: 'back' });
                    break;
                }
            }

            if (this.empty()) {
                this.recorder.saveFrame(`L = ∅ → Não tem ninguém, ADD`, { ...baseState(), status: 'idle' });
            }

            this.deque.push([current, i]);

            // Mostra como a deque ficou após a inserção ⟨ 3, 5 ⟩
            const elementsStr = this.deque.toArray().map(e => e[0]).join(',');
            this.recorder.saveFrame(`L_f = ⟨ ${elementsStr} ⟩`, { result: [...result] });

            // ==========================================
            // 3. COLETAR RESULTADO DA JANELA
            // ==========================================
            if (i >= k - 1) {
                const best = this.deque.front[0];
                result.push(best);
                this.recorder.saveFrame(`JANELA ${i - k + 2}: L[0] = ${best}`, { result: [...result] });
            }
        }

        this.recorder.endRecording(`Resultado Final:\n[ ${result.join(', ')} ]`);
        return { result, history: this.recorder.getHistory() };
    }
}