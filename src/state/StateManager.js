export class StateManager {
    constructor() {
        this.frames = [];
        this.currentIndex = 0;
        this.playInterval = null;
        this.speedMs = 1000;

        // Observer Design Pattern
        this.listeners = {
            frameChange: new Set(),
            playStateChange: new Set()
        }
    }

    get isPlaying() {
        return this.playInterval !== null;
    }

    get totalFrames() {
        return this.frames.length;
    }

    on(event, callback) {
        if (this.listeners[event])
            this.listeners[event].add(callback);
    }

    _emit(event, ...args) {
        if (this.listeners[event])
            for (const callback of this.listeners[event])
                callback(...args);
    }

    _notifyFrame() {
        if (this.frames.length > 0)
            this._emit('frameChange', this.frames[this.currentIndex], this.currentIndex, this.frames.length);
    }

    _notifyPlayState() {
        this._emit('playStateChange', this.isPlaying);
    }

    loadHistory(newFrames) {
        this.frames = newFrames;
        console.log("newFrames", newFrames)
        this.currentIndex = 0;
        this._notifyFrame();
        this.play();
    }

    next() {
        if (this.currentIndex < this.frames.length - 1) {
            this.currentIndex++;
            this._notifyFrame();
        } else {
            this.pause();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this._notifyFrame();
        }
    }

    goTo(index) {
        if (this.frames.length === 0) return;

        const clamped = Math.min(Math.max(index, 0), this.frames.length - 1);

        if (clamped !== this.currentIndex) {
            this.currentIndex = clamped;
            this._notifyFrame();
        }
    }

    play() {
        if (this.playInterval || this.frames.length === 0) return;

        if (this.currentIndex === this.frames.length - 1) {
            this.currentIndex = 0;
            this._notifyFrame();
        }

        this.playInterval = setInterval(() => {
            this.next();
        }, this.speedMs);

        this._notifyPlayState();
    }

    pause() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
            this._notifyPlayState();
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