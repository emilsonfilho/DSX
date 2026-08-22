export class StateManager {
    constructor(onFrameChangeCallback, onPlayStateChangeCallback) {
        this.frames = [];
        this.currentIndex = 0;
        this.playInterval = null;
        this.speedMs = 1000;

        this.onFrameChange = onFrameChangeCallback;
        this.onPlayStateChange = onPlayStateChangeCallback;
    }

    get isPlaying() {
        return this.playInterval !== null;
    }

    get totalFrames() {
        return this.frames.length;
    }

    loadHistory(newFrames) {
        this.frames = newFrames;
        this.currentIndex = 0;
        this.notify();
        this.play();
    }

    notify() {
        if (this.frames.length > 0 && typeof this.onFrameChange === "function")
            this.onFrameChange(this.frames[this.currentIndex], this.currentIndex, this.frames.length);
    }

    notifyPlayState() {
        if (typeof this.onPlayStateChange === "function")
            this.onPlayStateChange(this.isPlaying);
    }

    next() {
        if (this.currentIndex < this.frames.length - 1) {
            this.currentIndex++;
            this.notify();
        } else {
            this.pause();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.notify();
        }
    }

    goTo(index) {
        if (this.frames.length === 0) return;

        const clamped = Math.min(Math.max(index, 0), this.frames.length - 1);

        if (clamped !== this.currentIndex) {
            this.currentIndex = clamped;
            this.notify();
        }
    }

    play() {
        if (this.playInterval || this.frames.length === 0) return;

        if (this.currentIndex === this.frames.length - 1) {
            this.currentIndex = 0;
            this.notify();
        }

        this.playInterval = setInterval(() => {
            this.next();
        }, this.speedMs);

        this.notifyPlayState();
    }

    pause() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
            this.notifyPlayState();
        }
    }

    toggle() {
        this.isPlaying ? this.pause() : this.play();
    }

    setSpeed(ms) {
        this.speedMs = ms;

        if (this.playInterval) {
            this.pause();
            this.play();
        }
    }
}