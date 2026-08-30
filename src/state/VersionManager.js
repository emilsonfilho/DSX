export class VersionManager {
    constructor() {
        this.versions = [];
        this.currentIndex = -1;
    }

    get count() {
        return this.versions.length;
    }

    get current() {
        return this.get(this.currentIndex);
    }

    get currentVersionIndex() {
        return this.currentIndex;
    }

    get(index) {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.versions.length
        ) {
            return null;
        }

        return this.versions[index];
    }

    add(version, { select = true } = {}) {
        const index = this.versions.length;

        this.versions.push({
            ...version,
            index,
        });

        if (select) {
            this.currentIndex = index;
        }

        return index;
    }

    goTo(index) {
        if (!this.get(index)) {
            return false;
        }

        this.currentIndex = index;

        return true;
    }

    previous() {
        return this.goTo(
            this.currentIndex - 1
        );
    }

    next() {
        return this.goTo(
            this.currentIndex + 1
        );
    }

    clear() {
        this.versions = [];
        this.currentIndex = -1;
    }
}