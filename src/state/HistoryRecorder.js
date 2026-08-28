export class HistoryRecorder {
    /**
     * Records snapshots of a structure's state throughout an operation.
     *
     * The recorder uses a snapshot strategy to capture the current state.
     * A recording starts with {@link beginRecording}, additional snapshots
     * can be created with {@link saveFrame}, and the recording can be
     * finalized with {@link endRecording}.
     *
     * @param {Function} snapshotStrategy
     * Function responsible for creating and returning a snapshot of the
     * current state of the structure.
     */
    constructor(snapshotStrategy) {
        this.history = [];
        this.takeSnapshot = snapshotStrategy;
    }

    /**
     * Starts a new recording.
     *
     * Clears any previously recorded history and immediately saves the
     * initial state using the provided message.
     *
     * @param {string} message
     * Description associated with the initial snapshot.
     * @returns {void}
     */
    beginRecording(message) {
    beginRecording(message, detail = "") {
        this.history = [];
        this.saveFrame(message, detail);
    }

    /**
     * Saves a snapshot of the current state.
     *
     * The snapshot returned by the snapshot strategy is combined with
     * the provided message and appended to the recording history.
     *
     * @param {string} message
     * Description associated with the snapshot.
     * @returns {void}
     */
    saveFrame(message, stateOverride = {}) {
        this.history.push({
            message,
            ...this.takeSnapshot(),
            ...stateOverride
        })
    }

    /**
     * Saves the final snapshot of the current recording.
     *
     * This method is equivalent to calling {@link saveFrame} and is intended
     * to represent the final state of an operation.
     *
     * @param {string} message
     * Description associated with the final snapshot.
     * @returns {void}
     */
    endRecording(message) {
        this.saveFrame(message);
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

    /**
     * Returns all snapshots recorded during the current recording.
     *
     * @returns {Array<Object>}
     * Array containing the recorded snapshots. Each snapshot contains the
     * provided message combined with the state returned by the snapshot
     * strategy.
     */
    getHistory() {
        return this.history;
    }
}
