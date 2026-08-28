import { AscendingComparator } from "../segment-tree/Operations";
import { Deque } from "./Deque";

export class MonotonicDeque {
    constructor(comparator = AscendingComparator) {
        this.deque = new Deque();
        this.comparator = comparator;
    }

    push(value, index) {
        while (!this.deque.empty() && !this.comparator(this.deque.back().value[0], value))
            this.deque.pop();

        this.deque.push([value, index]);
    }

    pop(limit) {
        while (!this.deque.empty() && this.deque.front().value[1] < limit)
            this.deque.shift();
    }

    empty() {
        return this.deque.empty();
    }

    front() {
        if (this.empty())
            return undefined;

        return this.deque.front().value[0];
    }
}