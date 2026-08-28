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
        this.recorder.beginRecording(
            `Iniciando a Janela Deslizante com tamanho ${k}.`,
            `Vamos processar o array: [ ${array.join(', ')} ]`
        );

        while (!this.empty()) this.deque.pop();
        const result = [];

        for (let i = 0; i < array.length; i++) {
            const current = array[i];
            const cand = [current, i];

            const baseState = () => ({ candidate: cand, result: [...result] });

            // Calcula o limite atual da janela para mostrar na descrição
            const windowStart = Math.max(0, i - k + 1);
            const windowInfo = `A janela atual abrange os índices de <strong>${windowStart} até ${i}</strong>.`;

            // Helper para formatar a lista de resultados no rodapé e adicionar os detalhes da janela
            const getDetail = (extraInfo = "") => {
                const resStr = result.length > 0
                    ? `Resultados já encontrados: [ ${result.join(', ')} ]`
                    : `Nenhuma janela foi totalmente percorrida ainda.`;
                return extraInfo ? `${extraInfo}<br><br>${resStr}` : resStr;
            };

            this.recorder.saveFrame(
                `<strong>Analisando o elemento ${current}</strong> (que está na posição ${i}).`,
                getDetail(windowInfo),
                { ...baseState(), status: 'idle' }
            );

            // ==========================================
            // 1. POP EXPIRED (Limpando o que ficou pra trás)
            // ==========================================
            if (i >= k) {
                const expiredIdx = i - k;
                const isFrontExpired = !this.empty() && this.deque.front[1] === expiredIdx;

                if (isFrontExpired) {
                    this.recorder.saveFrame(
                        `A janela andou! O elemento que está no início da fila pertence ao índice ${expiredIdx}, que já ficou para trás.`,
                        getDetail(windowInfo),
                        { ...baseState(), status: 'expired', target: 'front' }
                    );
                    this.deque.shift();
                    this.recorder.saveFrame(
                        `Descartamos o elemento antigo da frente da fila.`,
                        getDetail(windowInfo),
                        { ...baseState(), status: 'idle' }
                    );
                } else {
                    this.recorder.saveFrame(
                        `A janela andou, mas o elemento no início da fila ainda está dentro da área abrangida pela janela.`,
                        getDetail(windowInfo),
                        { ...baseState(), status: 'idle' }
                    );
                }
            }

            // ==========================================
            // 2. PUSH (A dança para manter a fila organizada)
            // ==========================================
            while (!this.empty()) {
                const backVal = this.deque.back[0];
                this.recorder.saveFrame(
                    `Vamos comparar o candidato <strong>${current}</strong> com o último elemento da fila (<strong>${backVal}</strong>).`,
                    getDetail(windowInfo),
                    { ...baseState(), status: 'compare', target: 'back' }
                );

                if (!this.comparator(backVal, current)) {
                    // Quebra a regra: Remove
                    this.recorder.saveFrame(
                        `O candidato ${current} tem prioridade sobre o ${backVal} (satisfaz a nossa regra). Como o ${current} é mais recente, o ${backVal} tornou-se inútil para ser a resposta!`,
                        getDetail(windowInfo),
                        { ...baseState(), status: 'violate', target: 'back' }
                    );
                    this.deque.pop();
                } else {
                    // Segue a regra: Mantém
                    this.recorder.saveFrame(
                        `O candidato ${current} <strong>não</strong> tem prioridade sobre o ${backVal}, então paramos de descartar elementos.`,
                        getDetail(windowInfo),
                        { ...baseState(), status: 'valid', target: 'back' }
                    );
                    break;
                }
            }

            if (this.empty()) {
                this.recorder.saveFrame(
                    `A fila ficou vazia.`,
                    getDetail(windowInfo),
                    { ...baseState(), status: 'idle' }
                );
            }

            this.deque.push([current, i]);
            this.recorder.saveFrame(
                `Adicionamos o candidato ${current} ao final da fila.`,
                getDetail(windowInfo),
                { result: [...result] }
            );

            // ==========================================
            // 3. COLETAR RESULTADO DA JANELA ATUAL
            // ==========================================
            if (i >= k - 1) {
                const best = this.deque.front[0];
                result.push(best);
                this.recorder.saveFrame(
                    `A janela de tamanho ${k} está completa! A resposta dela é sempre o que sobreviveu na frente da fila: <strong>${best}</strong>.`,
                    getDetail(windowInfo),
                    { result: [...result] }
                );
            }
        }

        this.recorder.endRecording(
            `<strong>Janela Deslizante Finalizada!</strong>`,
            `Lista final de resultados: [ ${result.join(', ')} ]`
        );
        return { result, history: this.recorder.getHistory() };
    }
}