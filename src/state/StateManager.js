export class StateManager {
    constructor(onFrameChangeCallback) {
        this.frames = [];
        this.currentIndex = 0;
        this.playInterval = null;
        this.speedMs = 1000;

        this.onFrameChange = onFrameChangeCallback;
    }

    loadHistory(newFrames) {
        this.frames = newFrames;
        this.currentIndex = 0;
        this.pause();
        this.notify();
    }

    notify() {
        if (this.frames.length > 0 && typeof this.onFrameChange === "function")
            this.onFrameChange(this.frames[this.currentIndex], this.currentIndex, this.frames.length);
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

    play() {
        if (this.playInterval) return;

        if (this.currentIndex === this.frames.length - 1) {
            this.currentIndex = 0;
            this.notify();
        }

        this.playInterval = setInterval(() => {
            this.next();
        }, this.speedMs);
    }

    pause() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    setSpeed(ms) {
        this.speedMs = ms;

        if (this.playInterval) {
            this.pause();
            this.play();
        }
    }
}