export class HistoryRecorder {
    /**
     * @param {Function} snapshotStrategy - Uma função que retorna um clone do estado atual da estrutura.
     */
    constructor(snapshotStrategy) {
        this.history = [];
        this.takeSnapshot = snapshotStrategy;
    }

    beginRecording(message, detail = "") {
        this.history = [];
        this.saveFrame(message, detail);
    }

    saveFrame(message, detail = "") {
        this.history.push({
            message,
            detail,
            ...this.takeSnapshot()
        })
    }

    endRecording(message, detail = "") {
        this.saveFrame(message, detail);
    }

    getHistory() {
        return this.history;
    }
}
