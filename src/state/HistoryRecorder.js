export class HistoryRecorder {
    /**
     * @param {Function} snapshotStrategy - Uma função que retorna um clone do estado atual da estrutura.
     */
    constructor(snapshotStrategy) {
        this.history = [];
        this.takeSnapshot = snapshotStrategy;
    }

    beginRecording(message) {
        this.history = [];
        this.saveFrame(message);
    }

    saveFrame(message) {
        this.history.push({
            message,
            ...this.takeSnapshot()
        })
    }

    endRecording(message) {
        this.saveFrame(message);
    }

    getHistory() {
        return this.history;
    }
}